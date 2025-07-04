from fastapi import Query, APIRouter, Depends
from sqlmodel import Session, select, or_
from app.database import get_session
from app import models

router = APIRouter()

@router.get("/", response_model=list[models.Book])
def search_books(title: str = Query(default=None), authors: str = Query(default=None),
                 genres: str = Query(default=None), rating: int = Query(default=None), year: str = Query(default=None),
                 db: Session = Depends(get_session)):
    
    query = select(models.Book)

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
    if rating:
        query = query.where(models.Book.rating <= rating)
    if year:
        year_from = year.split("-")[0].strip()
        year_to = year.split("-")[1].strip()
        query = query.where(models.Book.year >= year_from, models.Book.year <= year_to)

    query = query.order_by(models.Book.title)

    books = db.exec(query).all()
    return books
