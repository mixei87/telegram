from typing import Annotated
from uuid import UUID

from fastapi import Path
from pydantic import model_validator

PositiveIntID = Annotated[int, Path(ge=0, le=2_147_483_647)]


class IdValidationMixin:
    @model_validator(mode="after")
    def validate_id(self):
        for field_name in getattr(self, "__id_fields__", []):
            value = getattr(self, field_name)
            if value < 0:
                raise ValueError(f"{field_name} не может быть отрицательным")
            if value > 2_147_483_647:
                raise ValueError(f"{field_name} слишком большое")
        return self


class NotBlankStrValidationMixin:
    @model_validator(mode="after")
    def validate_not_blank_str(self):
        for field_name in getattr(self, "__str_fields__", []):
            value = getattr(self, field_name).strip()
            if not value:
                raise ValueError(f"Название {field_name} не может быть пустым")
        return self


class UUIDValidationMixin:
    @model_validator(mode="after")
    def validate_uuid(self):
        for field_name in getattr(self, "__uuid_fields__", []):
            value = getattr(self, field_name)
            try:
                UUID(value, version=4)
            except ValueError:
                raise ValueError(f"{field_name} должен быть валидным UUIDv4")
        return self
