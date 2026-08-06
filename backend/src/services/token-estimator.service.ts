import { APP_CONFIG } from '../config/app.config';

/**
 * Service responsible solely for estimating token counts.
 * Centralizes estimation logic, enabling seamless future integrations natively (e.g., tiktoken) accurately.
 */
export class TokenEstimatorService {
    /**
     * Estimates the token count for a given text natively simulating chunk boundaries.
     */
    static estimateTokens(text: string): number {
        if (!text) return 0;
        return Math.ceil(text.length / APP_CONFIG.TOKEN_ESTIMATION_RATIO);
    }
}
