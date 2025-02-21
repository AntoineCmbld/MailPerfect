from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from langdetect import detect, LangDetectException

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
    language_choice = data.get('language', 'auto')

     # Detect or use specified language
    try:
        if language_choice == 'auto':
            detected_language = detect(email_text)
        else:
            detected_language = language_choice
            
        language_instruction = f"This email is in {detected_language}. Your response MUST be in {detected_language} only."
    except LangDetectException:
        # If language detection fails, use a more generic instruction
        language_instruction = "Maintain the exact same language as the original email."
    
    # Configure OpenAI with the provided API key
    openai.api_key = api_key
    
    # Select system prompt based on improvement level
    system_prompts = {
        'standard': """You are an email editor. Improve this email by fixing grammar, 
                    enhancing clarity, and ensuring a professional tone. 
                    IMPORTANT: Maintain the original language of the email - if it's in French, 
                    respond in French, if it's in English, respond in English, etc.
                    Maintain the original meaning, intent and style of the message.""",

        'professional': """You are an executive communication specialist. Enhance this email to be clear, concise, and impactful for a business environment. 
                    
                    Make these specific improvements:
                    1. Use professional vocabulary and tone appropriate for business correspondence
                    2. Structure content logically with clear paragraphs and transitions
                    3. Focus on clarity and brevity - remove unnecessary words and redundancies
                    4. Ensure appropriate level of formality based on context
                    5. Maintain proper business etiquette and courteous language
                    6. Keep actionable items and requests clear and specific
                    7. Fix any grammatical or spelling errors
                    
                    IMPORTANT: Preserve the original language of the email - if it's in French, respond in French, if it's in English, respond in English, etc.
                    Maintain the original intent, key information, and any specific terminology used.""",
        
        'casual': """You are a friendly writing assistant. Make this email warm and 
                conversational while keeping it professional. Improve clarity and 
                fix any errors while maintaining a personable tone.
                IMPORTANT: Always preserve the original language of the email - if it's in French, 
                your improvements must be in French, if it's in English, respond in English, etc."""
    }
    
    base_prompt = system_prompts.get(improvement_level, system_prompts['standard'])
    complete_prompt = f"{base_prompt} {language_instruction}"
    
    try:
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # You can use gpt-4 for better results if available
            messages=[
                {"role": "system", "content": complete_prompt},
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