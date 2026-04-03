import csv
import json

def process_csv():
    out_data = []
    with open('c:/DOAN/Data/sample.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for idx, row in enumerate(reader):
            if len(row) > 5:
                # Merge the last elements into level if there are unquoted commas
                level = ", ".join(row[4:]).strip()
            elif len(row) == 5:
                level = row[4].strip()
            else:
                level = ""
                
            instruction = row[0].strip() if len(row) > 0 else ""
            input_text = row[1].strip() if len(row) > 1 else ""
            output_text = row[2].strip() if len(row) > 2 else ""
            answer = row[3].strip() if len(row) > 3 else ""
            
            page_content = f"Loại câu hỏi: {instruction}\n"
            has_context = False
            if input_text:
                page_content += f"Ngữ cảnh: {input_text}\n"
                has_context = True
            page_content += f"Câu hỏi: {output_text}\n"
            page_content += f"Trả lời: {answer}"

            metadata = {
                "source_file": "sample.csv",
                "original_row_id": idx,
                "chunk_id": f"row_{idx}_chunk_0",
                "instruction": instruction,
                "level": level,
                "has_context_input": has_context,
                "chunk_length": len(page_content)
            }

            out_data.append({
                "page_content": page_content,
                "metadata": metadata
            })

    output_path = 'c:/DOAN/Data/chunked_sample.json'
    with open(output_path, 'w', encoding='utf-8') as out_f:
        json.dump(out_data, out_f, ensure_ascii=False, indent=4)
        
    print(f"Processed {len(out_data)} rows. Output saved to {output_path}")

if __name__ == '__main__':
    process_csv()
