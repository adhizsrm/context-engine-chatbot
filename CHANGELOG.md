# Changelog

## v0.4 - Complete Backend RAG Pipeline

### Added
- PDF upload pipeline
- PDF parser
- Text chunking
- Ollama embedding generation
- Weaviate vector storage
- Semantic retrieval
- OpenRouter integration

### Refactored
- Introduced LLMProvider interface
- Added PromptBuilder
- Added ProviderFactory
- Introduced Composition Root
- Dependency Injection for ChatService

### Next
- Clear and manage indexed documents
- React chat interface
- Document management endpoints
- Streaming responses