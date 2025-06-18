from fastapi import APIRouter, HTTPException

from src.core.dependencies import ChatServiceDepends
from src.core.exceptions import NotFoundError, AlreadyExistsError
from src.models.chat import Chat
from src.schemas.base import PositiveIntID
from src.schemas.chat import (
    ChatPersonalCreate,
    ChatGroupCreate,
    ChatResponse,
    ChatWithMembersResponse,
    ChatMember,
    ChatMemberResponse,
)

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("/create_personal", response_model=ChatResponse)
async def create_personal_chat(
    data: ChatPersonalCreate, service: ChatServiceDepends
) -> Chat:
    try:
        return await service.create_personal_chat(data.creator_id, data.friend_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create_group", response_model=ChatResponse)
async def create_group_chat(data: ChatGroupCreate, service: ChatServiceDepends) -> Chat:
    try:
        return await service.create_group_chat(data.name, data.creator_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{chat_id}", response_model=ChatWithMembersResponse)
async def get_chat(chat_id: PositiveIntID, service: ChatServiceDepends) -> Chat:
    chat = await service.get_chat_with_members(chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Чат с id: {chat_id} не найден")
    return chat


@router.post("/add_member", response_model=ChatMemberResponse)
async def add_member(data: ChatMember, service: ChatServiceDepends):
    try:
        await service.add_user_to_chat(data.chat_id, data.user_id)
        return ChatMemberResponse(chat_id=data.chat_id, user_id=data.user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except AlreadyExistsError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
