from fastapi import APIRouter, HTTPException
from src.schemas.chat import ChatPersonalCreate, ChatGroupCreate, ChatResponse, ChatWithMembersResponse, ChatMember, \
    ChatId
from src.core.dependencies import ChatServiceDepends
from src.models.chat import Chat

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("/create_personal", response_model=ChatResponse)
async def create_personal_chat(data: ChatPersonalCreate, service: ChatServiceDepends) -> Chat:
    try:
        chat = await service.create_personal_chat(data.name)
        return chat
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create_group", response_model=ChatResponse)
async def create_group_chat(data: ChatGroupCreate, service: ChatServiceDepends) -> Chat:
    try:
        chat = await service.create_group_chat(data.name, data.creator_id)
        return chat
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{chat_id}", response_model=ChatWithMembersResponse)
async def get_chat(chat_id: int, service: ChatServiceDepends) -> Chat:
    try:
        chat = ChatId(id=chat_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    chat = await service.get_chat(chat.id)
    if chat is None:
        raise HTTPException(status_code=404, detail=f"Чат с id: {chat_id} не найден")
    return chat


@router.post("/add_member")
async def add_member(data: ChatMember, service: ChatServiceDepends) -> str:
    try:
        await service.add_user_to_chat(data.chat_id, data.user_id)
        return f"Пользователь {data.user_id} добавлен в чат {data.chat_id}"
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
