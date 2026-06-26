import React, { useState, useRef, useEffect } from 'react';
import {
  X, ThumbsUp, Bookmark, MessageSquare, Send, Trash2, Clock,
} from 'lucide-react';
import { CATEGORY_COLOR } from './PostCard';

/* ── Helpers ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

/* ── Single comment row ── */
function CommentItem({ comment, currentUserId, onDelete }) {
  const isOwner = comment.author_id === currentUserId;
  const [hovering, setHovering] = useState(false);

  return (
    <div
      style={{
        display: 'flex', gap: '12px', padding: '14px 0',
        borderBottom: '1px solid var(--border)',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden',
        flexShrink: 0, background: 'var(--gradient-primary)',
      }}>
        <img
          src={comment.author_avatar || '/avatar-default.jpg'} alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 700, fontSize: '13px' }}>{comment.author_name}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} /> {timeAgo(comment.created_at)}
          </span>
          {isOwner && hovering && (
            <button
              onClick={() => onDelete(comment.id)}
              title="Xóa comment"
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'oklch(62% 0.22 25)', fontSize: '11px', fontWeight: 500,
                opacity: 0.85, transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
            >
              <Trash2 size={12} /> Xóa
            </button>
          )}
        </div>
        <p style={{
          fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {comment.content}
        </p>
      </div>
    </div>
  );
}

/* ── Main Modal ── */
export default function PostDetailModal({
  post,
  comments,
  commentsLoading,
  currentUserId,
  onClose,
  onLike,
  onSave,
  onAddComment,
  onDeleteComment,
}) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Auto-scroll to bottom when new comment added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onAddComment(post.id, trimmed);
      setCommentText('');
      textareaRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Ctrl+Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const cat = CATEGORY_COLOR[post.category] || {};

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Inject keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '720px', maxHeight: '88vh',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '20px', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'slideUp 0.3s ease',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
              background: 'var(--gradient-primary)', flexShrink: 0,
            }}>
              <img
                src={post.author_avatar || '/avatar-default.jpg'} alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{post.author_name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={10} /> {new Date(post.created_at).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
              background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
            }}>
              {post.category}
            </span>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '10px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-40)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Title */}
          <h2 style={{ fontWeight: 800, fontSize: '20px', lineHeight: 1.4, marginBottom: '16px' }}>
            {post.title}
          </h2>

          {/* Content */}
          <div style={{
            fontSize: '14px', lineHeight: 1.75, color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '16px',
          }}>
            {post.content}
          </div>

          {/* Image */}
          {post.image_url && (
            <div style={{
              marginBottom: '16px', borderRadius: '14px', overflow: 'hidden',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', justifyContent: 'center',
            }}>
              <img
                src={post.image_url} alt="post"
                style={{ width: '100%', maxHeight: '520px', objectFit: 'contain', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {post.tags.map(t => (
                <span key={t} style={{
                  fontSize: '11px', color: 'var(--primary-light)',
                  background: 'var(--primary-08)', border: '1px solid var(--primary-15)',
                  borderRadius: '999px', padding: '3px 10px',
                }}>
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
            marginBottom: '20px',
          }}>
            {onLike && (
              <button
                onClick={() => onLike(post.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                  color: post.is_liked ? 'var(--primary)' : 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                  transition: 'color 0.2s',
                }}
              >
                <ThumbsUp size={15} /> {post.likes_count}
              </button>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
              color: 'var(--primary)', fontWeight: 600,
            }}>
              <MessageSquare size={15} /> {comments.length} bình luận
            </div>
            {onSave && (
              <button
                onClick={() => onSave(post.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                  color: post.is_saved ? 'oklch(80% 0.18 80)' : 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
                  marginLeft: 'auto', transition: 'color 0.2s',
                }}
              >
                <Bookmark size={15} fill={post.is_saved ? 'oklch(80% 0.18 80)' : 'none'} />
                {post.is_saved ? 'Đã lưu' : 'Lưu'}
              </button>
            )}
          </div>

          {/* ── Comments Section ── */}
          <h3 style={{
            fontWeight: 700, fontSize: '15px', marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <MessageSquare size={16} style={{ color: 'var(--primary)' }} /> Bình luận
          </h3>

          {commentsLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Đang tải bình luận...
            </div>
          ) : comments.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '30px',
              color: 'var(--text-muted)', fontSize: '13px',
              background: 'var(--primary-04)', borderRadius: '12px',
              border: '1px dashed var(--border)',
            }}>
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </div>
          ) : (
            <div>
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  currentUserId={currentUserId}
                  onDelete={onDeleteComment}
                />
              ))}
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* ── Comment Input (sticky bottom) ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '16px 24px', borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface)', flexShrink: 0,
            display: 'flex', gap: '12px', alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Viết bình luận... (Ctrl+Enter để gửi)"
            rows={2}
            style={{
              flex: 1, resize: 'none',
              padding: '12px 16px', borderRadius: '14px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '13px', lineHeight: 1.5,
              outline: 'none', transition: 'border-color 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary-40)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || submitting}
            style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: commentText.trim() && !submitting ? 'var(--gradient-primary, var(--primary))' : 'var(--bg-elevated)',
              border: '1px solid',
              borderColor: commentText.trim() && !submitting ? 'var(--primary-40)' : 'var(--border)',
              color: commentText.trim() && !submitting ? 'var(--primary-contrast, #0B0C10)' : 'var(--text-muted)',
              cursor: commentText.trim() && !submitting ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s', flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
