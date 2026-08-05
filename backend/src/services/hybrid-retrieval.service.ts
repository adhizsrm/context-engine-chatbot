import { RetrievedChunk } from '../types/chunk.types';
import { WeaviateService } from '../vector-store/weaviate.service';
import { EmbeddingService } from '../embeddings/embedding.service';
import { APP_CONFIG } from '../config/app.config';

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
            if (!mergedMap.has(chunk.id)) {
                mergedMap.set(chunk.id, chunk);
            }
        });

        // Collect cohesive flat arrays securely isolated. 
        // We'll limit exactly to 'topK' or let it return expanded pools - returning raw merged arrays natively improves LLM horizons gracefully.
        const mergedResults = Array.from(mergedMap.values());

        // Emit diagnostic debugging natively for production logs explicitly
        if (APP_CONFIG.DEBUG_MODE) {
            console.log("\n========== FINAL RETRIEVED CHUNKS ==========");

            mergedResults.forEach((chunk, index) => {
                console.log({
                    rank: index + 1,
                    id: chunk.id,
                    chunkIndex: chunk.metadata.chunkIndex,
                    documentId: chunk.metadata.documentId,
                    distance: chunk.distance,
                    preview: chunk.text
                        .replace(/\s+/g, " ")
                        .substring(0, 120)
                });
            });

            console.log("============================================\n");
            console.log("\n========== Hybrid Retrieval ==========");
            console.log("Vector Results:");
            vectorResults.forEach((c, idx) => console.log(`  [V${idx + 1}] ID: ${c.id} - Distance: ${c.distance?.toFixed(4)}`));

            console.log("\nKeyword Results:");
            keywordResults.forEach((c, idx) => console.log(`  [K${idx + 1}] ID: ${c.id} - BM25 Score: ${c.distance?.toFixed(4)}`));

            console.log(`\nMerged Results: (Total: ${mergedResults.length})`);
            mergedResults.forEach((c, idx) => console.log(`  [M${idx + 1}] ID: ${c.id} - Original Score/Dist: ${c.distance?.toFixed(4)}`));
            console.log("======================================\n");
        }

        return mergedResults;
    }
}
