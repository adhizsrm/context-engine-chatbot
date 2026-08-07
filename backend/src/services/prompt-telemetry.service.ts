import { ConversationTurn } from './conversation-memory.service';
import { PromptBuilder } from './prompt.builder';
import { BudgetStats } from './token-budget.service';
import { TokenEstimatorService } from './token-estimator.service';
import { Logger } from '../utils/logger';

/**
 * Service dedicated exclusively to computing and reporting telemetry metrics about generated LLM prompts.
 * Strictly decoupled from structural generation (PromptBuilder) and orchestration (ChatService).
 */
export class PromptTelemetryService {
    /**
     * Safely checks the length of a string without throwing on undefined or null values.
     */
    private static safeLength(str?: string): number {
        return str ? str.length : 0;
    }

    /**
     * Calculates the percentage a specific section occupies in the prompt.
     */
    private static calculatePercentage(partLength: number, totalLength: number): string {
        if (totalLength === 0) return "(0%)";
        const percentage = Math.round((partLength / totalLength) * 100);
        return `(${percentage}%)`;
    }

    /**
     * Reusable logging for each line of telemetry statistics.
     */
    private static logStatisticLine(lines: string[], label: string, length: number, totalLength: number): void {
        const percentage = this.calculatePercentage(length, totalLength);
        lines.push(`${label.padEnd(20, ' ')} : ${length} chars ${percentage}`);
    }

    /**
     * Generates and logs comprehensive prompt statistics.
     * @param query Native user query
     * @param context Retrieved context chunk strings
     * @param history Previous conversational tracking natively
     * @param finalPrompt The entirely evaluated prompt string
     */
    static logTelemetry(query: string, context: string, history: ConversationTurn[], finalPrompt: string): void {
        // Evaluate precise text section lengths natively defensively via canonical formatting mapping.
        const queryLength = this.safeLength(query);
        const contextLength = this.safeLength(context);

        // Emphasizes "consume already formatted sections"
        const formattedHistory = PromptBuilder.formatHistory(history);
        const historyLength = this.safeLength(formattedHistory);

        const finalPromptLength = this.safeLength(finalPrompt);

        // Overhead comprises instructions, boundaries, and formatting lines.
        const promptOverheadLength = Math.max(0, finalPromptLength - (historyLength + contextLength + queryLength));

        const estimatedTokens = TokenEstimatorService.estimateTokens(finalPrompt);

        const lines = [
            "========== Prompt Statistics =========="
        ];
        this.logStatisticLine(lines, "Conversation History", historyLength, finalPromptLength);
        this.logStatisticLine(lines, "Retrieved Context", contextLength, finalPromptLength);
        this.logStatisticLine(lines, "Current Question", queryLength, finalPromptLength);
        this.logStatisticLine(lines, "Prompt Overhead", promptOverheadLength, finalPromptLength);
        lines.push(`Final Prompt         : ${finalPromptLength} chars`);
        lines.push("");
        lines.push(`Estimated Tokens     : ~${estimatedTokens}`);
        lines.push("=======================================");

        Logger.log(lines.join('\n'));
    }

    /**
     * Accurately details Configurable Token outputs mirroring diagnostic limits inherently tracing chunks.
     */
    static logTokenBudget(stats: BudgetStats): void {
        const lines = [
            "========== Token Budget ==========",
            `Configured Context Window : ${stats.configuredContextWindow}`,
            `Reserved Output Tokens    : ${stats.reservedOutputTokens}`,
            `Prompt Budget             : ${stats.promptBudget}`,
            `Estimated Prompt Tokens   : ${stats.estimatedPromptTokens}`,
            `Remaining Budget          : ${stats.remainingBudget}`,
            `Chunks Evaluated          : ${stats.chunksEvaluated}`,
            `Chunks Selected           : ${stats.chunksSelected}`,
            `Chunks Discarded          : ${stats.chunksDiscarded}`,
            "================================="
        ];
        Logger.log(lines.join('\n'));
    }
}
