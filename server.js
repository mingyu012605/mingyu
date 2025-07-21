const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai'); // Correctly import OpenAI

const app = express();
const port = 3000; // Or any port you prefer

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

// Initialize OpenAI with your API key
// Replace 'YOUR_OPENAI_API_KEY' with your actual OpenAI API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY', // Use environment variable or fallback
});

// Endpoint for AI communication
app.post('/api/ai', async (req, res) => {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        const prompt = `You are an AI assistant for a 3D CAD editor. You can understand commands related to manipulating 3D models.
When responding with a command, always use a JSON object with an "action" and a "value".
If a command is not a direct manipulation or query, respond conversationally with a "conversational" action and a "message" value.

**Available Actions and Expected Values:**
- "rotate": {"action": "rotate", "value": <degrees_number>} (e.g., {"action": "rotate", "value": 45}) - Rotates the currently selected part or the entire model.
- "scale": {"action": "scale", "value": <scale_factor_number>} (e.g., {"action": "scale", "value": 2.0}) - Scales the currently selected part or the entire model.
- "translate": {"action": "translate", "value": {"x": <number>, "y": <number>, "z": <number>}} (e.g., {"action": "translate", "value": {"x": 10, "y": 0, "z": 5}}) - Moves the currently selected part or the entire model.
- "color": {"action": "color", "value": "<hex_color_code>"} (e.g., {"action": "color", "value": "#FF0000"}) - Changes the color of the currently selected part or the entire model.
- "hide": {"action": "hide", "value": true} - Hides the currently selected part or the entire model.
- "show": {"action": "show", "value": true} - Shows the currently selected part or the entire model.
- "duplicate": {"action": "duplicate", "value": true} - Duplicates the currently selected part or the entire model.
- "removeObject": {"action": "removeObject", "value": true} - Removes the currently selected part or the entire model.
- "resetView": {"action": "resetView", "value": true} - Resets the camera view.
- "designInfo": {"action": "designInfo", "value": true} - Provides information about the currently selected part or the entire model.
- "selectPart": {"action": "selectPart", "value": "<exact_part_name>"} - Selects a specific part of the model by its exact name.
    **IMPORTANT NOTE ON PART NAMES:** Part names are often technical, case-sensitive, and may include numbers, periods, or underscores (e.g., "EngineBlock", "LeftWing_001", "Mesh_Sphere.002"). If the user asks to select a part, you MUST ask them to provide the *exact* name if you don't know it, or try to infer it from common GLTF naming patterns if the request is generic (e.g., "missile" might be "Missile_001").

**Conversational Response Example:**
{"action": "conversational", "message": "I can help with that! What specific part are you referring to? Please tell me its exact name from the model."}

Consider the currently selected object for actions like 'rotate', 'scale', 'translate', 'color', 'hide', 'show', 'duplicate', 'removeObject'. If an object is selected, these actions apply to it. If no object is selected, they apply to the entire model.

User command: ${userPrompt}
Your response (JSON only):`;

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o", // Using gpt-4o as per your previous setup
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
            temperature: 0.7,
            response_format: { type: "json_object" }, // Ensure JSON output
        });

        // The response from OpenAI will be a JSON string inside the 'content' field
        const aiResponseContent = chatCompletion.choices[0].message.content;

        // Send the AI's content back to the frontend
        res.json({ content: aiResponseContent });

    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).json({ error: 'Failed to get response from AI.', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`AI backend listening at http://localhost:${port}`);
});
