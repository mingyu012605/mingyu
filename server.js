// Load environment variables
require('dotenv').config();
console.log("🔐 Loaded API Key:", process.env.OPENAI_API_KEY); // Debug line

// Imports
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const bodyParser = require('body-parser');

// Setup app
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// OpenAI setup
const openai = new OpenAI();

// Server log
app.listen(port, () => {
    console.log(`🚀 GPT CAD Assistant running at http://localhost:${port}`);
});

// POST endpoint to process voice input
app.post('/ai', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Missing message' });
    }

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a voice command assistant for a 3D CAD viewer. Respond ONLY with one of the following function names:
                    - resetView
                    - removeObject
                    - showDesignInfo
                    - goBack
                    - stopAI

                    If none match, respond with "unknown".`
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.1
        });

        const reply = chatCompletion.choices?.[0]?.message?.content?.trim();
        console.log("🤖 AI Response:", reply);

        res.json({ reply });
    } catch (error) {
        console.error('❌ OpenAI error:', error);
        res.status(500).json({ error: 'OpenAI failed' });
    }
});
