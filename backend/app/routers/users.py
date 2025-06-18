from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.database import get_session
from app.auth import hash_password, verify_password, create_access_token
from app import models
import re

router = APIRouter()

# Register a User
@router.post("/register", response_model=models.LibUserRead)
def register(user: models.LibUserCreate, db: Session = Depends(get_session)):
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

    user_dict = user.model_dump()
    user_dict["hashed_password"] = hash_password(user_dict.pop("password"))

    new_user = models.LibUser(**user_dict)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Login a User
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}

# Get users
@router.get("/", response_model=list[models.LibUser])
def read_all_users(db: Session = Depends(get_session)):
    users = db.exec(select(models.LibUser)).all()
    return users

# Get single user
@router.get("/{user_id}", response_model=models.LibUserRead)
def read_user_by_id(user_id: int, db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Update user
@router.patch("/{user_id}", response_model=models.LibUserRead)
def update_user(user_id: int, user_update: models.LibUserUpdate, session: Session = Depends(get_session)):
    user = session.exec(select(models.LibUser).where(models.LibUser.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")

    user_data = user_update.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# Delete user
@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User does not exist")
    db.delete(user)
    db.commit()

