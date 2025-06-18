from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import joinedload

from src.models import Message


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self, external_id: str, chat_id: int, sender_id: int, text: str
    ) -> Message | None:
        stmt = (
            pg_insert(Message)
            .values(
                external_id=external_id, chat_id=chat_id, sender_id=sender_id, text=text
            )
            .on_conflict_do_nothing(index_elements=["external_id"])
            .returning(Message)
        )
        result = await self.session.execute(stmt)
        message = result.scalars().first()
        await self.session.flush()
        return message

    async def get_messages_by_chat(self, chat_id: int) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.chat_id == chat_id)
            .options(joinedload(Message.sender))
            .order_by(Message.timestamp)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
