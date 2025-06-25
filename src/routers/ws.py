from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.core.dependencies import MessageServiceDepends, RedisChatServiceDepends
from src.core.exceptions import NotFoundError
from src.core.ws_manager import ws_manager
from src.schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/ws", tags=["WebSocket"], include_in_schema=False)


@router.websocket("/{user_id}")
async def websocket_endpoint(
    user_id: int,
    websocket: WebSocket,
    message_service: MessageServiceDepends,
    redis: RedisChatServiceDepends,
):
    await ws_manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            chat_id = data.get("chat_id")
            print(data, flush=True)

            if not await redis.is_user_in_chat(chat_id, user_id):
                await websocket.send_json({"error": "Нет доступа к чату"})
                continue

            message = await message_service.create_message(
                MessageCreate(sender_id=user_id, **data)
            )

            print(f"Message created1: {message=}", flush=True)
            message_json = MessageResponse.model_validate(message).model_dump_json()
            print(f"Message created2: {message_json=}", flush=True)
            members = await redis.get_chat_members(chat_id)
            for member_id in members:
                if member_id == user_id:
                    continue
                if ws_manager.is_online(member_id):
                    await ws_manager.send_to_user(member_id, message_json)
                else:
                    await redis.add_to_queue(member_id, message_json)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {user_id}", flush=True)
    except NotFoundError as e:
        print(e, flush=True)
    except Exception as e:
        print(f"Unexpected error in WebSocket: {e}", flush=True)
    finally:
        ws_manager.disconnect(user_id)
        await websocket.close()
