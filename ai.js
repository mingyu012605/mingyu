async function sendToAI(userCommand) {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: userCommand })
        });

        const result = await response.json();

        if (!result || !result.reply) {
            console.error("No reply from server.");
            return { action: "error", value: "No reply from AI." };
        }

        // Try to extract JSON from the AI's message
        let actionData = null;

        // Extract JSON block from reply using regex
        const match = result.reply.match(/{[\s\S]*}/);
        if (match) {
            try {
                actionData = JSON.parse(match[0]);
            } catch (err) {
                console.error("JSON parsing failed:", err);
                return { action: "error", value: "Could not parse AI response." };
            }
        } else {
            console.warn("No JSON structure found in AI reply. Fallback to plain message.");
            return { action: "conversational", value: result.reply.trim() };
        }

        // Ensure response has required keys
        if (!actionData.action) {
            return { action: "conversational", value: result.reply.trim() };
        }

        return actionData;

    } catch (error) {
        console.error("Error communicating with AI backend:", error);
        return { action: "error", value: error.message };
    }
}
