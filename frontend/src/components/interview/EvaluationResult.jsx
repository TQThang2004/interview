import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function EvaluationResult({ result, evalResult, onNext, isLast }) {
  const evaluation = result || evalResult;
  if (!evaluation) return null;

  return (
    <div style={{ padding: 'clamp(20px, 5vw, 60px)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          
          <div style={{ 
            background: 'oklch(20% 0.015 250)', 
            padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid var(--border)' 
          }}>
             <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}> 
               <CheckCircle2 size={24} style={{ color: 'var(--success)' }} /> 
               Phân Tích AI
             </h3>
             <div style={{ 
               background: 'var(--bg-elevated)', border: '1px solid var(--border)',
               padding: '8px 20px', borderRadius: '12px', fontSize: '20px', fontWeight: 900, 
               color: 'var(--primary)', boxShadow: '0 4px 12px oklch(0% 0 0 / 0.2)' 
             }}>
                {evaluation.score_str}
             </div>
          </div>
          
          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
             {/* Điểm mạnh */}
             <div style={{
               padding: '10px 14px', borderRadius: '10px',
               background: 'oklch(72% 0.18 145 / 0.07)',
               border: '1px solid oklch(72% 0.18 145 / 0.25)',
             }}>
               <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                 ✅ Điểm Mạnh
               </h4>
               <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>
                 {evaluation.strengths || "Không có đáng kể."}
               </p>
             </div>

             {/* Điểm yếu */}
             <div style={{
               padding: '10px 14px', borderRadius: '10px',
               background: 'oklch(65% 0.22 25 / 0.07)',
               border: '1px solid oklch(65% 0.22 25 / 0.25)',
             }}>
               <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'oklch(65% 0.22 25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                 ⚠️ Cần Cải Thiện
               </h4>
               <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>
                 {evaluation.weaknesses || "Bạn đã trả lời rất tốt, không có điểm trừ."}
               </p>
             </div>

             {/* Gợi ý */}
             <div style={{
               padding: '10px 14px', borderRadius: '10px',
               background: 'var(--primary-07)',
               border: '1px solid var(--primary-25)',
             }}>
               <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                 💡 Gợi Ý AI
               </h4>
               <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.55, margin: 0 }}>
                 {evaluation.suggestions}
               </p>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
               <button onClick={onNext} className="btn-primary"
                 style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 {isLast ? "Xem kết quả chung cuộc" : "Đến câu tiếp theo"} <ChevronRight size={16}/>
               </button>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
