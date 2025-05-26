from pydantic import BaseModel, field_validator


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


class UserIdSchema(BaseModel):
    user_id: int

    @field_validator("user_id")
    def check_positive_and_not_too_big(cls, value: int) -> int:
        if value < 0:
            raise ValueError("ID не может быть отрицательным")
        if value > 2_147_483_647:  # максимальное значение INT в PostgreSQL
            raise ValueError("ID слишком большое")
        return value
