import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .main import agent_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 Started LangGraph Agent Service targeting {settings.EXPRESS_BACKEND_URL}")
    yield

app = FastAPI(title="Context Engine Agent Orchestrator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router, prefix="/api/agent")

@app.get("/health")
def health():
    return {"status": "ok", "backend": settings.EXPRESS_BACKEND_URL}
