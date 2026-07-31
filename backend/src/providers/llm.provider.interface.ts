/**
 * Generic abstraction defining the capabilities of an LLM generative engine.
 * Ensures services bind to interfaces rather than concrete third-party SDKs.
 */
export interface LLMProvider {
    /**
     * Executes standard conversational generation natively yielding plain text limits.
     * @param prompt The unified LLM instructions combined structurally with RAG context matrices.
     * @returns The generated model response mapped securely as a textual native string.
     */
    generate(prompt: string): Promise<string>;
}
