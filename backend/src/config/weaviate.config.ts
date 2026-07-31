/**
 * Configuration for the Weaviate vector database.
 */
export const WEAVIATE_CONFIG = {
    /** 
     * The connection URL for Weaviate. 
     * Defaults to standard Docker container local routing.
     */
    URL: process.env.WEAVIATE_URL || 'http://localhost:8080',

    /** 
     * Name of the collection handling vectorized text outputs.
     */
    COLLECTION_NAME: 'DocumentChunk',

    /** 
     * API Key needed for cloud clusters, empty for local container deployments.
     */
    API_KEY: process.env.WEAVIATE_API_KEY || ''
};
