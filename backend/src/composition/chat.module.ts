import { ProviderFactory } from '../providers/provider.factory';
import { ChatService } from '../services/chat.service';
import { ChatController } from '../controllers/chat.controller';

/**
 * Composition Root strictly defining dependency injection instantiations statically 
 * evaluating at application startup rather than dynamic per-request allocations globally.
 */
const provider = ProviderFactory.getLLMProvider();
const chatService = new ChatService(provider);
export const chatController = new ChatController(chatService);
