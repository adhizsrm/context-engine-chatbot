import { LLMProvider } from './llm.provider.interface';
import { OpenRouterProvider } from './openrouter.provider';

export class ProviderFactory {
    /**
     * Constructs and returns the concrete LLM Provider explicitly defined within environment variables.
     * Scales cleanly mapping new interfaces (Gemini/Groq) against the identical base execution securely.
     */
    static getLLMProvider(): LLMProvider {
        const activeProvider = process.env.LLM_PROVIDER || 'openrouter';

        switch (activeProvider.toLowerCase()) {
            case 'openrouter':
                return new OpenRouterProvider();

            // Future providers seamlessly scale out by matching the exact branch logically
            // case 'gemini':
            //     return new GeminiProvider();

            default:
                throw new Error(`Unsupported LLM provider resolution internally: ${activeProvider}`);
        }
    }
}
