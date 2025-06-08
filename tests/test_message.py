import pytest
import uuid
from src.core.exceptions import NotFoundError


class TestMessageService:
    """Тесты сервиса сообщений."""

    async def test_create_message(self, message_service, chat_service, user_service):
        """Тест успешного создания сообщения."""
        # Создаем пользователя и чат
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        friend = await user_service.create_user("Bob", "bob@example.com", "secret")
        chat = await chat_service.create_personal_chat(creator_id=user.id, friend_id=friend.id)

        # Создаем сообщение
        external_id = str(uuid.uuid4())
        text = "Привет, это тестовое сообщение!"
        message = await message_service.create_message(
            external_id=external_id,
            chat_id=chat.id,
            sender_id=user.id,
            text=text
        )

        assert message.id is not None
        assert message.external_id == external_id
        assert message.text == text
        assert message.chat_id == chat.id
        assert message.sender_id == user.id
        assert message.timestamp is not None

    async def test_create_message_nonexistent_chat(self, message_service, user_service):
        """Попытка создать сообщение в несуществующем чате."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")

        with pytest.raises(NotFoundError):
            await message_service.create_message(
                external_id=str(uuid.uuid4()),
                chat_id=999,  # Несуществующий ID чата
                sender_id=user.id,
                text="Привет!"
            )

    async def test_create_message_nonexistent_sender(self, message_service, chat_service, user_service):
        """Попытка создать сообщение от несуществующего отправителя."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        chat = await chat_service.create_group_chat("Test Chat", creator_id=user.id)

        with pytest.raises(NotFoundError):
            await message_service.create_message(
                external_id=str(uuid.uuid4()),
                chat_id=chat.id,
                sender_id=999,  # Несуществующий ID отправителя
                text="Сообщение"
            )

    async def test_create_message_user_not_in_chat(self, message_service, chat_service, user_service):
        """Попытка отправить сообщение, когда отправитель не в чате."""
        # Создаем создателя чата и пользователя, который не в чате
        creator = await user_service.create_user("Alice", "alice@example.com", "secret")
        stranger = await user_service.create_user("Eve", "eve@example.com", "secret")

        # Создаем чат, но не добавляем туда второго пользователя
        chat = await chat_service.create_group_chat("Private Chat", creator_id=creator.id)

        with pytest.raises(NotFoundError, match="Пользователь не состоит в чате"):
            await message_service.create_message(
                external_id=str(uuid.uuid4()),
                chat_id=chat.id,
                sender_id=stranger.id,  # Пользователь не в чате
                text="Я не должен отправить это сообщение"
            )

    async def test_get_messages(self, message_service, chat_service, user_service):
        """Тест получения сообщений чата."""
        # Создаем пользователя и чат
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        friend = await user_service.create_user("Bob", "bob@example.com", "secret")
        chat = await chat_service.create_personal_chat(creator_id=user.id, friend_id=friend.id)

        # Отправляем несколько сообщений
        messages = []
        for i in range(1, 6):
            message = await message_service.create_message(
                external_id=str(uuid.uuid4()),
                chat_id=chat.id,
                sender_id=user.id if i % 2 else friend.id,
                text=f"Сообщение {i}"
            )
            messages.append(message)

        # Получаем сообщения из чата
        chat_messages = await message_service.get_messages(chat.id)
        assert len(chat_messages) == 5

    async def test_get_messages_with_pagination(self, message_service, chat_service, user_service):
        """Тест пагинации при получении сообщений."""
        # Создаем пользователя и чат
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        chat = await chat_service.create_group_chat("Group Chat", creator_id=user.id)

        # Отправляем 15 сообщений
        for i in range(1, 16):
            await message_service.create_message(
                external_id=str(uuid.uuid4()),
                chat_id=chat.id,
                sender_id=user.id,
                text=f"Сообщение {i}"
            )

        # Получаем первую страницу (10 сообщений)
        page1 = await message_service.get_messages(chat.id, limit=10, offset=0)
        assert len(page1) == 10

        # Получаем вторую страницу (оставшиеся 5 сообщений)
        page2 = await message_service.get_messages(chat.id, limit=10, offset=10)
        assert len(page2) == 5

    async def test_get_messages_empty_chat(self, message_service, chat_service, user_service):
        """Тест получения сообщений из пустого чата."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        chat = await chat_service.create_group_chat("Empty Chat", creator_id=user.id)

        # Пытаемся получить сообщения из пустого чата
        messages = await message_service.get_messages(chat.id)
        assert len(messages) == 0
