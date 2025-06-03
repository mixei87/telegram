import pytest
from src.core.exceptions import NotFoundError, AlreadyExistsError


class TestGroupCreation:
    """Тесты создания групп."""

    async def test_create_group(self, group_service, user_service):
        """Тест создания группы с создателем."""
        user = await user_service.create_user("Admin", "admin@example.com", "secret")
        group = await group_service.create_group(name="Developers", creator_id=user.id)
        assert group.id > 0
        assert group.name == "Developers"
        assert group.creator_id == user.id

        # Проверяем, что создатель добавлен в группу
        group_with_members = await group_service.get_group(group.id)
        assert len(group_with_members.members) == 1
        assert group_with_members.members[0].id == user.id

    async def test_create_group_nonexistent_creator(self, group_service):
        """Попытка создать группу с несуществующим создателем."""
        with pytest.raises(NotFoundError):
            await group_service.create_group(name="Invalid Group", creator_id=999)


class TestGroupMembership:
    """Тесты управления участниками группы."""

    async def test_add_user_to_group(self, group_service, user_service):
        """Тест добавления пользователя в группу."""
        # Создаем создателя группы
        creator = await user_service.create_user("Alice", "alice@example.com", "secret")
        # Создаем пользователя, которого будем добавлять
        user = await user_service.create_user("Bob", "bob@example.com", "secret")

        # Создаем группу
        group = await group_service.create_group(name="Developers", creator_id=creator.id)

        # Добавляем пользователя
        await group_service.add_user_to_group(group.id, user.id)

        # Проверяем, что пользователь добавлен
        assert await group_service.is_user_in_group(group.id, user.id) is True

        # Проверяем, что нельзя добавить пользователя дважды
        with pytest.raises(AlreadyExistsError):
            await group_service.add_user_to_group(group.id, user.id)

    async def test_add_user_to_nonexistent_group(self, group_service, user_service):
        """Попытка добавить пользователя в несуществующую группу."""
        user = await user_service.create_user("Alice", "alice@example.com", "secret")
        with pytest.raises(NotFoundError):
            await group_service.add_user_to_group(999, user.id)

    async def test_add_nonexistent_user_to_group(self, group_service, user_service):
        """Попытка добавить несуществующего пользователя в группу."""
        creator = await user_service.create_user("Alice", "alice@example.com", "secret")
        group = await group_service.create_group("Developers", creator_id=creator.id)

        with pytest.raises(NotFoundError):
            await group_service.add_user_to_group(group.id, 999)


class TestGroupQueries:
    """Тесты запросов к группам."""

    async def test_get_group_with_members(self, group_service, user_service):
        """Тест получения группы с участниками."""
        # Создаем пользователей
        creator = await user_service.create_user("Alice", "alice@example.com", "secret")
        user1 = await user_service.create_user("Bob", "bob@example.com", "secret")
        user2 = await user_service.create_user("Charlie", "charlie@example.com", "secret")

        # Создаем группу и добавляем участников
        group = await group_service.create_group("Developers", creator_id=creator.id)
        await group_service.add_user_to_group(group.id, user1.id)
        await group_service.add_user_to_group(group.id, user2.id)

        # Получаем группу с участниками
        group_with_members = await group_service.get_group_with_members(group.id)
        assert len(group_with_members.members) == 3  # Создатель + 2 пользователя
        assert {member.id for member in group_with_members.members} == {creator.id, user1.id, user2.id}

    async def test_get_nonexistent_group(self, group_service):
        """Попытка получить несуществующую группу."""
        assert await group_service.get_group(999) is None

        with pytest.raises(NotFoundError):
            await group_service.get_group_with_members(999)
