import pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import create_engine, Session, SQLModel, select
import os, sys
os.environ["TESTING"] = "1"
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
from sqlmodel.pool import StaticPool
from app.database import get_session, init_engine
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
async def test_login_manager(client: AsyncClient, session: Session):
    user_payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": "user_test_reg@test.lol",
        "password": "testing123",
        "phone": "1234567890",
        "city": "Test City",
        "role": "user"
    }
    create_resp = await client.post("/users/register", json=user_payload)
    assert create_resp.status_code == 200, create_resp.text
    user = create_resp.json()

    user_login_payload = {
        "username": "user_test_reg@test.lol",
        "password": "testing123"
    }
    login_first_resp = await client.post("/managers/login", data=user_login_payload)
    assert login_first_resp.status_code == 403, login_first_resp.text

    manager_payload = {
        "first_name": "Test",
        "last_name": "Manager",
        "email": "manager_test_reg@test.lol",
        "password": "testing123",
        "phone": "1234567890",
        "city": "Test City",
    }
    create_resp = await client.post("/users/register", json=manager_payload)
    assert create_resp.status_code == 200, create_resp.text
    manager = create_resp.json()
    user_m = session.exec(select(models.LibUser).where(models.LibUser.email == manager_payload["email"])).first()
    user_m.role = "manager"
    session.commit()
    
    manager_login_payload = {
        "username": "manager_test_reg@test.lol",
        "password": "testing123"
    }
    login_resp = await client.post("/managers/login", data=manager_login_payload)
    assert login_resp.status_code == 200, login_resp.text
    token = login_resp.json().get("access_token")
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    delete_user = await client.delete(f"/users/{user['id']}", headers=headers)
    assert delete_user.status_code == 204

    delete_manager = await client.delete(f"/users/{manager['id']}", headers=headers)
    assert delete_manager.status_code == 204