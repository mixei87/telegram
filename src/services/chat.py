from src.repositories.chat import ChatRepository
from src.models import Chat, ChatType
from src.services.chat_member import ChatMemberService
from src.services.group import GroupService


class ChatService:
    def __init__(self, chat_repo: ChatRepository, chat_member_service: ChatMemberService,
                 group_service: GroupService):
        self.chat_repo = chat_repo
        self.chat_member_service = chat_member_service
        self.group_service = group_service

    async def create_personal_chat(self, name: str) -> Chat:
        chat = await self.chat_repo.create(name, ChatType.PERSONAL)
        return chat

    async def create_group_chat(self, name: str, creator_id: int) -> Chat:
        chat = await self.chat_repo.create(name, ChatType.GROUP)
        await self.group_service.create_group(chat, creator_id=creator_id)
        return chat

    async def get_chat(self, chat_id: int) -> Chat | None:
        return await self.chat_repo.get_by_id_with_members(chat_id)

    async def add_user_to_chat(self, chat_id: int, user_id: int) -> None:
        await self.chat_member_service.add_user_to_chat(chat_id, user_id)
