import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.core.config import settings
from src.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Выполняется при запуске и остановке приложения.
    """
    await init_db()
    print("Startup completed. Database tables are ready!")
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


if __name__ == "__main__":
    uvicorn.run(app="src.main:app", reload=True)
