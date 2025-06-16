from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from app.database import engine
from datetime import date


class LibUser(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, index=True)
    first_name: str
    last_name: str
    email: str = Field(index=True, unique=True)
    password_hash: str = Field(nullable=False)
    phone: str
    city: str
    role: str = Field(default="user")

    bookings: List["Booking"] = Relationship(back_populates="user")

class LibUserUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    role: Optional[str] = None

class Library(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    city: str
    address: str

    bookings: List["Booking"] = Relationship(back_populates="library")
    books: List["LibraryBook"] = Relationship(back_populates="library")

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    author: str
    description: str
    year: int
    image_url: str
    isbn: str
    genre: str

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
    date_to: date
    status: str = Field(default="active")

    user: Optional["LibUser"] = Relationship(back_populates="bookings")
    book: Optional["Book"] = Relationship(back_populates="bookings")
    library: Optional["Library"] = Relationship(back_populates="bookings")

SQLModel.metadata.create_all(engine)