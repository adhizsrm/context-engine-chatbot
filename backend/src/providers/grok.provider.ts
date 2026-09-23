import { LLMProvider } from './llm.provider.interface';
import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

export class GrokProvider implements LLMProvider {
    private apiKey: string;
    private model: string;

    constructor() {
        const key = process.env.GROK_API_KEY;
        const mdl = process.env.GROK_MODEL;

        if (!key) {
            throw new Error("Missing GROK_API_KEY environment variable.");
        }

        if (!mdl) {
            throw new Error("Missing GROK_MODEL environment variable. Please explicitly define it.");
        }

        this.apiKey = key;
        this.model = mdl;
    }

    async generate(prompt: string): Promise<string> {
        if (APP_CONFIG.DEBUG_MODE) {
            console.log("========== LLM PROVIDER ==========");
            console.log("Provider : Grok");
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

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const response = await fetch('https://api.x.ai/v1/chat/completions', {
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
                throw new Error(`Grok API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            if (!data || !data.choices || !data.choices[0] || !data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
                throw new Error("Unexpected response structure received from Grok API.");
            }

            return data.choices[0].message.content;

        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error("Grok API Error: Request timed out.");
            }
            if (error.message.includes('Grok API Error')) {
                throw error;
            }

            console.error("========== Grok Error ==========");
            console.error("Name   :", error?.name);
            console.error("Message:", error?.message);
            console.error("Cause  :", error?.cause);
            console.error("=================================");
            throw new Error(`Grok Text Generation Failed.\nDetails: ${error.message}`);
        }
    }
}
