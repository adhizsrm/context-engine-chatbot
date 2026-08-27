from typing import List, Dict, Any, TypedDict
from typing_extensions import NotRequired


class AgentState(TypedDict):
    query: str
    document_id: NotRequired[str]
    routing_decision: str
    context: List[Dict[str, Any]]
    response: str
    metadata: Dict[str, Any]
    needs_regeneration: bool
    regeneration_attempts: int
