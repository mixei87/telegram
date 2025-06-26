from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.core.dependencies import MessageServiceDepends, RedisChatServiceDepends
from src.core.exceptions import NotFoundError
from src.core.ws_manager import ws_manager
from src.schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/ws", tags=["WebSocket"], include_in_schema=False)


@router.websocket("/{user_id}")
async def websocket_handler(
    user_id: int,
    websocket: WebSocket,
    message_service: MessageServiceDepends,
    redis: RedisChatServiceDepends,
):
    await ws_manager.connect(user_id, websocket)
    chat_members: list[int] = []
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("action") == "get_chat_members":
                chat_id = data.get("chat_id")
                if not chat_id:
                    continue
                chat_members = await redis.get_chat_members(chat_id)
            elif data.get("action") == "send_message":
                message = await message_service.create_message(
                    MessageCreate(sender_id=user_id, **data.get("msg"))
                )
                await message_service.message_repo.session.commit()
                message_json = MessageResponse.model_validate(message).model_dump_json()
                for member_id in chat_members:
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
