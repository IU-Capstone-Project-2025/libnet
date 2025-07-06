from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from app.database import engine
from datetime import date
from enum import Enum
from app.database import init_engine


class BookingStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    RETURNED = "returned"
    CANCELLED = "cancelled"

class UserRole(str, Enum):
    USER = "user"
    MANAGER = "manager"
    ADMIN = "admin"

class LibUser(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, index=True)
    first_name: str
    last_name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str = Field(nullable=False)
    birthday: Optional[date] = None
    phone: str
    city: str
    role: UserRole = Field(default=UserRole.USER)
    library_id: Optional[int] = Field(foreign_key="library.id")

    favorite_books: List["FavoriteBook"] = Relationship(back_populates="user")
    library: Optional["Library"] = Relationship(back_populates="managers")
    bookings: List["Booking"] = Relationship(back_populates="user")
    library: Optional["Library"] = Relationship(back_populates="managers")

class LibUserCreate(SQLModel):
    first_name: str
    last_name: str
    email: str = Field(index=True, unique=True)
    password: str
    phone: str
    city: str
    role: UserRole = Field(default=UserRole.USER)

class LibUserRead(SQLModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    city: str
    role: UserRole
    library_id: Optional[int]

class LibUserUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    role: Optional[UserRole] = None

class LibUserUpdatePassword(SQLModel):
    old_password: str
    new_password: str

class Library(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    city: str
    phone: str
    email: str = Field(index=True, unique=True)
    address: str
    description: str
    open_at: str
    close_at: str
    days_open: str
    booking_duration: int = Field(default=7, nullable=False)
    rent_duration: int = Field(default=14, nullable=False)

    books: List["LibraryBook"] = Relationship(back_populates="library")
    managers: List["LibUser"] = Relationship(back_populates="library")
    bookings: List["Booking"] = Relationship(back_populates="library")

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    library_id: int = Field(foreign_key="library.id")
    title: str
    author: str
    description: str
    year: int
    image_url: str
    isbn: str = Field(index=True)
    genre: str
    rating: int = Field(default=0, nullable=False)
    pages_count: Optional[int] = None
    publisher: Optional[str] = None

    favorite_users: List["FavoriteBook"] = Relationship(back_populates="book")
    bookings: List["Booking"] = Relationship(back_populates="book")
    libraries: List["LibraryBook"] = Relationship(back_populates="book")

class BookUpdate(SQLModel):
    id: Optional[int] = None
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    image_url: Optional[str] = None
    isbn: Optional[str] = None
    genre: Optional[str] = None

class FavoriteBook(SQLModel, table=True):
    user_id: int = Field(foreign_key="libuser.id", primary_key=True)
    book_id: int = Field(foreign_key="book.id", primary_key=True)

    user: Optional["LibUser"] = Relationship(back_populates="favorite_books")
    book: Optional["Book"] = Relationship(back_populates="favorite_users")

class LibraryBook(SQLModel, table=True):
    library_id: int = Field(foreign_key="library.id", primary_key=True)
    book_id: int = Field(foreign_key="book.id", primary_key=True)
    quantity: int

    library: Optional["Library"] = Relationship(back_populates="books")
    book: Optional["Book"] = Relationship(back_populates="libraries")

class Booking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="libuser.id")
    book_id: int = Field(foreign_key="book.id")
    library_id: int = Field(foreign_key="library.id")
    date_from: date
    date_to: Optional[date] = None
    status: BookingStatus = Field(default=BookingStatus.PENDING)

    user: Optional["LibUser"] = Relationship(back_populates="bookings")
    book: Optional["Book"] = Relationship(back_populates="bookings")
    library: Optional[Library] = Relationship(back_populates="bookings")

class BookingUpdate(SQLModel):
    status: Optional[BookingStatus] = None
    date_from: Optional[date] = None
