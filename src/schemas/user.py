from pydantic import BaseModel, field_validator, ConfigDict
from src.schemas.base import IdValidationMixin, NotBlankStrValidationMixin


class UserCreate(BaseModel, NotBlankStrValidationMixin):
    name: str
    email: str
    password: str
    __str_fields__ = ["name", "email", "password"]

    @field_validator("email")
    def validate_email(cls, value):
        if "@" not in value:
            raise ValueError(f"Неверный email: {value}")
        return value


class UserId(BaseModel, IdValidationMixin):
    id: int
    __id_fields__ = ["id"]


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)
