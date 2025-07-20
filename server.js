require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post('/api/ai', async (req, res) => {
    const userInput = req.body.message;

    const messages = [
        {
            role: 'system',
            content: `You are an AI CAD assistant. Respond ONLY with valid JSON like:
{"action":"rotate","value":45}
{"action":"scale","value":2}
{"action":"move","value":{"x":-3,"y":2,"z":0}}
{"action":"color","value":"#ff0000"}
{"action":"conversational","value":"Hi there!"}
{"action":"error","value":"Sorry, I didn't understand."}
No text outside of JSON.`
        },
        { role: 'user', content: userInput }
    ];

    try {
        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages,
            temperature: 0.5
        });

        const reply = completion.data.choices[0].message.content;

        let parsed;
        try {
            parsed = JSON.parse(reply);
        } catch (e) {
            parsed = { action: 'error', value: 'AI returned invalid JSON.' };
        }

        res.json(parsed);
    } catch (error) {
        console.error('AI API Error:', error);
        res.status(500).json({ action: 'error', value: 'Failed to connect to AI.' });
    }
});

app.listen(port, () => {
    console.log(`✅ Server listening at http://localhost:${port}`);
});
