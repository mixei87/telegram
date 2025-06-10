from fastapi import APIRouter, HTTPException
from src.core.dependencies import MessageServiceDepends

router = APIRouter(prefix="/test_data", tags=["test_data"])


@router.post("/")
async def create_test_data(service: MessageServiceDepends):
    try:
        await service.create_test_data()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
