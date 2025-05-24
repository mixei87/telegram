from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Enum

from src.models.base import Base, ChatType, primary_key

if TYPE_CHECKING:
    from src.models import Message, User, Group


# Модель чата
class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[primary_key]
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    type: Mapped[ChatType] = mapped_column(Enum(ChatType), default=ChatType.PERSONAL)

    # Связь с пользователями через ChatMember
    members: Mapped[list["User"]] = relationship(
        secondary="chat_members",
        back_populates="chats"
    )

    # Связь с группой (one-to-one)
    group: Mapped["Group"] = relationship(
        back_populates="chat",
        uselist=False
    )
    messages: Mapped[list["Message"]] = relationship(back_populates="chat")
