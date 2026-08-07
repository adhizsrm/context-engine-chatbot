import { RetrievedChunk } from '../types/chunk.types';
import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

// ---------------------------------------------------------
// Heuristic Weight Constants
// ---------------------------------------------------------
const SEMANTIC_WEIGHT = 0.6;
const KEYWORD_WEIGHT = 0.4;
const HYBRID_BONUS = 0.2;
const KEYWORD_NORMALIZATION_DIVISOR = 10;
const LONG_CHUNK_BONUS = 0.05;
const LONG_CHUNK_THRESHOLD = 500;

export class RankingService {
    /**
     * Determines a weighted heuristic score normalizing semantic distances alongside bm25 values.
     * Computes natively completely independent from third party LLM APIs.
     * 
     * @param chunk The purely retrieved chunk containing base vector metrics.
     * @returns A distinct numeric score rating overall relevancy explicitly explicitly.
     */
    static computeScore(chunk: RetrievedChunk): number {
        // BM25 keyword score intrinsically yields high absolute numbers (unbounded) -> explicitly normalize arbitrarily. 
        // Semantic Distance inherently drops 0.0 - 1.0 mapping proximities (Cosine Distance = 1 - Similarity).
        const similarity = chunk.semanticDistance !== undefined ? Math.max(0, 1 - chunk.semanticDistance) : 0;

        // Define simple bounds maintaining relativity natively limiting explosive values
        const normalizedKeyword = chunk.keywordScore !== undefined ? Math.min(1, chunk.keywordScore / KEYWORD_NORMALIZATION_DIVISOR) : 0;

        // Assign structural math matrices accurately explicitly routing semantic boundaries mapping securely out internally.
        let score = (similarity * SEMANTIC_WEIGHT) + (normalizedKeyword * KEYWORD_WEIGHT);

        if (chunk.retrievalSource === 'hybrid') {
            score += HYBRID_BONUS;
        }

        if (chunk.text && chunk.text.length > LONG_CHUNK_THRESHOLD) {
            score += LONG_CHUNK_BONUS;
        }

        return score;
    }

    /**
     * Scores explicit chunks dynamically sorting into sequential lists dropping extraneous arrays dynamically exactly correctly formatting.
     * Operations are strictly immutable; original retrieval mappings remain completely untouched safely out natively.
     */
    static selectTopCandidates(candidates: RetrievedChunk[], topK: number = 5): RetrievedChunk[] {
        if (!candidates || candidates.length === 0) return [];

        // 1. Immutable Clone + Scoring: Apply mathematical heuristcs safely wrapping new memory layouts without touching original structs.
        const scoredCandidates: RetrievedChunk[] = candidates.map(chunk => ({
            ...chunk,
            rerankScore: this.computeScore(chunk)
        }));

        // 2. Immutable Splicing & Sorting: Spread mapped dependencies out before sorting internally implicitly protecting logic lists.
        const sorted = [...scoredCandidates].sort((a, b) => {
            const scoreA = a.rerankScore ?? 0;
            const scoreB = b.rerankScore ?? 0;
            return scoreB - scoreA; // descending implicitly dynamically sorting explicitly 
        });

        // 3. Selection
        const finalRanked = sorted.slice(0, topK);

        // 4. Delegated Telemetry logic separating noisy CLI formatting explicitly
        if (APP_CONFIG.DEBUG_MODE) {
            this.logDebugDiagnostics(candidates, scoredCandidates, finalRanked, topK);
        }

        return finalRanked;
    }

    /**
     * Extracts telemetry blocks explicitly into single responsibility rendering methods securely out locally.
     */
    private static logDebugDiagnostics(
        original: RetrievedChunk[],
        mapped: RetrievedChunk[],
        final: RetrievedChunk[],
        topK: number
    ): void {
        const formatPreview = (text: string) => text.replace(/\s+/g, ' ').substring(0, 120) + '...';

        const lines = [
            "========== Re-ranking ==========",
            "Original Retrieval Order:"
        ];

        original.forEach((c, idx) => {
            const correspondingScore = mapped[idx].rerankScore;
            lines.push(
                `  [Rank ${idx + 1}] ID: ${c.id} | Index: ${c.metadata.chunkIndex} | Source: ${c.retrievalSource}\n` +
                `    -> Semantic Dist: ${c.semanticDistance?.toFixed(4) || 'N/A'} | Keyword Score: ${c.keywordScore?.toFixed(4) || 'N/A'} | Final Score: ${correspondingScore?.toFixed(4)}\n` +
                `    -> Preview: "${formatPreview(c.text)}"`
            );
        });

        lines.push("");
        lines.push("Final Ranked Order:");
        lines.push(`Selected Top ${topK} Chunks`);

        final.forEach((c, idx) => {
            lines.push(
                `  [Rank ${idx + 1}] ID: ${c.id} | Source: ${c.retrievalSource}\n` +
                `    -> Semantic Dist: ${c.semanticDistance?.toFixed(4) || 'N/A'} | Keyword Score: ${c.keywordScore?.toFixed(4) || 'N/A'} | Final Score: ${c.rerankScore?.toFixed(4)}\n` +
                `    -> Preview: "${formatPreview(c.text)}"`
            );
        });

        lines.push("================================");
        Logger.log(lines.join('\n'));
    }
}
