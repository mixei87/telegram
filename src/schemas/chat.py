from pydantic import BaseModel

from src.models import ChatType
from src.schemas.user import UserResponse
from src.schemas.base import IdValidationMixin, NotBlankStrValidationMixin


class ChatPersonalCreate(BaseModel, IdValidationMixin):
    creator_id: int
    friend_id: int
    __id_fields__ = ["creator_id", "friend_id"]


class ChatGroupCreate(BaseModel, NotBlankStrValidationMixin, IdValidationMixin):
    name: str
    creator_id: int
    __str_fields__ = ["name"]
    __id_fields__ = ["creator_id"]


class ChatId(BaseModel, IdValidationMixin):
    id: int

    __id_fields__ = ["id"]


class ChatMember(BaseModel, IdValidationMixin):
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
