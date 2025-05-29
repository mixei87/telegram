from src.repositories.chat import ChatRepository
from src.repositories.group import GroupRepository
from src.services.chat_member import ChatMemberService
from src.services.user import UserService
from src.models import Group, Chat, ChatType


class GroupService:
    def __init__(self, group_repo: GroupRepository, chat_repo: ChatRepository, chat_member_service: ChatMemberService,
                 user_service: UserService):
        self.chat_repo = chat_repo
        self.group_repo = group_repo
        self.chat_member_service = chat_member_service
        self.user_service = user_service

    async def create_group(self, chat: Chat, creator_id: int) -> Group:
        creator = await self.user_service.get_user(creator_id)
        if not creator:
            raise ValueError(f"Пользователь c id: {creator_id} не найден")
        group = await self.group_repo.create_group(chat, creator_id)
        await self.group_repo.add_creator(group, creator)
        return group

    async def get_group(self, group_id: int) -> Group | None:
        return await self.chat_member_service.get_group_with_members(group_id)

    async def create_chat(self, name: str) -> Chat:
        return await self.chat_repo.create(name, ChatType.GROUP)
