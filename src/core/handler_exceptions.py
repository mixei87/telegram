from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError

from src.core.templates import templates


def register_exception_handlers(app: FastAPI):
    @app.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, exc: HTTPException):
        if exc.status_code == 404:
            return templates.TemplateResponse(
                "errors/404.html",
                {"request": request, "path": request.url.path},
                status_code=exc.status_code,
            )
        elif exc.status_code == 500:
            return templates.TemplateResponse(
                "errors/500.html", {"request": request}, status_code=exc.status_code
            )
        else:
            return templates.TemplateResponse(
                "errors/generic.html",
                {
                    "request": request,
                    "status_code": exc.status_code,
                    "detail": exc.detail,
                },
                status_code=exc.status_code,
            )

    def format_validation_error(error):
        field = " -> ".join(map(str, error["loc"]))
        message = error["msg"]

        if "greater than or equal to 0" in message:
            return {
                "field": field,
                "message": "Значение должно быть положительным числом",
            }
        if "less than or equal to 2147483647" in message:
            return {"field": field, "message": "Значение слишком большое"}
        if "Input should be a valid integer" in message:
            return {"field": field, "message": "Неверный формат. Ожидается число"}

        return {"field": field, "message": message}

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        return templates.TemplateResponse(
            "errors/validation.html",
            {
                "request": request,
                "errors": [format_validation_error(error) for error in exc.errors()],
            },
            status_code=422,
        )
