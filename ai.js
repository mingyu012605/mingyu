// ai.js - Handles communication with the AI backend server

// Function to send a message to the AI backend and get a response
async function sendToAI(message) {
    try {
        // Make a POST request to your backend server's /chat endpoint
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Indicate that we're sending JSON
            },
            body: JSON.stringify({ message: message }) // Send the user's message as JSON
        });

        // Check if the HTTP response was successful
        if (!response.ok) {
            // If not successful, throw an error with the status
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response from the backend
        const data = await response.json();

        // The backend sends back an object with a 'reply' property
        // This 'reply' can be a structured JSON object (for commands) or a simple string (for conversational replies)
        return data.reply;

    } catch (error) {
        // Log any errors during the fetch operation
        console.error('Error sending message to AI:', error);
        // Return an error message or a specific error object
        return { action: "error", value: "Failed to communicate with the AI backend." };
    }
}
