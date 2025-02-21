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

// Try a different approach to find Gmail's toolbar
const checkForComposeWindows = () => {
  // Specifically look for Gmail's compose window send button area
  const sendButtonContainers = document.querySelectorAll('tr.btC');
  
  sendButtonContainers.forEach(container => {
    // Check if our button is already added
    const buttonClass = 'improve-email-btn';
    if (!container.querySelector(`.${buttonClass}`)) {
      // Find the actual send button's parent TD
      const sendButtonTd = container.querySelector('td.gU.Up');
      
      if (sendButtonTd) {
        // Find the related compose area 
        const composeArea = container.closest('.M9').querySelector('.Am.Al.editable');
        
        if (composeArea) {
          // Add our button next to the send button
          addButtonNextToSend(sendButtonTd, composeArea);
        }
      }
    }
  });
  
  // As fallback, continue checking for compose boxes the old way
  const composeBoxes = document.querySelectorAll('.Am.Al.editable');
  composeBoxes.forEach(composeBox => {
    // Only try bottom placement if button not already present
    const container = composeBox.closest('.M9') || composeBox.closest('.aaZ');
    const buttonExistsInRow = container && container.closest('table').querySelector('.improve-email-btn');
    if (container && !buttonExistsInRow) {
      addImproveButtonToBottom(container, composeBox);
    }
  });
};

// Add button next to Gmail's send button
const addButtonNextToSend = (sendButtonTd, composeArea) => {
  // Create our button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'improve-email-send-row-container';
  buttonContainer.style.display = 'inline-block';
  buttonContainer.style.marginRight = '8px';
  
  // Create language dropdown with minimal styling to match Gmail
  const langSelect = document.createElement('select');
  langSelect.className = 'improve-email-lang-select';
  langSelect.style.marginRight = '8px';
  langSelect.style.height = '36px';
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
  
  // Create button matching Gmail's send button styling
  const button = document.createElement('button');
  button.className = 'improve-email-btn T-I J-J5-Ji aoO T-I-atl';
  button.innerHTML = '✨ Improve';
  button.title = 'AI-powered email improvement';
  button.style.marginLeft = '0';
  
  // Add click event listener
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedLang = langSelect.value;
    improveEmail(composeArea, selectedLang);
    return false;
  });
  
  // Add elements to container
  buttonContainer.appendChild(langSelect);
  buttonContainer.appendChild(button);
  
  // Insert our button container before the send button in the row
  sendButtonTd.insertBefore(buttonContainer, sendButtonTd.firstChild);
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