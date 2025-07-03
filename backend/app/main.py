from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from app.routers.users import router as users_router
from app.routers.managers import router as managers_router
from app.routers.admins import router as admins_router
from app.routers.bookings import router as bookings_router
from app.routers.libraries import router as libraries_router
from app.routers.books import router as books_router
from app.routers.search import router as search_router

app = FastAPI()

Instrumentator().instrument(app).expose(app)

app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(managers_router, prefix="/managers", tags=["managers"])
app.include_router(admins_router, prefix="/admins", tags=["admins"])
app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
app.include_router(libraries_router, prefix="/libraries", tags=["libraries"])
app.include_router(books_router, prefix="/books", tags=["books"])
app.include_router(search_router, prefix="/search", tags=["search"])
