# Управление асинхронной сессией
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from src.core.config import settings

# Создаем асинхронный движок
engine = create_async_engine(settings.DB_URL.get_secret_value(), echo=True)

# Создаем сессию
async_session = async_sessionmaker(engine)
