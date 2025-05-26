import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.db.init_db import init_db
from src.routers.user import router as user_router
from src.routers.chat import router as chat_router


# from src.routers.message import router as message_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Выполняется при запуске и остановке приложения.
    """
    await init_db()
    yield


app = FastAPI(title="Messenger API", lifespan=lifespan)

# Подключение роутов
app.include_router(user_router)
app.include_router(chat_router)

# app.include_router(message_router)


if __name__ == "__main__":
    uvicorn.run(app="src.main:app", reload=True)
