from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_async_session
from src.repositories.chat_member import ChatMemberRepository
from src.repositories.user import UserRepository
from src.repositories.chat import ChatRepository
from src.repositories.group import GroupRepository
from src.services.user import UserService
from src.services.chat import ChatService
from src.services.chat_member import ChatMemberService
from src.services.group import GroupService


def get_chat_repository(session: AsyncSession = Depends(get_async_session)) -> ChatRepository:
    return ChatRepository(session)


def get_chat_member_repository(session: AsyncSession = Depends(get_async_session)) -> ChatMemberRepository:
    return ChatMemberRepository(session)


def get_user_service(session: AsyncSession = Depends(get_async_session)) -> UserService:
    return UserService(UserRepository(session))


def get_chat_member_service(session: AsyncSession = Depends(get_async_session),
                            chat_repo: ChatRepository = Depends(get_chat_repository),
                            user_service: UserService = Depends(get_user_service)
                            ) -> ChatMemberService:
    return ChatMemberService(chat_repo, ChatMemberRepository(session), user_service)


def get_group_service(session: AsyncSession = Depends(get_async_session),
                      get_chat_repository: ChatRepository = Depends(get_chat_repository),
                      chat_member_service: ChatMemberService = Depends(get_chat_member_service),
                      user_service: UserService = Depends(get_user_service)
                      ) -> GroupService:
    return GroupService(GroupRepository(session), get_chat_repository, chat_member_service, user_service)


def get_chat_service(session: AsyncSession = Depends(get_async_session),
                     chat_member_service: ChatMemberService = Depends(get_chat_member_service),
                     group_service: GroupService = Depends(get_group_service)) -> ChatService:
    return ChatService(ChatRepository(session), chat_member_service, group_service)


UserServiceDepends = Annotated[UserService, Depends(get_user_service)]
ChatServiceDepends = Annotated[ChatService, Depends(get_chat_service)]
GroupServiceDepends = Annotated[GroupService, Depends(get_group_service)]
ChatMemberServiceDepends = Annotated[ChatMemberService, Depends(get_chat_member_service)]
