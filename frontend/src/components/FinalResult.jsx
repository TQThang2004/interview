import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function FinalResult({ history, topic, total, onRestart }) {
  const avgScore = history.length ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1) : 0;
  return (
    <div style={{ padding: 'clamp(30px, 6vw, 80px) 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: 'clamp(32px, 5vw, 48px)', textAlign: 'center' }}>
        {avgScore >= 7.0 ? (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'oklch(65% 0.15 150 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
          </div>
        ) : (
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'oklch(65% 0.22 40 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertCircle size={40} style={{ color: 'oklch(65% 0.22 40)' }} />
          </div>
        )}
        
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Hoàn Thành!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>Bạn đã hoàn thành hệ thống phỏng vấn "{topic}".</p>
        
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Điểm Trung Bình</div>
          <div style={{ fontSize: '48px', fontWeight: 900, color: avgScore >= 7.0 ? 'var(--success)' : 'oklch(65% 0.22 40)', lineHeight: 1 }}>
            {avgScore} <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>/ 10</span>
          </div>
        </div>

        <button onClick={onRestart} className="btn-primary"
          style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RefreshCw size={20} /> Bắt Đầu Phiên Khác
        </button>
      </div>
    </div>
  );
}
