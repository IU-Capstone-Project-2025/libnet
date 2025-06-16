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
@router.get("/{_id}", response_model=models.Booking)
def get_booking(_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == _id)).first()
    if not booking:
        raise HTTPException(status_code = 404, detail="Booking not found")
    
    return booking

# Update Booking's status
@router.patch("/{_id}", response_model=models.Booking)
def update_status(_id: int, booking_update: models.BookingUpdate, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == _id)).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = booking_update.status
    
    db.add(booking)
    db.commit()
    db.refresh()
    
    return booking

# Delete a Booking
@router.delete("/{_id}", response_model=models.Booking)
def update_bookings(_id: int, db: Session = Depends(get_session)):
    booking = db.exec(select(models.Booking).where(models.Booking.id == _id)).first()
    if not booking:
        raise HTTPException(status_code = 404, detail="Booking not found")

    db.delete(booking)
    db.commit()
