import { RetrievedChunk } from '../types/chunk.types';
import { WeaviateService } from '../vector-store/weaviate.service';
import { EmbeddingService } from '../embeddings/embedding.service';
import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

export class HybridRetrievalService {
    /**
     * Orchestrates hybrid parallel retrieval executing explicit semantic indexing bound alongside BM25 frequency arrays.
     * Deduplicates explicit IDs prioritizing vector proximities.
     * 
     * @param query The natural language user query.
     * @param topK The amount of subsets to query per methodology internally.
     * @returns A merged deduced sequence mapping array values robustly.
     */
    static async retrieveContext(query: string, topK: number = 5): Promise<RetrievedChunk[]> {
        if (!query || query.trim() === '') {
            return [];
        }

        // Parallel resolution of both matrix types explicitly
        const queryVector = await EmbeddingService.generateQueryEmbedding(query);
        const [vectorResults, keywordResults] = await Promise.all([
            WeaviateService.search(queryVector, topK),
            WeaviateService.keywordSearch(query, topK)
        ]);

        // Merge & Deduplicate mapping tracking memory natively
        const mergedMap = new Map<string, RetrievedChunk>();

        // Prioritize explicit vector results mapping natively first
        vectorResults.forEach(chunk => {
            mergedMap.set(chunk.id, chunk);
        });

        // Loop keyword arrays ensuring we don't clobber vectors
        keywordResults.forEach(chunk => {
            const existing = mergedMap.get(chunk.id);
            if (!existing) {
                mergedMap.set(chunk.id, chunk);
            } else {
                existing.keywordScore = chunk.keywordScore;
                existing.retrievalSource = 'hybrid';
            }
        });

        // Collect cohesive flat arrays securely isolated. 
        // We'll limit exactly to 'topK' or let it return expanded pools - returning raw merged arrays natively improves LLM horizons gracefully.
        const mergedResults = Array.from(mergedMap.values());

        // Emit diagnostic debugging natively for production logs explicitly
        if (APP_CONFIG.DEBUG_MODE) {
            const lines = [
                "========== RETRIEVAL ==========",
                `Vector Candidates  : ${vectorResults.length}`,
                `Keyword Candidates : ${keywordResults.length}`,
                `Merged Candidates  : ${mergedResults.length}`,
                "================================"
            ];
            Logger.log(lines.join('\n'));
        }

        return mergedResults;
    }
}
