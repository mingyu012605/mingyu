import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config(); // Proper ESM-compatible usage

const app = express();
const port = process.env.PORT || 3000;

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
      content: `You are an AI CAD assistant. The user may ask casual questions or give CAD commands like "rotate the model", "scale it up", or "reset view". Respond with natural replies for casual chat, and JSON commands for CAD actions.`,
    },
    {
      role: 'user',
      content: userInput,
    },
  ];

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.response?.data || err.message);
    res.status(500).json({ error: 'AI error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
