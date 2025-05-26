from pydantic import BaseModel, model_validator


class IdValidationMixin(BaseModel):
    @model_validator(mode="after")
    def validate_id_fields(self):
        fields_to_check = getattr(self, "__id_fields__", [])
        for field_name in fields_to_check:
            value = getattr(self, field_name)
            if not isinstance(value, int):
                continue
            if value < 0:
                raise ValueError(f"{field_name} не может быть отрицательным")
            if value > 2_147_483_647:
                raise ValueError(f"{field_name} слишком большое")
        return self
