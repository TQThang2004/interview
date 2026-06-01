import React, { useEffect, useRef } from 'react';
import { useModal } from '../../context/ModalContext';
import { X, AlertCircle, Info } from 'lucide-react';

export default function GlobalModal() {
  const { modalState } = useModal();
  const { isOpen, type, title, message, confirmText, cancelText, danger, onConfirm, onCancel } = modalState;

  const modalRef = useRef(null);

  // Focus trap / escape key handling could go here
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      
      <div ref={modalRef} className="glass-card" style={{
        width: '100%', maxWidth: '420px', padding: '24px',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column', gap: '20px',
        boxShadow: 'var(--shadow-xl)',
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: danger ? 'oklch(65% 0.22 25 / 0.1)' : 'var(--gradient-primary)',
              color: danger ? 'oklch(65% 0.22 25)' : 'oklch(15% 0.01 250)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {type === 'alert' && !danger ? <Info size={22} /> : <AlertCircle size={22} />}
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h3>
          </div>
          {type === 'alert' && (
            <button
              onClick={onCancel}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: '6px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {message}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          {type === 'confirm' && (
            <button
              className="btn-ghost"
              onClick={onCancel}
              style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 600 }}
            >
              {cancelText}
            </button>
          )}
          <button
            className="btn-primary"
            onClick={onConfirm}
            style={{
              padding: '10px 24px', fontSize: '14px', fontWeight: 600,
              background: danger ? 'oklch(65% 0.22 25)' : 'var(--gradient-primary)',
              color: danger ? 'white' : 'oklch(15% 0.01 250)',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
