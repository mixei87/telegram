from src.repositories.user import UserRepository
from src.models import User
from src.schemas.user import UserUpdate


class UserService:
    def __init__(self, repository: UserRepository):
        self.repo = repository

    async def get_user(self, user_id: int) -> User | None:
        return await self.repo.get_by_id(user_id)

    async def create_user(self, name: str, email: str, hashed_password: str) -> User:
        if await self.repo.get_by_email(email):
            raise ValueError("Email already exists")
        return await self.repo.create(name, email, hashed_password)

    async def update_user(self, user: User, data: UserUpdate) -> User:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise ValueError("No fields to update")
        return await self.repo.update(user, update_data)

    async def delete_user(self, user_id: int) -> None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        await self.repo.delete(user)
