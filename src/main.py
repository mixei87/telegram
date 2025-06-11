import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from src.db.init_db import init_db
from src.routers.base import router


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa
    await init_db()
    yield


app = FastAPI(title="Messenger API", lifespan=lifespan)
app.mount("/static", StaticFiles(directory="src/static"), name="static")
app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app="src.main:app", reload=True)
