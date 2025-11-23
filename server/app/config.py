import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET = os.getenv("SECRET", "SUPER_SECRET_KEY_CHANGE_IT")
    POSTGRES_URL = os.getenv(
        "POSTGRES_URL",
        "postgresql+asyncpg://admin:password@postgres:5432/postgres"
    )

settings = Settings()