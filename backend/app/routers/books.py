from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app import models

# Create a Book
@router.post("/", response_model=models.Book)
def create_book(book: models.Book, db: Session = Depends(get_session)):
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

# Get all Books
@router.get("/", response_model=list[models.Book])
def read_books(db: Session = Depends(get_session)):
    books = db.exec(select(models.Book)).all()
    return books

# Get single Book
@router.get("/{book_id}", response_model=models.Book)
def get_book(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

# Update a Book
@router.patch("/{book_id}", response_model=models.Book)
def update_book(book_id: int, book_update: models.BookUpdate, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    updated_data = book_update.model_dump(exclude_unset=True)
    for key, value in updated_data.items():
        setattr(book, key, value)

    db.add(book)
    db.commit()
    db.refresh(book)
    return book

# Delete a Book
@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
