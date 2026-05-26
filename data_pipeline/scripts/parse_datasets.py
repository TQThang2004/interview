import os
import re
import json
import glob

def get_instruction_from_filename(filename):
    mapping = {
        "da_interview_question.md": "Data Analysis",
        "docker_interview.question.md": "Docker",
        "git_interview_question.md": "Git",
        "java_interview_question.md": "Java",
        "javascript_interview_question.md": "JavaScript",
        "ml_interview_question.md": "Machine Learning",
        "nodejs_interview_question.md": "NodeJS",
        "oop_interview_question.md": "OOP",
        "python_interview_question.md": "Python",
        "react_interview_question.md": "React",
        "sd_interview_question.md": "System Design",
        "spring_interview_question.md": "Spring",
        "sql_interview_question.md": "SQL"
    }
    return mapping.get(filename, "General Topic")

def parse_markdown_qa(filepath, topic, file_name):
    """Đọc file markdown text, trích xuất cấu hình JSON Chunking theo chuẩn dự án"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Tách dựa trên pattern: (đầu dòng hoặc sau \n) tuỳ chọn số thứ tự, tuỳ chọn khoảng trắng, theo sau là ###
    sections = re.split(r'(?:^|\n)\s*(?:\d+\.)?\s*###\s+', content)
    
    out_data = []
    
    # Bỏ qua phần tử đầu tiên (thường là tiêu đề hoặc trống)
    for idx, section in enumerate(sections[1:]):
        lines = section.split('\n')
        if not lines:
            continue
            
        question = lines[0].strip()
        # Loại bỏ các ký tự hỏi bị dư ở cuối hoặc khoảng trắng
        if question.endswith('?'):
            pass
            
        answer = "\n".join(lines[1:]).strip()
        
        # Regex xử lý sạch (Bỏ chữ 'Answer:' nếu có)
        if len(answer) > 5:
            clean_answer = re.sub(r'(?i)^answer:\s*', '', answer).strip()
            
            # CHUNKING TRANG NỘI DUNG CHUẨN RAG
            page_content = f"Chủ đề: {topic}\n"
            page_content += f"Câu hỏi: {question}\n"
            page_content += f"Trả lời: {clean_answer}"
            
            # THÊM METADATA CHUẨN
            topic_key = topic.replace(' ', '_').lower()
            metadata = {
                "source_file": file_name,
                "original_row_id": idx,
                "chunk_id": f"{topic_key}_{idx}_chunk_0",
                "instruction": topic,
                "level": "",
                "has_context_input": False,
                "chunk_length": len(page_content)
            }
            
            out_data.append({
                "page_content": page_content,
                "metadata": metadata
            })
            
    return out_data

def process_all_datasets():
    input_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../dataset'))
    output_dir = os.path.join(input_dir, 'chunk')
    
    # Tạo thư mục lưu chunk nếu chưa có
    os.makedirs(output_dir, exist_ok=True)
    
    md_files = glob.glob(os.path.join(input_dir, '*.md'))
    
    if not md_files:
        print(f"❌ Không tìm thấy file .md nào trong {input_dir}")
        return
        
    print(f"🔍 Đã tìm thấy {len(md_files)} files markdown. Bắt đầu chunking...\n")
    
    total_chunks = 0
    
    for filepath in md_files:
        filename = os.path.basename(filepath)
        topic = get_instruction_from_filename(filename)
        
        data = parse_markdown_qa(filepath, topic, filename)
        
        if not data:
            print(f"⚠️  Cảnh báo: Không parse được chunk nào từ {filename}")
            continue
            
        # Lưu ra file JSON tương ứng (VD: chunked_da.json)
        # Bỏ đi phần mở rộng .md hoặc .question.md để tạo tên đẹp
        base_name = filename.split('_interview')[0].replace('.md', '')
        out_filename = f"chunked_{base_name}.json"
        out_filepath = os.path.join(output_dir, out_filename)
        
        with open(out_filepath, 'w', encoding='utf-8') as out_f:
            json.dump(data, out_f, ensure_ascii=False, indent=4)
            
        print(f"✅ Đã xử lý '{filename}' -> Tạo {len(data)} chunks -> Lưu tại '{out_filename}'")
        total_chunks += len(data)
        
    print(f"\n🎉 Hoàn tất! Tổng cộng đã tạo {total_chunks} chunks trong '{output_dir}'.")

if __name__ == "__main__":
    process_all_datasets()
