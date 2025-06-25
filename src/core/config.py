from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr


class Settings(BaseSettings):
    DB_USER: str = ""
    DB_PASS: SecretStr = ""
    DB_HOST: str = ""
    DB_PORT: int = 1111
    DB_NAME: str = ""

    TEST_DB_USER: str = ""
    TEST_DB_PASS: SecretStr = ""
    TEST_DB_HOST: str = ""
    TEST_DB_PORT: int = 1111
    TEST_DB_NAME: str = ""

    REDIS_HOST: str = ""
    REDIS_PORT: int = 1111

    WS_URL: str = ""

    @property
    def db_url(self) -> SecretStr:
        return SecretStr(
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS.get_secret_value()}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def test_db_url(self) -> SecretStr:
        return SecretStr(
            f"postgresql+asyncpg://{self.TEST_DB_USER}:{self.TEST_DB_PASS.get_secret_value()}@{self.TEST_DB_HOST}:{self.TEST_DB_PORT}/{self.TEST_DB_NAME}"
        )

    @property
    def ws_url(self) -> str:
        return self.WS_URL

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
