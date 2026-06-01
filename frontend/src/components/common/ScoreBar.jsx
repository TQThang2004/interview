import React from 'react';

/**
 * ScoreBar – thanh hiển thị điểm số dạng progress bar.
 * @param {{ score: number, maxWidth?: string }} props
 */
export default function ScoreBar({ score, maxWidth = '100px' }) {
  const color =
    score >= 8   ? 'oklch(72% 0.18 145)' :
    score >= 6.5 ? 'oklch(80% 0.18 80)' :
                   'oklch(65% 0.22 25)';
  return (
    <div style={{ width: maxWidth, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
    </div>
  );
}
