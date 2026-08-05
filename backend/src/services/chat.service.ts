import { LLMProvider } from '../providers/llm.provider.interface';
import { PromptBuilder } from './prompt.builder';
import { APP_CONFIG } from '../config/app.config';
import { ConversationTurn } from './conversation-memory.service';

export class ChatService {
    /**
     * Synthesizes isolated logic strictly binding dependency inject LLM structures mapped securely.
     */
    constructor(private provider: LLMProvider) { }

    /**
     * Generates a conversational LLM response using strictly injected structural retrieved contexts natively.
     * @param query The user's typed question.
     * @param context The consolidated text strings retrieved explicitly from Vector Search.
     * @param history Previous sliding sequential map bounding explicit tracking natively.
     * @returns The generated model reasoning text natively resolved via explicitly injected Provider. 
     */
    async generateResponse(query: string, context: string, history: ConversationTurn[] = []): Promise<string> {
        // Step 1: Delegate string manipulation completely mapping to dedicated isolated Prompt layers 
        const prompt = PromptBuilder.buildRagPrompt(query, context, history);

        if (APP_CONFIG.DEBUG_MODE) {
            console.log("========== PROMPT ==========");
            console.log(prompt);
            console.log("============================");
        }
        try {
            // Step 2: Decouple native LLM orchestration executing internally purely utilizing bound abstractions 
            return await this.provider.generate(prompt);
        } catch (error: any) {
            throw new Error(`Failed to generate LLM response via internal abstractions.\nDetails: ${error.message}`);
        }
    }
}
