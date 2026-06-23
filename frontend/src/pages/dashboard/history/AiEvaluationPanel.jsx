import React from 'react';
import { Lightbulb, ThumbsUp, AlertTriangle } from 'lucide-react';
import { parseAiEvaluation } from './historyHelpers';

export default function AiEvaluationPanel({ aiEvaluation }) {
  const parsed = parseAiEvaluation(aiEvaluation);
  if (!parsed) return null;

  return (
    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parsed.strengths && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px',
          background: 'oklch(72% 0.18 145 / 0.06)',
          border: '1px solid oklch(72% 0.18 145 / 0.2)',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
        }}>
          <ThumbsUp size={14} style={{ color: 'oklch(68% 0.2 145)', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'oklch(68% 0.2 145)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Điểm mạnh
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {parsed.strengths}
            </p>
          </div>
        </div>
      )}

      {parsed.weaknesses && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px',
          background: 'oklch(65% 0.22 25 / 0.06)',
          border: '1px solid oklch(65% 0.22 25 / 0.2)',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
        }}>
          <AlertTriangle size={14} style={{ color: 'oklch(65% 0.22 25)', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'oklch(65% 0.22 25)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Cần cải thiện
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {parsed.weaknesses}
            </p>
          </div>
        </div>
      )}

      {parsed.suggestions && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px',
          background: 'var(--primary-06)',
          border: '1px solid var(--primary-20)',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
        }}>
          <Lightbulb size={14} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              Gợi ý AI cải thiện
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {parsed.suggestions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
