import pytest
from src.models import ChatType
from src.core.exceptions import NotFoundError, LogicError


class TestChatService:
    """Тесты сервиса чатов."""

    async def test_create_personal_chat(self, user_service, chat_service):
        """Тест создания личного чата."""
        user1 = await user_service.create_user("Alice", "alice@example.com", "secret")
        user2 = await user_service.create_user("Bob", "bob@example.com", "secret")

        chat = await chat_service.create_personal_chat(creator_id=user1.id, friend_id=user2.id)

        assert chat.type == ChatType.PERSONAL
        assert chat.id > 0
        assert chat.name == user2.name  # Имя чата должно совпадать с именем друга

        chat_with_members = await chat_service.get_chat_with_members(chat.id)
        assert len(chat_with_members.members) == 2
        assert {member.id for member in chat_with_members.members} == {user1.id, user2.id}

    async def test_create_personal_chat_with_self_fails(self, user_service, chat_service):
        """Попытка создать личный чат с самим собой."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")

        with pytest.raises(LogicError, match="Нельзя создать персональный чат с самим собой"):
            await chat_service.create_personal_chat(creator_id=user.id, friend_id=user.id)

    async def test_create_group_chat(self, user_service, chat_service):
        """Тест создания группового чата."""
        user = await user_service.create_user("Admin", "admin@example.com", "secret")
        chat = await chat_service.create_group_chat(name="Team Chat", creator_id=user.id)

        assert chat.type == ChatType.GROUP
        assert chat.name == "Team Chat"
        assert chat.id > 0

        chat_with_members = await chat_service.get_chat_with_members(chat.id)
        assert len(chat_with_members.members) == 1
        assert chat_with_members.members[0].id == user.id

    async def test_create_group_chat_nonexistent_creator(self, chat_service):
        """Попытка создать чат с несуществующим создателем."""
        with pytest.raises(NotFoundError):
            await chat_service.create_group_chat(name="Invalid Chat", creator_id=999)

    async def test_get_chat(self, user_service, chat_service):
        """Тест получения чата по ID."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        chat = await chat_service.create_group_chat(name="Temp Chat", creator_id=user.id)

        fetched = await chat_service.get_chat(chat.id)
        assert fetched is not None
        assert fetched.id == chat.id
        assert fetched.name == "Temp Chat"

        # Пытаемся получить несуществующий чат
        assert await chat_service.get_chat(999) is None

    async def test_get_exist_chat(self, user_service, chat_service):
        """Тест получения чата с проверкой существования."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        chat = await chat_service.create_group_chat(name="Temp Chat", creator_id=user.id)

        fetched = await chat_service.get_exist_chat(chat.id)
        assert fetched is not None
        assert fetched.id == chat.id

        # Пытаемся получить несуществующий чат
        with pytest.raises(NotFoundError):
            await chat_service.get_exist_chat(999)

    async def test_add_user_to_chat(self, user_service, chat_service, db_session):
        """Тест добавления пользователя в чат."""
        creator = await user_service.create_user("Alice", "alice@example.com", "secret")
        user = await user_service.create_user("Bob", "bob@example.com", "secret")

        chat = await chat_service.create_group_chat("Test Group", creator_id=creator.id)
        await chat_service.add_user_to_chat(chat.id, user.id)
        await db_session.refresh(chat, ['members'])

        chat_with_members = await chat_service.get_chat_with_members(chat.id)
        user_ids = {member.id for member in chat_with_members.members}
        assert user.id in user_ids
        assert creator.id in user_ids  # Создатель тоже должен быть в чате

    async def test_add_user_to_nonexistent_chat(self, user_service, chat_service):
        """Попытка добавить пользователя в несуществующий чат."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        with pytest.raises(NotFoundError):
            await chat_service.add_user_to_chat(999, user.id)

    async def test_add_nonexistent_user_to_chat(self, user_service, chat_service):
        """Попытка добавить несуществующего пользователя в чат."""
        creator = await user_service.create_user("Alice", "alice@example.com", "secret")
        chat = await chat_service.create_group_chat("Test Group", creator_id=creator.id)

        with pytest.raises(NotFoundError):
            await chat_service.add_user_to_chat(chat.id, 999)

    async def test_get_chat_with_members(self, user_service, chat_service, db_session):
        """Тест получения чата с участниками."""
        # Создаем пользователей
        creator = await user_service.create_user("Alice", "alice@example.com", "secret")
        user1 = await user_service.create_user("Bob", "bob@example.com", "secret")
        user2 = await user_service.create_user("Charlie", "charlie@example.com", "secret")

        # Создаем чат и добавляем участников
        chat = await chat_service.create_group_chat("Team Chat", creator_id=creator.id)
        await chat_service.add_user_to_chat(chat.id, user1.id)
        await chat_service.add_user_to_chat(chat.id, user2.id)
        await db_session.refresh(chat, ['members'])

        # Получаем чат с участниками
        chat_with_members = await chat_service.get_chat_with_members(chat.id)
        assert chat_with_members is not None
        assert len(chat_with_members.members) == 3  # Создатель + 2 пользователя
        assert {member.id for member in chat_with_members.members} == {creator.id, user1.id, user2.id}

    async def test_is_user_in_chat(self, user_service, chat_service, chat_member_service):
        """Тест проверки нахождения пользователя в чате."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        friend = await user_service.create_user("Bob", "bob@example.com", "secret")

        # Создаем личный чат
        chat = await chat_service.create_personal_chat(creator_id=user.id, friend_id=friend.id)

        # Оба пользователя должны быть в чате
        assert await chat_member_service.is_user_in_chat(chat.id, user.id) is True
        assert await chat_member_service.is_user_in_chat(chat.id, friend.id) is True

        # Проверяем несуществующего пользователя
        assert await chat_member_service.is_user_in_chat(chat.id, 999) is False

        # Проверяем несуществующий чат
        assert await chat_member_service.is_user_in_chat(999, user.id) is False
