from fastapi import APIRouter, HTTPException
from src.schemas.user import UserCreate, UserResponse, UserId
from src.models import User
from src.core.dependencies import UserServiceDepends

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse)
async def create_user(data: UserCreate, service: UserServiceDepends) -> User:
    try:
        return await service.create_user(data.name, data.email, data.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, service: UserServiceDepends) -> User:
    try:
        user = UserId(id=user_id)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    user = await service.get_user(user.id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
