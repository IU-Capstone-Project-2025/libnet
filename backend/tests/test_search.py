import pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import create_engine, Session, SQLModel
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
from app import models
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
async def test_search(client: AsyncClient, session: Session):
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
        "title": "Cool book",
        "author": "Author 1",
        "isbn": "111",
        "library_id": 1,
        "description": "First book",
        "year": 1900,
        "image_url": "",
        "genre": "Fiction",
        "pages_count": 300
    }

    book2_data = {
        "title": "Slay book",
        "author": "Author 2",
        "isbn": "222",
        "library_id": 1,
        "description": "Second book",
        "year": 2025,
        "image_url": "",
        "genre": "Non-Fiction",
        "pages_count": 300
    }

    book3_data = {
        "title": "Lol book",
        "author": "Author 7",
        "isbn": "222",
        "library_id": 1,
        "description": "Second book",
        "year": 2023,
        "image_url": "",
        "genre": "Non-Fiction",
        "pages_count": 300
    }

    create_resp1 = await client.post("/books/1", json=book1_data)
    assert create_resp1.status_code == 201, create_resp1.text
    book1 = create_resp1.json()

    create_resp2 = await client.post("/books/1", json=book2_data)
    assert create_resp2.status_code == 201, create_resp2.text
    book2 = create_resp2.json()

    create_resp3 = await client.post("/books/1", json=book3_data)
    assert create_resp3.status_code == 201, create_resp3.text
    book3 = create_resp3.json()

    search1_payload = {
        "title": "Cool"
    }

    search2_payload = {
        "title": "book"
    }

    search3_payload = {
        "title": "Slay"
    }

    search4_payload = {
        "year": "2000-2025"
    }

    search5_payload = {
        "authors": "Author 7;Author 2"
    }
    search1_resp = await client.get("/search/", params=search1_payload)
    assert search1_resp.status_code == 200, search1_resp.text
    search1_results = search1_resp.json()
    assert len(search1_results) == 1
    assert search1_results[0]["id"] == book1["id"]
    assert search1_results[0]["title"] == "Cool book"

    search2_resp = await client.get("/search/", params=search2_payload)
    assert search2_resp.status_code == 200, search2_resp.text
    search2_results = search2_resp.json()
    assert len(search2_results) >= 3

    search3_resp = await client.get("/search/", params=search3_payload)
    assert search3_resp.status_code == 200, search3_resp.text
    search3_results = search3_resp.json()
    assert len(search3_results) == 1
    assert search3_results[0]["id"] == book2["id"]
    assert search3_results[0]["title"] == "Slay book"

    search4_resp = await client.get("/search/", params=search4_payload)
    assert search4_resp.status_code == 200, search4_resp.text
    search4_results = search4_resp.json()
    assert len(search4_results) == 2

    search5_resp = await client.get("/search/", params=search5_payload)
    assert search5_resp.status_code == 200, search5_resp.text
    search5_results = search5_resp.json()
    assert len(search5_results) == 2

    await client.delete(f"/books/{book1['id']}")
    await client.delete(f"/books/{book2['id']}")
    await client.delete(f"/books/{book3['id']}")

    if created:
        await client.delete("/libraries/1")
        assert (await client.get("/libraries/1")).status_code == 404