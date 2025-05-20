# Используем официальный образ Python 3.12
FROM python:3.12.10-alpine3.21

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY . .

# Копирование entrypoint.sh и добавление прав на выполнение
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Команда для запуска приложения
CMD ["/app/entrypoint.sh"]
