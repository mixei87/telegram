from src.repositories.chat import ChatRepository
from src.models import Chat, ChatType, User
from src.repositories.chat_member import ChatMemberRepository
from src.services.chat_member import ChatMemberService
from src.services.group import GroupService
from src.services.user import UserService
from src.core.exceptions import LogicError, NotFoundError


class ChatService:
    def __init__(self, chat_repo: ChatRepository, chat_member_repo: ChatMemberRepository, user_service: UserService,
                 chat_member_service: ChatMemberService,
                 group_service: GroupService):
        self.chat_repo = chat_repo
        self.chat_member_repo = chat_member_repo
        self.user_service = user_service
        self.chat_member_service = chat_member_service
        self.group_service = group_service

    async def create_personal_chat(self, creator_id: int, friend_id: int) -> Chat:
        if creator_id == friend_id:
            raise LogicError("Нельзя создать персональный чат с самим собой")

        creator: User = await self.user_service.get_exist_user(creator_id)
        friend: User = await self.user_service.get_exist_user(friend_id)

        chat = await self.chat_repo.create_chat(friend.name, ChatType.PERSONAL)
        await self.chat_member_repo.add_member(chat, creator)
        await self.chat_member_repo.add_member(chat, friend)
        return chat

    async def create_group_chat(self, name: str, creator_id: int) -> Chat:
        group = await self.group_service.create_group(name, creator_id=creator_id)
        return await self.get_chat(group.id)

    async def get_chat(self, chat_id: int) -> Chat | None:
        return await self.chat_repo.get_chat_by_id(chat_id)

    async def get_exist_chat(self, chat_id: int) -> Chat:
        chat = await self.get_chat(chat_id)
        if chat is None:
            raise NotFoundError(f"Чат с id: {chat_id} не найден")
        return chat

    async def get_chat_with_members(self, chat_id: int) -> Chat | None:
        return await self.chat_repo.get_chat_by_id_with_members(chat_id)

    async def add_user_to_chat(self, chat_id: int, user_id: int) -> None:
        await self.chat_member_service.add_user_to_chat(chat_id, user_id)
