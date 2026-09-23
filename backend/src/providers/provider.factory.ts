import { LLMProvider } from './llm.provider.interface';
import { OpenRouterProvider } from './openrouter.provider';
import { MistralProvider } from './mistral.provider';
import { GrokProvider } from './grok.provider';

export class ProviderFactory {
    /**
     * Constructs and returns the concrete LLM Provider explicitly defined within environment variables.
     * Scales cleanly mapping new interfaces (Gemini/Groq/Mistral) against the identical base execution securely.
     */
    static getLLMProvider(): LLMProvider {
        const activeProvider = process.env.LLM_PROVIDER;

        if (!activeProvider) {
            throw new Error('LLM_PROVIDER environment variable is missing.');
        }

        switch (activeProvider.toLowerCase()) {
            case 'mistral':
                return new MistralProvider();

            case 'openrouter':
                return new OpenRouterProvider();

            case 'grok':
                return new GrokProvider();

            default:
                throw new Error(`Unsupported LLM_PROVIDER: "${activeProvider}". Expected one of: openrouter, mistral, grok.`);
        }
    }
}
