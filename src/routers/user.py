from fastapi import APIRouter, HTTPException

from src.core.dependencies import UserServiceDepends
from src.core.exceptions import AlreadyExistsError, NotFoundError
from src.models import User
from src.schemas.base import PositiveIntID
from src.schemas.chat import ChatResponse, ChatsResponse
from src.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse)
async def create_user(data: UserCreate, service: UserServiceDepends) -> User:
    try:
        return await service.create_user(data.name, data.email, data.password)
    except AlreadyExistsError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: PositiveIntID, service: UserServiceDepends) -> User:
    try:
        user = await service.get_user(user_id)
        if user is None:
            raise NotFoundError(f"Пользователь с id: {user_id} не найден")
        return user
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}/chats", response_model=ChatsResponse)
async def get_user_chats(user_id: PositiveIntID, service: UserServiceDepends):
    try:
        chats = await service.get_chats_by_user_id(user_id)
        return ChatsResponse(
            chats=[ChatResponse.model_validate(chat) for chat in chats]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
