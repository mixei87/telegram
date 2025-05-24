#!/bin/sh

# Запуск приложения
exec uvicorn src.main:app --host "${APP_HOST}" --port "${APP_PORT}" --reload