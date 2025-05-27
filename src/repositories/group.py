from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from src.models import Group, Chat, User


class GroupRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_group(self, chat: Chat, creator_id: int) -> Group:
        group = Group(id=chat.id, name=chat.name, creator_id=creator_id)
        self.session.add(group)
        await self.session.flush()
        chat.group = group
        await self.session.flush()
        return group

    async def get_by_id_with_members(self, group_id: int) -> Group | None:
        stmt = select(Group).where(Group.id == group_id).options(joinedload(Group.chat).joinedload(Chat.members))
        result = await self.session.execute(stmt)
        return result.unique().scalars().first()

    async def add_creator(self, group: Group, creator: User) -> None:
        group.creator = creator
        await self.session.flush()
