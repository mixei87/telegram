from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy import select

from src.models import Chat, User, ChatType


class ChatRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, name: str, chat_type: ChatType) -> Chat:
        chat = Chat(name=name, type=chat_type)
        self.session.add(chat)
        await self.session.flush()
        return chat

    async def get_by_id_with_members(self, chat_id: int) -> Chat | None:
        stmt = (select(Chat).where(Chat.id == chat_id).options(joinedload(Chat.members)))
        result = await self.session.execute(stmt)
        return result.unique().scalars().first()

    async def add_member(self, chat: Chat, user: User) -> None:
        chat.members.append(user)
        await self.session.flush()
