import { RetrievedChunk } from '../types/chunk.types';
import { HybridRetrievalService } from './hybrid-retrieval.service';

export class RetrievalService {
    /**
     * Unified orchestration endpoint capturing natural language query mapping matrices natively.
     * Defers logic explicitly via our modular HybridRetrievalService bridging parallel search structures cleanly.
     * 
     * @param query The user's semantic question.
     * @param topK The maximum number of relevant chunks per retrieval methodology (defaults to 5).
     * @returns An array of structurally mapped RetrievedChunks sorted by Hybrid retrieval metrics natively.
     */
    static async retrieveContext(query: string, topK: number = 5): Promise<RetrievedChunk[]> {

        return HybridRetrievalService.retrieveContext(query, topK);
    }
}
