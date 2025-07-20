const aiLog = document.getElementById('ai-log');
const sendBtn = document.getElementById('send-btn');
const inputBox = document.getElementById('input-box');
const micBtn = document.getElementById('mic-btn');

sendBtn.addEventListener('click', () => {
    const userInput = inputBox.value.trim();
    if (userInput) {
        sendToAI(userInput);
        inputBox.value = '';
    }
});

function sendToAI(text) {
    addMessageToLog('User', text);

    fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
        if (data.action === 'conversational') {
            speakText(data.value);
            addMessageToLog('AI', data.value);
        } else if (data.action === 'error') {
            addMessageToLog('AI', data.value);
        } else {
            // Placeholder for CAD commands like rotate/scale/etc
            addMessageToLog('system', `Received command: ${JSON.stringify(data)}`);
        }
    })
    .catch(err => {
        console.error('AI error:', err);
        addMessageToLog('system', '⚠️ Could not connect to AI.');
    });
}

function addMessageToLog(sender, msg) {
    const entry = document.createElement('p');
    entry.className = sender === 'User' ? 'user-message' : sender === 'AI' ? 'ai-response' : 'system-message';
    entry.textContent = `${sender}: ${msg}`;
    aiLog.appendChild(entry);
    aiLog.scrollTop = aiLog.scrollHeight;
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
}

// Voice input
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    micBtn.addEventListener('click', () => {
        recognition.start();
        addMessageToLog('System', '🎙️ Listening...');
    });

    recognition.onresult = event => {
        const voiceText = event.results[0][0].transcript;
        addMessageToLog('User', voiceText);
        sendToAI(voiceText);
    };

    recognition.onerror = err => {
        console.error('Speech recognition error:', err);
        addMessageToLog('System', '🎤 Speech recognition failed.');
    };
}
