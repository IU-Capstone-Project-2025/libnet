import pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import create_engine, Session, SQLModel
import os, sys
from datetime import date, timedelta
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
from app import models
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(DATABASE_URL)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.rollback()
            session.close()

@pytest_asyncio.fixture(name="client")
async def client_fixture(session):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_crud_booking(client: AsyncClient, session: Session):
    created = []
    if (await client.get("/libraries/1")).status_code == 404:
        lib_payload = {
            "id": 1,
            "name": "string",
            "city": "string",
            "phone": "string",
            "email": "string",
            "address": "string",
            "description": "string",
            "open_at": "string",
            "close_at": "string",
            "days_open": "string",
            "booking_duration": 7,
            "rent_duration": 14
        }
        lib_resp = await client.post("/libraries/", json=lib_payload)
        assert lib_resp.status_code in (200, 201), lib_resp.text
        created.append("library")

    if (await client.get("/users/email/lol@girl.yes")).status_code == 404:
        user_payload = {
            "first_name": "string",
            "last_name": "string",
            "email": "lol@girl.yes",
            "password": "string",
            "phone": "string",
            "city": "string",
            "role": "user"
        }
        user_resp = await client.post("/users/register", json=user_payload)
        assert user_resp.status_code in (200, 201), user_resp.text
        created.append("user")
    user_id = (await client.get("/users/email/lol@girl.yes")).json()["id"]

    if (await client.get("/books/1")).status_code == 404:
        book_payload = {
            "id": 1,
            "title": "Book",
            "author": "Author",
            "isbn": "123",
            "library_id": 1,
            "description": "Test",
            "year": 2023,
            "image_url": "",
            "genre": "Test"
        }
        book_resp = await client.post("/books/1", json=book_payload)
        assert book_resp.status_code in (200, 201), book_resp.text
        created.append("book")


    payload = {
        "user_id": user_id,
        "book_id": 1,
        "library_id": 1,
        "date_from": "2025-07-02",
        "date_to": "2025-07-02",
        "status": "pending"
    }

    response = await client.post("/bookings/", json=payload)
    assert response.status_code == 200, response.text
    booking = response.json()
    assert booking["user_id"] == user_id
    assert booking["book_id"] == 1
    assert booking["library_id"] == 1

    get_resp = await client.get(f"/bookings/{booking['id']}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["status"] == "pending"

    update_payload = {"status": "cancelled"}
    update_resp = await client.patch(f"/bookings/{booking['id']}", json=update_payload)
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["status"] == "cancelled"

    delete = await client.delete(f"/bookings/{booking['id']}")
    assert delete.status_code == 204

    for item in created:
        if item == "library":
            await client.delete("/libraries/1")
            assert (await client.get("/libraries/1")).status_code == 404
        elif item == "user":
            await client.delete("/users/1")
            assert (await client.get("/users/1")).status_code == 404
        elif item == "book":
            await client.delete("/books/1")
            assert (await client.get("/books/1")).status_code == 404
