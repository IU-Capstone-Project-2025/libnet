from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, and_
from app.database import get_session
from app import models
from datetime import timedelta, date, datetime

router = APIRouter()

# Create a Booking
@router.post("/", response_model=models.Booking)
def create_booking(booking: models.Booking, db: Session = Depends(get_session)):
    library = db.get(models.Library, booking.library_id)
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
    bookings = db.exec(select(models.Booking)).all()
    return bookings

# Get single Booking
@router.get("/{booking_id}", response_model=models.Booking)
def get_booking(booking_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if not booking:
        raise HTTPException(status_code = 404, detail="Booking does not exist")
    return booking

# Get Bookings of a certain User
@router.get("/users/{user_id}", response_model=list[models.Booking])
def get_users_bookings(user_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.user_id == user_id)).all()
    if not booking:
        raise HTTPException(status_code=404, detail="User does not exist")
    return booking

# Get active bookings of a user
@router.get("/active/{user_id}", response_model=list[models.Booking])
def get_active_bookings_of_a_user(user_id: int, db: Session = Depends(get_session)):
    bookings = db.exec(select(models.Booking).where(and_(models.Booking.user_id == user_id, models.Booking.status in "pending; active"))).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="User has no active bookings")
    return bookings

# Get dismissed bookings of a user
@router.get("/dismissed/{user_id}", response_model=list[models.Booking])
def get_dismissed_bookings_of_a_user(user_id: int, db: Session = Depends(get_session)):
    bookings = db.exec(select(models.Booking).where(and_(models.Booking.user_id == user_id, models.Booking.status in "returned; cancelled"))).all()
    if not bookings:
        raise HTTPException(status_code=404, detail="User has no dismissed bookings")
    return bookings

# Update Booking's status
@router.patch("/{booking_id}", response_model=models.Booking)
def update_status(booking_id: int, booking_update: models.BookingUpdate, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking does not exist")
    
    if booking_update.status:
        booking.status = booking_update.status

        if booking.status == models.BookingStatus.ACTIVE or booking.status == models.BookingStatus.RETURNED:
            booking.date_from = date.today()
            if booking.status == models.BookingStatus.RETURNED:
                booking.date_to = None
            else:
                booking.date_to = booking.date_from + timedelta(days=booking.library.rent_duration)
        elif booking.status == models.BookingStatus.CANCELLED:
            booking.date_to = None

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

# Delete a Booking
@router.delete("/{booking_id}", status_code=204)
def delete_booking(booking_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if not booking:
        raise HTTPException(status_code = 404, detail="Booking does not exist")

    db.delete(booking)
    db.commit()
