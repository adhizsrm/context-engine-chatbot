import { APP_CONFIG } from '../config/app.config';
import { Logger } from '../utils/logger';

export interface ConversationTurn {
    userQuery: string;
    assistantResponse: string;
    timestamp: number;
    memoryEligible: boolean;
}

export class ConversationMemoryService {
    // Isolated internal memory map safely scaling multi-tenancy securely decoupling external reliance intrinsically.
    private static memory = new Map<string, ConversationTurn[]>();
    private static MAX_TURNS = 5;

    /**
     * Retrieves the strictly explicitly formatted sliding array seamlessly.
     * @param sessionId Session identity natively decoupling UI scopes. 
     * @returns Ordered historic turns strictly mapping past arrays robustly.
     */
    static getHistory(sessionId: string = 'default-session'): ConversationTurn[] {
        return this.memory.get(sessionId) || [];
    }

    /**
     * Appends a fresh conversation interaction seamlessly slicing oldest bounds dropping unneeded noise intelligently.
     */
    static addTurn(sessionId: string = 'default-session', userQuery: string, assistantResponse: string, memoryEligible: boolean, isCompressed: boolean = false): void {
        const history = this.memory.get(sessionId) || [];

        const turn: ConversationTurn = {
            userQuery,
            assistantResponse,
            timestamp: Date.now(),
            memoryEligible
        };

        history.push(turn);

        // Core sliding window truncating earliest contexts exclusively mapping safely without bloating prompts completely.
        if (history.length > this.MAX_TURNS) {
            history.shift();
        }

        this.memory.set(sessionId, history);

        // Rigorous telemetry extracting explicit bounds perfectly logging mapped variables 
        if (APP_CONFIG.DEBUG_MODE) {
            const debugLines: string[] = [
                "========== CONVERSATION MEMORY ==========",
                `Current Session       : ${sessionId}`,
                `Conversation Count    : ${history.length} / ${this.MAX_TURNS}`,
                `User Query Length     : ${userQuery.length} chars`,
                `Stored Assistant      : ${assistantResponse.length} chars`,
                `Memory Representation : ${isCompressed ? "Compressed" : "Original"}\n`,
                "Conversation Stored In Memory",
                "========================================="
            ];

            Logger.log(debugLines.join('\n'));
        }
    }

    /**
     * Natively completely wipes mapped sessions explicitly safely mapping resets inherently.
     */
    static clearHistory(sessionId: string = 'default-session'): void {
        this.memory.delete(sessionId);
    }
}
