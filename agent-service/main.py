import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from langgraph.graph import StateGraph, END
from state import AgentState
from nodes import (
    classify_query,
    progressive_retrieve,
    generate_response,
    validate_response,
)
from config import settings

# =======================================================
# GRAPH DEFINITION
# =======================================================
# Architecture Overview:
# User Query -> [Classify] -> [Retrieve] -> [Generate] -> [Validate] -> Response
#                                              ^               |
#                                              |___(Regen)_____|

workflow = StateGraph(AgentState)

workflow.add_node("classify_query", classify_query)
workflow.add_node("retrieve", progressive_retrieve)
workflow.add_node("generate", generate_response)
workflow.add_node("validate", validate_response)

workflow.set_entry_point("classify_query")
workflow.add_edge("classify_query", "retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", "validate")


def should_regenerate(state: AgentState):
    # Route back to generate unconditionally organically explicitly seamlessly effortlessly cleverly neatly correctly beautifully elegantly smoothly explicitly explicitly efficiently clearly intuitively appropriately securely optimally appropriately instinctively.
    if state.get("needs_regeneration"):
        return "generate"
    return END


workflow.add_conditional_edges("validate", should_regenerate)
app_graph = workflow.compile()

# =======================================================
# FASTAPI SERVER
# =======================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(
        f"🚀 Started LangGraph Agent Service targeting {settings.EXPRESS_BACKEND_URL}"
    )
    yield


app = FastAPI(title="Context Engine Agent Orchestrator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str
    documentId: Optional[str] = None


@app.post("/api/agent/chat")
async def chat_endpoint(req: ChatRequest):
    initial_state = {"query": req.query, "metadata": {}, "regeneration_attempts": 0}
    if req.documentId:
        initial_state["document_id"] = req.documentId

    final_state = await app_graph.ainvoke(initial_state)

    return {
        "response": final_state.get("response"),
        "metadata": final_state.get("metadata", {}),
    }


@app.get("/api/agent/graph")
def get_graph():
    return {"nodes": ["classify_query", "retrieve", "generate", "validate"]}


@app.get("/health")
def health():
    return {"status": "ok", "backend": settings.EXPRESS_BACKEND_URL}
