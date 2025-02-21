document.addEventListener('DOMContentLoaded', () => {
 
  // Load saved settings
  chrome.storage.sync.get([
    'apiKey', 
    'improvementLevel', 
    'backendUrl', 
    'model', 
    'customPrompt',
    'preserveFormatting',
  ], (result) => {
    // Populate form with saved values
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    
    if (result.improvementLevel) {
      document.getElementById('improvementLevel').value = result.improvementLevel;
      
      if (result.improvementLevel === 'custom') {
        customPromptContainer.style.display = 'block';
      }
    }
    
    if (result.backendUrl) {
      document.getElementById('backendUrl').value = result.backendUrl;
    } else {
      document.getElementById('backendUrl').value = 'http://localhost:5000/improve-email';
    }
    
    if (result.model) {
      document.getElementById('model').value = result.model;
    }
    
    if (result.customPrompt) {
      document.getElementById('customPrompt').value = result.customPrompt;
    }
    
    if (result.preserveFormatting !== undefined) {
      document.getElementById('preserveFormatting').checked = result.preserveFormatting;
    } else {
      document.getElementById('preserveFormatting').checked = true; // Default to true
    }
    
    if (result.buttonPosition) {
      document.getElementById('buttonPosition').value = result.buttonPosition;
    }
  });
  
  // Save settings
  document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const improvementLevel = document.getElementById('improvementLevel').value;
    const backendUrl = document.getElementById('backendUrl').value.trim();
    const model = document.getElementById('model').value;
    const preserveFormatting = document.getElementById('preserveFormatting').checked;
    
    if (!apiKey) {
      showStatus('Please enter a valid API key', 'error');
      return;
    }
    
    if (!backendUrl) {
      showStatus('Please enter a valid backend URL', 'error');
      return;
    }
    
    if (improvementLevel === 'custom' && !customPrompt) {
      showStatus('Please enter a custom prompt or select a different improvement style', 'error');
      return;
    }
    
    chrome.storage.sync.set({
      apiKey,
      improvementLevel,
      backendUrl,
      model,
      preserveFormatting
    }, () => {
      showStatus('Settings saved successfully!', 'success');
    });
  });
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
