import React from 'react';
import { Bell } from 'lucide-react';

export default function CommunityNotifications({ notifications, loading, unreadCount, onMarkAllRead, onMarkRead }) {
  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Thông báo</h3>
        {unreadCount > 0 && (
          <button onClick={onMarkAllRead} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải...</div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Chưa có thông báo nào.</p>
        </div>
      ) : notifications.map(notif => (
        <div key={notif.id} className="glass-card" style={{
          padding: '16px 20px', marginBottom: '10px',
          background: notif.is_read ? '' : 'var(--primary-04)',
          borderColor: notif.is_read ? '' : 'var(--primary-25)',
          cursor: notif.is_read ? 'default' : 'pointer'
        }} onClick={() => !notif.is_read && onMarkRead(notif.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                {notif.message}
              </p>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {new Date(notif.created_at).toLocaleString('vi-VN')}
              </div>
            </div>
            {!notif.is_read && (
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--primary)', flexShrink: 0, marginTop: '6px'
              }} />
            )}
          </div>
        </div>
      ))}
    </>
  );
}
