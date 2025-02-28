// content.js - Standalone version (no backend required)
let settings = {
  apiKey: '',
  improvementLevel: 'standard',
  model: 'gpt-3.5-turbo',
  customPrompt: '',
  preserveFormatting: true,
  buttonPosition: 'toolbar',  // Default to toolbar
  showNotifications: true
};

// Import language detection library (franc)
// Note: This would need to be properly bundled in your extension build process
import franc from 'franc';

// Load settings
function loadSettings() {
  chrome.storage.sync.get([
    'apiKey',
    'improvementLevel',
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
    { code: 'eng', name: 'English' },
    { code: 'fra', name: 'Français' },
    { code: 'spa', name: 'Español' },
    { code: 'deu', name: 'Deutsch' },
    { code: 'ita', name: 'Italiano' },
    { code: 'por', name: 'Português' },
    { code: 'nld', name: 'Nederlands' },
    { code: 'rus', name: 'Русский' },
    { code: 'cmn', name: 'Chinese' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'kor', name: 'Korean' }
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

// Improved language detection using franc library
const detectLanguage = (text) => {
  try {
    // Get the detected language code from franc
    const langCode = franc(text);
    
    // If undefined or unreliable detection, default to English
    if (langCode === 'und' || text.length < 10) {
      return 'eng';
    }
    
    // Return the detected language code (will be used for OpenAI prompt)
    return langCode;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'eng'; // Default to English on error
  }
};

// Function to improve the email content directly using OpenAI API
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
    
    // Detect language if set to auto
    let detectedLanguage = languageOverride;
    if (languageOverride === 'auto') {
      detectedLanguage = detectLanguage(composeBox.innerText);
    }
    
    // Map language codes to human-readable names for the prompt
    const languageNames = {
      'eng': 'English',
      'fra': 'French',
      'spa': 'Spanish',
      'deu': 'German',
      'ita': 'Italian',
      'por': 'Portuguese',
      'nld': 'Dutch',
      'rus': 'Russian',
      'cmn': 'Chinese',
      'jpn': 'Japanese',
      'kor': 'Korean'
    };
    
    const languageName = languageNames[detectedLanguage] || 'English';
    
    // Select system prompt based on improvement level
    const systemPrompts = {
      'standard': `You are an email editor. Improve this email by fixing grammar, 
                  enhancing clarity, and ensuring a professional tone. 
                  IMPORTANT: This email is in ${languageName}. Your response MUST be in ${languageName} only.
                  Maintain the original meaning, intent and style of the message.`,

      'professional': `You are an executive communication specialist. Enhance this email to be clear, concise, and impactful for a business environment. 
                  
                  Make these specific improvements:
                  1. Use professional vocabulary and tone appropriate for business correspondence
                  2. Structure content logically with clear paragraphs and transitions
                  3. Focus on clarity and brevity - remove unnecessary words and redundancies
                  4. Ensure appropriate level of formality based on context
                  5. Maintain proper business etiquette and courteous language
                  6. Keep actionable items and requests clear and specific
                  7. Fix any grammatical or spelling errors
                  
                  IMPORTANT: This email is in ${languageName}. Your response MUST be in ${languageName} only.
                  Maintain the original intent, key information, and any specific terminology used.`,
      
      'casual': `You are a friendly writing assistant. Make this email warm and 
              conversational while keeping it professional. Improve clarity and 
              fix any errors while maintaining a personable tone.
              IMPORTANT: This email is in ${languageName}. Your response MUST be in ${languageName} only.`
    };
    
    const systemPrompt = systemPrompts[settings.improvementLevel] || systemPrompts['standard'];
    const customPrompt = settings.customPrompt ? 
      `${settings.customPrompt} IMPORTANT: This email is in ${languageName}. Your response MUST be in ${languageName} only.` : 
      null;
    
    // Prepare the API request
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    };
    
    const body = JSON.stringify({
      model: settings.model,
      messages: [
        {"role": "system", "content": customPrompt || systemPrompt},
        {"role": "user", "content": `Please improve this email:\n\n${emailText}`}
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: body
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    const improvedText = result.choices[0].message.content;
    
    // Replace email content with improved version
    composeBox.innerHTML = improvedText;
    
    // Show success notification
    showNotification('Email improved successfully!', 'success');
    
  } catch (error) {
    // Restore original content and show error
    composeBox.innerHTML = originalHTML;
    showNotification(`Error: ${error.message}`, 'error');
    console.error('Email improvement error:', error);
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