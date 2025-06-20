from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app import models

router = APIRouter()

# Create a Booking
@router.post("/", response_model=models.Booking)
def create_booking(booking: models.Booking, db: Session = Depends(get_session)):
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
@router.get("/{user_id}", response_model=list[models.Booking])
def get_users_bookings(user_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.LibUser.id == user_id)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="User does not exist")
    return booking

# Update Booking's status
@router.patch("/{booking_id}", response_model=models.Booking)
def update_status(booking_id: int, booking_update: models.BookingUpdate, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking does not exist")
    
    booking.status = booking_update.status

    db.add(booking)
    db.commit()
    db.refresh()
    return booking

# Delete a Booking
@router.delete("/{booking_id}", response_model=models.Booking)
def update_bookings(booking_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == booking_id)).first()
    if not booking:
        raise HTTPException(status_code = 404, detail="Booking does not exist")

    db.delete(booking)
    db.commit()
