import pytest
from src.core.exceptions import AlreadyExistsError, NotFoundError


class TestUserService:
    """Тесты сервиса пользователей."""

    async def test_create_user_success(self, user_service):
        """Успешное создание пользователя."""
        user = await user_service.create_user("Alice", "alice@example.com", "hashed_password")

        assert user.id is not None
        assert user.name == "Alice"
        assert user.email == "alice@example.com"
        assert user.hashed_password == "hashed_password"

    async def test_create_duplicate_email_fails(self, user_service):
        """Попытка создать пользователя с существующим email."""
        await user_service.create_user("Alice", "alice@example.com", "hashed_password")

        with pytest.raises(AlreadyExistsError, match="уже зарегистрирован"):
            await user_service.create_user("Bob", "alice@example.com", "another_password")

    async def test_get_existing_user(self, user_service):
        """Получение существующего пользователя."""
        created_user = await user_service.create_user("Alice", "alice@example.com", "hashed_password")

        retrieved_user = await user_service.get_user(created_user.id)
        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.name == "Alice"
        assert retrieved_user.email == "alice@example.com"

        existing_user = await user_service.get_exist_user(created_user.id)
        assert existing_user is not None
        assert existing_user.id == created_user.id

    async def test_get_nonexistent_user_returns_none(self, user_service):
        """Попытка получить несуществующего пользователя."""
        user = await user_service.get_user(999)
        assert user is None

        with pytest.raises(NotFoundError, match='не найден'):
            await user_service.get_exist_user(999)
