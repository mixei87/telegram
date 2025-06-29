from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from src.core.config import settings
from src.core.templates import templates

router = APIRouter(tags=["Chat client"], include_in_schema=False)


@router.get("/", response_class=HTMLResponse)
async def show_chat_client(request: Request):
    return templates.TemplateResponse(
        "chat.html", {"request": request, "config": {"WS_URL": settings.ws_url}}
    )
