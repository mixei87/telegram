# SQLAlchemy модели
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, Boolean, text, Enum
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


# Промежуточная таблица для связи между группами и пользователями
class GroupMember(Base):
    __tablename__ = "group_members"

    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    group: Mapped["Group"] = relationship(back_populates="group_members")
    user: Mapped["User"] = relationship(back_populates="member_groups")


# Модель пользователя
class User(Base):
    __tablename__ = "users"

    id: Mapped[primary_key]  # Уникальный ID пользователя
    name: Mapped[str] = mapped_column(String(32), nullable=False)  # Имя пользователя
    email: Mapped[unique_string]  # Уникальный email
    hashed_password: Mapped[str] = mapped_column(String(60))  # Хэшированный пароль

    # Связь с таблицей messages (пользователь может отправить много сообщений)
    messages: Mapped[list["Message"]] = relationship(back_populates="sender")

    # Связь с таблицей group_members (пользователь может быть участником многих групп)
    member_groups: Mapped[list["GroupMember"]] = relationship(back_populates="user")


# Модель чата
class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[primary_key]  # Уникальный ID чата
    name: Mapped[str] = mapped_column(String(128), nullable=False)  # Название чата
    type: Mapped[ChatType] = mapped_column(Enum(ChatType), default=ChatType.PERSONAL)  # Тип чата

    # Связь one-to-one с Group
    group: Mapped["Group"] = relationship(back_populates="chat", uselist=False)

    # Связь с таблицей messages (чат может содержать много сообщений)
    messages: Mapped[list["Message"]] = relationship(back_populates="chat")


# Модель группы
class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(ForeignKey("chats.id"), primary_key=True)  # Уникальный ID группы
    name: Mapped[str] = mapped_column(String(128), nullable=False)  # Название группы
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))  # Создатель группы

    creator: Mapped["User"] = relationship(foreign_keys=[creator_id])  # Связь с таблицей users (создатель группы)
    group_members: Mapped[list["GroupMember"]] = (
        relationship(back_populates="group"))  # Группа может иметь много участников
    chat: Mapped["Chat"] = relationship(back_populates="group")  # Связь one-to-one с Chat


# Модель сообщения
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[primary_key]  # Уникальный ID сообщения
    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"), nullable=False)  # ID чата
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)  # ID отправителя
    text: Mapped[str] = mapped_column(String(4096), nullable=False)  # Текст сообщения
    timestamp: Mapped[timestamp]  # Время отправки
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)  # Флаг прочтения

    # Связь с таблицей users (кто отправил сообщение)
    sender: Mapped["User"] = relationship(back_populates="messages")

    # Связь с таблицей chats (в каком чате отправлено сообщение)
    chat: Mapped["Chat"] = relationship(back_populates="messages")
