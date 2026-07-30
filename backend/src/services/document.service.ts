import { PdfParser } from "../parser/pdf.parser";
import { TextChunker } from "../chunker/text.chunker";
import { TextChunk } from "../types/chunk.types";

export class DocumentService {
    /**
     * Chunking configuration.
     * Keeping these as constants avoids magic numbers and makes
     * experimentation easier during retrieval tuning.
     */
    private static readonly CHUNK_SIZE = 1000;
    private static readonly CHUNK_OVERLAP = 200;

    /**
     * Orchestrates the document ingestion pipeline.
     *
     * Current pipeline:
     * PDF -> Raw Text -> Text Chunks
     *
     * @param filePath Path to the uploaded PDF.
     * @returns An array of structured TextChunk objects.
     */
    static async processUpload(filePath: string): Promise<TextChunk[]> {
        // Step 1: Extract raw text from the uploaded PDF.
        const rawText = await PdfParser.parse(filePath);

        // Step 2: Split the extracted text into overlapping chunks.
        const chunks = TextChunker.chunkText(
            rawText,
            this.CHUNK_SIZE,
            this.CHUNK_OVERLAP
        );

        // Future pipeline:
        // PDF
        //   ↓
        // Parser
        //   ↓
        // Chunker
        //   ↓
        // Embedding Service
        //   ↓
        // Vector Database

        return chunks;
    }
}