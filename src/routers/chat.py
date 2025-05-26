from fastapi import APIRouter, HTTPException
from src.schemas.chat import ChatCreate, ChatResponse, ChatWithMembersResponse, ChatMember
from src.core.dependencies import ChatServiceDepends

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("/", response_model=ChatResponse)
async def create_chat(data: ChatCreate, service: ChatServiceDepends):
    try:
        chat = await service.create_chat(data.name, data.type)
        return chat
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{chat_id}", response_model=ChatWithMembersResponse)
async def get_chat(chat_id: int, service: ChatServiceDepends):
    try:
        chat = await service.get_chat(chat_id)
        return chat
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/add_member")
async def add_member(data: ChatMember, service: ChatServiceDepends):
    try:
        await service.add_user_to_chat(data.chat_id, data.user_id)
        return {"detail": f"Пользователь {data.user_id} добавлен в чат {data.chat_id}"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
