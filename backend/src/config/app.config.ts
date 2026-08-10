import dotenv from 'dotenv';
dotenv.config();

/**
 * Global application configuration and feature flags.
 */
export const APP_CONFIG = {
    /**
     * Determines whether to output verbose pipeline progress to the console.
     * Useful during development; should be disabled in production.
     */
    DEBUG_MODE: process.env.DEBUG_MODE !== 'false',
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash:free',
    MODEL_CONTEXT_WINDOW: parseInt(process.env.MODEL_CONTEXT_WINDOW || '16384', 10),
    MAX_OUTPUT_TOKENS: parseInt(process.env.MAX_OUTPUT_TOKENS || '2048', 10),
    PROMPT_TOKEN_BUDGET: parseInt(process.env.PROMPT_TOKEN_BUDGET || '11600', 10),
    TOKEN_ESTIMATION_RATIO: parseFloat(process.env.TOKEN_ESTIMATION_RATIO || '4.0'),
    MEMORY_DECAY_FACTOR: parseFloat(process.env.MEMORY_DECAY_FACTOR || '0.8'),
    MEMORY_DECAY_THRESHOLD: parseFloat(process.env.MEMORY_DECAY_THRESHOLD || '0.45'),
    MAX_SUMMARY_LENGTH: parseInt(process.env.MAX_SUMMARY_LENGTH || '300', 10),
    RETRIEVAL_TOP_K: Number(process.env.RETRIEVAL_TOP_K) || 5,
};
