from sqlmodel import create_engine, Session, select
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="../../.env")

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as db:
        yield db
        