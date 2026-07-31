/**
 * Configuration for the Ollama Local LLM provider.
 * Keeps magic strings out of business logic.
 */
export const OLLAMA_CONFIG = {
    /** 
     * The base URL for the local Ollama instance.
     */
    BASE_URL: 'http://localhost:11434',

    /** 
     * The direct endpoint for batch processing text embeddings.
     */
    EMBED_ENDPOINT: 'http://localhost:11434/api/embed',

    /** 
     * The model pulled in Ollama specifically tuned for embedding representations.
     */
    MODEL: 'nomic-embed-text',

    /**
     * The generalized model used explicitly for text generation (Chat).
     * Defaults to llama3 for standard generative mappings.
     */
    CHAT_MODEL: 'llama2'
};
