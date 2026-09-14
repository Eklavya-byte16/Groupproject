from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    The ONE place backend config lives. Every other module imports
    `settings` from here - never re-declare a second config/settings
    module elsewhere. (Duplicate config modules are the single most
    common way a fast-growing full-stack repo turns into a mess.)
    """
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "app"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:5173"]
    database_url: str = "sqlite:///./dev.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
