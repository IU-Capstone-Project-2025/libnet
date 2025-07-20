from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Request
from sqlmodel import Session, select, and_, func
from app.database import get_session
from app import models
import os
from typing import Optional
from fastapi.responses import FileResponse
from app.auth import get_current_user
from app.limiter import limiter

router = APIRouter()

COVERS_DIR = "book_covers"
os.makedirs(COVERS_DIR, exist_ok=True)

# Create a Book
@router.post("/{quantity}", response_model=models.Book, status_code=201)
@limiter.limit("100/minute")
async def create_book(request: Request, book: models.Book, quantity: int, cover_url: Optional[str] = None, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    db.add(book)
    db.commit()
    db.refresh(book)

    library_book = models.LibraryBook(library_id=book.library_id, book_id=book.id, quantity=quantity)
    db.add(library_book)
    db.commit()
    db.refresh(library_book)
    db.refresh(book)
    return book

# Upload book cover
@router.post("/upload-cover/{book_id}", response_model=models.Book)
async def upload_book_cover(
    book_id: int,
    file: Optional[UploadFile] = File(None),
    cover_url: Optional[str] = Query(None),
    db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)
):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if file:
        filename = f"{book_id}.jpg"
        file_path = os.path.join(COVERS_DIR, filename)

        if book.image_url and book.image_url.startswith(COVERS_DIR):
            old_file_path = os.path.join(COVERS_DIR, os.path.basename(book.image_url))
            try:
                os.remove(old_file_path)
            except OSError:
                pass
        
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        book.image_url = f"backend/{file_path}"

    elif cover_url:
        if book.image_url and book.image_url.startswith(COVERS_DIR):
            old_file_path = os.path.join(COVERS_DIR, os.path.basename(book.image_url))
            try:
                os.remove(old_file_path)
            except OSError:
                pass
        
        book.image_url = cover_url
    
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

# Get book cover
@router.get("/cover/{book_id}")
def get_book_cover(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book.cover_file and os.path.exists(book.cover_file):
        return FileResponse(book.cover_file)
    
    if book.cover_url:
        return {"cover_url": book.cover_url}
    
    else:
        raise HTTPException(status_code=404, detail="No cover available")

# Get quantity of books in a library
@router.get("/quantity/{library_id}/{book_id}", response_model=int)
def get_book_quantity(library_id: int, book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.LibraryBook)
                   .where(and_(models.LibraryBook.library_id == library_id, models.LibraryBook.book_id == book_id))
                   ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist in this library")
    return book.quantity

# Change quantity of a book in a library
@router.patch("/quantity/{library_id}/{book_id}", response_model=models.LibraryBook)
def change_book_quantity(library_id: int, book_id: int, quantity: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Access forbidden: Managers only")
    book = db.exec(select(models.LibraryBook)
                   .where(and_(models.LibraryBook.library_id == library_id, models.LibraryBook.book_id == book_id))
                   ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist in this library")
    book.quantity = quantity
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

# Get unique Books
@router.get("/unique/", response_model=list[models.Book])
def get_unique_books(db: Session = Depends(get_session)):
    subquery = (select(func.min(models.Book.id))
                .group_by(models.Book.isbn).subquery())

    books = db.exec(
        select(models.Book)
        .join(models.LibraryBook, models.Book.id == models.LibraryBook.book_id)
        .where(
            models.Book.id.in_(subquery),
            models.LibraryBook.quantity > 0
        )
    ).all()
    return books
    

# Get all Books
@router.get("/", response_model=list[models.Book])
def get_books(db: Session = Depends(get_session)):
    books = db.exec(select(models.Book)).all()
    if not books:
        raise HTTPException(status_code=404, detail="No books found")
    return books

# Get libraries that have a specific Book
@router.get("/libraries/{book_id}", response_model=list[models.Library])
def get_libraries_with_book(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    try:
        isbn = int(book.isbn)
        libraries = db.exec(select(models.Library).join(models.Book).where(models.Book.isbn == book.isbn)).all()
    except:
        libraries = db.exec(select(models.Library).join(models.Book).where(models.Book.title == book.title)).all()
    return libraries

# Get single Book
@router.get("/{book_id}", response_model=models.Book)
def get_book(book_id: int, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    return book

# Get authors of books
@router.get("/authors/", response_model=list[str])
def get_authors(db: Session = Depends(get_session)):
    books = db.exec(select(models.Book)).all()
    authors = set([book.author for book in books])
    return sorted(authors)

# Get genres of books
@router.get("/genres/", response_model=list[str])
def get_genres(db: Session = Depends(get_session)):
    books = db.exec(select(models.Book)).all()
    genres = set()

    for book in books:
        if book.genre:
            for genre in book.genre.split(","):
                genres.add(genre.strip())

    return sorted(genres)

# Update a Book
@router.patch("/{book_id}", response_model=models.Book)
@limiter.limit("50/minute")
def update_book(request: Request, book_id: int, book_update: models.BookUpdate, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
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
def delete_book(book_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    book = db.exec(select(models.Book).where(models.Book.id == book_id)).first()
    library_book = db.exec(select(models.LibraryBook).where(models.LibraryBook.book_id == book_id)).first()
    favorite_book = db.exec(select(models.FavoriteBook).where(models.FavoriteBook.book_id == book_id)).first()
    if favorite_book:
        db.delete(favorite_book)
    if library_book:
        db.delete(library_book)
    bookings = db.exec(select(models.Booking).where(models.Booking.book_id == book_id)).all()
    for booking in bookings:
        db.delete(booking)
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    db.delete(book)
    db.commit()
