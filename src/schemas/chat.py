from pydantic import BaseModel, field_validator

from src.models import ChatType
from src.schemas.user import UserResponse
from src.schemas.base import IdValidationMixin


class ChatCreate(BaseModel):
    name: str
    type: ChatType

    @field_validator("name")
    def validate_name(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Название чата не может быть пустым")
        return value


class ChatMember(IdValidationMixin, BaseModel):
    chat_id: int
    user_id: int
    __id_fields__ = ["chat_id", "user_id"]


class ChatResponse(BaseModel):
    id: int
    name: str
    type: ChatType

    class Config:
        from_attributes = True


class ChatWithMembersResponse(BaseModel):
    id: int
    name: str
    type: ChatType
    members: list[UserResponse] | None

    class Config:
        from_attributes = True
