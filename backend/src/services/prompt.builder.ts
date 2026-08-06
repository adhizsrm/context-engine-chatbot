import { ConversationTurn } from './conversation-memory.service';

/**
 * Specializes entirely upon formatting, consolidating, and optimizing text injection strings syntactically 
 * isolating lengthy string prompts totally separate from actual programmatic logic securely.
 */
export class PromptBuilder {
    static formatHistory(history: ConversationTurn[] = []): string {
        if (!history || history.length === 0) return "";

        let historyStr = "Previous Conversation\n\n";
        history.forEach(turn => {
            historyStr += `User:\n${turn.userQuery}\n\nAssistant:\n${turn.assistantResponse}\n\n`;
        });
        return historyStr;
    }

    /**
     * Constructs the strict, unyielding system boundaries required for RAG validation reliably blocking external scopes.
     * @param query Native user query explicitly unmodified.
     * @param context Parsed structural string arrays joined securely.
     * @param history Prior conversational mapped turns tracking multi-turn sequences robustly.
     * @returns Safe context generation pipeline prompt.
     */
    static buildRagPrompt(query: string, context: string, history: ConversationTurn[] = []): string {
        const historyStr = this.formatHistory(history);

        return `You are a highly helpful and precise assistant. 
You will answer the user's question based strictly and exclusively on the following provided context. 

If the answer cannot be confidently deduced entirely from the context below, immediately reply with 
"I don't know based on the provided documents." Do not utilize outside knowledge.

${historyStr}Retrieved Context

${context}

Current Question

${query}

Answer:`;
    }
}
