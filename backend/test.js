async function testSequence() {
    const queries = [
        "What is Redux?",
        "What is Middleware?",
        "What is TypeScript?",
        "What is Express?",
        "Explain it again."
    ];

    for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        console.log(`\n\n--- Testing: ${query} ---`);

        try {
            const resp = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            const data = await resp.json();
            console.log(`Response: ${data.response?.substring(0, 50)}...`);
        } catch (e) {
            console.error(`Error:`, e);
        }

        // Wait 1.5 seconds between requests
        await new Promise(r => setTimeout(r, 1500));
    }
}
testSequence();
