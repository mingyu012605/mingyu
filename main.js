const assistantOutput = document.getElementById("assistant-output");
const sendBtn = document.getElementById("send-btn");
const userInputField = document.getElementById("user-input");

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
      body: JSON.stringify({ prompt: message }) // ✅ FIXED: use "prompt" instead of "message"
    });

    const data = await res.json();

    if (data.content) {
      appendMessage("AI", data.content, "#00ff00");
      speakText(data.content);
    } else {
      appendMessage("AI", "AI error: Invalid response", "red");
    }
  } catch (err) {
    console.error("Error:", err);
    appendMessage("AI", "AI error occurred. Try again.", "red");
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

// Voice input
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = false;

document.getElementById("mic-btn").addEventListener("click", () => {
  appendMessage("System", "🎤 Listening...", "#9999ff");
  recognition.start();
});

recognition.onresult = (event) => {
  const speechToText = event.results[0][0].transcript;
  userInputField.value = speechToText;
  sendBtn.click();
};

recognition.onerror = (e) => {
  appendMessage("System", `🎤 Mic error: ${e.error}`, "orange");
};
