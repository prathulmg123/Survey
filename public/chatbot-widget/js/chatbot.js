document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    const isAuthenticated = localStorage.getItem('chatbot_authenticated') === 'true';
    
    // API Configuration
    const API_URL = 'http://vpn.seqato.com:8001/api/surveys/start';
    const WS_URL = 'ws://vpn.seqato.com:8001/ws/chat/'; // WebSocket URL
    
    // WebSocket connection state
    let socket = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 3000; // 3 seconds
    
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
    emailAuthForm.addEventListener('submit', async function(e) {
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

        // Show loading state
        const submitBtn = emailAuthForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
        
        try {
            // Call startSurvey with user data
            await startSurvey({
                guide_id: window.surveyContext?.surveyId || '',
                email: userData.email,
                username: userData.name
            });
            
            // Only save auth state and show chat if API call is successful
            localStorage.setItem('chatbot_user_data', JSON.stringify(userData));
            localStorage.setItem('chatbot_authenticated', 'true');
            
            // Hide auth modal and show chat
            authOverlay.style.display = 'none';
            chatbotContainer.style.display = 'block';
            
            // Focus on the input field
            userInput.focus();
        } catch (error) {
            console.error('Authentication failed:', error);
            alert('Failed to start the chat. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
    
    // Handle Google Sign In with Google Identity Services
    function handleGoogleSignIn() {
        // Load the Google API client library
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.head.appendChild(script);
    }
    
    // Initialize Google Sign-In
    function initializeGoogleSignIn() {
        if (!window.google) {
            console.error('Google Sign-In failed to load');
            return;
        }
        
        // Configure Google client
        try {
            const clientId = '29816798151-jm2ioshu4q9ei3cb4qnn8rdm90tc8cb2.apps.googleusercontent.com';
            
            // Validate client ID format
            if (!clientId || !clientId.endsWith('.apps.googleusercontent.com')) {
                throw new Error('Invalid Google Client ID format');
            }
            
            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse,
                auto_select: false,
                ux_mode: 'popup',
                context: 'signin'
            });
            
            console.log('Google Sign-In initialized with client ID:', clientId);
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
            alert('Failed to initialize Google Sign-In. Please check the configuration.');
            return;
        }
        
        // Show the Google Sign-In button
        google.accounts.id.renderButton(
            document.getElementById('googleSignIn'),
            {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: '100%',
                height: '40'
            }
        );
        
        // Also show the One Tap prompt
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Continue with the normal sign-in flow
            }
        });
    }
    
    // Handle Google Sign-In response
    function handleGoogleResponse(response) {
        try {
            // Decode the JWT token
            const responsePayload = parseJwt(response.credential);
            
            console.log('Google Sign-In successful:', responsePayload);
            
            // Extract user data
            const userData = {
                name: responsePayload.name || responsePayload.given_name,
                email: responsePayload.email,
                picture: responsePayload.picture,
                authMethod: 'google',
                authenticatedAt: new Date().toISOString(),
                googleId: responsePayload.sub
            };
            
            // Save user data
            localStorage.setItem('chatbot_user_data', JSON.stringify(userData));
            localStorage.setItem('chatbot_authenticated', 'true');
            
            // Hide auth modal and show chat
            authOverlay.style.display = 'none';
            chatbotContainer.style.display = 'block';
            
            // Start survey if survey ID is present
            if (window.surveyContext?.surveyId) {
                startSurvey({
                    guide_id: window.surveyContext.surveyId,
                    email: userData.email,
                    username: userData.name
                });
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            alert('Failed to sign in with Google. Please try again.');
        }
    }
    
    // Helper function to parse JWT token
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT:', e);
            return {};
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

    // Add event listeners
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Handle window close to clean up WebSocket
    window.addEventListener('beforeunload', () => {
        if (socket) {
            socket.close();
        }
    });

    // Handle incoming WebSocket messages
    function handleIncomingMessage(data) {
        console.log('Received message:', data);
        
        if (data.type === 'message' && data.content) {
            // Hide thinking indicator when we receive a message
            hideThinkingIndicator();
            addMessage(data.content, 'bot');
            scrollToBottom();
        } else if (data.type === 'typing') {
            // Handle typing indicator if needed
            console.log('Bot is typing...');
        } else if (data.type === 'error') {
            console.error('Server error:', data.message);
            addMessage('Sorry, an error occurred. Please try again.', 'bot');
        }
    }

    // Function to show thinking indicator
    function showThinkingIndicator() {
        // Remove any existing thinking indicator
        const existingIndicator = document.getElementById('thinking-indicator');
        if (existingIndicator) return;
        
        // Create and show thinking indicator
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message bot-message';
        thinkingDiv.id = 'thinking-indicator';
        thinkingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-comment-dots"></i>
            </div>
            <div class="message-content">
                <div class="message-text thinking-bubble">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(thinkingDiv);
        scrollToBottom();
    }
    
    // Function to hide thinking indicator
    function hideThinkingIndicator() {
        const thinkingEl = document.getElementById('thinking-indicator');
        if (thinkingEl) {
            thinkingEl.remove();
        }
    }

    // Function to send a message
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show thinking indicator
        showThinkingIndicator();

        // Send message via WebSocket
        const messageSent = sendWebSocketMessage({
            type: 'message',
            content: message,
            timestamp: new Date().toISOString()
        });

        if (!messageSent) {
            // Fallback to local response if WebSocket is not available
            setTimeout(() => {
                hideThinkingIndicator();
                const botResponse = getBotResponse(message);
                addMessage(botResponse, 'bot');
            }, 1000);
        }
    }

    // Function to add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        // Create avatar with icon
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        // Create icon element
        const icon = document.createElement('i');
        if (sender === 'bot') {
            // Different bot icons for variety
            const botIcons = ['fa-comment-dots'];
            const randomIcon = botIcons[Math.floor(Math.random() * botIcons.length)];
            icon.className = `fas ${randomIcon}`;
        } else {
            icon.className = 'fas fa-user';
        }
        avatarDiv.appendChild(icon);
        
        // Create message content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Create message text
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        
        // Check if the text contains HTML or is plain text
        if (/<[a-z][\s\S]*>/i.test(text)) {
            textDiv.innerHTML = text;
        } else {
            textDiv.textContent = text;
        }
        
        // Create timestamp
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = getCurrentTime();
        
        // Assemble the message
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timeDiv);
        
        // Always add avatar first, then content for both user and bot
        // The CSS will handle the positioning based on the message type
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        // Add to chat and scroll to bottom
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        // Add animation class
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
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

    // Initialize WebSocket connection
    function initWebSocket(webSocketUrl, onMessage) {
        if (socket) {
            socket.close();
        }

        console.log('Connecting to WebSocket:', webSocketUrl);
        updateConnectionStatus('connecting');
        
        try {
            socket = new WebSocket(webSocketUrl);
            reconnectAttempts = 0;

            socket.onopen = () => {
                console.log('WebSocket connected');
                updateConnectionStatus('connected');
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'pong') return; // Ignore pong messages
                    onMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
                }
            };

            socket.onclose = (event) => {
                console.log('WebSocket disconnected:', event);
                updateConnectionStatus('disconnected');
                
                // Clear ping interval on close
                if (window.pingInterval) {
                    clearInterval(window.pingInterval);
                }
                
                // Don't attempt to reconnect if the close was clean
                if (event.code === 1000) {
                    console.log('WebSocket connection closed cleanly');
                    return;
                }
                
                // Show error message to user
                const errorMessage = 'We are facing some issues. Please try after some time.';
                if (document.querySelector('.chat-messages')) {
                    addMessage(errorMessage, 'bot');
                }
                
                // Attempt to reconnect
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000); // Cap at 30s
                    console.log(`Reconnecting in ${delay/1000} seconds... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                    setTimeout(() => initWebSocket(webSocketUrl, onMessage), delay);
                } else {
                    console.error('Max reconnection attempts reached');
                    updateConnectionStatus('error', 'Connection lost. Please refresh the page.');
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                updateConnectionStatus('error', 'Connection error');
                
                // Show error message to user
                const errorMessage = 'We are facing some issues. Please try after some time.';
                if (document.querySelector('.chat-messages')) {
                    addMessage(errorMessage, 'bot');
                }
                
                // Try to reconnect on error
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
                    console.log(`Reconnecting after error in ${delay/1000} seconds...`);
                    setTimeout(() => initWebSocket(webSocketUrl, onMessage), delay);
                }
            };

            return socket;
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            updateConnectionStatus('error', 'Failed to connect');
            
            // Try to reconnect if possible
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
                console.log(`Retrying connection in ${delay/1000} seconds...`);
                setTimeout(() => initWebSocket(webSocketUrl, onMessage), delay);
            }
            
            throw error;
        }
    }

    // Update connection status in the UI
    function updateConnectionStatus(status, message = '') {
        const statusElement = document.getElementById('connectionStatus');
        const statusIndicator = document.querySelector('.status');
        
        if (!statusElement || !statusIndicator) return;

        // Update connection status bar
        statusElement.className = `connection-status ${status}`;
        
        const statusText = {
            'connected': 'Connected',
            'connecting': 'Connecting...',
            'disconnected': 'Disconnected',
            'error': message || 'Connection error'
        }[status] || '';

        statusElement.textContent = statusText;
        
        // Update the online/offline indicator in the header
        if (status === 'connected') {
            statusIndicator.textContent = 'Online';
            statusIndicator.className = 'status online';
        } else {
            statusIndicator.textContent = 'Offline';
            statusIndicator.className = 'status offline';
            
            // For connecting state, show a pulsing animation
            if (status === 'connecting') {
                statusIndicator.textContent = 'Connecting...';
                statusIndicator.className = 'status connecting';
            }
        }
    }

    // Function to send a message via WebSocket
    function sendWebSocketMessage(message) {
        try {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const messageStr = JSON.stringify(message);
                console.log('Sending WebSocket message:', messageStr);
                socket.send(messageStr);
                return true;
            }
            
            console.error('WebSocket is not connected. Current state:', socket ? socket.readyState : 'No socket');
            updateConnectionStatus('error', 'Not connected. Trying to reconnect...');
            
            // Show error message to user
            const errorMessage = 'We are facing some issues. Please try after some time.';
            if (document.querySelector('.chat-messages')) {
                addMessage(errorMessage, 'bot');
            }
            
            // Try to reconnect if we have a chat session ID
            if (window.chatSessionId) {
                const userData = JSON.parse(localStorage.getItem('chatbot_user_data') || '{}');
                if (userData) {
                    startSurvey({
                        guide_id: window.surveyContext?.surveyId || '',
                        email: userData.email,
                        username: userData.name
                    }).catch(error => {
                        console.error('Failed to reconnect:', error);
                        if (document.querySelector('.chat-messages')) {
                            addMessage('Unable to reconnect. Please refresh the page and try again.', 'bot');
                        }
                    });
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            updateConnectionStatus('error', 'Failed to send message');
            return false;
        }
    }

    // Function to start the survey and initialize WebSocket
    async function startSurvey(userData) {
        if (!userData || !userData.guide_id || !userData.email || !userData.username) {
            throw new Error('Invalid user data provided');
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    guide_id: userData.guide_id,
                    email: userData.email,
                    username: userData.username
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(errorData.message || 'Failed to start survey');
            }
            
            const responseData = await response.json();
            
            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to start chat session');
            }
            
            const { data } = responseData;
            console.log('Survey started successfully:', data);
            
            // Store the chat ID for future reference
            if (data.chat_id) {
                window.chatSessionId = data.chat_id;
            }
            
            // Initialize WebSocket connection with the provided URL
            if (data.websocket_url) {
                initWebSocket(data.websocket_url, handleIncomingMessage);
            }
            
            // We'll show the welcome message when it comes through the WebSocket
            
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
        const userData = JSON.parse(localStorage.getItem('chatbot_user_data') || '{}');
        if (userData.email && userData.name) {
            startSurvey({
                guide_id: window.surveyContext.surveyId,
                email: userData.email,
                username: userData.name
            }).then(() => {
                authOverlay.style.display = 'none';
                chatbotContainer.style.display = 'block';
            }).catch(error => {
                console.error('Failed to resume chat:', error);
                // Clear auth state on failure
                localStorage.removeItem('chatbot_authenticated');
                localStorage.removeItem('chatbot_user_data');
                authOverlay.style.display = 'flex';
            });
        } else {
            // Clear invalid auth state
            localStorage.removeItem('chatbot_authenticated');
            localStorage.removeItem('chatbot_user_data');
            authOverlay.style.display = 'flex';
        }
    }

    // Handle clicks outside the chat (optional)
    document.addEventListener('click', function(e) {
        // Add any outside click handling here if needed
    });
});