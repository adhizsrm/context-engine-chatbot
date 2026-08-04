import { Request, Response } from 'express';
import { WeaviateService } from '../vector-store/weaviate.service';

export class DocumentController {
    /**
     * Intercepts GET arrays executing memory aggregations safely mapping out explicit JSON objects.
     */
    static async getDocuments(req: Request, res: Response): Promise<void> {
        try {
            const docs = await WeaviateService.getIndexedDocuments();
            res.status(200).json(docs);
        } catch (error: any) {
            res.status(500).json({ error: `Retrieval generic error: ${error.message}` });
        }
    }

    /**
     * Parses explicit deletion ID targets dynamically orchestrating sequential document cascades.
     */
    static async deleteDocument(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            if (!id) {
                res.status(400).json({ error: 'Missing active document ID natively via params.' });
                return;
            }
            await WeaviateService.deleteDocument(id);
            res.status(200).json({ message: `Successfully deleted document ${id} completely wiping vector scope arrays.` });
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }
}
