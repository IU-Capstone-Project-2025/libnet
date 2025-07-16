from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlmodel import Session, select, and_
from app.database import get_session
from app import models
from datetime import timedelta, date, datetime
from app.auth import get_current_user
from app.limiter import limiter
from sqlalchemy import desc
from sqlalchemy.orm import selectinload

router = APIRouter()

# Create a Booking
@router.post("/", response_model=models.Booking)
@limiter.limit("100/minute")
def create_booking(request: Request, booking: models.Booking, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(status_code=400, detail="User is not verified")
    
    library = db.get(models.Library, booking.library_id)

    library_book = db.get(models.LibraryBook, (booking.library_id, booking.book_id))
    if not library_book:
        raise HTTPException(status_code=404, detail="LibraryBook not found")
    if library_book.quantity <= 0:
        raise HTTPException(status_code=400, detail="No available copies left")
    library_book.quantity -= 1
    db.commit()

    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    booking.date_from = datetime.strptime(booking.date_from, "%Y-%m-%d").date()

    booking.date_to = booking.date_from + timedelta(days=library.booking_duration)

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

# Get all Bookings
@router.get("/", response_model=list[models.Booking])
def get_bookings(db: Session = Depends(get_session)):
    bookings = db.exec(
        select(models.Booking)
        .options(
            selectinload(models.Booking.user),
            selectinload(models.Booking.book),
            selectinload(models.Booking.library),
        )
    ).all()
    return bookings

# Get single Booking
@router.get("/{booking_id}", response_model=models.Booking)
def get_booking(booking_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if not booking:
        raise HTTPException(status_code = 404, detail="Booking does not exist")
    return booking

# Get Bookings of a certain User
@router.get("/users/", response_model=list[models.Booking])
def get_bookings_of_a_user(db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    user_id = current_user.id
    booking = db.exec(select(models.Booking).where(models.Booking.user_id == user_id)).all()
    if not booking:
        raise HTTPException(status_code=404, detail="User does not exist")
    return booking

# Get active bookings of a user
@router.get("/active/{user_id}", response_model=list[models.Booking])
def get_active_bookings_of_a_user(user_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    bookings = db.exec(select(models.Booking).where(and_(models.Booking.user_id == user_id, models.Booking.status in "pending; active"))).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="User has no active bookings")
    return bookings

# Get dismissed bookings of a user
@router.get("/dismissed/{user_id}", response_model=list[models.Booking])
def get_dismissed_bookings_of_a_user(user_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    bookings = db.exec(select(models.Booking).where(and_(models.Booking.user_id == user_id, models.Booking.status in "returned; cancelled"))).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="User has no dismissed bookings")
    return bookings

# Update Booking's status
@router.patch("/{booking_id}", response_model=models.Booking)
@limiter.limit("100/minute")
def update_booking_status(request: Request, booking_id: int, booking_update: models.BookingUpdate, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if current_user.role != "manager" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    if not booking:
        raise HTTPException(status_code=404, detail="Booking does not exist")
    
    if booking_update.status:
        booking.status = booking_update.status

        if booking.status == models.BookingStatus.ACTIVE or booking.status == models.BookingStatus.RETURNED:
            booking.date_from = date.today()
            if booking.status == models.BookingStatus.RETURNED:
                booking.date_to = None
                library_book = db.get(models.LibraryBook, (booking.library_id, booking.book_id))
                if not library_book:
                    raise HTTPException(status_code=404, detail="LibraryBook not found")
                library_book.quantity += 1
                db.commit()
            else:
                booking.date_to = booking.date_from + timedelta(days=booking.library.rent_duration)
        elif booking.status == models.BookingStatus.CANCELLED:
            booking.date_to = None

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

# Search for booking
@router.get("/search")
def search_bookings(booking_id: int = Query(default=None), user_phone: str = Query(default=None), email: str = Query(default=None), db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Access forbidden: Managers only")

    query = select(models.Booking)

    if booking_id:
        query = query.where(models.Booking.id == booking_id)
    if user_phone:
        query = query.where(models.Booking.user.phone == user_phone)
    if email:
        query = query.where(models.Booking.user.email == email)

    query = query.order_by(desc(models.Booking.date_to))

    books = db.exec(query).all()
    return books


# Delete a Booking
@router.delete("/{booking_id}", status_code=204)
@limiter.limit("100/minute")
def delete_booking(request: Request, booking_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(status_code=400, detail="User is not verified")
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if not booking:
        raise HTTPException(status_code = 404, detail="Booking does not exist")

    db.delete(booking)
    db.commit()
