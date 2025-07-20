import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/ai', async (req, res) => {
  const prompt = req.body.prompt || req.body.message;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ reply: completion.choices[0].message.content }); // ✅ Fixed
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
