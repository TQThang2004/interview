import React from 'react';
import { BookOpen, Trash2 } from 'lucide-react';
import { CATEGORY_COLOR, StatusBadge } from './PostCard';

export default function CommunityMyPosts({ myPosts, loading, onDelete, onNewPost }) {
  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Bài viết của tôi ({myPosts.length})</h3>
        <button onClick={onNewPost} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          Đăng bài mới
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải...</div>
      ) : myPosts.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Bạn chưa có bài viết nào.</p>
        </div>
      ) : myPosts.map(post => {
        const cat = CATEGORY_COLOR[post.category] || {};
        return (
          <div key={post.id} className="glass-card" style={{ padding: '20px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                  {post.category}
                </span>
                <StatusBadge status={post.status} />
              </div>
              <button onClick={() => onDelete(post.id)} style={{
                background: 'oklch(62% 0.22 25 / 0.1)', border: '1px solid oklch(62% 0.22 25 / 0.3)',
                color: 'oklch(62% 0.22 25)', borderRadius: '8px', cursor: 'pointer',
                padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <Trash2 size={12} /> Xóa
              </button>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{post.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>
              {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
            </p>
            {post.image_url && (
              <div style={{ marginBottom: '10px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                <img src={post.image_url} alt="post" style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
            {post.status === 'pending' && (
              <div style={{
                padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
                background: 'oklch(78% 0.18 80 / 0.1)', color: 'oklch(72% 0.18 60)',
                border: '1px solid oklch(78% 0.18 80 / 0.3)'
              }}>
                ⏳ Bài đang chờ admin kiểm duyệt. Bài sẽ hiển thị công khai sau khi được duyệt.
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {new Date(post.created_at).toLocaleString('vi-VN')}
              {post.likes_count > 0 && <span style={{ marginLeft: '12px' }}>❤️ {post.likes_count}</span>}
              {post.comments_count > 0 && <span style={{ marginLeft: '8px' }}>💬 {post.comments_count}</span>}
            </div>
          </div>
        );
      })}
    </>
  );
}
