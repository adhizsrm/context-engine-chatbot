import { randomUUID } from 'crypto';
import { TextChunk } from '../types/chunk.types';

export class TextChunker {
    /**
     * Splits a given text into overlapping chunks and returns rich TextChunk objects.
     * 
     * Strategy: Fixed-Size Character Chunking with Overlap.
     * 
     * @param text The raw extracted text to chunk.
     * @param chunkSize The maximum character length of a single chunk (default: 1000).
     * @param overlap The number of overlapping characters between consecutive chunks (default: 200).
     * @returns An array of TextChunk objects.
     */
    static chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): TextChunk[] {
        if (!text || text.trim().length === 0) {
            return [];
        }

        if (chunkSize <= 0) {
            throw new Error('chunkSize must be greater than 0');
        }
        if (overlap >= chunkSize) {
            throw new Error('overlap must be strictly less than chunkSize');
        }

        const chunks: TextChunk[] = [];
        let startIndex = 0;
        let chunkIndex = 0;

        while (startIndex < text.length) {
            const chunkText = text.slice(startIndex, startIndex + chunkSize);

            chunks.push({
                id: randomUUID(),
                text: chunkText,
                metadata: {
                    chunkIndex: chunkIndex
                }
            });

            startIndex += (chunkSize - overlap);
            chunkIndex++;
        }

        return chunks;
    }
}
