// content.js
const API_ENDPOINT = 'http://localhost:5000/improve-email';
let settings = {
  apiKey: '',
  improvementLevel: 'standard' // standard, professional, casual
};

// Load settings
chrome.storage.sync.get(['apiKey', 'improvementLevel'], (result) => {
  if (result.apiKey) settings.apiKey = result.apiKey;
  if (result.improvementLevel) settings.improvementLevel = result.improvementLevel;
});

// Continuously check for Gmail compose windows
const checkForComposeWindows = () => {
  const composeBoxes = document.querySelectorAll('.Am.Al.editable');
  
  composeBoxes.forEach(composeBox => {
    // Only add button if it doesn't already exist for this compose box
    const toolbarParent = composeBox.closest('.M9');
    if (toolbarParent && !toolbarParent.querySelector('.improve-email-btn')) {
      addImproveButton(toolbarParent, composeBox);
    }
  });
};

// Add the Improve Mail button to Gmail's compose toolbar
const addImproveButton = (toolbar, composeBox) => {
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'improve-email-btn-container';
  
  const button = document.createElement('button');
  button.className = 'improve-email-btn';
  button.innerHTML = 'Improve Mail';
  button.title = 'AI-powered email improvement';
  
  button.addEventListener('click', () => improveEmail(composeBox));
  
  buttonContainer.appendChild(button);
  
  // Add to Gmail toolbar
  const toolbarItems = toolbar.querySelector('.wG.J-Z-I');
  if (toolbarItems) {
    toolbarItems.appendChild(buttonContainer);
  } else {
    toolbar.appendChild(buttonContainer);
  }
};

// Function to improve the email content
const improveEmail = async (composeBox) => {
  // Show loading state
  const originalText = composeBox.innerHTML;
  composeBox.innerHTML += '<p><em>Improving your email...</em></p>';
  
  try {
    if (!settings.apiKey) {
      throw new Error('API key not configured. Please set up in extension options.');
    }
    
    // Get email text and send to backend
    const emailText = composeBox.innerText;
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        email: emailText,
        improvementLevel: settings.improvementLevel
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const improvedEmail = await response.json();
    
    // Replace email content with improved version
    composeBox.innerHTML = improvedEmail.text;
    
    // Show success notification
    showNotification('Email improved successfully!', 'success');
    
  } catch (error) {
    // Restore original content and show error
    composeBox.innerHTML = originalText;
    showNotification(`Error: ${error.message}`, 'error');
  }
};

// Simple notification system
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `gmail-improver-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
};

// Run our code periodically to catch new compose windows
setInterval(checkForComposeWindows, 1000);