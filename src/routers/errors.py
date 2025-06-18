from fastapi import APIRouter, Request
from src.core.templates import templates

router = APIRouter()


@router.get("/404", include_in_schema=False)
async def not_found(request: Request):
    return templates.TemplateResponse(
        "errors/404.html", {"request": request}, status_code=404
    )


@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def catch_all_404(request: Request, path: str):
    return templates.TemplateResponse(
        "errors/404.html", {"request": request, "path": path}, status_code=404
    )
