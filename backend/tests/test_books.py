import pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from fastapi.testclient import TestClient
from sqlmodel import create_engine, Session, SQLModel
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
from app import models
import io
from app.database import get_session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(DATABASE_URL)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest_asyncio.fixture(name="client")
async def client_fixture(session):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_and_get_book(client: AsyncClient, session: Session):
    library = models.Library(id=1, name="Central Library", city="Test City", address="123 Test St", phone="1234567890", email="", description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri")
    session.add(library)
    session.commit()

    book = models.Book(title="Slay Book", author="Queen B", isbn="123", library_id=1, description="A book about slaying", year=2023, image_url="", genre="Fantasy")
    session.add(book)
    session.commit()
    session.refresh(book)

    response = await client.get(f"/books/{book.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Slay Book"
    assert data["author"] == "Queen B"

@pytest.mark.asyncio
async def test_upload_cover(client: AsyncClient, session: Session):
    library = models.Library(id=1, name="Central Library", city="Test City", address="123 Test St", phone="1234567890", email="", description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri")
    session.add(library)
    session.commit()
    
    book = models.Book(title="Cover Test", author="Cover Queen", isbn="321", library_id=1, description="A book to test cover upload", year=2023, image_url="", genre="Mystery")
    session.add(book)
    session.commit()
    session.refresh(book)

    file_bytes = io.BytesIO(b"fake image data")
    files = {"file": ("cover.jpg", file_bytes, "image/jpeg")}

    response = await client.post(f"/books/upload-cover/{book.id}", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "image_url" in data
    assert data["id"] == book.id

@pytest.mark.asyncio
async def test_update_book(client: AsyncClient, session: Session):
    library = models.Library(id=1, name="Central Library", city="Test City", address="123 Test St", phone="1234567890", email="", description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri")
    session.add(library)
    session.commit()
    
    book = models.Book(title="Old Title", author="Old Author", isbn="999", library_id=1, description="A book to update", year=2023, image_url="", genre="Sci-Fi")
    session.add(book)
    session.commit()
    session.refresh(book)

    update_payload = {"title": "New Title", "author": "New Author"}
    response = await client.patch(f"/books/{book.id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["author"] == "New Author"

@pytest.mark.asyncio
async def test_delete_book(client: AsyncClient, session: Session):
    library = models.Library(id=1, name="Central Library", city="Test City", address="123 Test St", phone="1234567890", email="", description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri")
    session.add(library)
    session.commit()
    
    book = models.Book(title="Delete Me", author="Bye", isbn="555", library_id=1, description="A book to delete", year=2023, image_url="", genre="Horror")
    session.add(book)
    session.commit()
    session.refresh(book)

    response = await client.delete(f"/books/{book.id}")
    assert response.status_code == 204

    response = await client.get(f"/books/{book.id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_get_all_books(client: AsyncClient, session: Session):
    library = models.Library(id=1, name="Central Library", city="Test City", address="123 Test St", phone="1234567890", email="", description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri")
    session.add(library)
    session.commit()
    
    book1 = models.Book(title="Book 1", author="Author 1", isbn="111", library_id=1, description="First book", year=2023, image_url="", genre="Fiction")
    book2 = models.Book(title="Book 2", author="Author 2", isbn="222", library_id=1, description="Second book", year=2023, image_url="", genre="Non-Fiction")
    session.add_all([book1, book2])
    session.commit()

    response = await client.get("/books/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2