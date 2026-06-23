import React from 'react';
import AiEvaluationPanel from './AiEvaluationPanel';

export default function HistoryDetailExpand({ detail }) {
  if (!detail) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
        Đang tải chi tiết...
      </div>
    );
  }

  if (detail.questions?.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
        Chưa có câu hỏi nào được lưu.
      </div>
    );
  }

  return (
    <>
      {detail.overall_feedback && (
        <div style={{ marginBottom: '14px', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nhận xét tổng quan</span>
          {detail.overall_feedback}
        </div>
      )}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Chi tiết {detail.questions.length} câu hỏi
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {detail.questions.map((q, i) => (
          <div key={q.id} style={{
            padding: '14px 16px', borderRadius: '12px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            {/* Header câu hỏi */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                flexShrink: 0, marginTop: '2px',
                background: 'var(--primary-10)',
                border: '1px solid var(--primary-20)',
                padding: '2px 8px', borderRadius: '6px',
              }}>#{i + 1}</span>
              <span style={{ fontSize: '13px', flex: 1, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{q.question_text}</span>
              {q.score != null && (
                <span style={{
                  fontWeight: 800, fontSize: '13px', flexShrink: 0,
                  color: q.score >= 8 ? 'oklch(68% 0.2 145)' : q.score >= 6.5 ? 'oklch(70% 0.18 80)' : 'oklch(60% 0.22 25)',
                  background: q.score >= 8 ? 'oklch(72% 0.18 145 / 0.12)' : q.score >= 6.5 ? 'oklch(80% 0.18 80 / 0.12)' : 'oklch(65% 0.22 25 / 0.12)',
                  padding: '2px 10px', borderRadius: '999px',
                }}>
                  {Number(q.score).toFixed(1)}/10
                </span>
              )}
            </div>

            {/* Câu trả lời đầy đủ */}
            {q.user_answer ? (
              <div style={{
                paddingLeft: '14px', borderLeft: '3px solid var(--primary-40)',
                marginBottom: '10px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Câu trả lời của bạn
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {q.user_answer}
                </p>
              </div>
            ) : (
              <div style={{ paddingLeft: '14px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                (Chưa trả lời)
              </div>
            )}

            {/* Đánh giá AI đầy đủ */}
            {q.ai_evaluation && (
              <AiEvaluationPanel aiEvaluation={q.ai_evaluation} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
