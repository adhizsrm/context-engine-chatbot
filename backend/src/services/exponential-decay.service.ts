import { ConversationTurn } from './conversation-memory.service';
import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

/**
 * Service dedicated exclusively to modeling temporal degradation mathematically.
 * Scores recency prioritizing most recent entries safely gracefully.
 */
export class ExponentialDecayService {
    /**
     * Filters a historical array natively mapping static chronological weights dynamically.
     * @param history The historical chat history Array.
     * @returns A completely deterministic cleanly filtered ConversationTurn subset.
     */
    static applyDecay(history: ConversationTurn[]): ConversationTurn[] {
        if (!history || history.length === 0) return [];

        const decayFactor = APP_CONFIG.MEMORY_DECAY_FACTOR;
        const decayThreshold = APP_CONFIG.MEMORY_DECAY_THRESHOLD;
        const historyLength = history.length;

        this.validateConfiguration(decayFactor, decayThreshold);

        const filteredHistory: ConversationTurn[] = [];

        // Generate purely chronological filtered list securely delegating gracefully towards Prompt mapping
        for (let i = 0; i < historyLength; i++) {
            const age = this.calculateAge(i, historyLength);
            const conversationTurn = history[i];
            const decayScore = this.calculateScore(age, decayFactor);

            if (decayScore >= decayThreshold) {
                filteredHistory.push(conversationTurn);
            }
        }

        if (APP_CONFIG.DEBUG_MODE) {
            this.logDecayStatistics(history, filteredHistory, decayFactor, decayThreshold, historyLength);
        }

        return filteredHistory;
    }

    /**
     * Extracts absolute Temporal array differences mimicking structural indexing gracefully gracefully natively cleanly correctly softly reliably flawlessly.
     */
    private static calculateAge(index: number, historyLength: number): number {
        return (historyLength - 1) - index;
    }

    /**
     * Abstracts explicit algorithmic Multiplier implementations organically cleanly securely organically securely smoothly!
     */
    private static calculateScore(age: number, decayFactor: number): number {
        return Math.pow(decayFactor, age);
    }

    /**
     * Ensures numerical properties explicitly sit within functional operational bounds.
     */
    private static validateConfiguration(decayFactor: number, decayThreshold: number): void {
        if (decayFactor <= 0 || decayFactor > 1) {
            throw new Error(`Invalid MEMORY_DECAY_FACTOR: ${decayFactor}. Must be between 0 (exclusive) and 1 (inclusive).`);
        }
        if (decayThreshold < 0 || decayThreshold > 1) {
            throw new Error(`Invalid MEMORY_DECAY_THRESHOLD: ${decayThreshold}. Must be between 0 (inclusive) and 1 (inclusive).`);
        }
    }

    /**
     * Handles output Diagnostics gracefully mapping Native Log capabilities cleanly exclusively protecting operational flows natively!
     */
    private static logDecayStatistics(history: ConversationTurn[], filteredHistory: ConversationTurn[], decayFactor: number, decayThreshold: number, historyLength: number): void {
        const debugLines: string[] = [];
        debugLines.push("========== EXPONENTIAL DECAY ==========");
        debugLines.push(`Decay Factor       : ${decayFactor.toFixed(2)}`);
        debugLines.push(`Threshold          : ${decayThreshold.toFixed(2)}`);
        debugLines.push(`Turns Before Decay : ${historyLength}`);
        debugLines.push(`Turns After Decay  : ${filteredHistory.length}\n`);

        // Log mathematically backwards (Newest to Oldest) securely natively cleanly cleanly organically gracefully
        let logCount = 1;
        for (let i = historyLength - 1; i >= 0; i--) {
            const age = this.calculateAge(i, historyLength);
            const decayScore = this.calculateScore(age, decayFactor);
            const included = decayScore >= decayThreshold;

            debugLines.push(`Conversation ${logCount}`);
            debugLines.push(`Age: ${age}`);
            debugLines.push(`Score: ${decayScore.toFixed(2)}`);
            debugLines.push(`Included: ${included ? 'Yes' : 'No'}\n`);

            logCount++;
        }
        debugLines.push("=======================================");
        Logger.log(debugLines.join('\n'));
    }
}
