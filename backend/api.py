import openai

def improve_email(email_text):
    """
    Analyze and improve an email using an AI language model.
    
    Args:
        email_text (str): The original email text
        
    Returns:
        str: The improved email text
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-4",  # or another suitable model
            messages=[
                {"role": "system", "content": """
                You are an expert email editor. Analyze the email provided and return an improved version that:
                1. Corrects grammar, spelling, and punctuation errors
                2. Improves clarity and conciseness
                3. Maintains a professional tone
                4. Enhances the structure for better readability
                5. Preserves the original intent and key information
                
                Return ONLY the improved email with no explanations or additional text.
                """},
                {"role": "user", "content": f"Please improve this email:\n\n{email_text}"}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Error improving email: {str(e)}"

def analyze_email(email_text):
    """
    Analyze an email and provide feedback on its quality.
    
    Args:
        email_text (str): The email text to analyze
        
    Returns:
        str: Analysis and feedback on the email
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-4",  # or another suitable model
            messages=[
                {"role": "system", "content": """
                You are an expert email analyst. Provide a brief analysis of the provided email including:
                1. Grammar/spelling issues
                2. Tone assessment
                3. Clarity evaluation
                4. Suggestions for improvement
                5. Overall effectiveness rating (1-10)
                
                Keep your analysis concise and actionable.
                """},
                {"role": "user", "content": f"Please analyze this email:\n\n{email_text}"}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Error analyzing email: {str(e)}"