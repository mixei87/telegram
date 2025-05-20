#!/bin/sh

# Инициализация Alembic (если папка migrations не существует)
if [ ! -d "migrations" ]; then
    echo "Initializing Alembic..."
    alembic init migrations
    sed -i "s/sqlalchemy.url = .*/sqlalchemy.url = postgresql+asyncpg:\/\/${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}\/${DB_NAME}/" /app/alembic.ini
fi

# Применение миграций
echo "Applying database migrations..."
alembic upgrade head

# Запуск приложения
exec uvicorn src.main:app --host "${APP_HOST}" --port "${APP_PORT}" --reload