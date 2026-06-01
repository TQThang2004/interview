import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteDialog({ filename, onConfirm, onCancel, deleting }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '32px', textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px',
          background: 'oklch(65% 0.22 25 / 0.12)', border: '1px solid oklch(65% 0.22 25 / 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trash2 size={26} style={{ color: 'oklch(60% 0.22 25)' }} />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '10px' }}>Xóa bản đánh giá?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          Bản đánh giá <strong>"{filename}"</strong> và file CV trên Cloudinary sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '10px 22px', borderRadius: '10px', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
          }}>
            Hủy
          </button>
          <button onClick={onConfirm} disabled={deleting} style={{
            padding: '10px 22px', borderRadius: '10px', border: 'none',
            background: 'oklch(60% 0.22 25)', color: 'white',
            cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px',
            opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            {deleting ? <><svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Đang xóa...</> : <><Trash2 size={14} /> Xóa bản đánh giá</>}
          </button>
        </div>
      </div>
    </div>
  );
}
