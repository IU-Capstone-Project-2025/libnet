from fastapi import APIRouter

router = APIRouter()

@router.get("/fake")
def fake():
    return {"message": "placeholder"}
