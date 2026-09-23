import { LLMProvider } from './llm.provider.interface';
import { APP_CONFIG } from '../config/app.config';

export class OpenRouterProvider implements LLMProvider {
    private apiKey: string;
    private model: string;

    constructor() {
        const key = process.env.OPENROUTER_API_KEY;
        const mdl = process.env.OPENROUTER_MODEL;

        if (!key || key === '<api_key>') {
            throw new Error("Missing OPENROUTER_API_KEY environment variable. Populate your .env securely.");
        }

        if (!mdl) {
            throw new Error("Missing OPENROUTER_MODEL environment variable. Please explicitly define it.");
        }

        this.apiKey = key;
        this.model = mdl;
    }

    /**
     * Executes standard conversational generation natively over the OpenRouter cloud.
     * @param prompt The precisely bound context prompt targeting the LLM dynamically.
     * @returns The assistant's text response.
     */
    async generate(prompt: string): Promise<string> {
        if (APP_CONFIG.DEBUG_MODE) {
            console.log("========== LLM PROVIDER ==========");
            console.log("Provider : OpenRouter");
            console.log(`Model    : ${this.model}`);
            console.log("==================================");
        }

        try {
            const requestBody = {
                model: this.model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            };

            if (APP_CONFIG.DEBUG_MODE) {
                console.log("========== OPENROUTER REQUEST ==========");
                console.log(JSON.stringify(requestBody, null, 2));
                console.log("========================================");
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Return only the assistant's final textual synthesis natively 
            if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
                throw new Error("Unexpected response format received from OpenRouter LLM Gateway.");
            }

            // Exposing nothing beyond standard synthesized textual properties explicitly 
            return data.choices[0].message.content;

        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error("OpenRouter API Error: Request timed out.");
            }
            // Rethrow beautifully catching bounds from fetch directly or parsed JSON 
            if (error?.message?.includes('OpenRouter API Error')) {
                throw error;
            }

            console.error("========== OpenRouter Error ==========");
            console.error("Name   :", error?.name);
            console.error("Message:", error?.message);
            console.error("Cause  :", error?.cause);
            console.error("======================================");
            throw new Error(`OpenRouter Text Generation Failed.\nDetails: ${error.message}`);
        }
    }
}
