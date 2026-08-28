# README.md

```markdown
# Document Chatbot with LangGraph Orchestration

## Overview
A document chatbot application that has evolved into an intelligent Context Engineering Engine with LangGraph-based orchestration. This represents **Milestone 5** with full RAG pipeline and agentic orchestration.

## Architecture
- Backend: Node.js, Express, TypeScript
- Frontend: React, Vite, TypeScript
- Storage: Weaviate Vector Database
- Document Parsing: PDF Parsing, Text Chunking, Embeddings Pipeline
- LLM: Provider Factory supporting Mistral & OpenRouter
- Orchestration: Python/FastAPI LangGraph Microservice with 4-node agentic workflow

## System Architecture
```
<table>
<tr>
<td align="center">

<b>React Frontend</b><br>
Port 5173

</td>

<td align="center">
➡️
</td>

<td align="center">

<b>Express Backend</b><br>
Port 3000

</td>

<td align="center">
➡️
</td>

<td align="center">

<b>FastAPI Agent</b><br>
Port 8000

</td>
</tr>

<tr>
<td></td>
<td></td>
<td align="center">⬇️</td>
<td></td>
<td align="center">⬇️</td>
</tr>

<tr>
<td></td>
<td></td>

<td align="center">

<b>Weaviate</b><br>
Vector Store

</td>

<td></td>

<td align="center">

<b>Ollama</b><br>
Local LLM

</td>
</tr>
</table>

## Folder Structure
```text
chatbot/
├── agent-service/          # Python FastAPI LangGraph Orchestrator
│   ├── main.py            # FastAPI app & LangGraph setup
│   ├── nodes.py           # Graph nodes (classify, retrieve, generate, validate)
│   ├── state.py           # AgentState definition
│   └── config.py          # Configuration settings
├── backend/
│   ├── src/
│   │   ├── chat/          # Chat conversation module
│   │   ├── chunker/       # Text chunking with overlap
│   │   ├── config/        # App, Ollama, Weaviate configs
│   │   ├── controllers/   # Request handlers (chat, upload, document, agent)
│   │   ├── embeddings/    # Embedding generation service
│   │   ├── llm/           # LLM Providers (Mistral, OpenRouter)
│   │   ├── middleware/    # Express middlewares
│   │   ├── parser/        # Document parsing (pdf-parse)
│   │   ├── providers/     # LLM provider factory
│   │   ├── retriever/     # Context retrieval engine
│   │   ├── routes/        # Express routers
│   │   ├── services/      # Core business logic
│   │   ├── types/         # Typescript definitions
│   │   ├── utils/         # Helper functions
│   │   └── vector-store/  # Weaviate service
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services (including agent.service.ts)
│   │   └── types/         # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── README.md
└── TASKS.md
```

## Features

### Current Features (v0.9)
- **Document Processing**: 
  - PDF upload and parsing
  - Text chunking with overlap (1000 chars, 200 overlap)
  - Embedding generation via Ollama (nomic-embed-text)
  - Vector storage in Weaviate

- **Hybrid Retrieval**:
  - Vector similarity search
  - BM25 keyword search
  - Hybrid retrieval with ranking

- **Intelligent Orchestration** (LangGraph):
  - Query classification (rule-based, zero tokens)
  - Adaptive retrieval strategy selection
  - Progressive retrieval with confidence-based expansion
  - Response validation with regeneration
  - Circuit breaker fallback to direct API

- **Conversation Management**:
  - Session-based conversation memory
  - Memory eligibility evaluation
  - Exponential decay for older messages

- **Multiple LLM Support**:
  - OpenRouter provider
  - Mistral provider
  - Provider factory pattern

## Installation

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- Docker & Docker Compose
- Ollama (for local embeddings)

### Setup

```bash
# Clone the repository
git clone <repository_url>
cd chatbot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup agent service
cd ../agent-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running

### 1. Start Weaviate (Docker)
```bash
docker-compose up -d weaviate
```

### 2. Start Express Backend
```bash
cd backend
npm run dev
```

### 3. Start Agent Service
```bash
cd agent-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

