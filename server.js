import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
const port = process.env.PORT || 10000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.post('/api/ai', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    res.json(completion.choices[0].message);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "OpenAI error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
