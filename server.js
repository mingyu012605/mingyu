require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 10000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/ai', async (req, res) => {
  const userInput = req.body.message;

  const messages = [
    {
      role: 'system',
      content: `You are an AI CAD assistant. The user will say commands or talk casually. 
Respond either with a conversational reply (if it's small talk like 'hi', 'how are you') 
or with a JSON object for CAD actions. Here are examples:

If user says:
- "rotate the model 45 degrees" → {"action":"rotate", "value":45}
- "scale it by 2.5" → {"action":"scale", "value":2.5}
- "reset the view" → {"action":"resetView"}
- "what part is this?" → {"action":"designInfo"}`
    },
    { role: 'user', content: userInput }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.5,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ reply: "AI error occurred. Try again." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
