# Настройки приложения
# from dotenv import load_dotenv, find_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr


# dotenv_path = find_dotenv()
# load_dotenv(dotenv_path)


class Settings(BaseSettings):
    DB_USER: str = ''
    DB_PASS: SecretStr = ''
    DB_HOST: str = ''
    DB_PORT: int = 1111
    DB_NAME: str = ''

    REDIS_HOST: str = ''
    REDIS_PORT: int = 1111

    @property
    def DB_URL(self) -> SecretStr:
        return SecretStr(
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS.get_secret_value()}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
