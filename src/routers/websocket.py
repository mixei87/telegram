from fastapi import APIRouter, WebSocket, status, WebSocketDisconnect, HTTPException

from src.core.dependencies import MessageServiceDepends
from src.core.exceptions import AuthenticationError
from src.repositories.chat import ChatRepository
from src.repositories.user import UserRepository
from src.services.chat_member import ChatMemberService
from src.services.chat import ChatService
from src.services.user import UserService
from src.schemas.message import MessageCreateWS


class ConnectionManager:
    def __init__(self):
        self.active_connections = {}  # { chat_id: { user_id: websocket } }

    async def connect(self, chat_id: int, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = {}
        self.active_connections[chat_id][user_id] = websocket

    def disconnect(self, chat_id: int, user_id: int):
        if chat_id in self.active_connections and user_id in self.active_connections[chat_id]:
            del self.active_connections[chat_id][user_id]

    async def send_message_to_chat(self, chat_id: int, sender_id: int, message_json: str):
        connections = self.active_connections.get(chat_id, {})
        for user_id, ws in connections.items():
            if user_id != sender_id:
                await ws.send_text(message_json)


manager = ConnectionManager()

router = APIRouter(prefix="/ws", tags=["WebSocket"], include_in_schema=False)


@router.websocket("/{chat_id}")
async def websocket_endpoint(chat_id: int, websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            await websocket.send_text(f"Echo: {data['text']}. chat_id: {chat_id}")
    except Exception as e:
        await websocket.close()
    # raise HTTPException(status_code=422, detail=str("Not implemented"))
    # try:
    #     user = await service.user_service.get_user_by_token(token)
    # except AuthenticationError:
    #     await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    #     return
    #
    # await manager.connect(chat_id, user.id, websocket)
    #
    # try:
    #     while True:
    #         data = await websocket.receive_json()
    #         message_data = MessageCreateWS(**data)
    #
    #         # Сохраняем сообщение через сервис
    #         message = await service.create_message(
    #             external_id=message_data.external_id,
    #             chat_id=chat_id,
    #             sender_id=user.id,
    #             text=message_data.text
    #         )
    #
    #         # Рассылаем всем участникам чата, кроме отправителя
    #         await manager.send_message_to_chat(chat_id, user.id, message.model_dump_json())
    #
    # except WebSocketDisconnect:
    #     manager.disconnect(chat_id, user.id)
