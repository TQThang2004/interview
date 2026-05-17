/**
 * LoadingScreen.jsx
 * Màn hình loading tái sử dụng với icon xoay.
 */
import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingScreen({ message }) {
  return (
    <div style={{ padding: 'clamp(40px, 10vw, 100px) 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'var(--primary-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 0 0 2px var(--primary-glow) inset, 0 0 20px var(--primary-glow)',
      }}>
        <RefreshCw size={28} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center' }}>
        {message}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
        Quá trình này có thể mất vài giây, vui lòng đợi...
      </p>
    </div>
  );
}
