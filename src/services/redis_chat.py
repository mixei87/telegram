import json

from redis.asyncio import Redis

from src.services.chat_member import ChatMemberService


class RedisChatService:
    def __init__(self, redis: Redis, chat_members_service: ChatMemberService):
        self.redis = redis
        self.chat_members_service = chat_members_service

    async def add_user_to_chat(self, chat_id: int, user_id: int):
        await self.redis.sadd(f"chat:{chat_id}:members", user_id)
        await self.redis.expire(f"chat:{chat_id}:members", 86400)

    async def remove_user_from_chat(self, chat_id: int, user_id: int):
        await self.redis.srem(f"chat:{chat_id}:members", user_id)

    async def is_user_in_chat(self, chat_id: int, user_id: int) -> bool:
        return bool(await self.redis.sismember(f"chat:{chat_id}:members", str(user_id)))

    async def get_chat_members(self, chat_id: int) -> list[int]:
        if not await self.redis.exists(f"chat:{chat_id}:members"):
            members = await self.chat_members_service.get_chat_members(chat_id)
            await self.redis.sadd(
                f"chat:{chat_id}:members", *[member.id for member in members]
            )
        members = await self.redis.smembers(f"chat:{chat_id}:members")
        return [int(id_str) for id_str in members]

    async def add_to_queue(self, user_id: int, message: json):
        await self.redis.rpush(f"queue:user:{user_id}", message)
        await self.redis.expire(f"queue:user:{user_id}", 86400)
