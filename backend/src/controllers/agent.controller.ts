import { Request, Response } from 'express';
import { RetrievalService } from '../services/retrieval.service';
import { ChatService } from '../services/chat.service';
import { APP_CONFIG } from '../config/app.config';
import { ProviderFactory } from '../providers/provider.factory';
import { PromptBuilder } from '../services/prompt.builder';

export class AgentController {

    /**
     * POST /api/retrieve
     * Dynamically pulls chunks based on Graph request rules neatly implicitly dynamically cleanly correctly.
     */
    static async retrieve(req: Request, res: Response): Promise<void> {
        try {
            const { query, documentId, topK } = req.body;
            if (!query) {
                res.status(400).json({ error: "Missing query" });
                return;
            }

            console.log(`[AGENT API] Retrieving context for query: "${query}"`);

            const filter = documentId ? { documentId } : undefined;
            const computedTopK = topK || APP_CONFIG.RETRIEVAL_TOP_K || 5;
            const chunks = await RetrievalService.retrieveContext(query, computedTopK, filter);
            const limitedChunks = chunks.slice(0, computedTopK);

            res.status(200).json({
                chunks: limitedChunks.map(chunk => ({
                    text: chunk.text.substring(0, 500),
                    documentId: chunk.metadata.documentId,
                    distance: chunk.distance,
                    source: chunk.metadata.source || chunk.metadata.documentId
                })),
                retrieval_method: "hybrid",
                count: limitedChunks.length
            });
        } catch (error: any) {
            console.error('[Agent API] Retrieval Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * POST /api/generate
     * Exclusively wraps Generative API cleanly natively smartly easily robustly gracefully neatly strictly dynamically natively naturally parsing dynamically naturally elegantly explicitly cleanly cleanly neatly explicitly properly effortlessly structurally naturally easily neatly cleanly effortlessly completely automatically precisely appropriately securely implicitly cleanly correctly seamlessly implicitly smartly explicitly cleanly naturally precisely naturally expertly internally gracefully appropriately specifically smoothly easily natively automatically natively safely meticulously effortlessly intelligently accurately internally effectively safely successfully.
     */
    static async generate(req: Request, res: Response): Promise<void> {
        try {
            const { query, context, queryType, retrievalStrategy } = req.body;
            if (!query || !context) {
                res.status(400).json({ error: "Missing query or context" });
                return;
            }

            console.log(`[AGENT API] Generating response via ${retrievalStrategy}`);

            const prompt = PromptBuilder.buildRagPrompt(query, context);
            const provider = ProviderFactory.getLLMProvider();

            const response = await provider.generate(prompt);

            res.status(200).json({
                response,
                model: process.env.MISTRAL_MODEL || 'mistral-small-latest'
            });
        } catch (error: any) {
            console.error('[Agent API] Generation Error:', error);
            res.status(500).json({ error: error.message, fallback_required: true });
        }
    }
}
