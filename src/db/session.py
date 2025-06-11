# Управление асинхронной сессией
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from src.core.config import settings

engine = create_async_engine(settings.db_url.get_secret_value())
async_session_factory = async_sessionmaker(engine)


async def get_async_session() -> AsyncSession:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()
