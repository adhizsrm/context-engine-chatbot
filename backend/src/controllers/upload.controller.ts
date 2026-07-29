import { Request, Response } from 'express';

/**
 * Controller to handle document upload endpoint.
 * Multer middleware should run before this to process the file.
 */
export const uploadDocument = (req: Request, res: Response): void => {
    try {
        const file = (req as any).file;
        if (!file) {
            res.status(400).json({ error: 'No file uploaded or file is not a PDF.' });
            return;
        }

        // Returning success with file metadata (avoiding processing for now)
        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                originalname: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
            },
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Internal Server Error during file upload.' });
    }
};
