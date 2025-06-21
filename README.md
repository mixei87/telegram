# 📱 Телеграм-подобный мессенджер

Этот проект представляет собой упрощенный аналог Telegram с возможностью обмена сообщениями между пользователями в
реальном времени, создания групповых чатов и просмотра истории сообщений.

## 🚀 Возможности

- 📨 Обмен сообщениями в реальном времени через WebSocket
- 👥 Создание и участие в групповых чатах
- 📜 Просмотр истории сообщений с пагинацией
- ✅ Уведомления о прочтении сообщений
- ⚡ Асинхронная работа сервера на FastAPI
- 💾 Хранение данных в PostgreSQL
- ⚡ Кэширование с помощью Redis

## 🛠 Технический стек

- **Backend**: Python 3.12, FastAPI
- **База данных**: PostgreSQL
- **Кэш**: Redis
- **WebSockets**: для обмена сообщениями в реальном времени
- **Контейнеризация**: Docker, Docker Compose

## 🚀 Быстрый старт

### Требования

- Docker и Docker Compose
- Python 3.12

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd test_telegram
   ```

2. **Настройте переменные окружения**
   Скопируйте файл `.env.example` в `.env` и настройте параметры:
   ```bash
   cp .env.example .env
   ```

   Отредактируйте `.env` файл, указав необходимые настройки.

3. **Запустите приложение**
   ```bash
   docker-compose up --build
   ```

4. **Приложение будет доступно**
    - API: `http://localhost:8000`
    - Документация API: `http://localhost:8000/docs`
    - Веб-интерфейс чата: `http://localhost:8000/chat`

## 📚 API Документация

### WebSocket

#### Подключение к чату

```
ws://localhost:8000/ws/{user_id}
```

#### Формат сообщения

```json
{
  "external_id": "уникальный_идентификатор_сообщения",
  "chat_id": 1,
  "text": "Текст сообщения"
}
```

### REST API

#### Получить список чатов пользователя

```http
GET /api/chats
Authorization: Bearer <jwt_token>
```

#### Создать чат

```http
POST /api/chats
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Название чата",
  "user_ids": [2, 3]
}
```

#### Получить историю сообщений

```http
GET /api/chats/{chat_id}/messages?limit=50&offset=0
Authorization: Bearer <jwt_token>
```

#### Отправить сообщение (REST)

```http
POST /api/chats/{chat_id}/messages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "text": "Текст сообщения"
}
```

## 🧪 Запуск тестов

Для запуска тестов выполните:

```bash
docker-compose run --rm app pytest tests -v
```

## 🏗 Структура проекта

```
src/
├── core/           # Основная логика приложения
├── db/             # Настройки базы данных
├── models/         # SQLAlchemy модели
├── repositories/   # Слой работы с данными
├── routers/        # API эндпоинты
├── schemas/        # Pydantic схемы
└── services/       # Бизнес-логика
```

## 📝 Лицензия

MIT
