import weaviate, { WeaviateClient } from 'weaviate-client';
import { WEAVIATE_CONFIG } from '../config/weaviate.config';
import { EmbeddedChunk } from '../types/embedding.types';
import { RetrievedChunk } from '../types/chunk.types';

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
     * Retrieves documents via vector similarity parsing parameters natively against the indexed collections.
     * @param queryVector The embedding representation of the user query.
     * @param topK The maximum number of contextual chunks to retrieve (default: 5).
     * @returns An array of structurally cohesive RetrievedChunk objects.
     */
    static async search(queryVector: number[], topK: number = 5): Promise<RetrievedChunk[]> {
        if (!this.client) {
            throw new Error("WeaviateService not initialized. Application boots must call initialize() primarily.");
        }

        try {
            const collection = this.client.collections.get(WEAVIATE_CONFIG.COLLECTION_NAME);

            // Execute the native nearest neighbor mathematical query matching the vector bounds.
            const result = await collection.query.nearVector(queryVector, {
                limit: topK,
                returnMetadata: ['distance']
            });

            // Map and safely unpack the objects dynamically returning the cohesive schema back strictly. 
            return result.objects.map(obj => ({
                id: (obj.uuid || (obj as any).id) as string,
                text: obj.properties.text as string,
                metadata: {
                    documentId: obj.properties.documentId as string,
                    source: obj.properties.source as string | undefined,
                    page: obj.properties.page as number | undefined,
                    chunkIndex: obj.properties.chunkIndex as number,
                    createdAt: obj.properties.createdAt as string | undefined
                },
                distance: obj.metadata?.distance as number
            }));
        } catch (error: any) {
            throw new Error(`Weaviate vector search failed.\n\nDetails: ${error.message}`);
        }
    }

    /**
     * Retrieves documents via keyword BM25 scoring explicitly scaling text frequencies intrinsically.
     * Maps the resulting structural confidence score into the standard 'distance' schema purely to maintain frontend interface conformities cleanly.
     * @param query The user's exact keyword mapping string.
     * @param topK The maximum limit of contextual chunks (default: 5).
     */
    static async keywordSearch(query: string, topK: number = 5): Promise<RetrievedChunk[]> {
        if (!this.client) {
            throw new Error("WeaviateService not initialized. Application boots must call initialize() primarily.");
        }

        try {
            const collection = this.client.collections.get(WEAVIATE_CONFIG.COLLECTION_NAME);

            // Execute the native BM25 syntactic query.
            const result = await collection.query.bm25(query, {
                limit: topK,
                returnMetadata: ['score']
            });

            // Map and safely unpack the objects dynamically returning the cohesive schema back strictly. 
            return result.objects.map(obj => ({
                id: (obj.uuid || (obj as any).id) as string,
                text: obj.properties.text as string,
                metadata: {
                    documentId: obj.properties.documentId as string,
                    source: obj.properties.source as string | undefined,
                    page: obj.properties.page as number | undefined,
                    chunkIndex: obj.properties.chunkIndex as number,
                    createdAt: obj.properties.createdAt as string | undefined
                },
                distance: obj.metadata?.score as number
            }));
        } catch (error: any) {
            throw new Error(`Weaviate keyword BM25 search failed.\n\nDetails: ${error.message}`);
        }
    }

    /**
     * Aggregates distinct structural documents mapped inherently within the bounds natively tracking active contexts.
     * Extracts exact mapping properties uniquely spanning IDs accurately matching UI requirements natively.
     */
    static async getIndexedDocuments(): Promise<any[]> {
        if (!this.client) throw new Error("WeaviateService not initialized.");
        const collection = this.client.collections.get(WEAVIATE_CONFIG.COLLECTION_NAME);

        const result = await collection.query.fetchObjects({
            limit: 10000,
            returnProperties: ['documentId', 'source', 'createdAt']
        });

        const documentsMap = new Map<string, any>();
        for (const obj of result.objects) {
            const docId = obj.properties.documentId as string;
            if (!docId) continue;

            if (!documentsMap.has(docId)) {
                documentsMap.set(docId, {
                    documentId: docId,
                    filename: obj.properties.source || 'Unknown File',
                    timestamp: obj.properties.createdAt || new Date().toISOString(),
                    chunkCount: 1
                });
            } else {
                documentsMap.get(docId).chunkCount++;
            }
        }
        return Array.from(documentsMap.values());
    }

    /**
     * Sequentially scrubs structural bindings explicitly from Vector memory targeting mapped documents.
     */
    static async deleteDocument(documentId: string): Promise<void> {
        if (!this.client) throw new Error("WeaviateService not initialized.");
        const collection = this.client.collections.get(WEAVIATE_CONFIG.COLLECTION_NAME);

        // Fetch matching limits natively extracting structural UUIDs uniquely mapping properties isolated efficiently 
        const result = await collection.query.fetchObjects({
            limit: 10000,
            returnProperties: ['documentId']
        });

        const objectsToDelete = result.objects.filter((obj) => obj.properties.documentId === documentId);
        if (objectsToDelete.length === 0) {
            throw new Error(`Document ID ${documentId} not found in active vector index.`);
        }

        let deletedCount = 0;
        for (const obj of objectsToDelete) {
            if (obj.uuid) {
                await collection.data.deleteById(obj.uuid);
                deletedCount++;
            }
        }
        console.log(`[Weaviate] Successfully purged ${deletedCount} chunks across bounds mapped to Document: ${documentId}`);
    }
}
