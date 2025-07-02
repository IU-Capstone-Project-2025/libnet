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
async def test_reg_login_user(client: AsyncClient, session: Session):
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": "user_test_reg@test.lol",
        "password": "testing123",
        "phone": "1234567890",
        "city": "Test City",
        "role": "user"
    }
    create_resp = await client.post("/users/register", json=payload)
    assert create_resp.status_code == 200, create_resp.text
    user = create_resp.json()
    assert user["email"] == "user_test_reg@test.lol"

    login_payload = {
        "username": "user_test_reg@test.lol",
        "password": "testing123"
    }
    login_resp = await client.post("/users/login", data=login_payload)
    assert login_resp.status_code == 200, login_resp.text
    token = login_resp.json().get("access_token")
    assert token is not None

    delete = await client.delete(f"/users/{user['id']}")
    assert delete.status_code == 204, delete.text