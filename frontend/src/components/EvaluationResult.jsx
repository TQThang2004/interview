import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function EvaluationResult({ evalResult, onNext, isLast }) {
  if (!evalResult) return null;

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
                {evalResult.score_str}
             </div>
          </div>
          
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div>
               <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                 Điểm Mạnh
               </h4>
               <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                 {evalResult.strengths || "Không có đáng kể."}
               </p>
             </div>
             
             <div>
               <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'oklch(65% 0.22 25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                 Điểm Yếu / Cần Cải Thiện
               </h4>
               <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                 {evalResult.weaknesses || "Bạn đã trả lời rất tốt, không có điểm trừ."}
               </p>
             </div>
             
             <div style={{ 
               background: 'var(--gradient-primary)', borderRadius: '16px', padding: '1px'
             }}>
               <div style={{ 
                 background: 'oklch(14% 0.018 250 / 0.95)', borderRadius: '15px', padding: '20px',
               }}>
                 <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                   AI Gợi ý Bổ Sung
                 </h4>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                   {evalResult.suggestions}
                 </p>
               </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', marginTop: '8px', borderTop: '1px solid var(--border)' }}>
               <button onClick={onNext} className="btn-primary"
                 style={{ padding: '14px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 {isLast ? "Xem kết quả chung cuộc" : "Đến câu tiếp theo"} <ChevronRight size={18}/>
               </button>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
