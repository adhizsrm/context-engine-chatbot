import { EmbeddingService } from '../embeddings/embedding.service';
import { WeaviateService } from '../vector-store/weaviate.service';
import { RetrievedChunk } from '../types/chunk.types';
import { APP_CONFIG } from '../config/app.config';

export class RetrievalService {
    /**
     * Orchestrates the transformation of a natural language query into vector space,
     * and performs nearest-neighbor retrieval to fetch relevant contextual document chunks.
     * 
     * @param query The user's semantic question.
     * @param topK The maximum number of relevant chunks to return (defaults to 5).
     * @returns An array of structurally mapped RetrievedChunks sorted by vector proximity.
     */
    static async retrieveContext(query: string, topK: number = 5): Promise<RetrievedChunk[]> {
        if (!query || query.trim() === '') {
            return [];
        }

        // Step 1: Generate vector representation of the semantic query
        const queryVector = await EmbeddingService.generateQueryEmbedding(query);

        // Step 2: Fetch nearest structural matches from Weaviate DB
        const retrievedChunks = await WeaviateService.search(queryVector, topK);

        if (APP_CONFIG.DEBUG_MODE) {
            console.log("========== RETRIEVED CHUNKS ==========");
            retrievedChunks.forEach((chunk, index) => {
                console.log({
                    rank: index + 1,
                    id: chunk.id,
                    chunkIndex: chunk.metadata.chunkIndex,
                    documentId: chunk.metadata.documentId,
                    distance: chunk.distance,
                    preview: chunk.text.substring(0, 80)
                });
            });
            console.log("======================================");
            console.log("========== Retrieval Debug ==========");
            console.log(`Query: "${query}"`);
            console.log(`Retrieved Context Matches: ${retrievedChunks.length}`);
            if (retrievedChunks.length > 0) {
                console.log(`Top Match Distance: ${retrievedChunks[0].distance}`);
                console.log(`Top Match Document ID: ${retrievedChunks[0].metadata.documentId}`);
            }
            console.log("=====================================");
        }

        return retrievedChunks;
    }
}
