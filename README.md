# Gmail Email Improver Chrome Extension

This Chrome extension adds an "Improve Mail" button to Gmail's compose window, allowing you to instantly improve the quality, clarity, and professionalism of your emails using AI.

## Features

- Seamlessly integrates with Gmail's compose interface
- One-click email improvement
- Customizable improvement styles (Standard, Professional, Casual)
- Simple setup with your own OpenAI API key

## Installation Instructions

### 1. Set up the Extension in Chrome

1. **Download/Clone the Extension Files**
   - Save all the provided files in a directory on your computer

2. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" using the toggle in the top-right corner
   - Click "Load unpacked" and select the directory containing the extension files

3. **Configure Settings**
   - Click the extension's options button
   - Enter your OpenAI API key
   - Select your preferred improvement style

### 2. Set up the Backend Service (Optional)

If you want to run your own backend service rather than relying on a third-party:

1. **Install Requirements**
   ```bash
   pip install flask flask-cors openai
   ```

2. **Run the Flask Application**
   ```bash
   python app.py
   ```

3. **Deploy to a Cloud Provider (Optional)**
   - The app can be deployed to services like Heroku, Google Cloud Run, or AWS Lambda
   - Remember to update the `API_ENDPOINT` in `content.js` to point to your deployed service

## How to Use

1. Open Gmail in Chrome
2. Click "Compose" to start a new email
3. Write your draft email
4. Click the "Improve Mail" button in the compose toolbar
5. Wait a few seconds while the AI improves your email
6. Review the improved version and make any final edits

## Folder Structure

```
gmail-email-improver/
├── manifest.json        # Extension configuration
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── content.js           # Content script for Gmail integration
├── background.js        # Background service worker
├── styles.css           # CSS styles
├── options.html         # Settings page
└── options.js           # Settings functionality
```

## Troubleshooting

- **Button not appearing?** Try refreshing Gmail or restarting Chrome
- **API errors?** Double-check your API key in the extension settings
- **Slow performance?** Consider switching to a faster OpenAI model in the backend code

## Privacy Note

This extension processes your email content through the OpenAI API using your personal API key. No email content is stored by the extension or its developers.
