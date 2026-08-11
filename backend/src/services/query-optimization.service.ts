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

        // 2. WH-question strictly targeting declarative extraction natively natively! (e.g. "What is Redux?")
        const newSubjectRegex = /^(what|who|where|how|why)\s+(is|are|does|do|can|could|will|would)\s+(?!it\b|this\b|that\b|there\b|he\b|she\b)/i;
        if (newSubjectRegex.test(lower)) return false;

        // 3. Exact matching or conversational action-verb prefixes universally identifying isolated traces accurately 
        const cleanQuery = lower.replace(/[^a-z\s]/g, '').trim();
        const matchesPhrase = this.STANDALONE_PHRASES.some(phrase => cleanQuery.startsWith(phrase) || cleanQuery === phrase);
        if (matchesPhrase) {
            return true;
        }

        // 4. Safely explicitly trace pronouns capturing broader instructional requests robustly natively seamlessly
        const hasPronoun = /\b(it|this|that|these|those|them)\b/.test(lower);
        const hasActionVerb = /^(can you|could you|please|explain|why|how|analyze|compare|show|simplify|tell me)\b/i.test(lower);

        if (hasPronoun && hasActionVerb) {
            return true;
        }

        // 5. Short vague conversational traces
        const wordCount = lower.split(/\s+/).length;
        if (hasPronoun && wordCount <= 15) {
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
                `Original Query       : ${query}`,
                `Optimized Query      : ${optimizedQuery}`,
                `Classification       : ${isStandalone ? 'Follow-Up' : 'Standalone'}`,
                `Reason               : ${reason}`,
                "========================================"
            ].join('\n'));
        }

        return optimizedQuery;
    }
}
