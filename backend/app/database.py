from sqlmodel import create_engine, Session

engine = None

def init_engine(database_url: str):
    global engine
    engine = create_engine(database_url)

def get_session():
    from app.database import engine
    if engine is None:
        raise RuntimeError("Engine not initialized. Call init_engine() first.")
    with Session(engine) as session:
        yield session

        