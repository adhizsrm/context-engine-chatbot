import * as fs from 'fs';

const BASE_URL = 'http://localhost:3000/api/chat';
const REDUX_ID = 'bee0d52c-6dcf-49b5-bbab-85b0c03d7970';
const EXPRESS_ID = '0e40365b-ba1d-433c-a93f-8781cc4ce7db';

async function req(name: string, payload: any) {
    console.log(`\n================= TEST: ${name} =================`);
    console.log(`Payload: ${JSON.stringify(payload)}`);
    const resp = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const data = await resp.json();
    console.log(`RESPONSE (snippet): ${data.response.substring(0, 100).replace(/\n/g, ' ')}...\n`);
    await new Promise(r => setTimeout(r, 2000)); // wait for file logging
}

async function run() {
    console.log("WAITING 2 SECONDS FOR SERVER TO START UP/RELOAD PROPERLY...");
    await new Promise(r => setTimeout(r, 2000));

    // TEST 1 — BASELINE / NO FILTER
    await req('1: BaseLine Unfiltered', { query: "What is Redux?" });

    // TEST 2 — FILTER TO REDUX DOCUMENT
    await req('2: Filter Redux Doc', { query: "What is Redux?", documentId: REDUX_ID });

    // TEST 3 — FILTER TO ANOTHER DOCUMENT
    await req('3: Filter Express Doc', { query: "What is Express?", documentId: EXPRESS_ID });

    // TEST 4 — CROSS-DOCUMENT ISOLATION (Redux query + Express doc)
    await req('4: Cross-Document (Redux on Express)', { query: "What is Redux?", documentId: EXPRESS_ID });

    // TEST 5 — REVERSE ISOLATION (Express query + Redux doc)
    await req('5: Reverse Isolation (Express on Redux)', { query: "What is Express?", documentId: REDUX_ID });
}

run().catch(console.error);
