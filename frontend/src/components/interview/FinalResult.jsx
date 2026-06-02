import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Star, TrendingUp } from 'lucide-react';

function ScoreBar({ score, index }) {
  const color = score >= 8
    ? 'oklch(72% 0.18 145)'
    : score >= 6
    ? 'oklch(80% 0.18 80)'
    : 'oklch(65% 0.22 25)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, width: '30px', flexShrink: 0 }}>
        #{index + 1}
      </span>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          background: color,
          width: `${(score / 10) * 100}%`,
          transition: 'width 0.8s ease',
        }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color, width: '36px', textAlign: 'right', flexShrink: 0 }}>
        {Number(score).toFixed(1)}
      </span>
    </div>
  );
}

export default function FinalResult({ history, topic, total, onRestart }) {
  // history = finalScores (mảng số, đầy đủ cả câu cuối)
  const hasAnswered = history.length > 0;
  const avgScore = hasAnswered
    ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1)
    : '0.0';

  const numAvg = parseFloat(avgScore);
  const isGood = numAvg >= 7.0;
  const isPerfect = numAvg >= 9.0;
  const isEarlyEnd = history.length < total;

  let emoji = '😊';
  let label = 'Khá tốt!';
  if (!hasAnswered) { emoji = '🚪'; label = 'Đã kết thúc sớm'; }
  else if (isPerfect) { emoji = '🏆'; label = 'Xuất sắc!'; }
  else if (numAvg >= 8.5) { emoji = '🌟'; label = 'Rất giỏi!'; }
  else if (numAvg >= 7) { emoji = '✅'; label = 'Tốt!'; }
  else if (numAvg >= 5) { emoji = '📈'; label = 'Cần cố gắng thêm'; }
  else { emoji = '💪'; label = 'Hãy luyện tập thêm'; }

  return (
    <div style={{ padding: 'clamp(20px, 5vw, 60px) 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Main score card */}
        <div className="glass-card" style={{ padding: 'clamp(28px, 5vw, 44px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* BG glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: isGood
              ? 'radial-gradient(ellipse 70% 50% at 50% 0%, oklch(72% 0.18 145 / 0.1) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 70% 50% at 50% 0%, oklch(65% 0.22 25 / 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Icon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: isGood ? 'oklch(65% 0.15 150 / 0.15)' : 'oklch(65% 0.22 40 / 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '36px',
          }}>
            {emoji}
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {label}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
            {hasAnswered ? (
              <>Bạn đã hoàn thành <strong>{history.length}/{total}</strong> câu hỏi cho chủ đề <strong>"{topic}"</strong>.
              {isEarlyEnd && <><br /><span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Phỏng vấn đã được kết thúc sớm.</span></>}
              </>
            ) : (
              <>Phỏng vấn chủ đề <strong>"{topic}"</strong> đã kết thúc.<br/>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Bạn chưa trả lời câu hỏi nào.</span></>
            )}
          </p>

          {/* Big score – chỉ hiện khi có điểm */}
          {hasAnswered ? (
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '28px', marginBottom: '24px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                Điểm Trung Bình
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '56px', fontWeight: 900, lineHeight: 1,
                  background: isGood ? 'var(--gradient-primary)' : 'linear-gradient(135deg, oklch(65% 0.22 25), oklch(75% 0.18 40))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {avgScore}
                </span>
                <span style={{ fontSize: '22px', color: 'var(--text-muted)', fontWeight: 500 }}>/10</span>
              </div>
              {/* Stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '12px' }}>
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i} size={14}
                    fill={i < Math.round(numAvg) ? 'oklch(80% 0.18 80)' : 'transparent'}
                    style={{ color: i < Math.round(numAvg) ? 'oklch(80% 0.18 80)' : 'var(--border)' }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '28px', marginBottom: '24px',
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                Không có dữ liệu điểm để hiển thị.<br />
                Hãy thử lại và cố gắng trả lời các câu hỏi nhé!
              </p>
            </div>
          )}

          <button onClick={onRestart} className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RefreshCw size={18} /> Bắt Đầu Phiên Khác
          </button>
        </div>

        {/* Per-question breakdown */}
        {history.length > 0 && (
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> Điểm từng câu hỏi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((score, i) => (
                <ScoreBar key={i} score={score} index={i} />
              ))}
            </div>
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'oklch(72% 0.18 145)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(72% 0.18 145)', display: 'inline-block' }} /> ≥8: Xuất sắc
              </span>
              <span style={{ fontSize: '12px', color: 'oklch(80% 0.18 80)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(80% 0.18 80)', display: 'inline-block' }} /> 6–8: Tốt
              </span>
              <span style={{ fontSize: '12px', color: 'oklch(65% 0.22 25)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'oklch(65% 0.22 25)', display: 'inline-block' }} /> &lt;6: Cần cải thiện
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
