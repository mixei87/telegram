from sqlalchemy import select
from sqlalchemy.orm import joinedload

from src.repositories.message import MessageRepository
from src.models import Message
from src.services.chat import ChatService
from src.services.chat_member import ChatMemberService
from src.services.user import UserService


class MessageService:
    def __init__(self, message_repo: MessageRepository, chat_service: ChatService, user_service: UserService,
                 chat_member_service: ChatMemberService):
        self.message_repo = message_repo
        self.chat_service = chat_service
        self.user_service = user_service
        self.chat_member_service = chat_member_service

    async def create_message(self, external_id: str, chat_id: int, sender_id: int, text: str) -> Message | None:
        if await self.chat_service.get_chat(chat_id) is None:
            raise ValueError(f"Чат с id: {chat_id} не найден")
        if await self.user_service.get_user(sender_id) is None:
            raise ValueError(f"Пользователь с id: {sender_id} не найден")

        # Проверяем, может ли пользователь писать в этот чат
        if not await self.chat_member_service.is_user_in_chat(chat_id, sender_id):
            raise ValueError("Пользователь не состоит в чате")

        return await self.message_repo.create(external_id, chat_id, sender_id, text)

    async def get_messages(self, chat_id: int, limit: int = 10, offset: int = 0) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.chat_id == chat_id)
            .options(joinedload(Message.sender))
            .order_by(Message.timestamp)
            .limit(limit)
            .offset(offset)
        )
        result = await self.message_repo.session.execute(stmt)
        return list(result.scalars().all())
