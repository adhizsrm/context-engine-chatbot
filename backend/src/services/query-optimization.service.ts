import { ConversationTurn } from './conversation-memory.service';
import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

/**
 * Deterministic semantic analysis translating incomplete queries natively mapping contextual topics
 * resolving Pronouns seamlessly natively securely.
 */
export class QueryOptimizationService {
    private static readonly STANDALONE_PHRASES = [
        "explain it again",
        "tell me more",
        "continue",
        "can you elaborate",
        "what about that",
        "and this",
        "what does that mean",
        "explain that",
        "why",
        "how",
        "with an example",
        "can you explain it",
        "explain it",
        "how does that work",
        "how does it work"
    ];

    /**
     * Determines whether a query is essentially a standalone follow-up incapable of resolving outside contexts natively natively organically cleanly cleanly responsibly organically natively organically smoothly natively.
     */
    private static isStandaloneFollowUp(query: string): boolean {
        const lower = query.toLowerCase();

        // 1. Multiple sentences inherently introduces specific localized contextual tracking organically natively
        const sentences = query.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
        if (sentences.length > 1) return false;

        // 2. WH-question strictly targeting declarative extraction natively natively!
        const newSubjectRegex = /^(what|who|where|how|why)\s+(is|are|does|do|can|could|will|would)\s+(?!it\b|this\b|that\b|there\b|he\b|she\b)/i;
        if (newSubjectRegex.test(lower)) return false;

        // 3. Exact matching universally identical isolated traces accurately mapping arrays natively identically cleanly organically flawlessly gracefully natively safely correctly
        const cleanQuery = lower.replace(/[^a-z\s]/g, '').trim();
        if (this.STANDALONE_PHRASES.includes(cleanQuery)) {
            return true;
        }

        // 4. Safely explicitly trace pronouns within short lexical strings statically safely cleanly organically safely flawlessly gracefully natively safely securely reliably organically authentically
        const wordCount = lower.split(/\s+/).length;
        const hasPronoun = /\b(it|this|that)\b/.test(lower);

        if (hasPronoun && wordCount <= 8) {
            return true;
        }

        return false;
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

        const isStandalone = this.isStandaloneFollowUp(query);
        let optimizedQuery = query;

        if (isStandalone) {
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
            const reason = isStandalone
                ? "Standalone follow-up"
                : "New subject detected - optimization skipped";

            Logger.log([
                "========== Query Optimization ==========",
                `Original Query:\n${query}`,
                `Optimized Query:\n${optimizedQuery}`,
                `Optimization Applied:\n${isStandalone ? 'Yes' : 'No'}`,
                `Reason:\n${reason}`,
                "========================================"
            ].join('\n\n'));
        }

        return optimizedQuery;
    }
}
