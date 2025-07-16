import pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import create_engine, Session, SQLModel
import os, sys
os.environ["TESTING"] = "1"
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
from app import models
import io
import shutil
from sqlmodel.pool import StaticPool
from app.database import get_session, init_engine

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    init_engine("sqlite://")
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest_asyncio.fixture(name="client")
async def client_fixture(session):
    app.dependency_overrides[get_session] = lambda: session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_and_get_book(client: AsyncClient, session: Session):
    user_payload = {
        "first_name": "string",
        "last_name": "string",
        "email": "loltotallytest@girl.yes",
        "password": "string",
        "phone": "string",
        "city": "string",
        "role": "user"
    }
    user_resp = await client.post("/users/register", json=user_payload)
    assert user_resp.status_code in (200, 201), user_resp.text

    login_payload = {
        "username": "loltotallytest@girl.yes",
        "password": "string"
    }
    resp = await client.post("users/login", data=login_payload)
    access_token = resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    user_id = (await client.get("/users/email/loltotallytest@girl.yes", headers=headers)).json()["id"]

    created = False
    if (await client.get("/libraries/1")).status_code == 404:
        library = models.Library(
            id=1, name="Central Library", city="Test City",
            address="123 Test St", phone="1234567890", email="book_test@la.la",
            description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri"
        )
        session.add(library)
        session.commit()
        created = True
    payload = {
        "title": "Slay Book",
        "author": "Queen B",
        "isbn": "123",
        "library_id": 1,
        "description": "A book about slaying",
        "year": 2023,
        "image_url": "",
        "genre": "Fantasy",
        "pages_count": 300
    }
    create_resp = await client.post("/books/1", json=payload, headers=headers)
    assert create_resp.status_code == 201
    book = create_resp.json()

    get_resp = await client.get(f"/books/{book['id']}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["title"] == "Slay Book"
    assert data["author"] == "Queen B"

    delete = await client.delete(f"/books/{book['id']}", headers=headers)
    assert delete.status_code == 204, delete.text

    if created:
        await client.delete("/libraries/1", headers=headers)
        assert (await client.get("/libraries/1")).status_code == 404
    await client.delete(f"/users/{user_id}", headers=headers)

@pytest.mark.asyncio
async def test_upload_cover(client: AsyncClient, session: Session):
    user_payload = {
        "first_name": "string",
        "last_name": "string",
        "email": "loltotallytest@girl.yes",
        "password": "string",
        "phone": "string",
        "city": "string",
        "role": "user"
    }
    user_resp = await client.post("/users/register", json=user_payload)
    assert user_resp.status_code in (200, 201), user_resp.text

    login_payload = {
        "username": "loltotallytest@girl.yes",
        "password": "string"
    }
    resp = await client.post("users/login", data=login_payload)
    access_token = resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    user_id = (await client.get("/users/email/loltotallytest@girl.yes", headers=headers)).json()["id"]

    created = False
    if (await client.get("/libraries/1")).status_code == 404:
        library = models.Library(
            id=1, name="Central Library", city="Test City",
            address="123 Test St", phone="1234567890", email="book_test@la.la",
            description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri"
        )
        session.add(library)
        session.commit()
        created = True
    
    payload = {
        "title": "Cover Test",
        "author": "Cover Queen",
        "isbn": "321",
        "library_id": 1,
        "description": "A book to test cover upload",
        "year": 2023,
        "image_url": "",
        "genre": "Mystery",
        "pages_count": 300
    }
    create_resp = await client.post("/books/1", json=payload, headers=headers)
    assert create_resp.status_code == 201, create_resp.text
    book = create_resp.json()

    file_bytes = io.BytesIO(b"fake image data")
    files = {"file": ("cover.jpg", file_bytes, "image/jpeg")}

    upload_resp = await client.post(f"/books/upload-cover/{book['id']}", files=files, headers=headers)
    assert upload_resp.status_code == 200, upload_resp.text
    data = upload_resp.json()
    assert "image_url" in data
    assert data["id"] == book["id"]

    await client.delete(f"/books/{book['id']}", headers=headers)
    if os.path.exists("book_covers/"):
        shutil.rmtree("book_covers/")

    if created:
        await client.delete("/libraries/1", headers=headers)
        assert (await client.get("/libraries/1")).status_code == 404
    
    await client.delete(f"/users/{user_id}", headers=headers)

@pytest.mark.asyncio
async def test_update_book(client: AsyncClient, session: Session):
    user_payload = {
        "first_name": "string",
        "last_name": "string",
        "email": "loltotallytest@girl.yes",
        "password": "string",
        "phone": "string",
        "city": "string",
        "role": "user"
    }
    user_resp = await client.post("/users/register", json=user_payload)
    assert user_resp.status_code in (200, 201), user_resp.text

    login_payload = {
        "username": "loltotallytest@girl.yes",
        "password": "string"
    }
    resp = await client.post("users/login", data=login_payload)
    access_token = resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    user_id = (await client.get("/users/email/loltotallytest@girl.yes", headers=headers)).json()["id"]

    created = False
    if (await client.get("/libraries/1")).status_code == 404:
        library = models.Library(
            id=1, name="Central Library", city="Test City",
            address="123 Test St", phone="1234567890", email="book_test@la.la",
            description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri"
        )
        session.add(library)
        session.commit()
        created = True
    
    payload  = {
        "title": "Old Title",
        "author": "Old Author",
        "isbn": "999",
        "library_id": 1,
        "description": "A book to update",
        "year": 2023,
        "image_url": "",
        "genre": "Sci-Fi",
        "pages_count": 300
    }
    create_resp = await client.post("/books/1", json=payload, headers=headers)
    assert create_resp.status_code == 201, create_resp.text
    book = create_resp.json()

    update_payload = {"title": "New Title", "author": "New Author"}
    response = await client.patch(f"/books/{book['id']}", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["author"] == "New Author"

    await client.delete(f"/books/{book['id']}", headers=headers)
    
    if created:
        await client.delete("/libraries/1", headers=headers)
        assert (await client.get("/libraries/1")).status_code == 404
    await client.delete(f"/users/{user_id}", headers=headers)

@pytest.mark.asyncio
async def test_get_all_books(client: AsyncClient, session: Session):
    user_payload = {
        "first_name": "string",
        "last_name": "string",
        "email": "loltotallytest@girl.yes",
        "password": "string",
        "phone": "string",
        "city": "string",
        "role": "user"
    }
    user_resp = await client.post("/users/register", json=user_payload)
    assert user_resp.status_code in (200, 201), user_resp.text

    login_payload = {
        "username": "loltotallytest@girl.yes",
        "password": "string"
    }
    resp = await client.post("users/login", data=login_payload)
    access_token = resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    user_id = (await client.get("/users/email/loltotallytest@girl.yes", headers=headers)).json()["id"]

    created = False
    if (await client.get("/libraries/1")).status_code == 404:
        library = models.Library(
            id=1, name="Central Library", city="Test City",
            address="123 Test St", phone="1234567890", email="book_test@la.la",
            description="Main library for testing", open_at="09:00", close_at="17:00", days_open="Mon-Fri"
        )
        session.add(library)
        session.commit()
        created = True
    
    book1_data = {
        "title": "Book 1",
        "author": "Author 1",
        "isbn": "111",
        "library_id": 1,
        "description": "First book",
        "year": 2023,
        "image_url": "",
        "genre": "Fiction",
        "pages_count": 300
    }

    book2_data = {
        "title": "Book 2",
        "author": "Author 2",
        "isbn": "222",
        "library_id": 1,
        "description": "Second book",
        "year": 2023,
        "image_url": "",
        "genre": "Non-Fiction",
        "pages_count": 300
    }

    create_resp1 = await client.post("/books/1", json=book1_data, headers=headers)
    assert create_resp1.status_code == 201, create_resp1.text
    book1 = create_resp1.json()

    create_resp2 = await client.post("/books/1", json=book2_data, headers=headers)
    assert create_resp2.status_code == 201, create_resp2.text
    book2 = create_resp2.json()

    response = await client.get("/books/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

    await client.delete(f"/books/{book1['id']}", headers=headers)
    await client.delete(f"/books/{book2['id']}", headers=headers)
    if created:
        await client.delete("/libraries/1", headers=headers)
        assert (await client.get("/libraries/1")).status_code == 404
    
    await client.delete(f"/users/{user_id}", headers=headers)
    