from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_async_session
from src.repositories.user import UserRepository
from src.repositories.chat import ChatRepository
from src.services.user import UserService
from src.services.chat import ChatService

AsyncSessionDepends = Annotated[AsyncSession, Depends(get_async_session)]


def get_user_service(session: AsyncSession = Depends(get_async_session)) -> UserService:
    return UserService(UserRepository(session))


UserServiceDepends = Annotated[UserService, Depends(get_user_service)]


def get_chat_service(
        session: AsyncSession = Depends(get_async_session),
        user_service: UserService = Depends(get_user_service)
) -> ChatService:
    return ChatService(ChatRepository(session), user_service)


ChatServiceDepends = Annotated[ChatService, Depends(get_chat_service)]
