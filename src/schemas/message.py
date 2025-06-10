from pydantic import BaseModel
from src.schemas.base import IdValidationMixin, UUIDValidationMixin, NotBlankStrValidationMixin


class MessageCreateHttp(BaseModel, UUIDValidationMixin, IdValidationMixin, NotBlankStrValidationMixin):
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
    id: int
    chat_id: int
    sender_id: int
    text: str
    is_read: bool

    class Config:
        from_attributes = True
