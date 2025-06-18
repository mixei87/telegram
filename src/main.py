from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from src.core.handler_exceptions import register_exception_handlers
from src.db.init_db import init_db
from src.routers.base import routers


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa
    await init_db()
    yield


app = FastAPI(title="Messenger API", lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(routers)

register_exception_handlers(app)


if __name__ == "__main__":
    uvicorn.run(app="src.main:app", reload=True)
