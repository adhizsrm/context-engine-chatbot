import { PdfParser } from '../parser/pdf.parser';
import { TextChunker } from '../chunker/text.chunker';
import { EmbeddingService } from '../embeddings/embedding.service';
import { EmbeddedChunk } from '../types/embedding.types';
import { APP_CONFIG } from '../config/app.config';

export class DocumentService {
    /**
     * Orchestrates the parsing, chunking, and embedding of an uploaded document.
     * @param filePath Path where the file is stored.
     * @returns An array of EmbeddedChunks.
     */
    static async processUpload(filePath: string): Promise<EmbeddedChunk[]> {
        // Step 1: Extract text directly from the PDF
        const rawText = await PdfParser.parse(filePath);

        // Step 2: Chunk the extracted raw text into objects
        const chunks = TextChunker.chunkText(rawText, 1000, 200);

        // Step 3: Embed the chunk data using Ollama
        const embeddedChunks = await EmbeddingService.generateEmbeddings(chunks);

        if (APP_CONFIG.DEBUG_MODE) {
            console.log("========== Embed Debug ==========");
            console.log("Total embedded chunks:", embeddedChunks.length);
            if (embeddedChunks.length > 0) {
                console.log("\nFirst embedded chunk (truncated vector):");
                console.log({
                    ...embeddedChunks[0],
                    embedding: `[... ${embeddedChunks[0].embedding.length} dimensions ...]`
                });
            }
            console.log("=================================");
        }

        // Optional future step: Attach filePath or other metadata 
        // for source attribution before passing to the vector DB.

        return embeddedChunks;
    }
}