document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings
    chrome.storage.sync.get(['apiKey', 'improvementLevel'], (result) => {
      if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
      }
      
      if (result.improvementLevel) {
        document.getElementById('improvementLevel').value = result.improvementLevel;
      }
    });
    
    // Save settings
    document.getElementById('saveButton').addEventListener('click', () => {
      const apiKey = document.getElementById('apiKey').value.trim();
      const improvementLevel = document.getElementById('improvementLevel').value;
      
      if (!apiKey) {
        showStatus('Please enter a valid API key', 'error');
        return;
      }
      
      chrome.storage.sync.set({
        apiKey,
        improvementLevel
      }, () => {
        showStatus('Settings saved successfully!', 'success');
      });
    });
    
    // Open advanced options
    document.getElementById('advancedButton').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
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