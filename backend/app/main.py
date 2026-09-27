from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import settings
from .db.session import engine
from .api.router import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("muninn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Muninn Backend...")
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Connected successfully to Neon PostgreSQL database.")
    except Exception as e:
        logger.error("Failed to connect to database during startup: %s", e)
    yield
    logger.info("Shutting down Muninn Backend...")
    await engine.dispose()

app = FastAPI(
    title="Muninn Living Memory API",
    description="Backend API for Muninn: voice capture, provenance tracking, sensitivity review, and living memory graph.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "muninn-backend",
        "version": "1.0.0",
        "llm_gateway": settings.llm_gateway_url,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
