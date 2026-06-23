/**
 * QuizResult.jsx
 * Trang tổng kết sau khi nộp bài kiểm tra.
 * Hiển thị: điểm tổng, số câu đúng/sai, chi tiết + đáp án từng câu.
 */
import React, { useState } from 'react';
import { Trophy, CheckCircle, XCircle, ChevronDown, ChevronUp, RotateCcw, BookOpen, Star } from 'lucide-react';

function ScoreRing({ score, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(10, parseFloat(score) || 0));
  const strokeDashoffset = circumference - (pct / 10) * circumference;
  const color = pct >= 8 ? 'oklch(72% 0.18 145)' : pct >= 6 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size > 100 ? '22px' : '16px', fontWeight: 900, color }}>{pct.toFixed(1)}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>/10</span>
      </div>
    </div>
  );
}

function isSkippedResult(item, score) {
  const answer = (item.user_answer || '').trim();
  return !answer || answer === '(Bỏ qua)' || answer === '(Bo qua)' || score === 0;
}

function QuestionDetail({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const score = parseFloat(item.score) || 0;
  const skipped = isSkippedResult(item, score);
  const passed = !skipped && score >= 6;
  const color = skipped ? 'oklch(65% 0.02 250)' : score >= 8 ? 'oklch(72% 0.18 145)' : score >= 6 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      border: `1px solid ${passed ? 'oklch(72% 0.18 145 / 0.3)' : 'oklch(65% 0.22 25 / 0.3)'}`,
      background: 'var(--bg-elevated)',
      marginBottom: '10px',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: '14px', padding: '14px 18px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Status icon */}
        <div style={{ flexShrink: 0 }}>
          {passed
            ? <CheckCircle size={20} style={{ color: 'oklch(72% 0.18 145)' }} />
            : <XCircle size={20} style={{ color: 'oklch(65% 0.22 25)' }} />
          }
        </div>

        {/* Question */}
        <div style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, textAlign: 'left' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Câu {index + 1}.</span>
          {item.question}
        </div>

        {/* Score */}
        <div style={{ fontWeight: 800, fontSize: '15px', color, flexShrink: 0, marginRight: '8px' }}>
          {skipped ? 'Bỏ qua - 0/10' : `${score.toFixed(1)}/10`}
        </div>

        {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
      </button>

      {/* Detail */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
          {/* User answer */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Câu trả lời của bạn
            </div>
            <div style={{
              padding: '12px 14px', borderRadius: '10px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              fontSize: '14px', lineHeight: 1.6,
              fontStyle: skipped ? 'italic' : 'normal',
              color: skipped ? 'var(--text-muted)' : 'var(--text-primary)',
            }}>
              {item.user_answer || '(Bỏ qua)'}
            </div>
          </div>

          {skipped && (
            <div style={{
              marginTop: '12px', padding: '12px 14px', borderRadius: '10px',
              background: 'oklch(65% 0.22 25 / 0.07)',
              border: '1px solid oklch(65% 0.22 25 / 0.25)',
              fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)',
            }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'oklch(65% 0.22 25)' }}>
                Câu này bị bỏ qua nên được tính 0 điểm.
              </p>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Hãy nhập câu trả lời trước khi nộp để được chấm điểm và nhận góp ý.
              </p>
            </div>
          )}

          {/* AI evaluation */}
          {!skipped && (item.strengths || item.weaknesses || item.suggestions) && (
            <div style={{
              marginTop: '12px', padding: '12px 14px', borderRadius: '10px',
              background: `${color.replace(')', ' / 0.06)').replace('oklch(', 'oklch(')}`,
              border: `1px solid ${color.replace(')', ' / 0.2)').replace('oklch(', 'oklch(')}`,
            }}>
              {item.strengths && (
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <span style={{ fontWeight: 700, color: 'oklch(72% 0.18 145)' }}>✨ Điểm mạnh:</span> {item.strengths}
                </p>
              )}
              {item.weaknesses && (
                <p style={{ margin: '0 0 6px', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <span style={{ fontWeight: 700, color: 'oklch(72% 0.17 50)' }}>⚠️ Cần cải thiện:</span> {item.weaknesses}
                </p>
              )}
              {item.suggestions && (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>
                  <span style={{ fontWeight: 700, color: 'oklch(70% 0.15 250)' }}>💡 Gợi ý:</span> {item.suggestions}
                </p>
              )}
            </div>
          )}

          {/* Reference answer */}
          {item.reference_answer && (
            <div style={{ marginTop: '12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px',
              }}>
                <BookOpen size={12} /> Đáp án tham khảo
              </div>
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'oklch(72% 0.18 145 / 0.07)',
                border: '1px solid oklch(72% 0.18 145 / 0.25)',
                fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {item.reference_answer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuizResult({ result, topic, level, onRetry, onSelectTopic }) {
  const { overall_score, correct_count, total_questions, results = [] } = result;
  const score = parseFloat(overall_score) || 0;
  const skippedCount = result.skipped_count ?? results.filter(item => isSkippedResult(item, parseFloat(item.score) || 0)).length;
  const wrongCount = Math.max(0, total_questions - correct_count - skippedCount);

  const rankLabel = score >= 9 ? 'Xuất sắc 🏆' : score >= 8 ? 'Giỏi 🌟' : score >= 7 ? 'Khá 👍' : score >= 6 ? 'Trung bình 📚' : 'Cần ôn tập 💪';
  const rankColor = score >= 8 ? 'oklch(72% 0.18 145)' : score >= 6 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '800px' }}>
      {/* Result card */}
      <div className="glass-card" style={{
        padding: 'clamp(24px, 4vw, 40px)',
        marginBottom: '24px',
        background: 'var(--primary-04)',
        border: '1px solid var(--primary-20)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Hoàn thành bài kiểm tra!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {topic} · {level} · {total_questions} câu hỏi
          </p>
        </div>

        {/* Score + stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <ScoreRing score={score} size={130} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800,
              color: rankColor, letterSpacing: '-0.01em',
            }}>
              {rankLabel}
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'oklch(72% 0.18 145)' }}>
                  {correct_count}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Câu đúng ✅</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'oklch(65% 0.22 25)' }}>
                  {wrongCount}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Câu sai ❌</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-muted)' }}>
                  {skippedCount}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Bỏ qua</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'oklch(80% 0.18 80)' }}>
                  {score.toFixed(1)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Điểm TB</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="btn-retry-practice"
            onClick={onRetry}
            className="btn-primary"
            style={{
              padding: '12px 24px', fontSize: '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <RotateCcw size={16} /> Làm lại chủ đề này
          </button>
          <button
            id="btn-select-topic"
            onClick={onSelectTopic}
            style={{
              padding: '12px 24px', fontSize: '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '8px',
              borderRadius: '12px', border: '1px solid var(--border)',
              background: 'var(--bg-elevated)', cursor: 'pointer', color: 'var(--text-primary)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <BookOpen size={16} /> Chọn chủ đề khác
          </button>
        </div>
      </div>

      {/* Detail per question */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={16} style={{ color: 'var(--primary)' }} /> Chi tiết từng câu
        </h2>
        {results.map((item, idx) => (
          <QuestionDetail key={item.answer_id || idx} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
}
