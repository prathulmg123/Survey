document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_URL = 'http://vpn.seqato.com:8001/api/surveys/start';
    
    // DOM Elements
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const minimizeButton = document.getElementById('minimizeChat');
    const closeButton = document.getElementById('closeChat');
    const chatbotContainer = document.querySelector('.chatbot-container');
    
    // Auth Elements
    const authOverlay = document.getElementById('authOverlay');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const emailAuthForm = document.getElementById('emailAuthForm');
    const googleSignInBtn = document.getElementById('googleSignIn');
    const googleSignInFullBtn = document.getElementById('googleSignInFull');
    const tabSwitchBtns = document.querySelectorAll('.auth-tab-switch');
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    
    // Always show auth modal on page load
    authOverlay.style.display = 'flex';
    chatbotContainer.style.display = 'none';
    
    // Clear any previous authentication
    localStorage.removeItem('chatbot_authenticated');
    localStorage.removeItem('chatbot_user_data');
    
    // For testing: Uncomment the following lines to enable auto-login with test credentials
    // const testUser = {
    //     name: 'Test User',
    //     email: 'test@example.com',
    //     authMethod: 'test',
    //     authenticatedAt: new Date().toISOString()
    // };
    // localStorage.setItem('chatbot_user_data', JSON.stringify(testUser));
    // localStorage.setItem('chatbot_authenticated', 'true');
    // authOverlay.style.display = 'none';
    // chatbotContainer.style.display = 'block';
    
    // Tab switching functionality
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${tabName}AuthForm`).classList.add('active');
        });
    });
    
    // Tab switch buttons (e.g., "Use email instead")
    tabSwitchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            const tabToActivate = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
            if (tabToActivate) tabToActivate.click();
        });
    });
    
    // Handle email form submission
    emailAuthForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = userNameInput.value.trim();
        const email = userEmailInput.value.trim();
        
        if (!name || !email) {
            alert('Please fill in all fields');
            return;
        }
        
        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Save user data
        const userData = {
            name,
            email,
            authMethod: 'email',
            authenticatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('chatbot_user_data', JSON.stringify(userData));
        localStorage.setItem('chatbot_authenticated', 'true');
        
        // Hide auth modal and show chat
        authOverlay.style.display = 'none';
        chatbotContainer.style.display = 'block';
        
        // Start survey if survey ID is present
        if (window.surveyContext?.surveyId) {
            startSurvey();
        }
    });
    
    // Handle Google Sign In (placeholder - you'll need to implement actual Google OAuth)
    function handleGoogleSignIn() {
        // This is a placeholder. In a real app, you would integrate with Google OAuth
        // For now, we'll simulate a successful Google sign-in
        const userData = {
            name: 'Google User',
            email: 'user@example.com',
            authMethod: 'google',
            authenticatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('chatbot_user_data', JSON.stringify(userData));
        localStorage.setItem('chatbot_authenticated', 'true');
        
        // Hide auth modal and show chat
        authOverlay.style.display = 'none';
        chatbotContainer.style.display = 'block';
        
        // Start survey if survey ID is present
        if (window.surveyContext?.surveyId) {
            startSurvey();
        }
    }
    
    // Add click handlers for Google sign-in buttons
    if (googleSignInBtn) googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    if (googleSignInFullBtn) googleSignInFullBtn.addEventListener('click', handleGoogleSignIn);

    // Handle minimize button if it exists
    if (minimizeButton) {
        minimizeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            // Toggle minimized state
            chatbotContainer.classList.toggle('minimized');
        });
    }

    // Handle close button if it exists
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            // Hide the chat container
            chatbotContainer.style.display = 'none';
        });
    }

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
        userInput.focus();
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
        
        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('message-avatar');
        avatarDiv.textContent = sender === 'bot' ? 'AI' : 'You';
        
        // Create message content container
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        // Create message text
        const textDiv = document.createElement('div');
        textDiv.classList.add('message-text');
        textDiv.textContent = text;
        
        // Create timestamp
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-time');
        timeDiv.textContent = getCurrentTime();
        
        // Assemble the message
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timeDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        // Add to chat
        chatMessages.appendChild(messageDiv);
    }
    
    // Helper function to get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    // Function to start the survey
    async function startSurvey() {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    guide_id: window.surveyContext?.surveyId || ''
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start survey');
            }

            const data = await response.json();
            console.log('Survey started successfully:', data);
            
            // Update chat with welcome message from API if available
            if (data.welcome_message) {
                addMessage(data.welcome_message, 'bot');
                scrollToBottom();
            }
            
            return data;
        } catch (error) {
            console.error('Error starting survey:', error);
            // Show error message to user
            addMessage('Sorry, I had trouble connecting to the survey. Please try again later.', 'bot');
            scrollToBottom();
        }
    }

    // Start the survey when the page loads if user is already authenticated
    if (isAuthenticated && window.surveyContext?.surveyId) {
        startSurvey();
    }

    // Handle clicks outside the chat (optional)
    document.addEventListener('click', function(e) {
        // Add any outside click handling here if needed
    });
});