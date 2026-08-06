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

            // Step 2: Retrieve tightly clustered semantic documents
            const retrievedChunks = await RetrievalService.retrieveContext(query);

            // Aggregation gracefully deferred downstream to the Services preserving thin HTTP layers natively
            if (APP_CONFIG.DEBUG_MODE) {
                console.log("========== RETRIEVAL ==========");
                console.log(`Chunks Retrieved: ${retrievedChunks.length}`);
                console.log("===============================");
            }

            // Step 3: Feed explicit chunks bounds tightly targeting LLM mapping accurately deferring structural logic
            const responseText = await this.chatService.generateResponse(query, retrievedChunks, history);

            // Step 4: Persist successful interaction intrinsically binding sliding window correctly organically tracking.
            ConversationMemoryService.addTurn('default-session', query, responseText);

            // Step 5: Serve strictly mapped telemetry response 
            res.status(200).json({
                query,
                response: responseText,
                sources: retrievedChunks.map(chunk => ({
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
