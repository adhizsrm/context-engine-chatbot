import weaviate, { WeaviateClient } from 'weaviate-client';
import { WEAVIATE_CONFIG } from '../config/weaviate.config';
import { EmbeddedChunk } from '../types/embedding.types';

export class WeaviateService {
    private static client: WeaviateClient;

    /**
     * Initializes the Weaviate connection.
     * Evaluates index presence and auto-creates structural bounds upon startup to drastically optimize upload requests.
     */
    static async initialize(): Promise<void> {
        try {
            // Stripping URL protocols appropriately for the custom connection handler.
            const urlWithoutProtocol = WEAVIATE_CONFIG.URL.replace(/^https?:\/\//, '');
            const [host, portPart] = urlWithoutProtocol.split(':');
            const port = portPart ? parseInt(portPart, 10) : 8080;
            const isSecure = WEAVIATE_CONFIG.URL.startsWith('https');

            this.client = await weaviate.connectToCustom({
                httpHost: host,
                httpPort: port,
                httpSecure: isSecure,
            });

            const collectionExists = await this.client.collections.exists(WEAVIATE_CONFIG.COLLECTION_NAME);

            if (!collectionExists) {
                console.log(`[Weaviate] Collection '${WEAVIATE_CONFIG.COLLECTION_NAME}' not found. Creating it...`);
                // Create a basic collection layout 
                await this.client.collections.create({
                    name: WEAVIATE_CONFIG.COLLECTION_NAME,
                });
                console.log(`[Weaviate] Collection '${WEAVIATE_CONFIG.COLLECTION_NAME}' created successfully.`);
            } else {
                console.log(`[Weaviate] Collection '${WEAVIATE_CONFIG.COLLECTION_NAME}' is ready.`);
            }
        } catch (error: any) {
            throw new Error(`Failed to initialize Weaviate connection. Ensure Weaviate is running at ${WEAVIATE_CONFIG.URL}.\nDetails: ${error.message}`);
        }
    }

    /**
     * Safely executes an atomic batch push binding custom vectors to metadata properties.
     * @param chunks Array of EmbeddedChunks parsed from external text files.
     */
    static async store(chunks: EmbeddedChunk[]): Promise<void> {
        if (!chunks || chunks.length === 0) return;

        if (!this.client) {
            throw new Error("WeaviateService not initialized. Application boots must call initialize() primarily.");
        }

        try {
            const collection = this.client.collections.get(WEAVIATE_CONFIG.COLLECTION_NAME);

            // Map chunks to standard Weaviate batch insertion model
            const objects = chunks.map(chunk => {
                const properties: Record<string, string | number> = {
                    text: chunk.text,
                    documentId: chunk.metadata.documentId!,
                    chunkIndex: chunk.metadata.chunkIndex,
                    createdAt: chunk.metadata.createdAt!,
                };

                if (chunk.metadata.source !== undefined) {
                    properties.source = chunk.metadata.source;
                }

                if (chunk.metadata.page !== undefined) {
                    properties.page = chunk.metadata.page;
                }

                return {
                    id: chunk.id,
                    vectors: chunk.embedding,
                    properties,
                };
            });

            const result = await collection.data.insertMany(objects);

            if (result.hasErrors) {
                const errors = Object.values(result.errors);
                throw new Error(`Batch insertion failed for ${errors.length} of ${chunks.length} chunks. First error snapshot: ${(errors[0] as any)?.message}`);
            }

        } catch (error: any) {
            if (error.message.includes('Batch insertion failed')) {
                throw error; // Re-throw atomic batch format specifically
            }
            throw new Error(`Weaviate storage runtime failed.\n\nDetails: ${error.message}`);
        }
    }

    /**
     * Future milestone: Retrieves documents via vector similarity parsing parameters.
     */
    static async search(queryVector: number[], topK: number = 5): Promise<any> {
        throw new Error("search(...) strictly not implemented in Milestone 5.");
    }

    /**
     * Future milestone: Uniquely drop document bundles from the vector DB based on bound DocumentIds.
     */
    static async deleteDocument(documentId: string): Promise<void> {
        throw new Error("deleteDocument(...) strictly not implemented in Milestone 5.");
    }
}
