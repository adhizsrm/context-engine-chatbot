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
                "========== FINAL RETRIEVED CHUNKS =========="
            ];

            mergedResults.forEach((chunk, index) => {
                lines.push(JSON.stringify({
                    rank: index + 1,
                    id: chunk.id,
                    chunkIndex: chunk.metadata.chunkIndex,
                    documentId: chunk.metadata.documentId,
                    distance: chunk.distance,
                    preview: chunk.text.replace(/\s+/g, " ").substring(0, 120)
                }, null, 2));
            });

            lines.push("============================================");
            lines.push("");
            lines.push("========== Hybrid Retrieval ==========");
            lines.push("Vector Results:");
            vectorResults.forEach((c, idx) => lines.push(`  [V${idx + 1}] ID: ${c.id} - Distance: ${c.distance?.toFixed(4)}`));

            lines.push("");
            lines.push("Keyword Results:");
            keywordResults.forEach((c, idx) => lines.push(`  [K${idx + 1}] ID: ${c.id} - BM25 Score: ${c.distance?.toFixed(4)}`));

            lines.push("");
            lines.push(`Merged Results: (Total: ${mergedResults.length})`);
            mergedResults.forEach((c, idx) => lines.push(`  [M${idx + 1}] ID: ${c.id} - Original Score/Dist: ${c.distance?.toFixed(4)}`));
            lines.push("======================================");

            Logger.log(lines.join('\n'));
        }

        return mergedResults;
    }
}
