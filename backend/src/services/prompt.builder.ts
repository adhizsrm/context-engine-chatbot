/**
 * Specializes entirely upon formatting, consolidating, and optimizing text injection strings syntactically 
 * isolating lengthy string prompts totally separate from actual programmatic logic securely.
 */
export class PromptBuilder {
    /**
     * Constructs the strict, unyielding system boundaries required for RAG validation reliably blocking external scopes.
     * @param query Native user query explicitly unmodified.
     * @param context Parsed structural string arrays joined securely.
     * @returns Safe context generation pipeline prompt.
     */
    static buildRagPrompt(query: string, context: string): string {
        return `You are a highly helpful and precise assistant. You will answer the user's question based strictly and exclusively on the following provided context. \n\nIf the answer cannot be confidently deduced entirely from the context below, immediately reply with "I don't know based on the provided documents." Do not utilize outside knowledge.\n\nContext:\n${context}\n\nQuestion: ${query}\nAnswer:`;
    }
}
