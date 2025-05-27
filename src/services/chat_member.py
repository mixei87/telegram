from src.models import Chat, Group
from src.repositories.chat import ChatRepository
from src.repositories.chat_member import ChatMemberRepository
from src.services.user import UserService


class ChatMemberService:
    def __init__(self, chat_repo: ChatRepository, chat_member_repo: ChatMemberRepository, user_service: UserService):
        self.chat_repo = chat_repo
        self.chat_member_repo = chat_member_repo
        self.user_service = user_service

    async def add_user_to_chat(self, chat_id: int, user_id: int) -> None:
        chat = await self.chat_member_repo.get_chat_with_members(chat_id)
        user = await self.user_service.get_user(user_id)

        if chat is None:
            raise ValueError(f"Чат c id: {chat_id} не найден")
        if user is None:
            raise ValueError(f"Пользователь c id: {user_id} не найден")
        if any(member.id == user.id for member in chat.members):
            raise ValueError(f"Пользователь c id: {user_id} уже состоит в чате")

        await self.chat_repo.add_member(chat, user)

    async def get_chat_with_members(self, chat_id: int) -> Chat | None:
        return await self.chat_member_repo.get_chat_with_members(chat_id)

    async def get_group_with_members(self, group_id: int) -> Group | None:
        return await self.chat_member_repo.get_group_with_members(group_id)
