import { LLMProvider } from './llm.provider.interface';
import { OpenRouterProvider } from './openrouter.provider';
import { MistralProvider } from './mistral.provider';

export class ProviderFactory {
    /**
     * Constructs and returns the concrete LLM Provider explicitly defined within environment variables.
     * Scales cleanly mapping new interfaces (Gemini/Groq/Mistral) against the identical base execution securely.
     */
    static getLLMProvider(): LLMProvider {
        // We explicitly swap logic seamlessly resolving 'mistral' defaults handling crashes gracefully 
        const activeProvider = process.env.LLM_PROVIDER || 'mistral';

        switch (activeProvider.toLowerCase()) {
            case 'mistral':
                return new MistralProvider();

            case 'openrouter':
                return new OpenRouterProvider();

            default:
                throw new Error(`Unsupported LLM provider resolution internally: ${activeProvider}`);
        }
    }
}
