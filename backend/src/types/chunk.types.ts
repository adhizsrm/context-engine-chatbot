import { randomUUID } from 'crypto';

export interface ChunkMetadata {
    /** 
     * Identifies the original document this chunk belongs to.
     * Useful for deleting or updating all chunks for a specific file.
     */
    documentId?: string;

    /**
     * The original filename or source URI.
     */
    source?: string;

    /**
     * If extracting from PDF, the specific page number if available.
     */
    page?: number;

    /**
     * The sequential index of this chunk within the document.
     */
    chunkIndex: number;

    /**
     * Timestamp of when this chunk was created.
     */
    createdAt?: string;
}

export interface RetrievalFilter {
    documentId?: string;
}

export interface TextChunk {
    id: string;
    text: string;
    metadata: ChunkMetadata; // Strictly required now
}

/**
 * Represents a document mapped from the Vector DB search response.
 */
export interface RetrievedChunk {
    id: string;
    text: string;
    metadata: ChunkMetadata;
    distance?: number;
    semanticDistance?: number;
    keywordScore?: number;
    rerankScore?: number;
    retrievalSource?: 'vector' | 'keyword' | 'hybrid';
}
