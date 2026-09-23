import { ProviderFactory } from './providers/provider.factory';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { MistralProvider } from './providers/mistral.provider';
import { GrokProvider } from './providers/grok.provider';
import * as fs from 'fs';

let logs: string[] = [];
function log(msg: string) {
    logs.push(msg);
}

function assertThrows(fn: () => void, expectedMessagePart?: string) {
    try {
        fn();
        log("FAIL: Expected function to throw, but it succeeded.");
        throw new Error("Expected function to throw, but it succeeded.");
    } catch (e: any) {
        if (expectedMessagePart && !e.message.includes(expectedMessagePart)) {
            log(`FAIL: Expected error containing "${expectedMessagePart}", got "${e.message}"`);
            throw new Error(`Expected error containing "${expectedMessagePart}", got "${e.message}"`);
        }
        log(`PASS: Threw expected error: ${e.message}`);
    }
}

function runTests() {
    log("Running Provider Factory Matrix Tests...");
    const originalEnv = { ...process.env };

    const clearEnv = () => {
        delete process.env.LLM_PROVIDER;
        delete process.env.OPENROUTER_API_KEY;
        delete process.env.OPENROUTER_MODEL;
        delete process.env.MISTRAL_API_KEY;
        delete process.env.MISTRAL_MODEL;
        delete process.env.GROK_API_KEY;
        delete process.env.GROK_MODEL;
    };

    try {
        log("Test A");
        clearEnv();
        process.env.LLM_PROVIDER = 'openrouter';
        process.env.OPENROUTER_API_KEY = 'test_key';
        process.env.OPENROUTER_MODEL = 'test_model';
        const providerA = ProviderFactory.getLLMProvider();
        if (!(providerA instanceof OpenRouterProvider)) throw new Error("Test A Failed");
        log("Test A Passed");

        log("Test B");
        clearEnv();
        process.env.LLM_PROVIDER = 'mistral';
        process.env.MISTRAL_API_KEY = 'test_key';
        process.env.MISTRAL_MODEL = 'test_model';
        const providerB = ProviderFactory.getLLMProvider();
        if (!(providerB instanceof MistralProvider)) throw new Error("Test B Failed");
        log("Test B Passed");

        log("Test C");
        clearEnv();
        process.env.LLM_PROVIDER = 'grok';
        process.env.GROK_API_KEY = 'test_key';
        process.env.GROK_MODEL = 'test_model';
        const providerC = ProviderFactory.getLLMProvider();
        if (!(providerC instanceof GrokProvider)) throw new Error("Test C Failed");
        log("Test C Passed");

        log("Test D");
        clearEnv();
        process.env.LLM_PROVIDER = 'mistrall';
        assertThrows(() => ProviderFactory.getLLMProvider(), "Expected one of: openrouter, mistral, grok");
        log("Test D Passed");

        log("Test E");
        clearEnv();
        process.env.LLM_PROVIDER = 'mistral';
        assertThrows(() => ProviderFactory.getLLMProvider(), "Missing MISTRAL_API_KEY");
        log("Test E Passed");

        log("Test F");
        clearEnv();
        process.env.LLM_PROVIDER = 'mistral';
        process.env.MISTRAL_API_KEY = 'test_key';
        assertThrows(() => ProviderFactory.getLLMProvider(), "Missing MISTRAL_MODEL");
        log("Test F Passed");

        log("Test G");
        clearEnv();
        process.env.LLM_PROVIDER = 'grok';
        assertThrows(() => ProviderFactory.getLLMProvider(), "Missing GROK_API_KEY");
        log("Test G Passed");

        log("Test H");
        clearEnv();
        process.env.LLM_PROVIDER = 'grok';
        process.env.GROK_API_KEY = 'test_key';
        assertThrows(() => ProviderFactory.getLLMProvider(), "Missing GROK_MODEL");
        log("Test H Passed");

        log("Test I");
        clearEnv();
        process.env.LLM_PROVIDER = 'mistral';
        process.env.MISTRAL_API_KEY = 'test_key';
        process.env.MISTRAL_MODEL = 'test_model';
        process.env.OPENROUTER_API_KEY = '';
        ProviderFactory.getLLMProvider();
        log("Test I Passed");

        log("Test J");
        clearEnv();
        process.env.LLM_PROVIDER = 'grok';
        process.env.GROK_API_KEY = 'test_key';
        process.env.GROK_MODEL = 'test_model';
        process.env.OPENROUTER_API_KEY = '';
        ProviderFactory.getLLMProvider();
        log("Test J Passed");

        log("All Provider Factory Matrix Tests Passed!");
    } catch (e: any) {
        log(`CRITICAL FAILURE: ${e.stack}`);
    }

    process.env = originalEnv;
    fs.writeFileSync('test_results.log', logs.join('\n'));
}

runTests();
