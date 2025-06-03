# Используем официальный образ Python 3.12
FROM python:3.12.10-alpine3.21

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости и устанавливаем зависимости
COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install -r requirements.txt

# Копируем исходный код
COPY src ./src
COPY .env .
COPY alembic.ini .
COPY tests ./tests

# Копирование entrypoint.sh и добавление прав на выполнение
COPY entrypoint.sh .
RUN chmod +x /app/entrypoint.sh

# Команда для запуска приложения
CMD ["/app/entrypoint.sh"]
