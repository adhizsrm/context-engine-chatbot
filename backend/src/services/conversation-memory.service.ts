import { APP_CONFIG } from '../config/app.config';

export interface ConversationTurn {
    userQuery: string;
    assistantResponse: string;
    timestamp: number;
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
    static addTurn(sessionId: string = 'default-session', userQuery: string, assistantResponse: string): void {
        const history = this.memory.get(sessionId) || [];

        const turn: ConversationTurn = {
            userQuery,
            assistantResponse,
            timestamp: Date.now()
        };

        history.push(turn);

        // Core sliding window truncating earliest contexts exclusively mapping safely without bloating prompts completely.
        if (history.length > this.MAX_TURNS) {
            history.shift();
        }

        this.memory.set(sessionId, history);

        // Rigorous telemetry extracting explicit bounds perfectly logging mapped variables 
        if (APP_CONFIG.DEBUG_MODE) {
            const formatPreview = (text: string) => text.replace(/\s+/g, ' ').substring(0, 100);

            console.log("\n========== Conversation Memory ==========");
            console.log(`Current Session: ${sessionId}`);
            console.log(`Conversation Count: ${history.length} / ${this.MAX_TURNS}`);
            console.log("Recent Conversation:");
            console.log(`  User: "${formatPreview(userQuery)}..."`);
            console.log(`  Assistant: "${formatPreview(assistantResponse)}..."`);
            console.log("Conversation Inserted Into Prompt (Available for next turn explicitly).");
            console.log("========================================\n");
        }
    }

    /**
     * Natively completely wipes mapped sessions explicitly safely mapping resets inherently.
     */
    static clearHistory(sessionId: string = 'default-session'): void {
        this.memory.delete(sessionId);
    }
}
