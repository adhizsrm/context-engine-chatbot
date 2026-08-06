import { ConversationTurn } from './conversation-memory.service';
import { PromptBuilder } from './prompt.builder';
import { BudgetStats } from './token-budget.service';
import { TokenEstimatorService } from './token-estimator.service';

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
    private static logStatisticLine(label: string, length: number, totalLength: number): void {
        const percentage = this.calculatePercentage(length, totalLength);
        console.log(`${label.padEnd(20, ' ')} : ${length} chars ${percentage}`);
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

        console.log("========== Prompt Statistics ==========");
        this.logStatisticLine("Conversation History", historyLength, finalPromptLength);
        this.logStatisticLine("Retrieved Context", contextLength, finalPromptLength);
        this.logStatisticLine("Current Question", queryLength, finalPromptLength);
        this.logStatisticLine("Prompt Overhead", promptOverheadLength, finalPromptLength);
        console.log(`Final Prompt         : ${finalPromptLength} chars`);
        console.log("");
        console.log(`Estimated Tokens     : ~${estimatedTokens}`);
        console.log("=======================================\n");
    }

    /**
     * Accurately details Configurable Token outputs mirroring diagnostic limits inherently tracing chunks.
     */
    static logTokenBudget(stats: BudgetStats): void {
        console.log("========== Token Budget ==========");
        console.log(`Configured Context Window : ${stats.configuredContextWindow}`);
        console.log(`Reserved Output Tokens    : ${stats.reservedOutputTokens}`);
        console.log(`Prompt Budget             : ${stats.promptBudget}`);
        console.log(`Estimated Prompt Tokens   : ${stats.estimatedPromptTokens}`);
        console.log(`Remaining Budget          : ${stats.remainingBudget}`);
        console.log(`Chunks Evaluated          : ${stats.chunksEvaluated}`);
        console.log(`Chunks Selected           : ${stats.chunksSelected}`);
        console.log(`Chunks Discarded          : ${stats.chunksDiscarded}`);
        console.log("=================================\n");
    }
}
