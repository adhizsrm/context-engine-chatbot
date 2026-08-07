import { randomUUID } from 'crypto';
import { PdfParser } from '../parser/pdf.parser';
import { TextChunker } from '../chunker/text.chunker';
import { EmbeddingService } from '../embeddings/embedding.service';
import { WeaviateService } from '../vector-store/weaviate.service';
import { EmbeddedChunk } from '../types/embedding.types';
import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';
import path from 'path';

export interface IngestionMetrics {
    documentId: string;
    message: string;
    chunksStored: number;
}

export class DocumentService {
    /**
     * Orchestrates the parsing, chunking, embedding, and storage of an uploaded document.
     * @param filePath Path where the file is stored.
     * @returns Metric summary capturing success and tracked IDs.
     */
    /* static async processUpload(filePath: string): Promise<IngestionMetrics> {
         // Step 1: Assign rigid Document boundary across text structures
         const documentId = randomUUID();
         const createdAt = new Date().toISOString();
 
         // Step 2: Extract text directly from the PDF
         const rawText = await PdfParser.parse(filePath);
 
         // Step 3: Chunk text seamlessly
         const chunks = TextChunker.chunkText(rawText, 1000, 200);
 
         // Step 4: Validate boundaries against mapped metrics
         chunks.forEach(chunk => {
             chunk.metadata.documentId = documentId;
             chunk.metadata.createdAt = createdAt;
             chunk.metadata.source = path.basename(filePath);
             // Optionally: map further external variables in later pipelines
         });
 
         // Step 5: Embed the chunk data using Ollama natively
         const embeddedChunks = await EmbeddingService.generateEmbeddings(chunks);
 
         // Step 6: Persist chunks identically across isolated Vector DB
         await WeaviateService.store(embeddedChunks);
 
         if (APP_CONFIG.DEBUG_MODE) {
             Logger.log([
                 "========== Persistence Debug ==========",
                 `Document Root Instantiated: ${documentId}`,
                 `Successfully batched and saved ${embeddedChunks.length} embedded chunks into Vector DB.`,
                 "======================================="
             ].join('\n\n'));
         }
 
         return {
             documentId,
             message: "Document successfully indexed.",
             chunksStored: embeddedChunks.length
         };
     }*/

    static async processUpload(filePath: string): Promise<IngestionMetrics> {
        const totalStart = performance.now();

        // Step 1
        const documentId = randomUUID();
        const createdAt = new Date().toISOString();

        // Step 2
        const parseStart = performance.now();
        const rawText = await PdfParser.parse(filePath);
        const parseTime = performance.now() - parseStart;

        // Step 3
        const chunkStart = performance.now();
        const chunks = TextChunker.chunkText(rawText, 1000, 200);
        const chunkTime = performance.now() - chunkStart;

        // Step 4
        chunks.forEach(chunk => {
            chunk.metadata.documentId = documentId;
            chunk.metadata.createdAt = createdAt;
            chunk.metadata.source = path.basename(filePath);
        });

        // Step 5
        const embeddingStart = performance.now();
        const embeddedChunks = await EmbeddingService.generateEmbeddings(chunks);
        const embeddingTime = performance.now() - embeddingStart;

        // Step 6
        const storageStart = performance.now();
        await WeaviateService.store(embeddedChunks);
        const storageTime = performance.now() - storageStart;

        const totalTime = performance.now() - totalStart;

        if (APP_CONFIG.DEBUG_MODE) {
            Logger.log([
                "========== Upload Performance ==========",
                `PDF Parsing          : ${parseTime.toFixed(2)} ms`,
                `Chunking             : ${chunkTime.toFixed(2)} ms`,
                `Embedding Generation : ${embeddingTime.toFixed(2)} ms`,
                `Weaviate Storage     : ${storageTime.toFixed(2)} ms`,
                `----------------------------------------`,
                `Total Upload         : ${totalTime.toFixed(2)} ms`,
                "",
                `Document ID          : ${documentId}`,
                `Chunks Generated     : ${chunks.length}`,
                `Chunks Stored        : ${embeddedChunks.length}`,
                "========================================"
            ].join('\n'));
        }

        return {
            documentId,
            message: "Document successfully indexed.",
            chunksStored: embeddedChunks.length
        };
    }
}
