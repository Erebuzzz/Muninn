from fastapi import APIRouter
from .routes_sessions import router as sessions_router
from .routes_claims import router as claims_router
from .routes_review import router as review_router
from .routes_graph import router as graph_router
from .routes_resurfacing import router as resurfacing_router
from .routes_chat import router as chat_router

api_router = APIRouter(prefix="/api")

api_router.include_router(sessions_router)
api_router.include_router(claims_router)
api_router.include_router(review_router)
api_router.include_router(graph_router)
api_router.include_router(resurfacing_router)
api_router.include_router(chat_router)
