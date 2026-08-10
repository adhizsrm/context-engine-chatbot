import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

/**
 * Service dedicated exclusively to compressing assistant response length optimizing token boundaries efficiently.
 * IMPORTANT ARCHITECTURAL NOTE: This current implementation uses deterministic slicing strictly keeping the design local.
 * This class is intentionally mapped safely to be completely hot-swapped seamlessly with a native OpenRouter LLM 
 * summarization call natively in future Context Engineering milestones without modifying ChatService orchestrations!
 */
export class ConversationSummaryService {
    /**
     * Executes a deterministic contextual compression scaling accurately evaluating string boundaries strictly.
     * @param response Complete generative text string returned by the Main LLM.
     * @returns A concisely wrapped contextually mapping summarization logically tracking boundaries efficiently.
     */
    static summarize(response: string): string {
        if (!response) return "";

        const maxLength = APP_CONFIG.MAX_SUMMARY_LENGTH;
        const originalLength = response.length;

        // Normalize excessive whitespaces resolving token inefficiencies natively cleanly smoothly safely.
        const normalizedResponse = response.replace(/\s+/g, ' ').trim();

        // Edge case: Responses shorter than, equal to, or extremely close to the limit
        if (normalizedResponse.length <= maxLength) {
            this.logSummaryStatistics(originalLength, normalizedResponse.length, false);
            return normalizedResponse;
        }

        const separator = " ... ";

        // Edge case: if configured maximum string bounds are critically low (e.g., 3 chars)
        if (maxLength <= separator.length) {
            const truncated = normalizedResponse.substring(0, Math.max(0, maxLength));
            this.logSummaryStatistics(originalLength, truncated.length, true);
            return truncated;
        }

        // Strategy: Preserve the first 60% of the budget and the final 40% natively leaving trailing metadata appropriately.
        // NOTE: This is deterministic lexical compression, NOT semantic summarization!
        const availableBudget = maxLength - separator.length;
        const splitIndexStart = Math.floor(availableBudget * 0.60);
        const splitIndexEnd = availableBudget - splitIndexStart;

        let firstPortion = normalizedResponse.substring(0, splitIndexStart);
        let lastPortion = normalizedResponse.substring(normalizedResponse.length - splitIndexEnd);

        // Adjust to safe word boundaries where possible natively cleanly avoiding mid-word chops
        const lastSpaceInFirst = firstPortion.lastIndexOf(' ');
        if (lastSpaceInFirst > 0) {
            firstPortion = firstPortion.substring(0, lastSpaceInFirst);
        }

        const firstSpaceInLast = lastPortion.indexOf(' ');
        if (firstSpaceInLast !== -1 && firstSpaceInLast < lastPortion.length - 1) {
            lastPortion = lastPortion.substring(firstSpaceInLast + 1);
        }

        const compressedSummary = `${firstPortion}${separator}${lastPortion}`;

        this.logSummaryStatistics(originalLength, compressedSummary.length, true);

        return compressedSummary;
    }

    /**
     * Privately abstracts complex logging mapping diagnostic arrays efficiently gracefully beautifully cleanly natively explicitly securely statically. 
     */
    private static logSummaryStatistics(originalLength: number, summaryLength: number, applied: boolean): void {
        if (!APP_CONFIG.DEBUG_MODE) return;

        const compressionRatio = originalLength > 0
            ? ((1 - (summaryLength / originalLength)) * 100).toFixed(1)
            : "0.0";

        Logger.log([
            "========== Conversation Summarization ==========",
            `Original Response Characters : ${originalLength}`,
            `Summary Characters           : ${summaryLength}`,
            `Compression Ratio            : ${applied ? compressionRatio + "%" : "0.0% (N/A)"}`,
            `Optimization Applied         : ${applied ? "Yes" : "No"}`,
            "==============================================="
        ].join('\n'));
    }
}
