from src.repositories.chat import ChatRepository
from src.models import Chat, ChatType
from src.services.user import UserService


class ChatService:
    def __init__(self, repository: ChatRepository, user_service: UserService):
        self.repo = repository
        self.user_service = user_service

    async def create_chat(self, name: str, chat_type: ChatType) -> Chat:
        # TODO: also create group if chat_type is group
        return await self.repo.create(name, chat_type)

    async def get_chat(self, chat_id: int) -> Chat | None:
        chat = await self.repo.get_by_id_with_members(chat_id)
        if not chat:
            raise ValueError("Чат не найден")
        return chat

    async def add_user_to_chat(self, chat_id: int, user_id: int) -> None:
        chat = await self.repo.get_by_id_with_members(chat_id)
        user = await self.user_service.get_user(user_id)

        if not chat:
            raise ValueError(f"Чат {chat_id} не найден")

        if not user:
            raise ValueError(f"Пользователь {user_id} не найден")

        if any(member.id == user.id for member in chat.members):
            raise ValueError("Пользователь уже состоит в чате")

        await self.repo.add_member(chat, user)
