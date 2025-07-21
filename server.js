import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { OpenAI } from 'openai';

const app = express();
const port = 10000; // Ensure this port matches what your frontend is trying to connect to

app.use(cors()); // Enables CORS for all routes
app.use(bodyParser.json()); // Parses incoming request bodies as JSON

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Make sure your .env file has OPENAI_API_KEY set
});

app.post('/api/ai', async (req, res) => {
  // 🎉 FIXED: Changed from req.body.message to req.body.prompt
  // This matches the 'prompt' key sent by your frontend (index.html's sendToAI function)
  const userInput = req.body.prompt;

  if (!userInput) {
    return res.status(400).json({ message: 'No prompt provided in the request body.' });
  }

  const messages = [
    {
      role: 'system',
      content: `You are an AI CAD assistant. The user will say commands or talk casually.
Respond either with a conversational reply (if it's small talk like 'hi', 'how are you')
or with a **JSON object for CAD actions**. For JSON responses, **do not include any other text besides the JSON itself**. Here are examples:

If user says:
- "rotate the model 45 degrees" → {"action":"rotate", "value":45}
- "scale it by 2.5" → {"action":"scale", "value":2.5}
- "reset the view" → {"action":"resetView"}
- "what part is this?" → {"action":"designInfo", "value":"This is a detailed part of a CAD model."}
- "change color to red" → {"action":"color", "value":"#FF0000"}
- "move by X 10" → {"action":"move", "value":{"x":10, "y":0, "z":0}}` // Added more specific examples for move and color
    },
    { role: 'user', content: userInput }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using the specified gpt-4o model
      messages,
      temperature: 0.7, // Adjust creativity (0.0 for deterministic, 1.0 for highly creative)
      max_tokens: 150, // Limit response length
    });

    // The frontend expects a JSON object with a 'content' field
    // It will then attempt to parse this 'content' if it's a JSON string.
    res.json({ content: completion.choices[0].message.content });

  } catch (error) {
    console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error processing your request with AI.', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
