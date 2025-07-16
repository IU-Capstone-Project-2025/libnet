from fastapi import Query, APIRouter, Depends, Request
from sqlmodel import Session, select, or_, func
from app.database import get_session
from app import models
from app.limiter import limiter

router = APIRouter()

@router.get("/", response_model=list[models.Book])
@limiter.limit("100/minute")
def search_books(request: Request, title: str = Query(default=None), authors: str = Query(default=None),
                 genres: str = Query(default=None), rating: int = Query(default=None), year: str = Query(default=None),
                 library_id: int = Query(default=None), city: str = Query(default=None),
                 db: Session = Depends(get_session)):
    
    query = (
        select(models.Book)
        .join(models.LibraryBook, models.Book.id == models.LibraryBook.book_id)
        .where(models.LibraryBook.quantity > 0)
    )

    if title:
        query = query.where(models.Book.title.ilike(f"%{title}%"))
    if authors:
        conditions = []
        for author in authors.split(";"):
            author = author.strip()
            conditions.append(models.Book.author.ilike(f"%{author}%"))
        query = query.where(or_(*conditions))
    if genres:
        conditions = []
        for genre in genres.split(";"):
            genre = genre.strip()
            conditions.append(models.Book.genre.ilike(f"%{genre}%"))
        query = query.where(or_(*conditions))
    if rating is not None:
        query = query.where(models.Book.rating <= rating)
    if year:
        year_from = year.split("-")[0].strip()
        year_to = year.split("-")[1].strip()
        query = query.where(models.Book.year >= year_from, models.Book.year <= year_to)
    if library_id is not None:
        query = query.where(models.Book.library_id == library_id)
    if city:
        subquery = (
            select(models.Book.id)
            .join(models.LibraryBook, models.Book.id == models.LibraryBook.book_id)
            .join(models.Library, models.LibraryBook.library_id == models.Library.id)
            .where(
                models.Library.city == city,
                models.LibraryBook.quantity > 0
            )
            .group_by(models.Book.id)
            .subquery()
        )
        
        query = query.where(models.Book.id.in_(subquery))

    query = query.order_by(models.Book.title)

    books = db.exec(query).all()
    return books
