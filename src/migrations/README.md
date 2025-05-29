# Применение миграций

- Для создания миграций выполнить команду `alembic init -t async migrations`
- В файле alembic.ini изменить строку prepend_sys_path на `prepend_sys_path = . src`
- В файле migrations/env.py:
    - добавить импорт `from core.config import settings`
    - добавить импорт `from models import *`
    - добавить строку
      `config.set_main_option("sqlalchemy.url", settings.db_url.get_secret_value())` для замены
      sqlalchemy.url в alembic.ini
    - изменить target_metadata на `target_metadata = Base.metadata`
- Выполнить команду в контейнере app `alembic revision --autogenerate -m "comment"`
- Для применения миграций необходимо использовать команду `alembic upgrade head`