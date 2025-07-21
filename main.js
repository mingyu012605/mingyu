const assistantOutput = document.getElementById("assistant-output");
const sendBtn = document.getElementById("send-btn");
const userInputField = document.getElementById("user-input");
const micBtn = document.getElementById("mic-btn");

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
      body: JSON.stringify({ prompt: message })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Backend error: ${errorData.message || res.statusText}`);
    }

    const rawResult = await res.json();
    console.log("Raw AI response:", rawResult);

    let resultData;
    try {
      const trimmed = rawResult.content.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        resultData = JSON.parse(trimmed);
        console.log("Parsed structured AI command:", resultData);
      } else {
        throw new Error("Not JSON");
      }
    } catch (e) {
      resultData = { action: 'conversational', value: rawResult.content };
      console.log("Parsed as conversational:", resultData);
    }

    if (resultData.action === 'conversational') {
      const responseText = resultData.value || resultData.message || "No response.";
      appendMessage("AI", responseText, "#00ff00");
      speakText(responseText);
    } else {
      const commandText = `🛠 Command: ${resultData.action}` + (resultData.value ? ` → ${JSON.stringify(resultData.value)}` : '');
      appendMessage("AI", commandText, "#00ff00");
      speakText(commandText);
      // TODO: Implement actual CAD command behavior here
    }

  } catch (err) {
    console.error("AI error:", err);
    appendMessage("AI", `⚠️ AI error: ${err.message}`, "red");
  }
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// Send message with button click
sendBtn.addEventListener("click", () => {
  const msg = userInputField.value.trim();
  if (msg !== "") {
    sendToAI(msg);
    userInputField.value = "";
  }
});

// Send message with Enter key
userInputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// 🎙️ Voice input (if supported)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

if (micBtn) {
  micBtn.addEventListener("click", () => {
    if (!micBtn.classList.contains("active")) {
      recognition.start();
      micBtn.classList.add("active");
      micBtn.textContent = "🔴 Listening...";
      appendMessage("System", "🎤 Voice input started. Please speak.");
    } else {
      recognition.stop();
      micBtn.classList.remove("active");
      micBtn.textContent = "🎙️ Mic Off";
      appendMessage("System", "🛑 Voice input stopped.");
    }
  });
} else {
  console.warn("❗ No #mic-btn found. Voice input disabled.");
}

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  userInputField.value = transcript;
  sendBtn.click();
  micBtn.classList.remove("active");
  micBtn.textContent = "🎙️ Mic Off";
};

recognition.onerror = (event) => {
  console.error("🎤 Speech recognition error:", event.error);
  appendMessage("System", `❌ Mic error: ${event.error}`, "red");
  micBtn.classList.remove("active");
  micBtn.textContent = "🎙️ Mic Off";
};

recognition.onend = () => {
  if (micBtn && micBtn.classList.contains("active")) {
    micBtn.classList.remove("active");
    micBtn.textContent = "🎙️ Mic Off";
  }
  appendMessage("System", "🎤 Speech recognition ended.", "gray");
};
