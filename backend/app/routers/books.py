from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app import models

router = APIRouter()

# Create a Book
@router.post("/{quantity}", response_model=models.Book)
def create_book(book: models.Book, quantity: int, db: Session = Depends(get_session)):
    db.add(book)
    db.commit()
    db.refresh(book)
    library_book = models.LibraryBook(library_id=book.library_id, book_id=book.id, quantity=quantity)
    db.add(library_book)
    db.commit()
    db.refresh(library_book)
    return book

# Get quantity of books in a library
@router.get("/quantity/{library_id}/{book_id}", response_model=int)
def get_book_quantity(library_id: int, book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.LibraryBook).where(models.LibraryBook.library_id == library_id and models.LibraryBook.book_id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist in this library")
    return book.quantity

# Get all Books
@router.get("/", response_model=list[models.Book])
def get_all_books(db: Session = Depends(get_session)):
    books = db.exec(select(models.Book)).all()
    return books

# Get libraries that have a specific Book
@router.get("/libraries/{book_id}", response_model=list[models.Library])
def get_libraries_with_book(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    
    libraries = db.exec(select(models.Library).join(models.Book).where(models.Book.isbn == book.isbn)).all()
    return libraries

# Get single Book
@router.get("/{book_id}", response_model=models.Book)
def get_book(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    return book

# Update a Book
@router.patch("/{book_id}", response_model=models.Book)
def update_book(book_id: int, book_update: models.BookUpdate, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")

    updated_data = book_update.model_dump(exclude_unset=True)
    for key, value in updated_data.items():
        setattr(book, key, value)

    db.add(book)
    db.commit()
    db.refresh(book)
    return book

# Delete a Book
@router.delete("/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    db.delete(book)
    db.commit()
