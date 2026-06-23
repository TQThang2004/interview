import React from 'react';
import {
  ThumbsUp, MessageSquare, Bookmark, ChevronRight, BookOpen
} from 'lucide-react';

const CATEGORY_COLOR = {
  'Kinh nghiệm': { bg: 'oklch(75% 0.17 150 / 0.12)', color: 'oklch(68% 0.2 145)', border: 'oklch(75% 0.17 150 / 0.3)' },
  'Câu hỏi':     { bg: 'var(--primary-12)', color: 'var(--primary)', border: 'var(--primary-30)' },
  'Tài nguyên':  { bg: 'oklch(68% 0.16 230 / 0.12)', color: 'oklch(62% 0.18 230)', border: 'oklch(68% 0.16 230 / 0.3)' },
  'Thảo luận':   { bg: 'oklch(78% 0.14 60 / 0.12)', color: 'oklch(72% 0.18 60)', border: 'oklch(78% 0.14 60 / 0.3)' },
};

export { CATEGORY_COLOR };

export function StatusBadge({ status }) {
  const STATUS_CONFIG = {
    pending:  { color: 'oklch(78% 0.18 80)',  label: 'Chờ duyệt',    bg: 'oklch(78% 0.18 80 / 0.1)' },
    approved: { color: 'oklch(68% 0.2 145)',  label: 'Đã duyệt',     bg: 'oklch(68% 0.2 145 / 0.1)' },
    rejected: { color: 'oklch(62% 0.22 25)',  label: 'Bị từ chối',   bg: 'oklch(62% 0.22 25 / 0.1)' },
  };
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`
    }}>
      {cfg.label}
    </span>
  );
}

export default function PostCard({ post, onLike, onSave, showStatus }) {
  const cat = CATEGORY_COLOR[post.category] || {};
  return (
    <div className="glass-card" style={{ padding: '22px', transition: 'all 0.25s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-40)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: 'var(--gradient-primary)' }}>
            <img src={post.author_avatar || '/avatar-default.jpg'} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>{post.author_name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString('vi-VN')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {showStatus && <StatusBadge status={post.status} />}
          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
            {post.category}
          </span>
        </div>
      </div>

      <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', lineHeight: 1.4 }}>{post.title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.65, marginBottom: '14px' }}>
        {post.content.length > 300 ? post.content.substring(0, 300) + '...' : post.content}
      </p>

      {post.image_url && (
        <div style={{ marginBottom: '14px', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <img src={post.image_url} alt="post" style={{ width: '100%', maxHeight: '520px', objectFit: 'contain', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {post.tags.map(t => (
            <span key={t} style={{ fontSize: '11px', color: 'var(--primary-light)', background: 'var(--primary-08)', border: '1px solid var(--primary-15)', borderRadius: '999px', padding: '2px 8px' }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        {onLike && (
          <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: post.is_liked ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            <ThumbsUp size={14} /> {post.likes_count}
          </button>
        )}
        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          <MessageSquare size={14} /> {post.comments_count}
        </button>
        {onSave && (
          <button onClick={() => onSave(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: post.is_saved ? 'oklch(80% 0.18 80)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
            <Bookmark size={14} fill={post.is_saved ? 'oklch(80% 0.18 80)' : 'none'} /> {post.is_saved ? 'Đã lưu' : 'Lưu'}
          </button>
        )}
        <button style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginLeft: onSave ? '0' : 'auto' }}>
          Đọc thêm <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

export function PostList({ posts, loading, onLike, onSave, showStatus }) {
  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải bài viết...</div>;
  if (posts.length === 0) return <div style={{ textAlign: 'center', padding: '40px' }}>Không có bài viết nào.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {posts.map(post => (
        <PostCard key={post.id} post={post} onLike={onLike} onSave={onSave} showStatus={showStatus} />
      ))}
    </div>
  );
}
