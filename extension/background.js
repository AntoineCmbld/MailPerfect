// background.js
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      // Open options page on first install
      chrome.runtime.openOptionsPage();
    }
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openOptions') {
      chrome.runtime.openOptionsPage();
    }
    return true;
  });