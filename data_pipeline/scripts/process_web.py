import os
import re
import json

def parse_markdown_qa(filepath, topic, file_name):
    """Đọc file markdown text, trích xuất cấu hình JSON Chunking theo chuẩn dự án"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Tìm các đoạn bắt đầu bằng "### " đến "### " tiếp theo
    sections = re.split(r'\n###\s+', content)
    
    out_data = []
    
    # Bỏ qua phần header (trước '### ' đầu tiên)
    for idx, section in enumerate(sections[1:]):
        lines = section.split('\n')
        if not lines:
            continue
            
        question = lines[0].strip()
        answer = "\n".join(lines[1:]).strip()
        
        # Regex xử lý sạch (Bỏ chữ 'Answer:' nếu có)
        if len(answer) > 10:
            clean_answer = re.sub(r'(?i)^answer:\s*', '', answer).strip()
            
            # 1) CHUNKING TRANG NỘI DUNG CHUẨN RAG (Giống quy chuẩn sample.csv)
            page_content = f"Chủ đề: {topic}\n"
            page_content += f"Câu hỏi: {question}\n"
            page_content += f"Trả lời: {clean_answer}"
            
            # 2) THÊM METADATA CHUẨN
            metadata = {
                "source_file": file_name,
                "original_row_id": idx,
                "chunk_id": f"{topic.replace(' ', '_').lower()}_{idx}_chunk_0",
                "instruction": topic,
                "level": "Intermediate",
                "has_context_input": False,
                "chunk_length": len(page_content)
            }
            
            out_data.append({
                "page_content": page_content,
                "metadata": metadata
            })
            
    return out_data

def process_web_files():
    react_file = r"C:\Users\Thang\.gemini\antigravity\brain\36bc634c-1ffb-41b6-9feb-e196727f7149\.system_generated\steps\174\content.md"
    node_file = r"C:\Users\Thang\.gemini\antigravity\brain\36bc634c-1ffb-41b6-9feb-e196727f7149\.system_generated\steps\175\content.md"
    
    react_data = parse_markdown_qa(react_file, "Frontend React", "react_interview_questions.md")
    node_data = parse_markdown_qa(node_file, "Backend NodeJS", "node_interview_questions.md")
    
    all_data = react_data + node_data
    
    output_path = os.path.join(os.path.dirname(__file__), '../data/chunked_web.json')
    with open(output_path, 'w', encoding='utf-8') as out_f:
        json.dump(all_data, out_f, ensure_ascii=False, indent=4)
        
    print(f"✅ Chunking hoàn tất: {len(all_data)} chunks. Dữ liệu đã lưu theo chuẩn tại {output_path}")

if __name__ == "__main__":
    process_web_files()
