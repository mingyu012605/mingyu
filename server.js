// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/ai', async (req, res) => {
  const userInput = req.body.prompt;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI CAD assistant. If the user says something simple like "hi" or "hello", just reply conversationally. If the user says a command like "rotate the model 30 degrees", respond with structured JSON like {"action": "rotate", "value": 30}.`
        },
        {
          role: 'user',
          content: userInput
        }
      ]
    });

    const aiMessage = response.data.choices[0].message.content;
    res.json({ content: aiMessage });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ message: 'OpenAI API error', detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
