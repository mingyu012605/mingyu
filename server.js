require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OpenAI API Key is not set. Make sure it's defined in the Render environment variables.");
  process.exit(1);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const systemPrompt = `
You are an AI CAD assistant. When the user sends casual small talk like "hi", reply naturally.
If the user gives an instruction like "rotate the model 45 degrees", respond with a JSON command like:
{"action": "rotate", "value": 45}

If you are confident the user is referring to a specific part of the CAD model, use:
{"action": "selectPart", "value": "InferredPartName"}

Keep all JSON outputs flat and short.
`;

app.post('/api/ai', async (req, res) => {
  const userInput = req.body.prompt;

  if (!userInput) {
    return res.status(400).json({ message: "Missing prompt in request." });
  }

  try {
    const chatResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput }
      ]
    });

    const reply = chatResponse.data.choices[0].message.content.trim();
    res.json({ content: reply });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ message: "OpenAI API error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ AI server running at http://localhost:${port}`);
});
