const assistantOutput = document.getElementById("assistant-output");
const sendBtn = document.getElementById("send-btn");
const userInputField = document.getElementById("user-input");
const micBtn = document.getElementById("mic-btn"); // Assuming you have a mic-btn in your HTML if using voice input

function appendMessage(sender, text, color = 'white') {
  assistantOutput.innerHTML += `<div style="color:${color}"><strong>${sender}:</strong> ${text}</div>`;
  assistantOutput.scrollTop = assistantOutput.scrollHeight;
}

async function sendToAI(message) {
  appendMessage("User", message, "#00ffff");

  try {
    const res = await fetch("https://mingyu.onrender.com/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: message }) // Ensure 'prompt' matches backend
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Backend error: ${errorData.message || res.statusText}`);
    }

    const rawResult = await res.json(); // This will be { content: "..." }
    console.log("Raw AI response from backend (main.js):", rawResult);

    let resultData;
    try {
        // Attempt to parse as JSON for commands
        resultData = JSON.parse(rawResult.content);
        console.log("Parsed AI command (main.js):", resultData);
    } catch (e) {
        // If parsing fails, it's likely conversational text
        resultData = { action: 'conversational', value: rawResult.content };
        console.log("Parsed AI conversational response (main.js):", resultData);
    }

    // Now handle the resultData object (either command or conversational)
    if (resultData.action === 'conversational') {
        const responseText = resultData.value || resultData.message;
        if (responseText) {
            appendMessage("AI", responseText, "#00ff00");
            speakText(responseText);
        } else {
            appendMessage("AI", "AI error: Empty conversational response", "red");
        }
    } else {
        // This block handles structured commands. You'll need to define how to act on them here.
        // For now, it will just log and speak that a command was received.
        const commandText = `Received AI command: ${resultData.action}` + (resultData.value ? ` with value: ${JSON.stringify(resultData.value)}` : '');
        appendMessage("AI", commandText, "#00ff00");
        speakText(commandText);
        // TODO: Implement actual command execution logic here if main.js is also meant to control the CAD model
        // Example: if (resultData.action === 'rotate') { /* call rotation function */ }
    }

  } catch (err) {
    console.error("Error in main.js sendToAI:", err);
    appendMessage("AI", `AI error occurred: ${err.message}. Try again.`, "red");
  }
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// Send with Enter or button
sendBtn.addEventListener("click", () => {
  const msg = userInputField.value.trim();
  if (msg !== "") {
    sendToAI(msg);
    userInputField.value = "";
  }
});

userInputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Voice input (assuming webkitSpeechRecognition is available)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = false; // Set to true if you want continuous listening
recognition.interimResults = false; // Set to true to get interim results

// You need a button with id="mic-btn" in your HTML for this to work
if (micBtn) {
    micBtn.addEventListener("click", () => {
        if (!micBtn.classList.contains('active')) {
            recognition.start();
            micBtn.classList.add('active');
            micBtn.textContent = '🔴 Listening...';
            appendMessage("System", "Voice input started. Please speak.");
        } else {
            recognition.stop();
            micBtn.classList.remove('active');
            micBtn.textContent = '🎙️ Mic Off';
            appendMessage("System", "Voice input stopped.");
        }
    });
} else {
    console.warn("Element with ID 'mic-btn' not found. Voice input will not work.");
}


recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  userInputField.value = transcript; // Populate input field with transcript
  sendBtn.click(); // Automatically send the command
  micBtn.classList.remove('active');
  micBtn.textContent = '🎙️ Mic Off';
};

recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
  appendMessage("System", `Speech recognition error: ${event.error}`, "red");
  micBtn.classList.remove('active');
  micBtn.textContent = '🎙️ Mic Off';
};

recognition.onend = () => {
  if (micBtn && micBtn.classList.contains('active')) { // If it ended but was still "active", restart it or indicate
    micBtn.classList.remove('active');
    micBtn.textContent = '🎙️ Mic Off';
  }
  appendMessage("System", "Speech recognition ended.", "gray");
};
