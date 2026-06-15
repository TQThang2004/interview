/**
 * QuizPanel.jsx
 * Hiển thị tất cả câu hỏi trên 1 trang – Phương án B.
 * Ứng viên trả lời tất cả rồi nộp 1 lần.
 */
import React, { useState } from 'react';
import { Send, ChevronUp, ChevronDown, AlertCircle, BookOpen } from 'lucide-react';

export default function QuizPanel({
  sessionId: _sessionId,
  topic,
  level,
  questions,         // [{answer_id, order, question}]
  onSubmit,          // (answers) => void – answers: [{answer_id, user_answer}]
  onAbandon,
  isSubmitting,
}) {
  // answers: map answer_id → user_answer (string)
  const [answers, setAnswers] = useState(() => {
    const init = {};
    questions.forEach(q => { init[q.answer_id] = ''; });
    return init;
  });
  const [expandedIdx, setExpandedIdx] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const answeredCount = Object.values(answers).filter(v => v.trim()).length;
  const totalCount = questions.length;
  const progressPct = Math.round((answeredCount / totalCount) * 100);

  const handleChange = (answerId, value) => {
    setAnswers(prev => ({ ...prev, [answerId]: value }));
  };

  const handleSubmit = () => {
    // Kiểm tra có câu nào chưa trả lời?
    const unanswered = questions.filter(q => !answers[q.answer_id].trim());
    if (unanswered.length > 0 && !showWarning) {
      setShowWarning(true);
      return;
    }
    // Build payload
    const payload = questions.map(q => ({
      answer_id: q.answer_id,
      user_answer: answers[q.answer_id].trim(),
    }));
    onSubmit(payload);
  };

  const toggleExpand = (idx) => {
    setExpandedIdx(prev => (prev === idx ? -1 : idx));
  };

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span className="gradient-text">{topic}</span> · {level}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
              {totalCount} câu hỏi · Trả lời tất cả rồi nộp bài
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Đã trả lời {answeredCount}/{totalCount}
            </div>
            <div style={{
              width: '140px', height: '6px', borderRadius: '999px',
              background: 'var(--border)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '999px',
                width: `${progressPct}%`,
                background: 'var(--gradient-primary)',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Warning chưa điền hết */}
      {showWarning && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          padding: '14px 16px', borderRadius: '12px', marginBottom: '20px',
          background: 'oklch(80% 0.18 80 / 0.1)', border: '1px solid oklch(80% 0.18 80 / 0.4)',
        }}>
          <AlertCircle size={18} style={{ color: 'oklch(75% 0.18 80)', flexShrink: 0, marginTop: '1px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'oklch(85% 0.15 80)' }}>
              Còn {totalCount - answeredCount} câu chưa trả lời
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'oklch(75% 0.12 80)' }}>
              Câu bỏ trống sẽ được tính 0 điểm. Bạn có muốn nộp bài ngay không?
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowWarning(false)}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg-elevated)', cursor: 'pointer', fontSize: '13px',
                color: 'var(--text-secondary)', fontWeight: 600,
              }}
            >Tiếp tục làm</button>
            <button
              onClick={() => {
                setShowWarning(false);
                const payload = questions.map(q => ({
                  answer_id: q.answer_id,
                  user_answer: answers[q.answer_id].trim(),
                }));
                onSubmit(payload);
              }}
              disabled={isSubmitting}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                background: 'oklch(72% 0.18 145)', cursor: 'pointer', fontSize: '13px',
                color: 'oklch(15% 0.01 250)', fontWeight: 700,
              }}
            >Nộp bài</button>
          </div>
        </div>
      )}

      {/* Question list – accordion style */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {questions.map((q, idx) => {
          const isExpanded = expandedIdx === idx;
          const answered = answers[q.answer_id]?.trim().length > 0;

          return (
            <div
              key={q.answer_id}
              className="glass-card"
              style={{
                overflow: 'hidden',
                border: answered
                  ? '1px solid oklch(72% 0.18 145 / 0.5)'
                  : '1px solid var(--border)',
                transition: 'all 0.2s',
              }}
            >
              {/* Question header */}
              <button
                onClick={() => toggleExpand(idx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start',
                  gap: '14px', padding: '16px 20px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Number badge */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: answered ? 'oklch(72% 0.18 145 / 0.2)' : 'var(--bg-surface)',
                  border: `1px solid ${answered ? 'oklch(72% 0.18 145 / 0.5)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  color: answered ? 'oklch(72% 0.18 145)' : 'var(--text-muted)',
                }}>
                  {answered ? (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {q.question}
                  </span>
                  {!isExpanded && answered && (
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                      {answers[q.answer_id]}
                    </p>
                  )}
                </div>

                <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Answer textarea */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', margin: '14px 0 8px' }}>
                    Câu trả lời của bạn
                  </label>
                  <textarea
                    id={`answer-${q.answer_id}`}
                    value={answers[q.answer_id]}
                    onChange={e => handleChange(q.answer_id, e.target.value)}
                    placeholder="Nhập câu trả lời của bạn vào đây..."
                    className="input-field"
                    style={{
                      minHeight: '120px', resize: 'vertical', width: '100%',
                      fontFamily: 'inherit', fontSize: '14px',
                    }}
                    autoFocus
                  />
                  {/* Auto next */}
                  {idx < questions.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button
                        onClick={() => setExpandedIdx(idx + 1)}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)', cursor: 'pointer',
                          fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600,
                        }}
                      >
                        Câu tiếp theo →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit + Abandon */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button
          onClick={onAbandon}
          style={{
            padding: '12px 20px', borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(65% 0.22 25 / 0.7)'; e.currentTarget.style.color = 'oklch(65% 0.22 25)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          Huỷ bài
        </button>

        <button
          id="btn-submit-quiz"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary"
          style={{
            padding: '12px 28px', fontSize: '15px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px',
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              Đang chấm điểm...
            </>
          ) : (
            <>
              <Send size={16} />
              Nộp bài ({answeredCount}/{totalCount} câu)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
