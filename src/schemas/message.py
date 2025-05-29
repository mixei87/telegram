from uuid import UUID

from pydantic import BaseModel, field_validator
from src.schemas.base import IdValidationMixin, NotBlankStrValidationMixin


class MessageCreate(IdValidationMixin, NotBlankStrValidationMixin, BaseModel):
    __id_fields__ = ["chat_id", "sender_id"]
    __str_fields__ = ["text"]
    external_id: str
    chat_id: int
    sender_id: int
    text: str

    @field_validator("external_id")
    def validate_external_id(cls, value: str) -> str:
        try:
            UUID(value, version=4)
        except ValueError:
            raise ValueError("external_id должен быть валидным UUIDv4")
        return value


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    text: str
    is_read: bool

    class Config:
        from_attributes = True
