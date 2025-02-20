from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes - important for Chrome extension access

@app.route('/improve-email', methods=['POST'])
def improve_email():
    # Get API key from request headers
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Invalid or missing API key'}), 401
    
    api_key = auth_header.split(' ')[1]
    
    # Get request data
    data = request.json
    if not data or 'email' not in data:
        return jsonify({'error': 'Missing email content'}), 400
    
    email_text = data['email']
    improvement_level = data.get('improvementLevel', 'standard')
    
    # Configure OpenAI with the provided API key
    openai.api_key = api_key
    
    # Select system prompt based on improvement level
    system_prompts = {
        'standard': """You are an email editor. Improve this email by fixing grammar, 
                     enhancing clarity, and ensuring a professional tone. Maintain the 
                     original meaning and intent of the message.""",
        
        'professional': """You are a professional business writing expert. Transform 
                        this email into a clear, concise, and highly professional message.
                        Use appropriate business language, ensure perfect grammar, and 
                        optimize structure for maximum impact.""",
        
        'casual': """You are a friendly writing assistant. Make this email warm and 
                  conversational while keeping it professional. Improve clarity and 
                  fix any errors while maintaining a personable tone."""
    }
    
    system_prompt = system_prompts.get(improvement_level, system_prompts['standard'])
    
    try:
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # You can use gpt-4 for better results if available
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Please improve this email:\n\n{email_text}"}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        # Extract the improved text from the response
        improved_text = response.choices[0].message.content
        
        # Return the improved email
        return jsonify({
            'text': improved_text,
            'status': 'success'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Debug route to verify server is running
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running'}), 200

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)