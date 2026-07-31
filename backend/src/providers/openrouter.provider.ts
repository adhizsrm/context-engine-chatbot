import { LLMProvider } from './llm.provider.interface';

export class OpenRouterProvider implements LLMProvider {
    /**
     * Executes standard conversational generation natively over the OpenRouter cloud.
     * @param prompt The precisely bound context prompt targeting the LLM dynamically.
     * @returns The assistant's text response.
     */
    async generate(prompt: string): Promise<string> {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash:free';

        if (!apiKey || apiKey === '<api_key>') {
            throw new Error("Missing OPENROUTER_API_KEY environment variable. Populate your .env securely.");
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Return only the assistant's final textual synthesis natively 
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error("Unexpected response format received from OpenRouter LLM Gateway.");
            }

            // Exposing nothing beyond standard synthesized textual properties explicitly 
            return data.choices[0].message.content;

        } catch (error: any) {
            // Rethrow beautifully catching bounds from fetch directly or parsed JSON 
            if (error.message.includes('OpenRouter API Error')) {
                throw error;
            }
            throw new Error(`OpenRouter Text Generation Failed.\nDetails: ${error.message}`);
        }
    }
}