### Or Use Docker Compose for All Services
```bash
docker-compose up -d
```

## API Endpoints

### Document Management
- `POST /api/upload` - Upload PDF document
- `GET /api/documents` - List indexed documents
- `DELETE /api/documents/:id` - Delete document

### Chat
- `POST /api/chat` - Direct chat (bypasses orchestration)
- `POST /api/agent/chat` - Orchestrated chat via LangGraph
- `POST /api/agent/retrieve` - Agent retrieval endpoint
- `POST /api/agent/generate` - Agent generation endpoint

### Health Checks
- `GET /health` - Express backend health
- `GET /api/agent/health` - Agent service health
- `GET /api/agent/graph` - Get graph structure

## Environment Variables

### Backend `.env`
```env
PORT=3000
LLM_PROVIDER=mistral  # or openrouter
MISTRAL_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
WEAVIATE_URL=http://localhost:8080
```

### Agent Service (in docker-compose.yml or environment)
```env
EXPRESS_BACKEND_URL=http://localhost:3000
AGENT_MAX_RETRIEVAL_ATTEMPTS=2
AGENT_INITIAL_TOP_K=3
AGENT_EXPANDED_TOP_K=5
AGENT_VALIDATION_THRESHOLD=0.3
```

## LangGraph Orchestration

### Graph Structure
```
User Query → [Classify] → [Retrieve] → [Generate] → [Validate] → Response
                ↓            ↑                          ↓
             (Rule-based)  (from Express)          (if invalid)
                ↓                                    ↓
          Vector/Keyword/Hybrid                Regenerate
```

### Nodes
1. **Classify**: Rule-based query classification (zero tokens)
2. **Retrieve**: Progressive retrieval with adaptive top-K
3. **Generate**: Delegated LLM generation via Express
4. **Validate**: Response quality checking with regeneration

### Key Benefits
- Zero-token routing decisions
- Adaptive retrieval strategies
- Automatic fallback handling
- Full orchestration visibility

## Development Milestones

### Completed
- **Milestone 1**: Project initialization, folder structure
- **Milestone 2**: PDF upload and text extraction
- **Milestone 3**: Document chunking and embedding pipeline
- **Milestone 4**: RAG pipeline implementation with Weaviate
- **Milestone 5**: LangGraph orchestration layer

### Future Scope
- **Milestone 6**: Multi-agent orchestration
- **Milestone 7**: Advanced memory management
- **Milestone 8**: Streaming responses
- Continued evolution into a full Context Engineering Engine

## Testing

### Manual Testing Scenarios
1. **Simple Query**: "What is Redux?" → Keyword routing
2. **Complex Query**: "Why does middleware work?" → Vector routing
3. **Comparison Query**: "Compare Redux and Express" → Hybrid routing
4. **Fallback Test**: Kill agent service → Direct Express fallback

### Verification
```bash
# Check agent health
curl http://localhost:8000/health

# Test orchestration
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Redux?"}'

# View graph structure
curl http://localhost:8000/api/agent/graph
```

## Troubleshooting

### Common Issues
- **CORS errors**: Ensure Express CORS is configured for port 5173
- **Agent connection failed**: Check if agent service is running on port 8000
- **Weaviate connection**: Verify Weaviate is running on port 8080
- **Ollama not responding**: Ensure Ollama is running and models are pulled

### Port Conflicts
```bash
# Check port usage
netstat -ano | findstr :8000
netstat -ano | findstr :3000
netstat -ano | findstr :8080
```

## Tech Stack

### Backend
- Node.js, Express, TypeScript
- Weaviate Client
- pdf-parse
- Multer (file uploads)
- CORS

### Agent Service
- Python 3.11
- FastAPI
- LangGraph
- httpx
- Pydantic

### Frontend
- React 19
- Vite 8
- TypeScript 6
- Axios
- CSS3 with custom properties

### Infrastructure
- Docker & Docker Compose
- Ollama (local LLM & embeddings)
- Weaviate Vector Database
```
