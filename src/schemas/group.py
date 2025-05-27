from pydantic import BaseModel
from src.schemas.user import UserResponse
from src.schemas.base import IdValidationMixin


class GroupCreate(IdValidationMixin, BaseModel):
    name: str
    creator_id: int
    __id_fields__ = ["creator_id"]


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


class GroupId(BaseModel):
    id: int
    __id_fields__ = ["id"]


class GroupMember(IdValidationMixin, BaseModel):
    group_id: int
    user_id: int
    __id_fields__ = ["group_id", "user_id"]
