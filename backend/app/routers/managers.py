from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.database import get_session
from app.auth import verify_password, create_access_token
from app import models

router = APIRouter()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.role != "manager":
        raise HTTPException(status_code=403, detail="Access forbidden: Managers only")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}