import { ChunkMetadata } from './chunk.types';

/**
 * Represents a document text chunk enriched with its vector embedding.
 */
export interface EmbeddedChunk {
    id: string;
    text: string;
    embedding: number[];
    metadata: ChunkMetadata;
}

/**
 * Represents the expected JSON response format from the Ollama /api/embed endpoint.
 */
export interface OllamaEmbeddingResponse {
    model: string;
    embeddings: number[][];
}

