from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy import select

from src.models import Chat, Group


class ChatMemberRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_chat_with_members(self, chat_id: int) -> Chat | None:
        stmt = (
            select(Chat).
            where(Chat.id == chat_id).
            options(joinedload(Chat.members))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_group_with_members(self, group_id: int) -> Group | None:
        stmt = (
            select(Group).
            where(Group.id == group_id).
            options(joinedload(Group.chat).joinedload(Chat.members))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
