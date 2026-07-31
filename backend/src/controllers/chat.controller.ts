import { Request, Response } from 'express';
import { RetrievalService } from '../services/retrieval.service';
import { ChatService } from '../services/chat.service';

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

            // Step 1: Retrieve tightly clustered semantic documents
            const retrievedChunks = await RetrievalService.retrieveContext(query);

            // Aggregate raw textual objects safely into delimited strings for prompts
            const contextText = retrievedChunks.map(chunk => chunk.text).join("\n\n---\n\n");

            // Step 2: Feed context explicitly against query bounds targeting generative arrays natively 
            const responseText = await this.chatService.generateResponse(query, contextText);

            // Step 3: Serve strictly mapped telemetry response 
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
