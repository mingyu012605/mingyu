import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ NEW OpenAI SDK Usage
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/ai', async (req, res) => {
  const userInput = req.body.message;

  const messages = [
    {
      role: 'system',
      content: `You are an AI CAD assistant. Help with natural voice and JSON replies.`
    },
    {
      role: 'user',
      content: userInput
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'AI error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
