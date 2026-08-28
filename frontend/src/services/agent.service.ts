import axios from 'axios';

interface Source { documentId: string; distance?: number; }

export interface OrchestratedResponse {
    response: string;
    sources: Source[];
    orchestrated: boolean;
    metadata?: {
        queryType: string;
        retrievalStrategy: string;
        confidence: number;
        validationScore: number;
        nodePath: string[];
    };
}

class ChatOrchestratorService {
    private agentAvailable = true;
    private circuitBreakerTimeout: number | null = null;

    private agentClient = axios.create({ baseURL: 'http://localhost:8000/api/agent' });
    private expressClient = axios.create({ baseURL: 'http://localhost:3000/api' });

    async chat(query: string, documentId: string | null = null): Promise<OrchestratedResponse> {
        if (this.agentAvailable) {
            try {
                return await this.tryAgent(query, documentId);
            } catch (error) {
                console.warn("[Agent Orchestrator] LangGraph microservice offline/failed. Tripping circuit breaker and falling back to direct Express.");
                this.tripCircuitBreaker();
                return await this.tryExpress(query, documentId);
            }
        } else {
            console.log("[Agent Orchestrator] Circuit breaker active. Routing directly to Express.");
            return await this.tryExpress(query, documentId);
        }
    }

    private async tryAgent(query: string, documentId: string | null): Promise<OrchestratedResponse> {
        const payload: any = { query };
        if (documentId) payload.documentId = documentId;

        const res = await this.agentClient.post('/chat', payload);

        return {
            response: res.data.response,
            sources: res.data.metadata?.context_ids?.map((id: string) => ({ documentId: id })) || [],
            orchestrated: true,
            metadata: {
                queryType: res.data.metadata?.query_type || 'unknown',
                retrievalStrategy: res.data.metadata?.retrieval_strategy || 'hybrid',
                confidence: res.data.metadata?.confidence || 0,
                validationScore: res.data.metadata?.validation_score || 0,
                nodePath: res.data.metadata?.node_path || []
            }
        };
    }

    private async tryExpress(query: string, documentId: string | null): Promise<OrchestratedResponse> {
        const payload: any = { query };
        if (documentId) payload.documentId = documentId;

        const res = await this.expressClient.post('/chat', payload);

        return {
            response: res.data.response,
            sources: res.data.sources || [],
            orchestrated: false
        };
    }

    private tripCircuitBreaker() {
        this.agentAvailable = false;
        if (this.circuitBreakerTimeout) clearTimeout(this.circuitBreakerTimeout);

        this.circuitBreakerTimeout = window.setTimeout(() => {
            console.log("[Agent Orchestrator] Circuit breaker resolving. Next request will attempt LangGraph again.");
            this.agentAvailable = true;
        }, 30000);
    }
}

export const ChatOrchestrator = new ChatOrchestratorService();
