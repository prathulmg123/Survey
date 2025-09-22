document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const toggleButton = document.getElementById('toggleChat');
    const chatbotContainer = document.querySelector('.chatbot-container');

    // Toggle chat window
    toggleButton.addEventListener('click', function(e) {
        e.stopPropagation();
        chatbotContainer.classList.toggle('collapsed');
        if (!chatbotContainer.classList.contains('collapsed')) {
            // Auto-scroll to bottom when opening
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    });

    // Send message when clicking the send button
    sendButton.addEventListener('click', sendMessage);

    // Send message when pressing Enter
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Function to send a message
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        scrollToBottom();

        // Simulate bot response after a short delay
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            addMessage(botResponse, 'bot');
            scrollToBottom();
        }, 500);
    }

    // Function to add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
    }

    // Function to generate bot responses
    function getBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Simple response logic - can be expanded with more sophisticated NLP
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "Hello! How can I assist you today?";
        } else if (message.includes('how are you')) {
            return "I'm just a bot, but I'm functioning perfectly! How can I help you?";
        } else if (message.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        } else if (message.includes('bye') || message.includes('goodbye')) {
            return "Goodbye! Feel free to come back if you have more questions.";
        } else if (message.includes('help')) {
            return "I can help answer questions, provide information, or just chat. What would you like to know?";
        } else if (message.includes('name')) {
            return "I'm your friendly chatbot assistant!";
        } else if (message.includes('time')) {
            return "The current time is " + new Date().toLocaleTimeString();
        } else if (message.includes('date')) {
            return "Today's date is " + new Date().toLocaleDateString();
        } else {
            // Default response if no keywords match
            const responses = [
                "I'm not sure I understand. Could you rephrase that?",
                "That's interesting. Tell me more!",
                "I'm still learning. Could you ask me something else?",
                "I don't have an answer for that right now.",
                "Let me think about that..."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    // Function to auto-scroll to the bottom of the chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Close chat when clicking outside
    document.addEventListener('click', function(e) {
        if (!chatbotContainer.contains(e.target) && !chatbotContainer.classList.contains('collapsed')) {
            chatbotContainer.classList.add('collapsed');
        }
    });

    // Prevent clicks inside the chat from closing it
    chatWindow.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});