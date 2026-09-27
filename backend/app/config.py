import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")
    database_url: str = os.getenv("DATABASE_URL", "")
    sync_database_url: str = os.getenv("SYNC_DATABASE_URL", "")
    assemblyai_api_key: str = os.getenv("ASSEMBLYAI_API_KEY", "")
    assemblyai_voice_agent_id: str = os.getenv("ASSEMBLYAI_VOICE_AGENT_ID", "")
    llm_gateway_url: str = os.getenv("LLM_GATEWAY_URL", "https://llm-gateway.assemblyai.com/v1")
    llm_gateway_model: str = os.getenv("LLM_GATEWAY_MODEL", "claude-3-5-sonnet")
    default_user_id: str = os.getenv("DEFAULT_USER_ID", "00000000-0000-0000-0000-000000000001")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

settings = Settings()
