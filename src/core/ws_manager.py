from typing import Dict

from fastapi import WebSocket


class WSManager:
    def __init__(self):
        self.connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.connections:
            del self.connections[user_id]

    async def send_to_user(self, user_id: int, message: str):
        if user_id in self.connections:
            await self.connections[user_id].send_text(message)

    def is_online(self, user_id: int) -> bool:
        return user_id in self.connections


ws_manager = WSManager()
