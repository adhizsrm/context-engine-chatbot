import { APP_CONFIG } from '../config/app.config';

/**
 * Service dedicated to evaluating whether an LLM response should be retained in conversational memory.
 * This isolates deterministic detection bounds, ensuring ChatController orchestration remains completely decoupled.
 * Over time, this architecture enables seamless swapping to an LLM-as-a-Judge or embedding-based grounding signal.
 */
export class MemoryEligibilityService {
    /**
     * Determines whether the generated response is syntactically grounded natively avoiding polluting contexts organically securely.
     */
    static evaluateEligibility(response: string): boolean {
        const normalized = response.toLowerCase();

        // Exact historical exclusions (backward compatibility perfectly mapping cleanly)
        if (normalized === "i don't know based on the provided documents.") {
            return false;
        }

        // Structural substring detection matching LLM-generated hallucination refusals logically safely
        const ungroundedPatterns = [
            "i don't know",
            "i do not know",
            "i don't find any information",
            "i do not find any information",
            "i could not find",
            "i couldn't find",
            "no information about",
            "does not contain information",
            "does not provide information",
            "does not mention",
            "cannot answer",
            "not enough information"
        ];

        for (const pattern of ungroundedPatterns) {
            if (normalized.includes(pattern)) {
                return false;
            }
        }

        // If no refusal pattern is detected natively, it is eligible confidently!
        return true;
    }
}
