import { RetrievedChunk } from '../types/chunk.types';
import { APP_CONFIG } from '../config/app.config';
import { TokenEstimatorService } from './token-estimator.service';

export interface BudgetStats {
    configuredContextWindow: number;
    reservedOutputTokens: number;
    promptBudget: number;
    estimatedPromptTokens: number;
    remainingBudget: number;
    chunksEvaluated: number;
    chunksSelected: number;
    chunksDiscarded: number;
}

export interface BudgetResult {
    selectedChunks: RetrievedChunk[];
    stats: BudgetStats;
}

/**
 * Service responsible solely for filtering retrieved chunks to fit within configured prompt token budgets.
 */
export class TokenBudgetService {
    /**
     * Sequentially selects chunks until the token budget is reached.
     * Evaluates strictly inside predefined structural sizes statically stopping organically upon overflow boundaries.
     */
    static budgetChunks(chunks: RetrievedChunk[], baseOverheadTokens: number): BudgetResult {
        let currentTokens = baseOverheadTokens;

        const selectedChunks: RetrievedChunk[] = [];
        let discardedCount = 0;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            // Account for the aggregating structural mapping safely 
            const delimiter = selectedChunks.length > 0 ? "\n\n---\n\n" : "";
            const simulatedText = delimiter + chunk.text;
            const chunkTokens = TokenEstimatorService.estimateTokens(simulatedText);

            if (currentTokens + chunkTokens <= APP_CONFIG.PROMPT_TOKEN_BUDGET) {
                currentTokens += chunkTokens;
                selectedChunks.push(chunk);
            } else {
                discardedCount = chunks.length - i;
                break;
            }
        }

        const stats: BudgetStats = {
            configuredContextWindow: APP_CONFIG.MODEL_CONTEXT_WINDOW,
            reservedOutputTokens: APP_CONFIG.MAX_OUTPUT_TOKENS,
            promptBudget: APP_CONFIG.PROMPT_TOKEN_BUDGET,
            estimatedPromptTokens: currentTokens,
            remainingBudget: APP_CONFIG.PROMPT_TOKEN_BUDGET - currentTokens,
            chunksEvaluated: chunks.length,
            chunksSelected: selectedChunks.length,
            chunksDiscarded: discardedCount
        };

        return { selectedChunks, stats };
    }
}
