from sqlalchemy import select
from sqlalchemy.orm import joinedload
from random import choice, randint, sample
from uuid import uuid4

from src.core.exceptions import NotFoundError
from src.repositories.message import MessageRepository
from src.models import Message
from src.services.chat import ChatService
from src.services.chat_member import ChatMemberService
from src.services.user import UserService
from src.models.base import ChatType


class MessageService:
    def __init__(self, message_repo: MessageRepository, chat_service: ChatService, user_service: UserService,
                 chat_member_service: ChatMemberService):
        self.message_repo = message_repo
        self.chat_service = chat_service
        self.user_service = user_service
        self.chat_member_service = chat_member_service

    async def create_message(self, external_id: str, chat_id: int, sender_id: int, text: str) -> Message | None:
        await self.chat_service.get_exist_chat(chat_id)
        await self.user_service.get_exist_user(sender_id)

        # Проверяем, может ли пользователь писать в этот чат
        if not await self.chat_member_service.is_user_in_chat(chat_id, sender_id):
            raise NotFoundError("Пользователь не состоит в чате")

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

    async def create_test_data(self):
        users = [await self.user_service.create_user(name=f"User{i}", email=f"user{i}@example.com",
                                                     hashed_password="password") for i in range(7)]

        chats = []
        for i in range(5):
            users_in_chat = sample(users, 2)
            chat = await self.chat_service.create_personal_chat(users_in_chat[0].id, users_in_chat[1].id)
            chats.append(chat)

        for i in range(5, 10):
            chat = await self.chat_service.create_group_chat(name=f"Chat {i}", creator_id=choice(users).id)
            chats.append(chat)

        for chat in chats:
            if chat.type == ChatType.PERSONAL:
                number_users = 2
            else:
                number_users = randint(3, 4)
            for user in sample(users, number_users):
                await self.chat_member_service.add_user_to_chat(chat.id, user.id)

        for _ in range(20):
            chat = choice(chats)
            await self.chat_member_service.get_chat_with_members(chat.id)
            sender = choice(chat.members)
            await self.message_repo.create(external_id=str(uuid4()), chat_id=chat.id, sender_id=sender.id,
                                           text=f"Message from {sender.name} in {chat.name}")

        print("Test data created successfully!")
