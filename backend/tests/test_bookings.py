import pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import create_engine, Session, SQLModel
import os, sys
os.environ["TESTING"] = "1"
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
from sqlmodel.pool import StaticPool
from app.database import init_engine, get_session
from app import models

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
async def test_crud_booking(client: AsyncClient, session: Session):
    created = []

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
    created.append("user")

    user = session.get(models.LibUser, user_resp.json()['id'])
    user.role = "manager"
    session.commit()

    login_payload = {
        "username": "loltotallytest@girl.yes",
        "password": "string"
    }
    resp = await client.post("users/login", data=login_payload)
    access_token = resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    lib_payload = {
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
    lib_resp = await client.post("/libraries/", json=lib_payload, headers=headers)
    assert lib_resp.status_code in (200, 201), lib_resp.text
    created.append("library")
    library_id = lib_resp.json()["id"]

    
    user_id = (await client.get("/users/email/loltotallytest@girl.yes", headers=headers)).json()["id"]

    if (await client.get("/books/1", headers=headers)).status_code == 404:
        book_payload = {
            "id": 1,
            "title": "Book",
            "author": "Author",
            "isbn": "123",
            "library_id": library_id,
            "description": "Test",
            "year": 2023,
            "image_url": "",
            "genre": "Test"
        }
        book_resp = await client.post("/books/1", json=book_payload, headers=headers)
        assert book_resp.status_code in (200, 201), book_resp.text
        created.append("book")


    payload = {
        "user_id": user_id,
        "book_id": 1,
        "library_id": library_id,
        "date_from": "2025-07-02",
        "date_to": "2025-07-02",
        "status": "pending"
    }

    response = await client.post("/bookings/", json=payload, headers=headers)
    assert response.status_code == 200, response.text
    booking = response.json()
    assert booking["user_id"] == user_id
    assert booking["book_id"] == 1
    assert booking["library_id"] == library_id

    get_resp = await client.get(f"/bookings/{booking['id']}", headers=headers)
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["status"] == "pending"

    update_payload = {"status": "cancelled"}
    update_resp = await client.patch(f"/bookings/{booking['id']}", json=update_payload, headers=headers)
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["status"] == "cancelled"

    delete = await client.delete(f"/bookings/{booking['id']}", headers=headers)
    assert delete.status_code == 204

