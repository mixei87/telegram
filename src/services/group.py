from src.core.exceptions import NotFoundError
from src.repositories.chat import ChatRepository
from src.repositories.chat_member import ChatMemberRepository
from src.repositories.group import GroupRepository
from src.services.chat_member import ChatMemberService
from src.services.user import UserService
from src.models import Group, Chat, ChatType


class GroupService:
    def __init__(self, group_repo: GroupRepository, chat_repo: ChatRepository, chat_member_repo: ChatMemberRepository,
                 chat_member_service: ChatMemberService,
                 user_service: UserService):
        self.chat_repo = chat_repo
        self.chat_member_repo = chat_member_repo
        self.group_repo = group_repo
        self.chat_member_service = chat_member_service
        self.user_service = user_service

    async def create_group(self, name: str, creator_id: int) -> Group:
        creator = await self.user_service.get_exist_user(creator_id)
        chat = await self._create_chat(name)
        group = await self.group_repo.create_group(chat, creator_id)
        await self.group_repo.set_creator(group, creator)
        await self.chat_member_repo.add_member(chat, creator)
        return group

    async def get_group(self, group_id: int) -> Group | None:
        return await self.chat_member_service.get_group_with_members(group_id)

    async def _create_chat(self, name: str) -> Chat:
        return await self.chat_repo.create_chat(name, ChatType.GROUP)

    async def add_user_to_group(self, group_id: int, user_id: int) -> None:
        await self.chat_member_service.add_user_to_chat(group_id, user_id)

    async def is_user_in_group(self, group_id: int, user_id: int) -> bool:
        return await self.chat_member_service.is_user_in_chat(group_id, user_id)

    async def get_group_with_members(self, group_id: int) -> Group | None:
        group = await self.group_repo.get_by_id_with_members(group_id)
        if group is None:
            raise NotFoundError(f"Группа с id: {group_id} не найдена")
        return group
