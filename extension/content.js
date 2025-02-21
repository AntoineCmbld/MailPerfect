// content.js
let settings = {
  apiKey: '',
  improvementLevel: 'standard',
  backendUrl: 'http://localhost:5000/improve-email',
  model: 'gpt-3.5-turbo',
  customPrompt: '',
  preserveFormatting: true,
  buttonPosition: 'toolbar',  // Default to toolbar
  showNotifications: true
};

// Load settings
function loadSettings() {
  chrome.storage.sync.get([
    'apiKey',
    'improvementLevel',
    'backendUrl',
    'model',
    'customPrompt',
    'preserveFormatting',
    'buttonPosition',
    'showNotifications'
  ], (result) => {
    // Update settings with saved values
    Object.keys(result).forEach(key => {
      if (result[key] !== undefined) {
        settings[key] = result[key];
      }
    });
    
    // Set default backend URL if not set
    if (!settings.backendUrl) {
      settings.backendUrl = 'http://localhost:5000/improve-email';
    }
  });
}

// Initial settings load
loadSettings();

// Reload settings when they might have changed
chrome.storage.onChanged.addListener(() => {
  loadSettings();
});

// Continuously check for Gmail compose windows
const checkForComposeWindows = () => {
  // Look for compose windows
  const composeBoxes = document.querySelectorAll('.Am.Al.editable');
  
  composeBoxes.forEach(composeBox => {
    // Find the toolbar - this is where we'll add our button
    const toolbar = composeBox.closest('.aan').querySelector('.aal');
    
    // Only add button if it doesn't already exist for this toolbar
    const buttonClass = 'improve-email-btn';
    if (toolbar && !toolbar.querySelector(`.${buttonClass}`)) {
      addImproveButtonToToolbar(toolbar, composeBox);
    }
    
    // Fallback to bottom placement if we can't find the toolbar
    if (!toolbar) {
      const container = composeBox.closest('.M9') || composeBox.closest('.aaZ');
      if (container && !container.querySelector(`.${buttonClass}`)) {
        addImproveButtonToBottom(container, composeBox);
      }
    }
  });
};

// Add the Improve Mail button to the Gmail toolbar
const addImproveButtonToToolbar = (toolbar, composeBox) => {
  // Create a container div for our button and dropdown
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'improve-email-toolbar-container';
  buttonContainer.style.display = 'inline-block';
  buttonContainer.style.marginRight = '12px';
  
  // Create language dropdown
  const langSelect = document.createElement('select');
  langSelect.className = 'improve-email-lang-select';
  langSelect.style.marginRight = '8px';
  langSelect.style.verticalAlign = 'middle';
  
  // Add language options
  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }
  ];
  
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    langSelect.appendChild(option);
  });
  
  // Create the button element
  const button = document.createElement('button');
  button.className = 'improve-email-btn';
  button.innerHTML = '✨ Improve';
  button.title = 'AI-powered email improvement';
  button.style.verticalAlign = 'middle';
  
  // Add click event listener
  button.addEventListener('click', () => {
    const selectedLang = langSelect.value;
    improveEmail(composeBox, selectedLang);
  });
  
  // Add elements to container
  buttonContainer.appendChild(langSelect);
  buttonContainer.appendChild(button);
  
  // Insert at the beginning of the toolbar
  toolbar.prepend(buttonContainer);
};

// Add the Improve Mail button to the bottom of the compose window (fallback)
const addImproveButtonToBottom = (container, composeBox) => {
  const bottomContainer = document.createElement('div');
  bottomContainer.className = 'improve-email-bottom-container';
  
  // Add language dropdown
  const langSelect = document.createElement('select');
  langSelect.className = 'improve-email-lang-select';
  
  // Add language options
  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }
  ];
  
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.code;
    option.textContent = lang.name;
    langSelect.appendChild(option);
  });
  
  // Create improve button
  const button = document.createElement('button');
  button.className = 'improve-email-btn improve-email-btn-bottom';
  button.innerHTML = 'Improve Mail with AI';
  button.title = 'AI-powered email improvement';
  
  // Modify the click event to include language selection
  button.addEventListener('click', () => {
    const selectedLang = langSelect.value;
    improveEmail(composeBox, selectedLang);
  });
  
  // Add elements to container
  bottomContainer.appendChild(langSelect);
  bottomContainer.appendChild(button);
  
  // Add after the compose box
  composeBox.parentNode.insertBefore(bottomContainer, composeBox.nextSibling);
};

// Function to improve the email content - updated to accept language parameter
const improveEmail = async (composeBox, languageOverride = 'auto') => {
  // Check for API key
  if (!settings.apiKey) {
    showNotification('API key not configured. Please set up in extension options.', 'error');
    return;
  }
  
  // Show loading state
  const originalHTML = composeBox.innerHTML;
  composeBox.innerHTML += '<p><em>Improving your email...</em></p>';
  
  try {
    // Get email content
    let emailText;
    
    if (settings.preserveFormatting) {
      // Get HTML content to preserve formatting
      emailText = composeBox.innerHTML;
    } else {
      // Get plain text only
      emailText = composeBox.innerText;
    }
    
    // Send to backend
    const response = await fetch(settings.backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        email: emailText,
        improvementLevel: settings.improvementLevel,
        model: settings.model,
        customPrompt: settings.customPrompt,
        preserveFormatting: settings.preserveFormatting,
        language: languageOverride
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
    composeBox.innerHTML = originalHTML;
    showNotification(`Error: ${error.message}`, 'error');
  }
};

// Simple notification system
const showNotification = (message, type = 'info') => {
  if (!settings.showNotifications) return;
  
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