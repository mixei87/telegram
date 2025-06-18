from pydantic import BaseModel

from src.schemas.base import IdValidationMixin, NotBlankStrValidationMixin
from src.schemas.user import UserResponse


class GroupCreate(BaseModel, IdValidationMixin, NotBlankStrValidationMixin):
    name: str
    creator_id: int

    __id_fields__ = ["creator_id"]
    __str_fields__ = ["name"]


class GroupMember(BaseModel, IdValidationMixin):
    group_id: int
    user_id: int

    __id_fields__ = ["group_id", "user_id"]


class GroupResponse(BaseModel):
    id: int
    name: str
    creator_id: int


class GroupMembersResponse(BaseModel):
    id: int
    name: str
    creator_id: int
    members: list[UserResponse]


class GroupMemberResponse(BaseModel):
    message: str = "Пользователь успешно добавлен в группу"
    group_id: int
    user_id: int
