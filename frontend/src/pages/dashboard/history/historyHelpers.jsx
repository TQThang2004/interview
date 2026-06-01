import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Hoàn thành', color: 'oklch(68% 0.2 145)', bg: 'oklch(72% 0.18 145 / 0.1)' },
    in_progress: { label: 'Đang diễn ra', color: 'oklch(70% 0.18 80)', bg: 'oklch(80% 0.18 80 / 0.1)' },
    cancelled: { label: 'Đã thoát', color: 'oklch(60% 0.22 25)', bg: 'oklch(65% 0.22 25 / 0.1)' },
  };
  const s = map[status] || { label: status, color: 'var(--text-muted)', bg: 'transparent' };
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, color: s.color, background: s.bg,
      padding: '2px 8px', borderRadius: '6px', border: `1px solid ${s.color}33`,
    }}>
      {s.label}
    </span>
  );
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function calcDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null;
  const ms = new Date(completedAt) - new Date(startedAt);
  const mins = Math.round(ms / 60000);
  return mins > 0 ? `${mins} phút` : '< 1 phút';
}

/**
 * Parse ai_evaluation: hỗ trợ cả JSON mới và text cũ.
 */
export function parseAiEvaluation(raw) {
  if (!raw) return null;
  // Thử parse JSON (format mới)
  try {
    const obj = JSON.parse(raw);
    if (obj && (obj.strengths || obj.weaknesses || obj.suggestions)) return obj;
  } catch (_) {}
  // Fallback: parse text cũ "ĐIỂM MẠNH: ..."
  const result = {};
  const lines = raw.split('\n');
  let currentKey = null;
  let buffer = [];
  const flush = () => buffer.join(' ').trim();

  for (const line of lines) {
    const s = line.trim().replace(/\*/g, '');
    if (s.startsWith('ĐIỂM:') || s.startsWith('DIEM:')) {
      result.score_str = s.split(':')[1]?.trim();
      currentKey = null; buffer = [];
    } else if (s.startsWith('ĐIỂM MẠNH:') || s.startsWith('DIEM MANH:')) {
      if (currentKey) result[currentKey] = flush();
      currentKey = 'strengths'; buffer = [s.split(':')[1]?.trim() || ''];
    } else if (s.startsWith('ĐIỂM YẾU:') || s.startsWith('DIEM YEU:')) {
      if (currentKey) result[currentKey] = flush();
      currentKey = 'weaknesses'; buffer = [s.split(':')[1]?.trim() || ''];
    } else if (s.startsWith('GỢI Ý') || s.startsWith('GOI Y')) {
      if (currentKey) result[currentKey] = flush();
      currentKey = 'suggestions'; buffer = [s.split(':').slice(1).join(':').trim() || ''];
    } else if (currentKey && s) {
      buffer.push(s);
    }
  }
  if (currentKey) result[currentKey] = flush();
  return Object.keys(result).length > 0 ? result : null;
}
