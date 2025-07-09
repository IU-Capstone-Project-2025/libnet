from sqlmodel import SQLModel, create_engine, Session

engine = None

def init_engine(custom_engine=None):
    global engine
    if custom_engine:
        engine = custom_engine
    else:
        from os import getenv
        engine = create_engine(getenv("DATABASE_URL"))

def get_session():
    if engine is None:
        raise RuntimeError("Engine not initialized")
    with Session(engine) as session:
        yield session

def create_all():
    from app import models
    SQLModel.metadata.create_all(engine)