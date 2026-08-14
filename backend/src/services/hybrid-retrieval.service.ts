import { RetrievedChunk, RetrievalFilter } from '../types/chunk.types';
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
     * @param filter The explicit optional documentId metadata bound.
     * @returns A merged deduced sequence mapping array values robustly.
     */
    static async retrieveContext(query: string, topK: number = 5, filter?: RetrievalFilter): Promise<RetrievedChunk[]> {
        if (!query || query.trim() === '') {
            return [];
        }

        // METADATA FILTER LOGGING
        if (APP_CONFIG.DEBUG_MODE) {
            Logger.log("========== METADATA FILTER ==========");
            if (filter?.documentId) {
                Logger.log("Filter Applied : Yes");
                Logger.log("Field          : documentId");
                Logger.log(`Value          : ${filter.documentId}`);
            } else {
                Logger.log("Filter Applied : No");
            }
            Logger.log("======================================\n");
        }

        // Parallel resolution of both matrix types explicitly
        const queryVector = await EmbeddingService.generateQueryEmbedding(query);
        const [vectorResults, keywordResults] = await Promise.all([
            WeaviateService.search(queryVector, topK, filter),
            WeaviateService.keywordSearch(query, topK, filter)
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
        const mergedResults = Array.from(mergedMap.values());

        // Emit diagnostic debugging natively for production logs explicitly
        if (APP_CONFIG.DEBUG_MODE) {
            const filterStr = filter?.documentId ? `documentId = ${filter.documentId}` : "None";
            const lines = [
                "========== RETRIEVAL ==========",
                `Filter             : ${filterStr}`,
                `Vector Candidates  : ${vectorResults.length}`,
                `Keyword Candidates : ${keywordResults.length}`,
                `Merged Candidates  : ${mergedResults.length}`,
                "================================"
            ];
            Logger.log(lines.join('\n'));

            Logger.log("\n========== RETRIEVAL CANDIDATES ==========\n");
            mergedResults.forEach((chunk, index) => {
                Logger.log(`[${index + 1}] Chunk: ${chunk.metadata.chunkIndex}`);
                Logger.log(`    documentId : ${chunk.metadata.documentId}`);
                Logger.log(`    Source     : ${chunk.retrievalSource}`);
                // Safely grab the score from distance or keyword score respectively internally
                const score = chunk.semanticDistance ?? chunk.keywordScore;
                Logger.log(`    Score      : ${score ? score.toFixed(4) : "0.0000"}`);
                Logger.log("");
            });
            Logger.log("===========================================\n");

            Logger.log("========== FILTER VALIDATION ==========");
            let matching = 0;
            let mismatched = 0;
            if (filter?.documentId) {
                Logger.log(`Requested Document : ${filter.documentId}`);
                mergedResults.forEach(c => {
                    if (c.metadata.documentId === filter.documentId) matching++;
                    else mismatched++;
                });
            } else {
                Logger.log(`Requested Document : None`);
                matching = mergedResults.length;
            }
            Logger.log(`Candidates Retrieved: ${mergedResults.length}`);
            Logger.log(`Matching Candidates : ${matching}`);
            Logger.log(`Mismatched Candidates: ${mismatched}`);
            Logger.log("=======================================\n");
        }

        return mergedResults;
    }
}
