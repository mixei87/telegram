from src.core.exceptions import NotFoundError, AlreadyExistsError
from src.models import Chat, Group
from src.repositories.chat_member import ChatMemberRepository
from src.services.user import UserService


class ChatMemberService:
    def __init__(self, chat_member_repo: ChatMemberRepository, user_service: UserService):
        self.chat_member_repo = chat_member_repo
        self.user_service = user_service

    async def add_user_to_chat(self, chat_id: int, user_id: int) -> None:
        chat = await self.chat_member_repo.get_chat_with_members(chat_id)
        user = await self.user_service.get_user(user_id)

        if chat is None:
            raise NotFoundError(f"Чат c id: {chat_id} не найден")
        if user is None:
            raise NotFoundError(f"Пользователь c id: {user_id} не найден")
        if any(member.id == user.id for member in chat.members):
            raise AlreadyExistsError(f"Пользователь c id: {user_id} уже состоит в чате")

        await self.chat_member_repo.add_member(chat, user)

    async def get_chat_with_members(self, chat_id: int) -> Chat | None:
        return await self.chat_member_repo.get_chat_with_members(chat_id)

    async def get_group_with_members(self, group_id: int) -> Group | None:
        return await self.chat_member_repo.get_group_with_members(group_id)

    async def is_user_in_chat(self, chat_id: int, user_id: int) -> bool:
        chat = await self.get_chat_with_members(chat_id)
        return chat is not None and any(member.id == user_id for member in chat.members)

    async def check_user_in_this_chat(self, chat_id: int, user_id: int) -> None:
        if not self.is_user_in_chat(chat_id, user_id):
            raise NotFoundError("Пользователь не состоит в чате")
