from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from src.routers import templates

router = APIRouter(prefix="/ws", tags=["WebSocket docs"], include_in_schema=False)


@router.get("/client", response_class=HTMLResponse)
async def get_websocket_documentation(request: Request):
    return templates.TemplateResponse("ws_client.html", {"request": request})
