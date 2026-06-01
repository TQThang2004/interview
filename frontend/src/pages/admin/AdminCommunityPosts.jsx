import React, { useState, useEffect } from 'react';
import {
  Search, CheckCircle, XCircle, Trash2, Clock, Eye,
  Filter, RefreshCw, MessageSquare, ThumbsUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useModal } from '../../context/ModalContext';

const STATUS_CONFIG = {
  pending:  { color: 'oklch(78% 0.18 80)',  bg: 'oklch(78% 0.18 80 / 0.12)',  label: 'Chờ duyệt' },
  approved: { color: 'oklch(68% 0.2 145)',  bg: 'oklch(68% 0.2 145 / 0.12)', label: 'Đã duyệt'  },
  rejected: { color: 'oklch(62% 0.22 25)',  bg: 'oklch(62% 0.22 25 / 0.12)', label: 'Đã từ chối' },
};

const PAGE_SIZE = 15;

export default function AdminCommunityPosts() {
  const { showConfirm } = useModal();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // postId đang xử lý

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);

  const [expandedPost, setExpandedPost] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetCommunityPosts(PAGE_SIZE, page * PAGE_SIZE, statusFilter, search);
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, [statusFilter, page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleApprove = async (postId, title) => {
    setActionLoading(postId);
    try {
      await api.adminApprovePost(postId);
      setPosts(p => p.map(post => post.id === postId ? { ...post, status: 'approved' } : post));
      showToast(`✅ Đã duyệt bài "${title.substring(0, 40)}..."`);
    } catch (err) {
      showToast(err.message || 'Duyệt thất bại', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId, title) => {
    if (!await showConfirm(`Từ chối bài "${title.substring(0, 50)}"?\nBài sẽ bị xóa và tác giả sẽ nhận thông báo.`)) return;
    setActionLoading(postId);
    try {
      await api.adminRejectPost(postId);
      setPosts(p => p.filter(post => post.id !== postId));
      setTotal(t => t - 1);
      showToast('❌ Đã từ chối và xóa bài viết.');
    } catch (err) {
      showToast(err.message || 'Từ chối thất bại', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (postId, title) => {
    if (!await showConfirm(`Xóa bài "${title.substring(0, 50)}"?`)) return;
    setActionLoading(postId);
    try {
      const ok = await api.adminDeleteCommunityPost(postId);
      if (ok) {
        setPosts(p => p.filter(post => post.id !== postId));
        setTotal(t => t - 1);
        showToast('🗑️ Đã xóa bài viết.');
      }
    } catch (err) {
      showToast('Xóa thất bại', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pendingCount = posts.filter(p => p.status === 'pending').length;

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1200px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
          background: toast.type === 'error' ? 'oklch(62% 0.22 25 / 0.95)' : 'oklch(68% 0.2 145 / 0.95)',
          color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)', animation: 'slideIn 0.3s ease'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 800, marginBottom: '6px' }}>
          <span className="gradient-text">Quản lý bài viết</span> Community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Kiểm duyệt bài đăng, duyệt hoặc từ chối bài viết của người dùng.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng bài', value: total, color: 'var(--primary)' },
          { label: 'Chờ duyệt (trang này)', value: pendingCount, color: 'oklch(78% 0.18 80)' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: '14px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '200px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <Search className="input-icon" size={16} />
              <input className="input-field" placeholder="Tìm tiêu đề, tác giả..."
                value={searchInput} onChange={e => setSearchInput(e.target.value)}
                style={{ paddingLeft: '40px', height: '40px' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Tìm
            </button>
          </form>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { value: '',         label: 'Tất cả' },
              { value: 'pending',  label: '⏳ Chờ duyệt' },
              { value: 'approved', label: '✅ Đã duyệt' },
            ].map(opt => (
              <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setPage(0); }} style={{
                padding: '8px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '10px',
                background: statusFilter === opt.value ? 'var(--primary)' : 'var(--bg-elevated)',
                color: statusFilter === opt.value ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {opt.label}
              </button>
            ))}
          </div>

          <button onClick={() => { loadPosts(); }} style={{
            padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)'
          }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Đang tải...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <MessageSquare size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Không có bài viết nào.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {posts.map(post => {
            const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.pending;
            const isLoading = actionLoading === post.id;
            const isExpanded = expandedPost === post.id;

            return (
              <div key={post.id} className="glass-card" style={{
                padding: '18px 20px',
                borderColor: post.status === 'pending' ? 'oklch(78% 0.18 80 / 0.35)' : '',
              }}>
                {/* Row header */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--gradient-primary)', overflow: 'hidden'
                  }}>
                    <img src={post.author_avatar || '/avatar-default.jpg'} alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, lineHeight: 1.4 }}>{post.title}</h3>
                      <span style={{
                        flexShrink: 0, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                        color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.color}44`
                      }}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Meta */}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>👤 {post.author_name}</span>
                      <span>📧 {post.author_email}</span>
                      <span>📂 {post.category}</span>
                      <span>🕐 {new Date(post.created_at).toLocaleString('vi-VN')}</span>
                      <span><ThumbsUp size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {post.likes_count}</span>
                      <span><MessageSquare size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {post.comments_count}</span>
                    </div>

                    {/* Content preview */}
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                      {isExpanded ? post.content : (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content)}
                    </p>

                    {post.content.length > 150 && (
                      <button onClick={() => setExpandedPost(isExpanded ? null : post.id)} style={{
                        fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none',
                        cursor: 'pointer', padding: 0, marginBottom: '10px'
                      }}>
                        {isExpanded ? '▲ Thu gọn' : '▼ Xem thêm'}
                      </button>
                    )}

                    {/* Image */}
                    {post.image_url && (
                      <div style={{
                        marginBottom: '12px', borderRadius: '12px', overflow: 'hidden',
                        maxHeight: isExpanded ? '480px' : '200px',
                        transition: 'max-height 0.3s ease',
                        background: 'oklch(18% 0.02 260 / 0.5)',
                        border: '1px solid var(--border)',
                      }}>
                        <img
                          src={post.image_url}
                          alt="post"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => { e.target.closest('div').style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {post.tags.map(t => (
                          <span key={t} style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                            background: 'oklch(83.3% 0.145 321.434 / 0.08)',
                            border: '1px solid oklch(83.3% 0.145 321.434 / 0.15)',
                            color: 'var(--primary-light)'
                          }}>#{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {post.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(post.id, post.title)} disabled={isLoading} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '10px',
                            background: 'oklch(68% 0.2 145 / 0.15)', color: 'oklch(68% 0.2 145)',
                            border: '1px solid oklch(68% 0.2 145 / 0.4)', cursor: 'pointer',
                            opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s'
                          }}>
                            <CheckCircle size={13} /> {isLoading ? 'Đang duyệt...' : 'Duyệt bài'}
                          </button>
                          <button onClick={() => handleReject(post.id, post.title)} disabled={isLoading} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '10px',
                            background: 'oklch(62% 0.22 25 / 0.12)', color: 'oklch(62% 0.22 25)',
                            border: '1px solid oklch(62% 0.22 25 / 0.35)', cursor: 'pointer',
                            opacity: isLoading ? 0.6 : 1, transition: 'all 0.2s'
                          }}>
                            <XCircle size={13} /> {isLoading ? 'Đang xử lý...' : 'Từ chối'}
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(post.id, post.title)} disabled={isLoading} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '10px',
                        background: 'oklch(50% 0.2 25 / 0.08)', color: 'oklch(62% 0.22 25)',
                        border: '1px solid oklch(62% 0.22 25 / 0.2)', cursor: 'pointer',
                        opacity: isLoading ? 0.6 : 1, marginLeft: post.status !== 'pending' ? '0' : 'auto',
                        transition: 'all 0.2s'
                      }}>
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
            padding: '8px 14px', borderRadius: '10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', cursor: page === 0 ? 'not-allowed' : 'pointer',
            color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <ChevronLeft size={15} /> Trước
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Trang {page + 1} / {totalPages} ({total} bài)
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{
            padding: '8px 14px', borderRadius: '10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
            color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            Sau <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
