from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.core.dependencies import MessageServiceDepends
from src.core.ws_manager import manager
from src.schemas.message import MessageCreateWS

router = APIRouter(prefix="/ws", tags=["WebSocket"], include_in_schema=False)


@router.websocket("/{user_id}")
async def websocket_handler(
    user_id: int,
    websocket: WebSocket,
    message_service: MessageServiceDepends,
):
    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            print(f"WEBSOCKET 1: {data=}", flush=True)
            message_data = MessageCreateWS(**data)

            # Сохраняем сообщение через сервис
            message = await message_service.create_message(
                external_id=message_data.external_id,
                chat_id=message_data.chat_id,
                sender_id=user_id,
                text=message_data.text,
            )

            # Рассылаем всем участникам чата, кроме отправителя
            print(f"WEBSOCKET 2: {message=}", flush=True)
            await manager.send_message_to_chat(
                message_data.chat_id, user_id, message_data.text
            )
    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {user_id}")
    except Exception as e:
        print(f"Unexpected error in WebSocket: {e}")
    finally:
        await manager.disconnect(user_id)
