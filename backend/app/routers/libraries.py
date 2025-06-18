from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app import models

router = APIRouter()

# Create a Library
@router.post("/", response_model=models.Library)
def create_library(library: models.Library, db: Session=Depends(get_session)):
    db.add(library)
    db.commit()
    db.refresh(library)

    return library

# Get all Libraries
@router.get("/", response_model=list[models.Library])
def get_libraries(db: Session = Depends(get_session)):
    libraries = db.exec(select(models.Library)).all()
    return libraries

# Get single Library
@router.get("/{library_id}", response_model=models.Library)
def get_library(library_id: int, db: Session = Depends(get_session)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    return library

# Update a Library
@router.patch("/{library_id}", response_model=models.Library)
def update_library(library_id: int, library_update: models.Library, db: Session = Depends(get_session)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id)).first()
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    updated_data = library_update.model_dump(exclude_unset=True)
    for key, value in updated_data.items():
        setattr(library, key, value)

    db.add(library)
    db.commit()
    db.refresh(library)
    return library

# Delete a Library
@router.delete("/{library_id}", response_model=models.Library)
def delete_library(library_id: int, db: Session = Depends(get_session)):
    library = db.exec(select(models.Library).where(models.Library.id == library_id))
    if not library:
        raise HTTPException(status_code=404, detail="Library not found")
    
    db.delete(library)
    db.commit()
