from pydantic import BaseModel, field_validator
from src.schemas.base import IdValidationMixin


class UserCreate(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("email")
    def validate_email(cls, value):
        if "@" not in value:
            raise ValueError("Invalid email")
        return value


class UserUpdate(BaseModel):
    name: str | None = None
    hashed_password: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class UserIdSchema(IdValidationMixin, BaseModel):
    user_id: int
    __id_fields__ = ["user_id"]
