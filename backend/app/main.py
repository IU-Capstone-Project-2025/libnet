from fastapi import FastAPI
from app.routers.users import router as users_router
from app.routers.managers import router as managers_router
from app.routers.admins import router as admins_router
from app.routers.bookings import router as bookings_router
from app.routers.libraries import router as libraries_router
from app.routers.books import router as books_router

app = FastAPI()

app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(managers_router, prefix="/api/managers", tags=["managers"])
app.include_router(admins_router, prefix="/api/admins", tags=["admins"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["bookings"])
app.include_router(libraries_router, prefix="/api/libraries", tags=["libraries"])
app.include_router(books_router, prefix="/api/books", tags=["books"])
