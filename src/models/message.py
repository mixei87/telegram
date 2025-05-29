from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Boolean, UniqueConstraint

from src.models.base import Base, primary_key, timestamp

if TYPE_CHECKING:
    from src.models import User, Chat


# Модель сообщения
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[primary_key]
    external_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"), nullable=False)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    text: Mapped[str] = mapped_column(String(4096), nullable=False)
    timestamp: Mapped[timestamp]
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    # Связь с чатом
    chat: Mapped["Chat"] = relationship(back_populates="messages")

    # Связь с отправителем
    sender: Mapped["User"] = relationship(back_populates="messages")
    __table_args__ = (UniqueConstraint("external_id", name="uq_message_external_id"),)
