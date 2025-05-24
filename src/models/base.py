from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy import String, DateTime, text
from typing import Annotated
from enum import Enum as PyEnum


# Базовый класс для всех моделей
class Base(DeclarativeBase):
    repr_cols_num: int = 2
    repr_cols: tuple[...] = tuple()

    def __repr__(self):
        cols = [f"{col}={getattr(self, col)}" for idx, col in enumerate(self.__table__.columns.keys()) if
                col in self.repr_cols or idx < self.repr_cols_num]
        return f"<{self.__class__.__name__} {', '.join(cols)}>"


# Типы для аннотаций
primary_key = Annotated[int, mapped_column(primary_key=True)]
unique_string = Annotated[str, mapped_column(String(100), unique=True, nullable=False)]
timestamp = Annotated[DateTime, mapped_column(DateTime(), server_default=text("TIMEZONE('utc', now())"))]


# Перечисление для типа чата
class ChatType(PyEnum):
    PERSONAL = "personal"
    GROUP = "group"
