from sqlalchemy import inspect, text

from src.models.base import Base
from src.db.create_test_data import create_test_data
from src.db.session import engine


async def init_db():
    """
    Создает таблицы в базе данных, если они еще не существуют.
    """
    async with engine.connect() as conn:
        schema = 'public'
        await conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema}"))
        # Проверяем существование таблиц
        existing_tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())

        if not existing_tables:
            print("Creating database tables...")
            await conn.run_sync(Base.metadata.create_all)
            await conn.commit()
            print("Database tables created successfully!")
            await create_test_data()
        else:
            print("Tables already exist. Skipping creation.")
        print("Startup completed. Database tables are ready!")
