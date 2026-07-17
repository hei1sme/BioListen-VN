"""
Settings — load từ .env file
Tạo .env từ .env.example sau khi có API keys
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "VAIC 2026 API"
    DEBUG: bool = True

    # LLM API Keys (điền sau khi quyết định dùng provider nào)
    GROQ_API_KEY: str = ""          # https://console.groq.com — FREE & FAST
    OPENAI_API_KEY: str = ""        # OpenAI
    ANTHROPIC_API_KEY: str = ""     # Claude
    GOOGLE_API_KEY: str = ""        # Gemini

    # Database
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24h

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
