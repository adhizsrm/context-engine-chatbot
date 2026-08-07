import { RetrievedChunk } from '../types/chunk.types';
import { HybridRetrievalService } from './hybrid-retrieval.service';
import { RankingService } from './ranking.service';
import { APP_CONFIG } from '../config/app.config';

export class RetrievalService {
    /**
     * Unified orchestration endpoint capturing natural language query mapping matrices natively.
     * Defers logic explicitly via our modular HybridRetrievalService bridging parallel search structures cleanly.
     * Maps the resulting matrices accurately dynamically scoring algorithms sequentially extracting purely explicit bounds locally.
     * 
     * @param query The user's semantic question.
     * @param topK The maximum number of relevant chunks per retrieval methodology (defaults to 5).
     * @returns An array of structurally mapped RetrievedChunks sorted by Ranking metrics natively.
     */
    static async retrieveContext(query: string, topK: number = APP_CONFIG.RETRIEVAL_TOP_K): Promise<RetrievedChunk[]> {
        const mergedCandidates = await HybridRetrievalService.retrieveContext(query, topK);
        return RankingService.selectTopCandidates(mergedCandidates, topK);
    }
}
