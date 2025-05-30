from fastapi import APIRouter
from src.routers.user import router as user_router
from src.routers.chat import router as chat_router
from src.routers.group import router as group_router
from src.routers.message import router as message_router
from src.routers.test_data import router as test_data_router

# from src.routers.websocket import router as websocket_router


router = APIRouter()

router.include_router(user_router)
router.include_router(chat_router)
router.include_router(group_router)
router.include_router(message_router)
router.include_router(test_data_router)
# router.include_router(websocket_router)
