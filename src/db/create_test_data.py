from random import choice, randint, sample

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from src.models.base import ChatType
from src.models.chat import Chat
from src.models.user import User
from src.models.group import Group
from src.models.message import Message
from src.models.chat_member import ChatMember
from src.db.session import async_session


async def create_test_data():
    async with async_session() as session:
        # Создаем пользователей
        users = [
            User(name=f"User{i}", email=f"user{i}@example.com", hashed_password="password")
            for i in range(7)
        ]
        session.add_all(users)
        await session.flush()
        print(f'users: {users}')

        # Создаем чаты
        chats = [Chat(name=f"Chat {i}", type=ChatType.GROUP if i % 2 else ChatType.PERSONAL) for i in range(10)]
        session.add_all(chats)
        await session.flush()
        print(f'chats: {chats}')

        # Добавляем участников в чаты
        chat_members = []
        groups = []

        for chat in chats:
            if chat.type == ChatType.PERSONAL:
                selected_users = sample(users, 2)
            else:
                selected_users = sample(users, randint(3, 4))
                groups.append(Group(id=chat.id, name=f"Group {chat.name}", creator_id=choice(selected_users).id))
            chat_members.extend(ChatMember(chat_id=chat.id, user_id=user.id) for user in selected_users)

        session.add_all(chat_members)
        session.add_all(groups)
        await session.flush()

        # Создаем сообщения
        for _ in range(20):
            chat = choice(chats)
            stmt = select(Chat).where(Chat.id == chat.id).options(joinedload(Chat.members))
            result = await session.execute(stmt)
            chat = result.scalars().unique().one()
            sender = choice(chat.members)
            message = Message(
                text=f"Message from {sender.name} in {chat.name}",
                chat_id=chat.id,
                sender_id=sender.id,
                is_read=bool(randint(0, 1)),  # Случайно устанавливаем флаг прочтения
            )
            session.add(message)

        # Сохраняем все изменения
        await session.commit()
        print("Test data created successfully!")
