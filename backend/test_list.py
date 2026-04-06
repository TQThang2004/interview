import os
import google.generativeai as genai
from dotenv import load_dotenv
import traceback

load_dotenv(os.path.abspath(os.path.join('.', '../.env')))
api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=api_key)

try:
    models = genai.list_models()
    for m in list(models):
        print(m.name)
except Exception as e:
    print(f"Error fetching models: {e}")
    traceback.print_exc()
