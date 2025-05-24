from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String

from src.models.base import Base, primary_key, unique_string

if TYPE_CHECKING:
    from src.models import Chat, Message


# Модель пользователя
class User(Base):
    __tablename__ = "users"

    id: Mapped[primary_key]
    name: Mapped[str] = mapped_column(String(32), nullable=False)
    email: Mapped[unique_string]
    hashed_password: Mapped[str] = mapped_column(String(60))

    # Связь с чатами через ChatMember
    chats: Mapped[list["Chat"]] = relationship(
        secondary="chat_members",
        back_populates="members"
    )

    messages: Mapped[list["Message"]] = relationship(back_populates="sender")
