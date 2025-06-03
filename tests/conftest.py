import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from src.core.config import settings
from src.models.base import Base
from src.repositories.chat import ChatRepository
from src.repositories.chat_member import ChatMemberRepository
from src.repositories.group import GroupRepository
from src.repositories.message import MessageRepository
from src.repositories.user import UserRepository
from src.services.chat import ChatService
from src.services.chat_member import ChatMemberService
from src.services.group import GroupService
from src.services.message import MessageService
from src.services.user import UserService


@pytest_asyncio.fixture(scope="session")
async def create_test_engine():
    engine = create_async_engine(
        settings.test_db_url.get_secret_value(),
        # pool_pre_ping=True,
        # pool_recycle=3600,
        # pool_size=5,
        # max_overflow=10
    )
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="session")
async def create_tables(create_test_engine):
    async with create_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        yield


@pytest_asyncio.fixture(scope="session")
async def create_async_sessionmaker(create_test_engine):
    return async_sessionmaker(bind=create_test_engine, expire_on_commit=False)


@pytest_asyncio.fixture(scope="function")
async def db_session(create_tables, create_async_sessionmaker):
    async with create_async_sessionmaker() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()
            await session.bind.dispose()


@pytest_asyncio.fixture(scope="function")
def chat_repo(db_session: AsyncSession):
    return ChatRepository(db_session)


@pytest_asyncio.fixture(scope="function")
def chat_member_repo(db_session: AsyncSession):
    return ChatMemberRepository(db_session)


@pytest_asyncio.fixture(scope="function")
def user_repo(db_session: AsyncSession):
    return UserRepository(db_session)


@pytest_asyncio.fixture(scope="function")
def group_repo(db_session: AsyncSession):
    return GroupRepository(db_session)


@pytest_asyncio.fixture(scope="function")
def message_repo(db_session: AsyncSession):
    return MessageRepository(db_session)


@pytest_asyncio.fixture(scope="function")
def user_service(user_repo):
    return UserService(user_repo)


@pytest_asyncio.fixture(scope="function")
def chat_member_service(chat_repo, chat_member_repo, user_service):
    return ChatMemberService(chat_repo, chat_member_repo, user_service)


@pytest_asyncio.fixture(scope="function")
def group_service(group_repo, chat_repo, chat_member_service, user_service):
    return GroupService(group_repo, chat_repo, chat_member_service, user_service)


@pytest_asyncio.fixture(scope="function")
def chat_service(chat_repo, chat_member_service, group_service):
    return ChatService(chat_repo, chat_member_service, group_service)


@pytest_asyncio.fixture(scope="function")
def message_service(message_repo, chat_service, user_service, chat_member_service):
    return MessageService(message_repo, chat_service, user_service, chat_member_service)
