from fastapi import APIRouter, HTTPException
from src.schemas.user import UserCreate, UserResponse, UserIdSchema
from src.models import User
from src.core.dependencies import UserServiceDepends

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, service: UserServiceDepends) -> User:
    try:
        user_id = UserIdSchema(user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserResponse)
async def create_user(data: UserCreate, service: UserServiceDepends) -> User:
    try:
        user = await service.create_user(data.name, data.email, data.password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
