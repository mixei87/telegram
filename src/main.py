import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.db.init_db import init_db
from src.routers.base import router


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa
    """
    Выполняется при запуске и остановке приложения.
    """
    await init_db()
    yield


app = FastAPI(title="Messenger API", lifespan=lifespan)

# Подключение роутов
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app="src.main:app", reload=True)
