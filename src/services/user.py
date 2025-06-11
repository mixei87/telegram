from src.core.exceptions import AlreadyExistsError, NotFoundError
from src.repositories.user import UserRepository
from src.models import User


class UserService:
    def __init__(self, repository: UserRepository):
        self.repo = repository

    async def create_user(self, name: str, email: str, hashed_password: str) -> User:
        if await self.repo.get_by_email(email):
            raise AlreadyExistsError(f"Email {email} уже зарегистрирован")
        return await self.repo.create(name, email, hashed_password)

    async def get_user(self, user_id: int) -> User | None:
        return await self.repo.get_by_id(user_id)

    async def get_exist_user(self, user_id: int) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"Пользователь с id: {user_id} не найден")
        return user

    async def get_user_by_token(self, token) -> User:
        # TODO: заглушка выбор юзера с id = 15
        return await self.get_user(15)
