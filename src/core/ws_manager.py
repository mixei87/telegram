from fastapi import WebSocket
from typing import Dict
from src.core.redis_config import redis


class ConnectionManager:
    def __init__(self):
        self.connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.connections[user_id] = websocket
        # Добавляем пользователя в онлайн в Redis
        await redis.sadd("online_users", user_id)
        await redis.expire("online_users", 86400)  # TTL 24 часа

    async def disconnect(self, user_id: int):
        if user_id in self.connections:
            del self.connections[user_id]
        await redis.srem("online_users", user_id)

    async def send_message_to_user(self, user_id: int, message: str):
        if user_id in self.connections:
            await self.connections[user_id].send_text(message)

    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.connections

    async def send_message_to_chat(self, chat_id: int, sender_id: int, message: str):
        members = await self._get_chat_members(chat_id)

        for user_id in members:
            if user_id == sender_id:
                continue

            if user_id in self.connections:
                await self.connections[user_id].send_text(message)
            else:
                # Сохраняем в очередь для доставки позже
                await redis.rpush(f"queue:user:{user_id}", message)
                await redis.expire(f"queue:user:{user_id}", 86400)

    @staticmethod
    async def _get_chat_members(chat_id: int) -> list[int]:
        members = await redis.smembers(f"chat:{chat_id}:members")
        print(f"_get_chat_members: {members=}", flush=True)
        return [int(uid) for uid in members] if members else []

    async def _is_user_in_chat(self, chat_id: int, user_id: int) -> bool:
        return await redis.sismember(f"chat:{chat_id}:members", user_id)


manager = ConnectionManager()
