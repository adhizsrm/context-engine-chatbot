import { ConversationTurn } from './conversation-memory.service';
import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

/**
 * Deterministic semantic analysis translating incomplete queries natively mapping contextual topics
 * resolving Pronouns seamlessly natively securely.
 */
export class QueryOptimizationService {
    private static readonly FOLLOW_UP_INDICATORS = [
        "explain that",
        "tell me more",
        "what about",
        "can you elaborate",
        "why",
        "how",
        "with an example",
        "continue",
        "and this",
        "what does that mean"
    ];

    /**
     * Determines whether a query is likely a contextual follow-up organically querying explicitly.
     */
    private static isFollowUp(query: string): boolean {
        const lowerQuery = query.toLowerCase();

        // Exact trailing heuristics commonly implying contextual bounds:
        if (lowerQuery.includes("it") || lowerQuery.includes("that") || lowerQuery.includes("this")) {
            return true;
        }

        return this.FOLLOW_UP_INDICATORS.some(indicator => lowerQuery.includes(indicator));
    }

    /**
     * Extracts a simplistic topic from the previous user intent mapping semantic chunks natively natively.
     */
    private static extractTopic(lastQuery: string): string {
        // Strip common question wrappers isolating organic topic bounds generically natively
        return lastQuery
            .replace(/^(explain|tell me about|what is|how do i|can you explain)\s+/i, '')
            .replace(/[.?!]+$/, '')
            .trim();
    }

    /**
     * Optimizes search capabilities strictly mapping contextually incomplete queries structurally securely natively.
     */
    static optimizeQuery(query: string, history: ConversationTurn[]): string {
        if (!history || history.length === 0) {
            return query;
        }

        const isLikelyFollowUp = this.isFollowUp(query);
        let optimizedQuery = query;

        if (isLikelyFollowUp) {
            const lastTurn = history[history.length - 1];
            const topic = this.extractTopic(lastTurn.userQuery);

            if (topic) {
                // Heuristic replacement: mapping pronoun spaces dynamically securely
                const lowerQuery = query.toLowerCase();
                if (lowerQuery.includes(' it ')) {
                    optimizedQuery = query.replace(/\bit\b/i, topic);
                } else if (lowerQuery.includes(' that ')) {
                    optimizedQuery = query.replace(/\bthat\b/i, topic);
                } else if (lowerQuery.includes(' this ')) {
                    optimizedQuery = query.replace(/\bthis\b/i, topic);
                } else {
                    optimizedQuery = `${topic} ${query}`;
                }
            }
        }

        if (APP_CONFIG.DEBUG_MODE) {
            Logger.log([
                "========== Query Optimization ==========",
                `Original Query:\n${query}`,
                `Optimized Query:\n${optimizedQuery}`,
                `Optimization Applied:\n${isLikelyFollowUp ? 'Yes' : 'No'}`,
                "========================================"
            ].join('\n\n'));
        }

        return optimizedQuery;
    }
}
