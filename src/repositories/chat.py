from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy import select

from src.models import Chat, ChatType


class ChatRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_chat(self, name: str, chat_type: ChatType) -> Chat:
        chat = Chat(name=name, type=chat_type)
        self.session.add(chat)
        await self.session.flush()
        return chat

    async def get_chat_by_id(self, chat_id: int) -> Chat | None:
        return await self.session.get(Chat, chat_id)

    async def get_chat_by_id_with_members(self, chat_id: int) -> Chat | None:
        stmt = (select(Chat).where(Chat.id == chat_id).options(joinedload(Chat.members)))
        result = await self.session.execute(stmt)
        return result.unique().scalars().first()
