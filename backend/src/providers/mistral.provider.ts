import { LLMProvider } from './llm.provider.interface';
import { APP_CONFIG } from '../config/app.config';

export class MistralProvider implements LLMProvider {
    /**
     * Executes standard conversational generation natively over the official Mistral cloud APIs.
     * @param prompt The precisely bound context prompt targeting the LLM dynamically.
     * @returns The assistant's text response.
     */
    async generate(prompt: string): Promise<string> {
        const apiKey = process.env.MISTRAL_API_KEY;
        const model = process.env.MISTRAL_MODEL || 'mistral-small-latest'; // Good baseline fast API model inherently.

        if (!apiKey) {
            throw new Error("Missing MISTRAL_API_KEY environment variable. Populate your .env securely.");
        }

        try {
            const requestBody = {
                model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            };

            if (APP_CONFIG.DEBUG_MODE) {
                console.log("========== MISTRAL REQUEST ==========");
                console.log(JSON.stringify(requestBody, null, 2));
                console.log("=====================================");
            }

            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Mistral API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Return only the assistant's final textual synthesis natively 
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error("Unexpected response format received from Mistral LLM Gateway.");
            }

            // Exposing nothing beyond standard synthesized textual properties explicitly 
            return data.choices[0].message.content;

        } catch (error: any) {
            // Rethrow beautifully catching bounds from fetch directly or parsed JSON 
            if (error.message.includes('Mistral API Error')) {
                throw error;
            }

            console.error("========== Mistral Error ==========");
            console.error("Name   :", error?.name);
            console.error("Message:", error?.message);
            console.error("Cause  :", error?.cause);
            console.error("===================================");
            throw new Error(`Mistral Text Generation Failed.\nDetails: ${error.message}`);
        }
    }
}
