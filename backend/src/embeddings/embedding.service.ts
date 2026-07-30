import { TextChunk } from '../types/chunk.types';
import { EmbeddedChunk, OllamaEmbeddingResponse } from '../types/embedding.types';
import { OLLAMA_CONFIG } from '../config/ollama.config';

export class EmbeddingService {
    /**
     * Transforms an array of text chunks into embedded chunks using the configured LLM provider.
     * 
     * @param chunks The structured text chunks requiring vector embeddings.
     * @returns An array of EmbeddedChunk objects.
     * @throws If the embedding provider is unreachable or returns malformed data.
     */
    static async generateEmbeddings(chunks: TextChunk[]): Promise<EmbeddedChunk[]> {
        if (!chunks || chunks.length === 0) {
            return [];
        }

        try {
            const inputs = chunks.map(chunk => chunk.text);

            const response = await fetch(OLLAMA_CONFIG.EMBED_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: OLLAMA_CONFIG.MODEL,
                    input: inputs
                })
            });

            if (!response.ok) {
                throw new Error(
                    `Embedding generation failed.\n\n` +
                    `Cause:\nOllama HTTP Status ${response.status}.\n\n` +
                    `Hint:\nCheck if the model '${OLLAMA_CONFIG.MODEL}' exists.`
                );
            }

            const data = (await response.json()) as OllamaEmbeddingResponse;

            this.validateOllamaResponse(data, chunks.length);

            return chunks.map((chunk, index) => ({
                id: chunk.id,
                text: chunk.text,
                metadata: chunk.metadata,
                embedding: data.embeddings[index]
            }));

        } catch (error: any) {
            // Rethrow beautifully formatted errors directly; no duplicate logging
            if (error.message.includes('Embedding generation failed')) {
                throw error;
            }

            throw new Error(
                `Embedding generation failed.\n\n` +
                `Cause:\nOllama server unavailable or network failure.\n\n` +
                `Details:\n${error.message}\n\n` +
                `Hint:\nEnsure Ollama is running at ${OLLAMA_CONFIG.BASE_URL} and model '${OLLAMA_CONFIG.MODEL}' is installed.`
            );
        }
    }

    /**
     * Validates that the provider response matches expectations strictly. Fail-fast paradigm.
     */
    private static validateOllamaResponse(data: OllamaEmbeddingResponse, expectedCount: number): void {
        if (!data || !data.embeddings) {
            throw new Error(`Embedding generation failed.\n\nCause:\nResponse missing 'embeddings' field.`);
        }

        if (!Array.isArray(data.embeddings)) {
            throw new Error(`Embedding generation failed.\n\nCause:\n'embeddings' field is not an array.`);
        }

        if (data.embeddings.length !== expectedCount) {
            throw new Error(
                `Embedding generation failed.\n\n` +
                `Cause:\nMismatching results. Sent ${expectedCount} chunks, received ${data.embeddings.length} embeddings.`
            );
        }

        // Validate structure of a random element rather than iterating all of them to save CPU,
        // or check the first one to assure they are float arrays.
        if (data.embeddings.length > 0 && !Array.isArray(data.embeddings[0])) {
            throw new Error(`Embedding generation failed.\n\nCause:\nArray contains invalid scalar values instead of vectors.`);
        }
    }
}
