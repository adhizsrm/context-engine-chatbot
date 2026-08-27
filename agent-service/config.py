from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    EXPRESS_BACKEND_URL: str = "http://localhost:3000"
    RETRIEVAL_ENDPOINT: str = "/api/agent/retrieve"
    GENERATION_ENDPOINT: str = "/api/agent/generate"
    MAX_RETRIEVAL_ATTEMPTS: int = 2
    INITIAL_TOP_K: int = 3
    EXPANDED_TOP_K: int = 5
    VALIDATION_THRESHOLD: float = 0.3
    MAX_REGENERATION_ATTEMPTS: int = 2

    class Config:
        env_file = ".env"


settings = Settings()
