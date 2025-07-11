import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import create_engine, Session, SQLModel
import os, sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
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
async def test_create_and_get_library(client: AsyncClient):
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

    payload = {
        "name": "Test Library",
        "city": "Test City",
        "address": "123 Test St",
        "phone": "1234567890",
        "email": "libtest@la.la",
        "description": "Test library",
        "open_at": "09:00",
        "close_at": "17:00",
        "days_open": "Mon-Fri"
    }
    create_resp = await client.post("/libraries/", json=payload, headers=headers)
    assert create_resp.status_code == 200, create_resp.text
    library = create_resp.json()
    assert library["name"] == "Test Library"

    get_resp = await client.get(f"/libraries/{library['id']}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["city"] == "Test City"

    delete = await client.delete(f"/libraries/{library['id']}", headers=headers)
    assert delete.status_code == 204

    await client.delete(f"/users/{user_id}", headers=headers)

@pytest.mark.asyncio
async def test_get_library_cities(client: AsyncClient):
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

    payload = {
        "name": "City Test Library",
        "city": "Slaytown",
        "address": "456 Diva Ave",
        "phone": "0987654321",
        "email": "libtest@la.la",
        "description": "A fabulous library",
        "open_at": "10:00",
        "close_at": "18:00",
        "days_open": "Tue-Sat"
    }
    library = await client.post("/libraries/", json=payload, headers=headers)
    lib_id = library.json()["id"]
    cities_resp = await client.get("/libraries/cities")
    assert cities_resp.status_code == 200
    cities = cities_resp.json()
    assert "Slaytown" in cities

    delete = await client.delete(f"/libraries/{lib_id}", headers=headers)
    assert delete.status_code == 204

    await client.delete(f"/users/{user_id}", headers=headers)

@pytest.mark.asyncio
async def test_update_library(client: AsyncClient):
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

    payload = {
        "name": "Update Me Library",
        "city": "Old City",
        "address": "789 Old St",
        "phone": "5555555555",
        "email": "libtest@la.la",
        "description": "Old description",
        "open_at": "08:00",
        "close_at": "16:00",
        "days_open": "Mon-Sun"
    }
    library = await client.post("/libraries/", json=payload, headers=headers)
    lib_id = library.json()["id"]

    update_data = {"name": "Updated Library", "city": "New City"}
    update_resp = await client.patch(f"/libraries/{lib_id}", json=update_data, headers=headers)
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["name"] == "Updated Library"
    assert updated["city"] == "New City"

    delete = await client.delete(f"/libraries/{lib_id}", headers=headers)
    assert delete.status_code == 204

    await client.delete(f"/users/{user_id}", headers=headers)

@pytest.mark.asyncio
async def test_get_all_libraries(client: AsyncClient):
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

    payload1 = {
        "id": 101,
        "name": "Alpha Library",
        "city": "City A",
        "address": "Alpha St",
        "phone": "1111111111",
        "email": "libtest1@la.la",
        "description": "Library Alpha",
        "open_at": "08:00",
        "close_at": "17:00",
        "days_open": "Mon-Fri"
    }
    payload2 = {
        "id": 102,
        "name": "Beta Library",
        "city": "City B",
        "address": "Beta Blvd",
        "phone": "2222222222",
        "email": "libtest2@la.la",
        "description": "Library Beta",
        "open_at": "09:00",
        "close_at": "18:00",
        "days_open": "Mon-Fri"
    }
    await client.post("/libraries/", json=payload1, headers=headers)
    await client.post("/libraries/", json=payload2, headers=headers)

    get_resp = await client.get("/libraries/")
    assert get_resp.status_code == 200
    libraries = get_resp.json()
    print(libraries)
    assert any(lib["id"] == 101 for lib in libraries)
    assert any(lib["id"] == 102 for lib in libraries)

    delete1 = await client.delete("/libraries/101", headers=headers)
    delete2 = await client.delete("/libraries/102", headers=headers)
    assert delete1.status_code == 204
    assert delete2.status_code == 204

    await client.delete(f"/users/{user_id}", headers=headers)
