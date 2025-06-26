from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models import Chat, Group, User, ChatMember


class ChatMemberRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_chat_with_members(self, chat_id: int) -> Chat | None:
        stmt = select(Chat).where(Chat.id == chat_id).options(joinedload(Chat.members))
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_group_with_members(self, group_id: int) -> Group | None:
        stmt = (
            select(Group)
            .where(Group.id == group_id)
            .options(joinedload(Group.chat).joinedload(Chat.members))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def add_member(self, chat: Chat, user: User) -> None:
        self.session.add(ChatMember(chat_id=chat.id, user_id=user.id))
        await self.session.flush()

    async def get_chat_members(self, chat_id: int) -> list[User]:
        stmt = (
            select(User)
            .join(ChatMember, User.id == ChatMember.user_id)
            .where(ChatMember.chat_id == chat_id)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
