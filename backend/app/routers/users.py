from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app import models
import re

router = APIRouter()

# Create a User
@router.post("/", response_model=models.LibUser)
def create_user(user: models.LibUser, db: Session = Depends(get_session)):
    existing_user = db.exec(select(models.LibUser).where(models.LibUser.email == user.email)).first()
    roles = ["user", "manager", "admin"]
    email_pattern = r'^[^@]+@[^@]+\.[^@]+$'
    data = [user.first_name, user.last_name, user.email, user.phone, user.city]

    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    if user.role not in roles:
        raise HTTPException(status_code=400, detail="User role is invalid")
    if None in data:
        raise HTTPException(status_code=400, detail="Some fields are missing")
    if not bool(re.match(email_pattern, user.email)):
        raise HTTPException(status_code=400, detail="Email address is invalid")

    db.add(user)
    db.commit()
    db.refresh(user)
    print(user.id)
    return user

# Get users
@router.get("/", response_model=list[models.LibUser])
def read_users(db: Session = Depends(get_session)):
    users = db.exec(select(models.LibUser)).all()
    return users

# Get single user
@router.get("/{_id}", response_model=list[models.LibUser])
def read_users(_id: int, db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == _id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update user
@router.patch("/users/{_id}")
def update_user(_id: int, user_update: models.LibUserUpdate, session: Session = Depends(get_session)):
    user = session.exec(select(models.LibUser).where(models.LibUser.id == _id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")

    user_data = user_update.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.delete("/{_id}")
def delete_user(_id: int, db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == _id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User does not exist")
    db.delete(user)
    db.commit()

