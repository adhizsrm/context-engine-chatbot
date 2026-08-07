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

        return `
        You are a helpful and precise Retrieval-Augmented Generation (RAG) assistant.

        Answer the user's question using ONLY the information contained in the retrieved context.

        Guidelines:

        1. Use the retrieved context as the only source of truth.
        2. You may combine and summarize information from multiple retrieved passages when they support the same conclusion.
        3. You may make simple logical inferences that are directly supported by the retrieved context.
        4. Do NOT introduce facts that are not supported by the retrieved context.
        5. If the retrieved context does not contain enough information to answer the question, reply exactly:

        "I don't know based on the provided documents."

        Provide clear, concise, and well-structured answers.

        ${historyStr}Retrieved Context

        ${context}

        Current Question

        ${query}

        Answer:`;
    }
}
