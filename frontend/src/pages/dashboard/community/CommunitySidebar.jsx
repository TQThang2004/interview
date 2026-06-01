import React from 'react';
import { TrendingUp, Hash, Users } from 'lucide-react';

export default function CommunitySidebar({ tags }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: 0 }}>
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={15} style={{ color: 'var(--primary)' }} /> Tags phổ biến
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tags.map(t => (
            <button key={t.tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <Hash size={12} />{t.tag} ({t.count})
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={15} style={{ color: 'oklch(68% 0.16 230)' }} /> Thành viên
        </h3>
        <div style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>
          <span className="gradient-text">523</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>developer đang hoạt động</div>
      </div>

      {/* Quy định */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--text-primary)' }}>
          📋 Quy định đăng bài
        </h3>
        <ul style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '16px', lineHeight: 1.8, margin: 0 }}>
          <li>Nội dung phải liên quan đến lập trình/IT</li>
          <li>Không spam, quảng cáo không phép</li>
          <li>Tôn trọng thành viên khác</li>
          <li>Bài sẽ được duyệt trong 24h</li>
        </ul>
      </div>
    </div>
  );
}
