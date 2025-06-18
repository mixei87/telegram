from pydantic import BaseModel, ConfigDict
from src.schemas.base import (
    IdValidationMixin,
    UUIDValidationMixin,
    NotBlankStrValidationMixin,
)


class MessageCreateHttp(
    BaseModel, UUIDValidationMixin, IdValidationMixin, NotBlankStrValidationMixin
):
    external_id: str
    chat_id: int
    sender_id: int
    text: str

    __uuid_fields__ = ["external_id"]
    __id_fields__ = ["chat_id", "sender_id"]
    __str_fields__ = ["text"]


class MessageCreateWS(BaseModel, UUIDValidationMixin, NotBlankStrValidationMixin):
    external_id: str
    text: str

    __uuid_fields__ = ["external_id"]
    __str_fields__ = ["text"]


class MessageResponse(BaseModel):
    chat_id: int
    sender_id: int
    text: str
    is_read: bool

    model_config = ConfigDict(from_attributes=True)


class MessageHistoryResponse(BaseModel):
    messages: list[MessageResponse]
