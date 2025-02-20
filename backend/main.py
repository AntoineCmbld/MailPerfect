"""
MailPerfect is a GPT-powered email assistant that helps you write emails with better clarity and impact, while removing orthographic and grammatical errors.
"""
from api import improve_email, analyze_email
import sys
import argparse

def main():
    parser = argparse.ArgumentParser(description="Email Analysis and Improvement Tool")
    parser.add_argument("--file", type=str, help="Path to file containing the email text")
    parser.add_argument("--analyze", action="store_true", help="Provide analysis instead of improvement")
    args = parser.parse_args()
    
    # Get email text from file or stdin
    if args.file:
        try:
            with open(args.file, 'r') as f:
                email_text = f.read()
        except Exception as e:
            print(f"Error reading file: {str(e)}")
            return
    else:
        print("Enter your email text (press Ctrl+D when finished):")
        email_text = sys.stdin.read()
    
    if not email_text.strip():
        print("Error: No email text provided")
        return
    
    # Either analyze or improve the email based on the flag
    if args.analyze:
        result = analyze_email(email_text)
        print("\n=== EMAIL ANALYSIS ===\n")
    else:
        result = improve_email(email_text)
        print("\n=== IMPROVED EMAIL ===\n")
    
    print(result)

if __name__ == "__main__":
    main()