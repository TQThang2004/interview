import React, { useEffect } from 'react';
import { CheckCheck, AlertTriangle, X } from 'lucide-react';

/**
 * Toast thông báo nổi nhỏ ở góc phải.
 * @param {{ message: string, type?: 'success'|'error'|'info', onClose: () => void }} props
 */
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'oklch(72% 0.18 145 / 0.12)', border: 'oklch(72% 0.18 145 / 0.4)', text: 'oklch(60% 0.2 145)' },
    error:   { bg: 'oklch(65% 0.22 25 / 0.12)',  border: 'oklch(65% 0.22 25 / 0.4)',  text: 'oklch(55% 0.22 25)' },
    info:    { bg: 'oklch(83.3% 0.145 321.434 / 0.1)', border: 'oklch(83.3% 0.145 321.434 / 0.35)', text: 'var(--primary)' },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, borderRadius: '14px', padding: '14px 20px',
      fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', backdropFilter: 'blur(12px)',
      animation: 'slideUp 0.3s ease',
    }}>
      {type === 'success' ? <CheckCheck size={16} /> : type === 'error' ? <AlertTriangle size={16} /> : null}
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: 0, display: 'flex' }}>
        <X size={14} />
      </button>
    </div>
  );
}
