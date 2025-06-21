from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from src.core.templates import templates

router = APIRouter(prefix="/ws", tags=["WebSocket client"], include_in_schema=False)


@router.get("/client", response_class=HTMLResponse)
async def show_ws_client(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})
