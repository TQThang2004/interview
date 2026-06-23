import React from 'react';
import { Download, Star, Lightbulb, Clock, Trash2 } from 'lucide-react';
import ScoreBar from '../../../components/common/ScoreBar';
import { formatDate } from './cvHistoryHelpers';

export default function EvalResultPanel({ evaluation, onDelete, deleting }) {
  const result = evaluation.evaluation_result;
  if (!result) return null;

  const overall = Number(result.overall || evaluation.overall_score || 0);
  const overallColor =
    overall >= 8   ? 'oklch(72% 0.18 145)' :
    overall >= 6.5 ? 'oklch(80% 0.18 80)' :
                     'oklch(65% 0.22 25)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Overall */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center', minWidth: '72px' }}>
            <div style={{ fontSize: '40px', fontWeight: 900, lineHeight: 1, color: overallColor }}>{overall}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Điểm tổng</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
              {overall >= 8 ? '🎉 CV rất tốt!' : overall >= 6.5 ? '👍 CV ổn, cần cải thiện' : '⚠️ CV cần cải thiện nhiều'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={11} /> {formatDate(evaluation.evaluated_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {result.sections?.length > 0 && (
        <div className="glass-card" style={{ padding: '18px', flex: '1 0 auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={12} style={{ color: 'var(--primary)' }} /> Điểm theo từng phần
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.sections.map((s, i) => (
              <div key={i} style={{ borderBottom: i < result.sections.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < result.sections.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{s.name}</span>
                  <ScoreBar score={s.score} maxWidth="80px" />
                  <span style={{ fontWeight: 700, fontSize: '13px', minWidth: '28px', textAlign: 'right', color: s.score >= 8 ? 'oklch(72% 0.18 145)' : s.score >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)' }}>
                    {s.score}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{s.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={12} style={{ color: 'oklch(80% 0.18 80)' }} /> Gợi ý cải thiện
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--primary-contrast)', flexShrink: 0, marginTop: '1px' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="no-print"
        onClick={() => window.print()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px', borderRadius: '12px', border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text-secondary)',
          cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        }}
      >
        <Download size={14} /> Xuat ket qua PDF
      </button>

      {/* Delete button */}
      <button
        className="no-print"
        onClick={onDelete}
        disabled={deleting}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px', borderRadius: '12px', border: '1px solid oklch(65% 0.22 25 / 0.4)',
          background: 'oklch(65% 0.22 25 / 0.06)', color: 'oklch(60% 0.22 25)',
          cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600,
          opacity: deleting ? 0.6 : 1, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!deleting) { e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.15)'; }}}
        onMouseLeave={e => { e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.06)'; }}
      >
        <Trash2 size={14} /> Xóa bản đánh giá này
      </button>
    </div>
  );
}
