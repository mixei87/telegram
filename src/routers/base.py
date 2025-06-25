from fastapi import APIRouter

from src.routers.chat import router as chat_router
from src.routers.errors import router as errors_router
from src.routers.group import router as group_router
from src.routers.message import router as message_router
from src.routers.test_data import router as test_data_router
from src.routers.user import router as user_router
from src.routers.ws import router as websocket_router
from src.routers.client import router as ws_client_router

routers = APIRouter()

routers.include_router(user_router)
routers.include_router(chat_router)
routers.include_router(group_router)
routers.include_router(message_router)
routers.include_router(test_data_router)
routers.include_router(websocket_router)
routers.include_router(ws_client_router)
routers.include_router(errors_router)
