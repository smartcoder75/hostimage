// Authentication Script for Login/Signup Page

document.addEventListener('DOMContentLoaded', function() {
  console.log('Auth.js loaded - DOMContentLoaded');
  
  // Handle Signup - Using button click instead of form submit
  const signupBtn = document.getElementById('sig_btn');
  console.log('Signup button found:', signupBtn);
  
  if (signupBtn) {
    signupBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('Signup button clicked');

      const username = document.getElementById('sig_username')?.value.trim();
      const email = document.getElementById('sig_email')?.value.trim();
      const password = document.getElementById('sig_password')?.value.trim();
      const msg = document.getElementById('register_msg');

      if (!username || !email || !password) {
        showMessage('Please fill in all fields', 'error', msg);
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error', msg);
        return;
      }

      // Validate password length
      if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error', msg);
        return;
      }

      try {
        showMessage('Creating account...', 'info', msg);
        console.log('Calling apiClient.register with:', { username, email });
        
        const response = await apiClient.register(username, email, password);
        console.log('Registration response:', response);
        
        showMessage('Account created successfully! Redirecting...', 'success', msg);
        
        // Clear form
        document.getElementById('sig_username').value = '';
        document.getElementById('sig_email').value = '';
        document.getElementById('sig_password').value = '';
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1500);
      } catch (error) {
        console.error('Registration error:', error);
        showMessage(error.message || 'Registration failed. Please try again.', 'error', msg);
      }
    });
  }

  // Handle Login - Using button click instead of form submit
  const loginButton = document.getElementById('log_btn');
  if (loginButton) {
    loginButton.addEventListener('click', async (e) => {
      e.preventDefault();

      const email = document.getElementById('log_email')?.value.trim();
      const password = document.getElementById('log_password')?.value.trim();
      const msg = document.getElementById('login_msg');

      if (!email || !password) {
        showMessage('Please fill in all fields', 'error', msg);
        return;
      }

      try {
        showMessage('Logging in...', 'info', msg);
        const response = await apiClient.login(email, password);
        
        showMessage('Login successful! Redirecting...', 'success', msg);
        
        // Clear form
        document.getElementById('log_email').value = '';
        document.getElementById('log_password').value = '';
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1500);
      } catch (error) {
        showMessage(error.message || 'Login failed. Please check your credentials.', 'error', msg);
      }
    });
  }

  // Show message function - Updated to support inline messages
  function showMessage(message, type = 'info', inlineElement = null) {
    // If inline element is provided, show message there
    if (inlineElement) {
      inlineElement.textContent = message;
      if (type === 'success') {
        inlineElement.style.color = '#4CAF50';
      } else if (type === 'error') {
        inlineElement.style.color = '#f44336';
      } else {
        inlineElement.style.color = '#2196F3';
      }
      return;
    }
    // Remove existing message if any
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.textContent = message;

    // Style the message
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    // Set color based on type
    if (type === 'success') {
      messageDiv.style.background = '#4CAF50';
      messageDiv.style.color = 'white';
    } else if (type === 'error') {
      messageDiv.style.background = '#f44336';
      messageDiv.style.color = 'white';
    } else if (type === 'info') {
      messageDiv.style.background = '#2196F3';
      messageDiv.style.color = 'white';
    }

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
      messageDiv.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
  }

  // Check if user is already logged in
  if (apiClient.isAuthenticated()) {
    const userData = getUserData();
    if (userData) {
      showMessage(`Already logged in as ${userData.username}. Redirecting...`, 'info');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2000);
    }
  }
});

// Express static middleware for serving public files
app.use('/public', express.static(path.join(__dirname, 'public')));
