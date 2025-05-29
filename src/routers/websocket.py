# from fastapi import WebSocket, APIRouter
# from src.core.dependencies import get_async_session
# from src.services.websocket_manager import manager
#
# router = APIRouter(prefix="/ws", tags=["websocket"])
#
#
# @router.websocket("/{chat_id}")
# async def websocket_endpoint(websocket: WebSocket, chat_id: int):
#     async for session in get_async_session():  # или get_user_from_token
#         user = ...  # как-то получить текущего пользователя
#         await manager.connect(chat_id, websocket, user)
#         try:
#             while True:
#                 data = await websocket.receive_json()
#                 await manager.broadcast(chat_id, data)
#         except Exception as e:
#             manager.disconnect(chat_id, websocket)
