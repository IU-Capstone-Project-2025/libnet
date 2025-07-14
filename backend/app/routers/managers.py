from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.database import get_session
from app.auth import verify_password, create_access_token
from app import models
from app.auth import get_current_user
from app.limiter import limiter

router = APIRouter()

# Login a Manager
@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.role != "manager":
        raise HTTPException(status_code=403, detail="Access forbidden: Managers only")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# Assign manager to a library
@router.post("/assign/{manager_email}/{library_id}")
def assign_manager(manager_email: str, library_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    manager = db.exec(select(models.LibUser).where(models.LibUser.email == manager_email)).first()
    if not manager:
        raise HTTPException(status_code=404, detail="User does not exist")

    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    
    manager.role = "manager"
    manager.library_id = library_id
    db.add(manager)
    db.commit()
    db.refresh(manager)
    return manager

# Dismiss manager from a library
@router.post("/dismiss/{manager_email}/{library_id}")
def dismiss_manager(manager_email: str, library_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Admins only")
    manager = db.exec(select(models.LibUser).where(models.LibUser.email == manager_email)).first()
    if not manager:
        raise HTTPException(status_code=404, detail="User does not exist")

    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    
    if manager.library_id != library_id:
        raise HTTPException(status_code=400, detail="Manager is not assigned to this library")
    
    manager.role = "user"
    manager.library_id = None
    db.add(manager)
    db.commit()
    db.refresh(manager)
    return manager