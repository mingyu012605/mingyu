app.post('/api/ai', async (req, res) => {
  const userInput = req.body.message; // 👈 Fix: match with client

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
- "what part is this?" → {"action":"designInfo"}
`
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
    res.json({ reply }); // 👈 Must send back JSON
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ reply: "AI error occurred. Try again." });
  }
});
