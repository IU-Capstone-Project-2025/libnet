from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, and_
from app.database import get_session
from app import models
from app.auth import get_current_user

router = APIRouter()

# Create a Library
@router.post("/", response_model=models.Library)
def create_library(library: models.Library, db: Session=Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    db.add(library)
    db.commit()
    db.refresh(library)

    return library

# Get all Libraries
@router.get("/", response_model=list[models.Library])
def get_libraries(db: Session = Depends(get_session)):
    
    libraries = db.exec(select(models.Library)).all()
    return libraries

# Get cities of all Libraries
@router.get("/cities", response_model=list[str])
def get_library_cities(db: Session = Depends(get_session)):
    libraries = db.exec(select(models.Library)).all()
    if not libraries:
        raise HTTPException(status_code=404, detail="No libraries found")
    
    cities = list(set(library.city for library in libraries))
    return cities

# Get single Library
@router.get("/{library_id}", response_model=models.Library)
def get_library(library_id: int, db: Session = Depends(get_session)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    return library

# Update a Library
@router.patch("/{library_id}", response_model=models.Library)
def update_library(library_id: int, library_update: models.Library, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    
    updated_data = library_update.model_dump(exclude_unset=True)
    for key, value in updated_data.items():
        setattr(library, key, value)

    db.add(library)
    db.commit()
    db.refresh(library)
    return library

# Get list of books in a Library
@router.get("/{library_id}/books", response_model=list[models.Book])
def get_books_in_library(library_id: int, db: Session=Depends(get_session)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    books = []
    for book in library.books:
        books.append(book.book)
    return books

# Get list of bookings in a Library
@router.get("/{library_id}/bookings", response_model=list[models.Booking])
def get_bookings_in_library(library_id: int, db: Session=Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    return library.bookings

# Get list of managers in a Library
@router.get("/{library_id}/managers", response_model=list[models.LibUser])
def get_managers_in_library(library_id: int, db: Session=Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    return library.managers

# Delete a Library
@router.delete("/{library_id}", status_code=204)
def delete_library(library_id: int, db: Session = Depends(get_session), current_user: models.LibUser = Depends(get_current_user)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library does not exist")
    
    db.delete(library)
    db.commit()

# Get a Book by ISBN
@router.get("/isbn/{library_id}/{book_isbn}", response_model=models.Book)
def get_book_isbn(library_id: int, book_isbn: str, db: Session = Depends(get_session)):
    book = db.exec(select(models.Book).where(and_(
            models.Book.library_id == library_id,
            models.Book.isbn == book_isbn
        ))).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book does not exist")
    return book
