import pytest, pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import create_engine, Session, SQLModel
import os, sys
os.environ["TESTING"] = "1"
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
async def test_crud_login_user(client: AsyncClient, session: Session):
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

    headers = {"Authorization": f"Bearer {token}"}

    get_resp = await client.get(f"/users/{user['id']}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["email"] == "user_test_reg@test.lol"

    update_payload = {
        "city": "New City"
    }
    patch_resp = await client.patch(f"/users/{user['id']}", json=update_payload, headers=headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["city"] == "New City"

    delete = await client.delete(f"/users/{user['id']}", headers=headers)
    assert delete.status_code == 204, delete.text

@pytest.mark.asyncio
async def test_user_likes_book(client: AsyncClient, session: Session):
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
    headers = {"Authorization": f"Bearer {login_resp.json().get("access_token")}"}

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
        "title": "testBook 1",
        "author": "Author 1",
        "isbn": "11100000000000",
        "library_id": 1,
        "description": "First book",
        "year": 2023,
        "image_url": "",
        "genre": "Fiction",
        "pages_count": 300
    }

    book2_data = {
        "title": "testBook 2",
        "author": "Author 2",
        "isbn": "222000000000000",
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

    fav_payload = {"user_id": user["id"], "book_id": book1["id"]}
    like_resp = await client.post("/users/like", json=fav_payload, headers=headers)
    assert like_resp.status_code == 200


    likes_resp = await client.get(f"/users/likes/{user['id']}", headers=headers)
    assert likes_resp.status_code == 200
    assert book1["id"] in likes_resp.json()


    unlike_resp = await client.delete(f"/users/like/{user['id']}/{book1['id']}", headers=headers)
    assert unlike_resp.status_code == 204


    await client.delete(f"/books/{book1['id']}", headers=headers)
    await client.delete(f"/books/{book2['id']}", headers=headers)

    if created:
        await client.delete("/libraries/1", headers=headers)
        assert (await client.get("/libraries/1")).status_code == 404

    await client.delete(f"/users/{user['id']}", headers=headers)

@pytest.mark.asyncio
async def test_user_update_password(client: AsyncClient, session: Session):
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

    headers = {"Authorization": f"Bearer {token}"}

    update_password_payload = {
        "old_password": "testing123",
        "new_password": "newpassword123"
    }
    update_resp = await client.patch(f"/users/{user['id']}/update-password", json=update_password_payload, headers=headers)
    assert update_resp.status_code == 200, update_resp.text 

    delete = await client.delete(f"/users/{user['id']}", headers=headers)
    assert delete.status_code == 204, delete.text