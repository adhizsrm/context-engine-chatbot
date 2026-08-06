import { Request, Response } from 'express';
import { RetrievalService } from '../services/retrieval.service';
import { ChatService } from '../services/chat.service';
import { ConversationMemoryService } from '../services/conversation-memory.service';
import { APP_CONFIG } from '../config/app.config';

export class ChatController {
    /**
     * Bootstraps Controller internally capturing required Service Orchestrators globally.
     */
    constructor(private chatService: ChatService) { }

    /**
     * Intercepts HTTP endpoints orchestrating semantic vector querying alongside generative model answering sequences natively.
     */
    ask = async (req: Request, res: Response): Promise<void> => {
        try {
            const { query } = req.body;

            if (!query || typeof query !== 'string') {
                res.status(400).json({ error: "Missing or invalid 'query' payload in JSON body." });
                return;
            }

            // Step 1: Extract Prior Memory natively matching session mapping
            const history = ConversationMemoryService.getHistory('default-session');

            // Step 2: Delegate complex downstream Retrieval, Rendering, and Prompting completely natively securely organically.
            const ragResult = await this.chatService.executeRagWorkflow(query, history);

            // Step 3: Persist successful interaction intrinsically binding sliding window correctly organically tracking.
            ConversationMemoryService.addTurn('default-session', query, ragResult.response);

            // Step 4: Serve strictly mapped telemetry response natively rendering gracefully mapping HTTP boundaries safely.
            res.status(200).json({
                query,
                response: ragResult.response,
                sources: ragResult.sources.map(chunk => ({
                    documentId: chunk.metadata.documentId,
                    page: chunk.metadata.page,
                    distance: chunk.distance
                }))
            });

        } catch (error: any) {
            console.error('[ChatController] Runtime Orchestration Error:', error.message);
            res.status(500).json({ error: 'Failed to process RAG workflow and contextual synthesis.' });
        }
    }
}
