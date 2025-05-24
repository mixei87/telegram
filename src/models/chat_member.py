from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey

from src.models.base import Base


# Промежуточная модель: пользователь -> чат
class ChatMember(Base):
    __tablename__ = "chat_members"

    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
