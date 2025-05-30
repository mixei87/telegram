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
from src.repositories.message import MessageRepository
from src.services.message import MessageService

SesionDepends = Annotated[AsyncSession, Depends(get_async_session)]


def get_chat_repository(session: SesionDepends) -> ChatRepository:
    return ChatRepository(session)


def get_chat_member_repository(session: SesionDepends) -> ChatMemberRepository:
    return ChatMemberRepository(session)


def get_user_service(session: SesionDepends) -> UserService:
    return UserService(UserRepository(session))


def get_chat_member_service(session: SesionDepends,
                            chat_repo: ChatRepository = Depends(get_chat_repository),
                            user_service: UserService = Depends(get_user_service)
                            ) -> ChatMemberService:
    return ChatMemberService(chat_repo, ChatMemberRepository(session), user_service)


def get_group_service(session: SesionDepends,
                      get_chat_repository: ChatRepository = Depends(get_chat_repository),
                      chat_member_service: ChatMemberService = Depends(get_chat_member_service),
                      user_service: UserService = Depends(get_user_service)
                      ) -> GroupService:
    return GroupService(GroupRepository(session), get_chat_repository, chat_member_service, user_service)


def get_chat_service(session: SesionDepends,
                     chat_member_service: ChatMemberService = Depends(get_chat_member_service),
                     group_service: GroupService = Depends(get_group_service)) -> ChatService:
    return ChatService(ChatRepository(session), chat_member_service, group_service)


def get_message_service(session: SesionDepends,
                        chat_service: ChatService = Depends(get_chat_service),
                        user_service: UserService = Depends(get_user_service),
                        chat_member_service: ChatMemberService = Depends(get_chat_member_service)
                        ) -> MessageService:
    return MessageService(MessageRepository(session), chat_service, user_service, chat_member_service)


UserServiceDepends = Annotated[UserService, Depends(get_user_service)]
ChatServiceDepends = Annotated[ChatService, Depends(get_chat_service)]
GroupServiceDepends = Annotated[GroupService, Depends(get_group_service)]
ChatMemberServiceDepends = Annotated[ChatMemberService, Depends(get_chat_member_service)]
MessageServiceDepends = Annotated[MessageService, Depends(get_message_service)]
