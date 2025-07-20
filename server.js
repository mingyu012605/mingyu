require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

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

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI CAD assistant. 
You can talk casually or respond with actions.

If user says:
- "hi" or "how are you?" → respond normally
- "rotate 45 degrees" → {"action":"rotate", "value":45}
- "scale it by 2" → {"action":"scale", "value":2}
- "reset view" → {"action":"resetView"}

Only return JSON for CAD commands. Otherwise, talk like a helpful assistant.`,
        },
        { role: 'user', content: userInput },
      ],
    });

    const aiResponse = completion.data.choices[0].message.content.trim();

    // If it's JSON, try to parse and send directly
    try {
      const parsed = JSON.parse(aiResponse);
      res.json(parsed);
    } catch (e) {
      // Otherwise, treat it as a normal reply
      res.json({ action: 'conversational', value: aiResponse });
    }
  } catch (error) {
    console.error('OpenAI Error:', error?.response?.data || error.message);
    res.json({ action: 'error', value: 'AI error occurred. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
