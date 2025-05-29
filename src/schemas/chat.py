from pydantic import BaseModel

from src.models import ChatType
from src.schemas.user import UserResponse
from src.schemas.base import IdValidationMixin, NotBlankStrValidationMixin


class ChatPersonalCreate(NotBlankStrValidationMixin, BaseModel):
    name: str
    __name_fields__ = ["name"]


class ChatGroupCreate(NotBlankStrValidationMixin, IdValidationMixin, BaseModel):
    name: str
    creator_id: int
    __name_fields__ = ["name"]
    __id_fields__ = ["creator_id"]


class ChatId(IdValidationMixin, BaseModel):
    id: int
    __id_fields__ = ["id"]


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
