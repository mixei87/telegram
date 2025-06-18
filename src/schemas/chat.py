from pydantic import BaseModel, ConfigDict

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


class ChatMember(BaseModel, IdValidationMixin):
    chat_id: int
    user_id: int

    __id_fields__ = ["chat_id", "user_id"]


class ChatResponse(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class ChatsResponse(BaseModel):
    chats: list[ChatResponse]


class ChatMemberResponse(BaseModel):
    message: str = "Пользователь успешно добавлен в чат"
    chat_id: int
    user_id: int


class ChatWithMembersResponse(BaseModel):
    id: int
    name: str
    members: list[UserResponse] | None
