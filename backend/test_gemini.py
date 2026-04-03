import sys
sys.path.append('c:\\DOAN\\Data\\backend')
import rag_services
import traceback

llm = rag_services.get_llm()
try:
    response = llm.generate_content('Test prompt')
    print('OK:', response.text)
except Exception as e:
    traceback.print_exc()
