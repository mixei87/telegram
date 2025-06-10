from pydantic import BaseModel
from src.schemas.user import UserResponse
from src.schemas.base import IdValidationMixin, NotBlankStrValidationMixin


class GroupCreate(BaseModel, IdValidationMixin, NotBlankStrValidationMixin):
    name: str
    creator_id: int

    __id_fields__ = ["creator_id"]
    __str_fields__ = ["name"]


class GroupId(BaseModel):
    id: int

    __id_fields__ = ["id"]


class GroupMember(BaseModel, IdValidationMixin):
    group_id: int
    user_id: int

    __id_fields__ = ["group_id", "user_id"]


class GroupResponse(BaseModel):
    id: int
    name: str
    creator_id: int

    class Config:
        from_attributes = True


class GroupMembersResponse(BaseModel):
    id: int
    name: str
    creator_id: int
    members: list[UserResponse]

    class Config:
        from_attributes = True
