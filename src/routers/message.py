from fastapi import APIRouter, HTTPException
from src.schemas.message import MessageCreateHttp, MessageResponse
from src.schemas.chat import ChatId
from src.core.dependencies import MessageServiceDepends

router = APIRouter(tags=["messages"])


@router.post("/messages/", response_model=MessageResponse)
async def send_message(data: MessageCreateHttp, service: MessageServiceDepends):
    try:
        message = await service.create_message(data.external_id, data.chat_id, data.sender_id, data.text)
        if message is None:
            return {"detail": "Сообщение уже существует"}
        return message
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history/{chat_id}", response_model=list[MessageResponse])
async def get_messages(chat_id: int, service: MessageServiceDepends, limit: int = 10, offset: int = 0):
    try:
        ChatId(id=chat_id)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    return await service.get_messages(chat_id, limit, offset)
