import { LLMProvider } from '../providers/llm.provider.interface';
import { PromptBuilder } from './prompt.builder';
import { PromptTelemetryService } from './prompt-telemetry.service';
import { ConversationTurn } from './conversation-memory.service';
import { APP_CONFIG } from '../config/app.config';
import { TokenBudgetService, BudgetStats } from './token-budget.service';
import { TokenEstimatorService } from './token-estimator.service';
import { RetrievedChunk } from '../types/chunk.types';
import { QueryOptimizationService } from './query-optimization.service';
import { RetrievalService } from './retrieval.service';

export class ChatService {
    /**
     * Synthesizes isolated logic strictly binding dependency inject LLM structures mapped securely.
     */
    constructor(private provider: LLMProvider) { }

    /**
     * Orchestrates the complete RAG workflow internally explicitly safely tracking domains seamlessly natively!
     * @param query The raw untouched explicitly natural user command natively.
     * @param history Prior strings matching user conversational boundaries explicitly safely securely.
     */
    async executeRagWorkflow(query: string, history: ConversationTurn[]) {
        // Step 1: Synthesize Incomplete Contexts precisely translating missing strings explicitly
        const optimizedQuery = QueryOptimizationService.optimizeQuery(query, history);

        // Step 2: Retrieve tightly clustered documents mimicking optimized translations natively
        const retrievedChunks = await RetrievalService.retrieveContext(optimizedQuery);

        // Step 3: Produce contextual strings identically mapping Original Query gracefully preserving backward bounds inherently mapping strings internally.
        const responseText = await this.generateResponse(query, retrievedChunks, history);

        return { response: responseText, sources: retrievedChunks };
    }

    /**
     * Generates a conversational LLM response using strictly injected structural retrieved contexts natively.
     * @param query The user's typed question.
     * @param context The consolidated text strings retrieved explicitly from Vector Search.
     * @param history Previous sliding sequential map bounding explicit tracking natively.
     * @returns The generated model reasoning text natively resolved via explicitly injected Provider. 
     */
    async generateResponse(query: string, contextOrChunks: string | RetrievedChunk[], history: ConversationTurn[] = []): Promise<string> {
        let finalContextText = "";
        let budgetStats: BudgetStats | null = null;

        if (Array.isArray(contextOrChunks)) {
            // Determine prompt structure overhead before iterating chunks securely avoiding dependency coupling
            const emptyPrompt = PromptBuilder.buildRagPrompt(query, "", history);
            const overheadTokens = TokenEstimatorService.estimateTokens(emptyPrompt);

            // Apply TokenBudget precisely resolving sizes explicitly preventing overflows
            const budgetResult = TokenBudgetService.budgetChunks(contextOrChunks as RetrievedChunk[], overheadTokens);
            finalContextText = budgetResult.selectedChunks.map(chunk => chunk.text).join("\n\n---\n\n");
            budgetStats = budgetResult.stats;
        } else {
            // Safely preserves backward-compatibility natively mapping string fallbacks
            finalContextText = contextOrChunks as string;
        }

        // Step 1: Delegate string manipulation completely mapping to dedicated isolated Prompt layers 
        const prompt = PromptBuilder.buildRagPrompt(query, finalContextText, history);

        if (APP_CONFIG.DEBUG_MODE) {
            PromptTelemetryService.logTelemetry(query, finalContextText, history, prompt);
            if (budgetStats) {
                PromptTelemetryService.logTokenBudget(budgetStats);
            }
        }
        try {
            // Step 2: Decouple native LLM orchestration executing internally purely utilizing bound abstractions 
            return await this.provider.generate(prompt);
        } catch (error: any) {
            throw new Error(`Failed to generate LLM response via internal abstractions.\nDetails: ${error.message}`);
        }
    }
}
