import React from 'react';

/**
 * ScoreChip – badge hiển thị điểm số dạng chip tròn.
 * @param {{ score: number|null }} props
 */
export default function ScoreChip({ score }) {
  if (score == null) return <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span>;
  const s = Number(score);
  const [color, bg] =
    s >= 8   ? ['oklch(68% 0.2 145)', 'oklch(72% 0.18 145 / 0.12)'] :
    s >= 6.5 ? ['oklch(70% 0.18 80)', 'oklch(80% 0.18 80 / 0.12)'] :
               ['oklch(60% 0.22 25)', 'oklch(65% 0.22 25 / 0.12)'];
  return (
    <span style={{ fontWeight: 700, fontSize: '14px', color, background: bg, padding: '3px 10px', borderRadius: '999px' }}>
      {s.toFixed(1)}/10
    </span>
  );
}
