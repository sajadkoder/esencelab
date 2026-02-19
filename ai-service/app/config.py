import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    class Config:
        env_file = env_path
        extra = "ignore"


settings = Settings()
