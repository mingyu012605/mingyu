// netlify/functions/ai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    try {
        const { command } = JSON.parse(event.body);

        // Access your API key from Netlify Environment Variables
        const API_KEY = process.env.GEMINI_API_KEY; 

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "GEMINI_API_KEY is not set in Netlify environment variables." }),
            };
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const chatHistory = [
            {
                role: "user",
                parts: [{ text: "You are an AI assistant for a 3D CAD editor. Your primary function is to interpret user commands to manipulate a 3D model (rotate, scale, move, color). If the user's input is not a CAD command, respond conversationally and politely. For conversational responses, set `action` to 'conversational' and place the conversational text in the `value` field. Always respond in JSON format according to the provided schema." }]
            }
        ];

        const payload = {
            contents: [...chatHistory, { role: "user", parts: [{ text: command }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "action": { "type": "STRING", "description": "The action to perform (e.g., 'rotate', 'scale', 'move', 'color', 'conversational', 'error')." },
                        "value": { "type": ["STRING", "NUMBER", "OBJECT"], "description": "The value associated with the action. For 'rotate' it's degrees, for 'scale' it's a factor, for 'move' it's an object {x, y, z}, for 'color' it's a hex string, for 'conversational' it's a string message." },
                        "message": { "type": "STRING", "description": "A conversational message to the user, used for 'conversational' action." }
                    },
                    "propertyOrdering": ["action", "value", "message"]
                }
            }
        };

        const result = await model.generateContent(payload.contents, payload.generationConfig);
        const responseText = result.response.text(); // Get the raw text response from Gemini

        let parsedJson;
        try {
            // Remove markdown code block fences if present
            let jsonString = responseText;
            if (jsonString.startsWith('```json\n') && jsonString.endsWith('\n```')) {
                jsonString = jsonString.substring(8, jsonString.length - 4);
            }
            parsedJson = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Backend JSON parsing failed:", parseError);
            return {
                statusCode: 200, // Still return 200, but with an error action
                body: JSON.stringify({ action: "error", value: "AI returned unparseable JSON." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(parsedJson), // Send the parsed JSON back to the frontend
        };

    } catch (error) {
        console.error("Netlify Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process AI request.", details: error.message }),
        };
    }
};
