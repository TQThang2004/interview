import os
import google.generativeai as genai
from dotenv import load_dotenv
import traceback

load_dotenv(os.path.abspath(os.path.join('.', '../.env')))
api_key = os.getenv('GOOGLE_API_KEY')
print(f'API KEY LOADED: {api_key}')
genai.configure(api_key=api_key)
try:
    print('Testing generate_content...')
    res = genai.GenerativeModel('gemini-2.5-flash').generate_content('hi')
    print('SUCCESS', res.text)
except Exception as e:
    with open('error.log', 'w', encoding='utf-8') as f:
        f.write(traceback.format_exc())
    print('FAILED', e)
