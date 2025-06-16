from sqlmodel import create_engine, Session, HTTPException, select
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.models import LibUser
from app.auth import SECRET_KEY, ALGORITHM
from dotenv import load_dotenv
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as db:
        yield db

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)) -> LibUser:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.exec(select(LibUser).where(LibUser.email == email)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

