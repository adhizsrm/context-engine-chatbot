import { ConversationTurn } from './conversation-memory.service';
import { PromptBuilder } from './prompt.builder';

/**
 * Service dedicated exclusively to computing and reporting telemetry metrics about generated LLM prompts.
 * Strictly decoupled from structural generation (PromptBuilder) and orchestration (ChatService).
 */
export class PromptTelemetryService {
    /**
     * Safely checks the length of a string without throwing if it's undefined or null.
     */
    private static safeLength(str?: string): number {
        return str ? str.length : 0;
    }

    /**
     * Estimates the token count of a prompt using a simple heuristic.
     * Ready for replacement by actual tokenizer integrations (e.g. tiktoken) in future milestones.
     */
    private static estimateTokens(prompt: string): number {
        if (!prompt) return 0;
        return Math.ceil(prompt.length / 4);
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

        // Overhead includes system prompt, labels, spacing layers, wrappers natively.
        const promptOverheadLength = Math.max(0, finalPromptLength - (historyLength + contextLength + queryLength));

        const estimatedTokens = this.estimateTokens(finalPrompt);

        console.log("========== Prompt Statistics ==========");
        this.logStatisticLine("Conversation History", historyLength, finalPromptLength);
        this.logStatisticLine("Retrieved Context", contextLength, finalPromptLength);
        this.logStatisticLine("Current Question", queryLength, finalPromptLength);
        this.logStatisticLine("Prompt Overhead", promptOverheadLength, finalPromptLength);
        console.log(`Final Prompt         : ${finalPromptLength} chars`);
        console.log("");
        console.log(`Estimated Tokens     : ~${estimatedTokens}`);
        console.log("=======================================");
    }
}
