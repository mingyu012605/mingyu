require('dotenv').config();
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const app = express();
const port = 10000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.post('/api/ai', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    res.json(completion.data.choices[0].message);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "OpenAI error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
