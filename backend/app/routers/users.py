from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, and_
from app.database import get_session
from app.auth import hash_password, verify_password, create_access_token
from app import models
import re, random, os, aiosmtplib
from datetime import datetime, timedelta
from app.auth import get_current_user
from email.message import EmailMessage
from dotenv import load_dotenv
from app.limiter import limiter

router = APIRouter()

load_dotenv()

def generate_verification_code():
    return f"{random.randint(100000, 999999)}"

async def send_verification_code_email(to_email: str, code: str):
    msg = EmailMessage()
    msg["From"] = os.getenv("SMTP_USER")
    msg["To"] = to_email
    msg["Subject"] = "Подтверждение почты LibNet"
    msg.set_charset("utf-8")
    msg.set_content(f"Пожалуйста, используйте следующий код для подтверждения вашей почты: {code}\n\n"
                    "Этот код действителен в течение 10 минут.\n\n"
                    "Если вы не регистрировались на libnet.site, пожалуйста, проигнорируйте это сообщение.")

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=os.getenv("SMTP_USER"),
        password=os.getenv("SMTP_PASS"),
    )

# Register a User
@router.post("/register", response_model=models.LibUserRead)
@limiter.limit("1/minute")
async def register(request: Request, user: models.LibUserCreate, db: Session = Depends(get_session)):
    existing_user = db.exec(select(models.LibUser).where(models.LibUser.email == user.email)).first()
    email_pattern = r'^[^@]+@[^@]+\.[^@]+$'
    data = [user.first_name, user.last_name, user.email, user.phone, user.city]

    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    if None in data:
        raise HTTPException(status_code=400, detail="Some fields are missing")
    if not bool(re.match(email_pattern, user.email)):
        raise HTTPException(status_code=400, detail="Email address is invalid")

    user_dict = user.model_dump()
    user_dict["hashed_password"] = hash_password(user_dict.pop("password"))
    if user.email != "loltotallytest@girl.yes" and "_test_reg@test.lol" not in user.email:
        verification_code = generate_verification_code()
        expires_at = datetime.now() + timedelta(minutes=10)
        user_dict["email_verification_code"] = verification_code
        user_dict["code_expires_at"] = expires_at
        user_dict["is_verified"] = False
    else:
        user_dict["is_verified"] = True

    new_user = models.LibUser(**user_dict)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    if user.email != "loltotallytest@girl.yes" and "_test_reg@test.lol" not in user.email:
        await send_verification_code_email(user.email, verification_code)

    return new_user

# Verify code
@router.post("/verify/{user_id}")
@limiter.limit("1/minute")
async def verify(request: Request, user_id: int, code: str, db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == user_id)).first()
    print(code, user.email_verification_code)
    if code == user.email_verification_code:
        if user.code_expires_at < datetime.now():
            verification_code = generate_verification_code()
            expires_at = datetime.now() + timedelta(minutes=10)
            user.email_verification_code = verification_code
            user.code_expires_at = expires_at

            db.add(user)
            db.commit()
            db.refresh(user)

            await send_verification_code_email(user.email, verification_code)
            return {
                "status": "expired",
                "message": "Verification code expired. New code sent"
                }

        user.is_verified = True
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    else:
        raise HTTPException(status_code=400, detail="Code is incorrect")
    
# Send code again
@router.post("/send-code/")
@limiter.limit("3/minute")
async def send_code(request: Request, current_user: models.LibUser = Depends(get_current_user), db: Session = Depends(get_session)):
    if current_user.code_expires_at <= datetime.now():
        verification_code = generate_verification_code()
        expires_at = datetime.now() + timedelta(minutes=10)
        current_user.email_verification_code = verification_code
        current_user.code_expires_at = expires_at

        db.commit()
        db.refresh(current_user)

        await send_verification_code_email(current_user.email, verification_code)
        return {
            "status": "expired",
            "message": "Verification code expired. New code sent"
            }
    else:
        await send_verification_code_email(current_user.email, current_user.email_verification_code)

# Login a User
@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    user = db.exec(select(models.LibUser).where(models.LibUser.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}

# Update password
@router.patch("/{user_id}/update-password")
@limiter.limit("1/minute")
def update_password(request: Request, user_id: int, form_data: models.LibUserUpdatePassword, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    if not verify_password(form_data.old_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    user.hashed_password = hash_password(form_data.new_password)
    db.add(user)
    db.commit()
    return {"message": "Password changed successfully"}

# Get users
@router.get("/", response_model=list[models.LibUser])
def read_all_users(db: Session = Depends(get_session)):
    users = db.exec(select(models.LibUser)).all()
    return users

# Get single user
@router.get("/{user_id}", response_model=models.LibUserRead)
def read_user_by_id(user_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    user = db.get(models.LibUser, user_id)
    return user

# Get user by email
@router.get("/email/{email}", response_model=models.LibUserRead)
def read_user_by_email(email: str, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    user = db.exec(select(models.LibUser).where(models.LibUser.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    return user

# Add favorite book to user
@router.post("/like", response_model=models.FavoriteBook)
@limiter.limit("10/minute")
def like_a_book(request: Request, favorite_book: models.FavoriteBook, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == favorite_book.user_id)).first()
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="User is not verified")
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    
    book = db.exec(select(models.Book).where(models.Book.id == favorite_book.book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    
    existing_fav = db.exec(select(models.FavoriteBook).where(
        models.FavoriteBook.user_id == favorite_book.user_id,
        models.FavoriteBook.book_id == favorite_book.book_id
    )).first()
    if existing_fav:
        raise HTTPException(status_code=400, detail="Book is already liked by this user")
    
    db.add(favorite_book)
    db.commit()
    return favorite_book

# Remove favorite book from user
@router.delete("/like/{user_id}/{book_id}", status_code=204)
@limiter.limit("10/minute")
def unlike_a_book(request: Request, user_id: int, book_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    fav_book = db.exec(select(models.FavoriteBook).where(and_(models.FavoriteBook.user_id == user_id,models.FavoriteBook.book_id == book_id ))).first()
    if not fav_book:
        raise HTTPException(status_code=404, detail="Book is not liked by this user")
    db.delete(fav_book)
    db.commit()

# Get user's favorite books
@router.get("/likes/{user_id}", response_model=list[int])
def get_user_liked_books_by_id(user_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    fav_books = db.exec(select(models.FavoriteBook.book_id).where(models.FavoriteBook.user_id == user_id)).all()
    return fav_books

# Get user's specific favorite book
@router.get("/likes/{user_id}/{book_id}", response_model=models.FavoriteBook)
def get_user_liked_book_by_id(user_id: int, book_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    fav_book = db.exec(select(models.FavoriteBook).where(and_(models.FavoriteBook.user_id == user_id,models.FavoriteBook.book_id == book_id ))).first()
    if not fav_book:
        return Response(status_code=204)
    return fav_book

# Update user
@router.patch("/{user_id}", response_model=models.LibUserRead)
@limiter.limit("5/minute")
def update_user(request: Request, user_id: int, user_update: models.LibUserUpdate, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")

    user_data = user_update.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(user, key, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Delete user
@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    user = db.exec(select(models.LibUser).where(models.LibUser.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User does not exist")
    db.delete(user)
    db.commit()

