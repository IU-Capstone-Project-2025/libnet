from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.database import get_session
from app.auth import verify_password, create_access_token
from app import models
from app.auth import get_current_user

router = APIRouter()

# Login an Admin
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# Add new admin
@router.post("/assign/{admin_email}")
def assign_admin(admin_email: str, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    admin = db.exec(select(models.LibUser).where(models.LibUser.email == admin_email)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="User does not exist")

    if admin.role == "admin":
        raise HTTPException(status_code=400, detail="User is already an admin")

    admin.role = "admin"
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

# Remove admin
@router.post("/remove/{admin_email}")
def remove_admin(admin_email: str, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    admin = db.exec(select(models.LibUser).where(models.LibUser.email == admin_email)).first()
    if not admin:
        raise HTTPException(status_code=404, detail="User does not exist")

    if admin.role != "admin":
        raise HTTPException(status_code=400, detail="User is not an admin")

    admin.role = "user"
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

# Get all admins
@router.get("/", response_model=list[models.LibUser])
def get_all_admins(db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    
    admins = db.exec(select(models.LibUser).where(models.LibUser.role == "admin")).all()
    return admins