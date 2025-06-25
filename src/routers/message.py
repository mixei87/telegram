from fastapi import APIRouter, HTTPException

from src.schemas.base import PositiveIntID
from src.core.exceptions import NotFoundError, AlreadyExistsError
from src.core.dependencies import MessageServiceDepends
from src.schemas.message import (
    MessageCreate,
    MessageResponse,
    MessageHistoryResponse,
)

router = APIRouter(tags=["messages"])


@router.post("/messages/", response_model=MessageResponse)
async def send_message(data: MessageCreate, service: MessageServiceDepends):
    try:
        message = await service.create_message(data)
        if message is None:
            raise AlreadyExistsError("Сообщение уже существует")
        return message
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except AlreadyExistsError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get("/history/{chat_id}", response_model=MessageHistoryResponse)
async def get_messages(
    chat_id: PositiveIntID,
    service: MessageServiceDepends,
    limit: int = 10,
    offset: int = 0,
):
    try:
        messages = await service.get_messages(chat_id, limit, offset)
        return MessageHistoryResponse(
            messages=[MessageResponse.model_validate(message) for message in messages]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
