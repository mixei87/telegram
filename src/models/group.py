from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey

from src.models.base import Base

if TYPE_CHECKING:
    from src.models import User, Chat


# Модель группы
class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(ForeignKey("chats.id"), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Теперь обращаемся к участникам напрямую через чат и его members
    @property
    def members(self) -> list["User"]:
        return self.chat.members if self.chat else []

    # Связь с чатом (one-to-one)д
    chat: Mapped["Chat"] = relationship(back_populates="group")

    # Связь с создателем
    creator: Mapped["User"] = relationship(foreign_keys=[creator_id])
