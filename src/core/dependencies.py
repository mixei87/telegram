from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.redis_config import redis
from src.db.session import get_async_session
from src.repositories.chat import ChatRepository
from src.repositories.chat_member import ChatMemberRepository
from src.repositories.group import GroupRepository
from src.repositories.message import MessageRepository
from src.repositories.user import UserRepository
from src.services.chat import ChatService
from src.services.chat_member import ChatMemberService
from src.services.group import GroupService
from src.services.message import MessageService
from src.services.redis_chat import RedisChatService
from src.services.user import UserService

SesionDepends = Annotated[AsyncSession, Depends(get_async_session)]


def get_chat_repo(session: SesionDepends) -> ChatRepository:
    return ChatRepository(session)


def get_group_repo(session: SesionDepends) -> GroupRepository:
    return GroupRepository(session)


def get_chat_member_repo(session: SesionDepends) -> ChatMemberRepository:
    return ChatMemberRepository(session)


def get_user_repo(session: SesionDepends) -> UserRepository:
    return UserRepository(session)


def get_message_repo(session: SesionDepends) -> MessageRepository:
    return MessageRepository(session)


def get_user_service(user_repo: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(user_repo)


def get_chat_member_service(
    chat_member_repo: ChatMemberRepository = Depends(get_chat_member_repo),
    user_service: UserService = Depends(get_user_service),
) -> ChatMemberService:
    return ChatMemberService(chat_member_repo, user_service)


def get_group_service(
    group_repo: GroupRepository = Depends(get_group_repo),
    chat_repo: ChatRepository = Depends(get_chat_repo),
    chat_member_repo: ChatMemberRepository = Depends(get_chat_member_repo),
    chat_member_service: ChatMemberService = Depends(get_chat_member_service),
    user_service: UserService = Depends(get_user_service),
) -> GroupService:
    return GroupService(
        group_repo, chat_repo, chat_member_repo, chat_member_service, user_service
    )


def get_chat_service(
    chat_repo: ChatRepository = Depends(get_chat_repo),
    chat_member_repo: ChatMemberRepository = Depends(get_chat_member_repo),
    user_service: UserService = Depends(get_user_service),
    chat_member_service: ChatMemberService = Depends(get_chat_member_service),
    group_service: GroupService = Depends(get_group_service),
) -> ChatService:
    return ChatService(
        chat_repo, chat_member_repo, user_service, chat_member_service, group_service
    )


def get_message_service(
    message_repo: MessageRepository = Depends(get_message_repo),
    chat_service: ChatService = Depends(get_chat_service),
    user_service: UserService = Depends(get_user_service),
    chat_member_service: ChatMemberService = Depends(get_chat_member_service),
) -> MessageService:
    return MessageService(message_repo, chat_service, user_service, chat_member_service)


def get_redis_chat_service() -> RedisChatService:
    return RedisChatService(redis)


UserServiceDepends = Annotated[UserService, Depends(get_user_service)]
ChatServiceDepends = Annotated[ChatService, Depends(get_chat_service)]
GroupServiceDepends = Annotated[GroupService, Depends(get_group_service)]
ChatMemberServiceDepends = Annotated[
    ChatMemberService, Depends(get_chat_member_service)
]
MessageServiceDepends = Annotated[MessageService, Depends(get_message_service)]
RedisChatServiceDepends = Annotated[RedisChatService, Depends(get_redis_chat_service)]
