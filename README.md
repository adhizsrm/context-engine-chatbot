# Document Chatbot

## Overview
A document chatbot application designed to gradually evolve into a complete Context Engineering Engine. This represents **Milestone 1**.

## Architecture
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TypeScript
- **Storage**: In-memory storage (No Database yet)
- **Document Parsing**: `pdf-parse` (Planned)
- **LLM**: Abstraction layer starting with MockLLMProvider (Planned)

## Folder Structure
```text
chatbot/
├── backend/
│   ├── src/
│   │   ├── chat/          # Chat conversation module
│   │   ├── controllers/   # Request handlers
│   │   ├── llm/           # LLM Providers (Mock, Gemini, OpenRouter)
│   │   ├── middleware/    # Express middlewares
│   │   ├── parser/        # Document parsing (pdf-parse)
│   │   ├── retriever/     # Context retrieval engine
│   │   ├── routes/        # Express routers
│   │   ├── services/      # Core business logic
│   │   ├── types/         # Typescript definitions
│   │   └── utils/         # Helper functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/               # React components and views
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── TASKS.md
```

## Features
- **Current (v0.1 / v0.2)**: 
  - Clean monorepo structure, TypeScript configured, Frontend & Backend boilerplates.
  - **Document Processing**: `POST /api/upload` endpoint for PDF uploads. Automatically extracts text using `pdf-parse`.
- **Planned**: Document Chunking & Storage, Mock LLM Answers, RAG Pipeline.

## Installation
Ensure you have Node.js installed.
```bash
# Clone the repository (if not already cloned)
git clone <repository_url>
cd chatbot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running
### Start Backend
```bash
cd backend
npm start      # Depends on adding start script
# For development run with tsx or nodemon
npx tsx src/index.ts
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
# LLM API keys to be added here in later milestones
```

## Future Scope
- **Milestone 2**: Document Parser Integration
- **Milestone 3**: Mock LLM and Conversation History
- **Milestone 4**: RAG Pipeline implementation
- Continued evolution into a full Context Engineering Engine

## Current Progress
- **Milestone 1**: Project initialized. Folder structure mapped out.
- **Milestone 2**: Implemented PDF Uploads and Raw Text Extraction (pdf-parse) on the backend.

