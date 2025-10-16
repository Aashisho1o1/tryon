from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings and configuration"""

    # Application
    APP_NAME: str = "Jewelry AR Try-On API"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "jewelry_ar_db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ]

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"

    # API
    API_PREFIX: str = "/api/v1"
    API_RATE_LIMIT: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
