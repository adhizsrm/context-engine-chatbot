import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';

/**
 * Controller to handle document upload endpoint.
 * Multer middleware should run before this to process the file.
 */
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = (req as any).file;
        if (!file) {
            res.status(400).json({ error: 'No file uploaded or file is not a PDF.' });
            return;
        }

        // Delegate business logic to the service layer natively yielding success metrics
        const stats = await DocumentService.processUpload(file.path);

        res.status(200).json({
            message: stats.message,
            documentId: stats.documentId,
            chunksStored: stats.chunksStored,
            file: {
                originalname: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
            }
        });
    } catch (error: any) {
        console.error('Upload Error:', error);

        // Check if the error originated from our PDF parser
        if (error.message && error.message.startsWith('PARSE_ERROR:')) {
            const exactReason = error.message.replace('PARSE_ERROR: ', '');
            res.status(400).json({
                error: 'The uploaded PDF is malformed, corrupted, or unsupported.',
                details: exactReason
            });
            return;
        }

        res.status(500).json({
            error: 'Internal Server Error during file upload.',
            details: error.message
        });
    }
};
