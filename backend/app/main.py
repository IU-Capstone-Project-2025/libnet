from fastapi import FastAPI
# from app.database import engine
from app import models
from app import auth, users, bookings

#models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(bookings.router)

@app.get("/")
def root():
    return {"message": "Tema top"}
