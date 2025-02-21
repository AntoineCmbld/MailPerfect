document.addEventListener('DOMContentLoaded', () => {
 
  // Load saved settings
  chrome.storage.sync.get([
    'apiKey', 
    'improvementLevel', 
    'model', 
    'customPrompt',
    'preserveFormatting',
    'buttonPosition',
    'showNotifications'
  ], (result) => {
    // Populate form with saved values
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    
    if (result.improvementLevel) {
      document.getElementById('improvementLevel').value = result.improvementLevel;
      
      // If there's a custom prompt option in your UI
      if (result.improvementLevel === 'custom' && document.getElementById('customPrompt')) {
        document.getElementById('customPromptContainer').style.display = 'block';
      }
    }
    
    if (result.model) {
      document.getElementById('model').value = result.model;
    }
    
    if (result.customPrompt && document.getElementById('customPrompt')) {
      document.getElementById('customPrompt').value = result.customPrompt;
    }
    
    if (result.preserveFormatting !== undefined) {
      document.getElementById('preserveFormatting').checked = result.preserveFormatting;
    } else {
      document.getElementById('preserveFormatting').checked = true; // Default to true
    }
    
    if (result.buttonPosition && document.getElementById('buttonPosition')) {
      document.getElementById('buttonPosition').value = result.buttonPosition;
    }
    
    if (result.showNotifications !== undefined && document.getElementById('showNotifications')) {
      document.getElementById('showNotifications').checked = result.showNotifications;
    } else if (document.getElementById('showNotifications')) {
      document.getElementById('showNotifications').checked = true; // Default to true
    }
  });
  
  // Save settings
  document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const improvementLevel = document.getElementById('improvementLevel').value;
    const model = document.getElementById('model').value;
    const preserveFormatting = document.getElementById('preserveFormatting').checked;
    
    // Optional UI elements - check if they exist before accessing
    const customPrompt = document.getElementById('customPrompt')?.value?.trim();
    const buttonPosition = document.getElementById('buttonPosition')?.value;
    const showNotifications = document.getElementById('showNotifications')?.checked;
    
    if (!apiKey) {
      showStatus('Please enter a valid API key', 'error');
      return;
    }
    
    if (improvementLevel === 'custom' && !customPrompt && document.getElementById('customPrompt')) {
      showStatus('Please enter a custom prompt or select a different improvement style', 'error');
      return;
    }
    
    const settings = {
      apiKey,
      improvementLevel,
      model,
      preserveFormatting
    };
    
    // Add optional settings if they exist in the UI
    if (customPrompt !== undefined) settings.customPrompt = customPrompt;
    if (buttonPosition !== undefined) settings.buttonPosition = buttonPosition;
    if (showNotifications !== undefined) settings.showNotifications = showNotifications;
    
    chrome.storage.sync.set(settings, () => {
      showStatus('Settings saved successfully!', 'success');
    });
  });
  
  // Add event listener for improvement level change if custom prompt UI exists
  const improvementLevelSelect = document.getElementById('improvementLevel');
  const customPromptContainer = document.getElementById('customPromptContainer');
  
  if (improvementLevelSelect && customPromptContainer) {
    improvementLevelSelect.addEventListener('change', () => {
      if (improvementLevelSelect.value === 'custom') {
        customPromptContainer.style.display = 'block';
      } else {
        customPromptContainer.style.display = 'none';
      }
    });
  }
});

function showStatus(message, type) {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusElement.className = 'status-message';
  }, 3000);
}