import { PdfParser } from '../parser/pdf.parser';
import fs from 'fs';

export class DocumentService {
    /**
     * Orchestrates the parsing of an uploaded document.
     * @param filePath Path where the file is stored.
     * @returns The parsed text from the document.
     */
    static async processUpload(filePath: string): Promise<string> {
        try {
            // For Milestone 2: We only extract the text.
            // In the future, chunking and embedding logic will go here.
            const rawText = await PdfParser.parse(filePath);

            // Optional: We can delete the file after parsing if we don't want to keep it,
            // but for robustness in the RAG pipeline or if we want to preview it, keeping it is fine.
            // Let's decide to keep it in the uploads folder as planned.

            return rawText;
        } catch (error) {
            throw error;
        }
    }
}
