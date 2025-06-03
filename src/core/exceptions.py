"""
Кастомные исключения для операций с базой данных и бизнес-логики.
"""
from typing import Any


class BaseAppError(Exception):
    """Базовое исключение для всех ошибок приложения."""
    default_message: str = "Произошла непредвиденная ошибка"
    status_code: int = 500

    def __init__(
            self,
            message: str | None = None,
            status_code: int | None = None,
            **kwargs: Any
    ):
        self.message = message or self.default_message
        self.status_code = status_code or self.status_code
        self.extra = kwargs
        super().__init__(self.message)

    def __str__(self) -> str:
        return self.message


class NotFoundError(BaseAppError):
    """Вызывается, когда запрашиваемый ресурс не найден."""
    default_message = "Запрашиваемый ресурс не найден"
    status_code = 404


class LogicError(BaseAppError):
    """Вызывается, когда произошла логическая ошибка."""
    default_message = "Логическая ошибка"
    status_code = 422


class AlreadyExistsError(BaseAppError):
    """Вызывается при попытке создать уже существующий ресурс."""
    default_message = "Ресурс с такими данными уже существует"
    status_code = 409


class ValidationError(BaseAppError):
    """Вызывается при ошибке валидации входных данных."""
    default_message = "Некорректные входные данные"
    status_code = 400


class PermissionDeniedError(BaseAppError):
    """Вызывается при отсутствии прав на выполнение действия."""
    default_message = "У вас нет прав для выполнения этого действия"
    status_code = 403


class AuthenticationError(BaseAppError):
    """Вызывается при ошибке аутентификации."""
    default_message = "Ошибка аутентификации"
    status_code = 401


class DatabaseError(BaseAppError):
    """Вызывается при ошибке работы с базой данных."""
    default_message = "Ошибка базы данных"
    status_code = 500


class IntegrityError(DatabaseError):
    """Вызывается при нарушении ограничений целостности БД."""
    default_message = "Нарушение целостности данных"
    status_code = 409


class TimeOutError(BaseAppError):
    """Вызывается при истечении времени ожидания операции."""
    default_message = "Время операции истекло"
    status_code = 408


class RateLimitExceededError(BaseAppError):
    """Вызывается при превышении лимита запросов."""
    default_message = "Превышено количество запросов"
    status_code = 429
