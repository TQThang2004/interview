import React from 'react';
import { Star, Target } from 'lucide-react';
import ScoreBar from '../../../components/common/ScoreBar';

export default function CVEvalResult({ result, onReset }) {
  const overallColor = result.overall >= 8 ? 'oklch(72% 0.18 145)' : result.overall >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';

  return (
    <div>
      {/* Overall score */}
      <div className="glass-card" style={{
        padding: '28px', display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '20px',
      }}>
        <div style={{ textAlign: 'center', minWidth: '90px' }}>
          <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, color: overallColor }}>{result.overall}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Điểm tổng</div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>
            {result.overall >= 8 ? '🎉 CV rất tốt!' : result.overall >= 6.5 ? '👍 CV ổn, cần cải thiện' : '⚠️ CV cần cải thiện nhiều'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            {result.overall >= 8
              ? 'CV của bạn có chất lượng cao và sẽ gây ấn tượng tốt với nhà tuyển dụng.'
              : 'Có một số điểm cần cải thiện để tăng tỷ lệ được chọn.'}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button className="btn-ghost" onClick={onReset} style={{ fontSize: '13px' }}>
            Đánh giá lại
          </button>
        </div>
      </div>

      {/* Section scores */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={15} style={{ color: 'var(--primary)' }} /> Điểm theo từng phần
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {result.sections.map((s, i) => (
            <div key={i} style={{ borderBottom: i < result.sections.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < result.sections.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>{s.name}</span>
                <ScoreBar score={s.score} />
                <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '32px', textAlign: 'right', color: s.score >= 8 ? 'oklch(72% 0.18 145)' : s.score >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)' }}>
                  {s.score}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={15} style={{ color: 'oklch(80% 0.18 80)' }} /> Gợi ý cải thiện
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {result.suggestions.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--primary-contrast)', flexShrink: 0, marginTop: '1px' }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
