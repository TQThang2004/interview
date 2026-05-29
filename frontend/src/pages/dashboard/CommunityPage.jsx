import React, { useState, useEffect } from 'react';
import {
  Users, MessageSquare, ThumbsUp, Bookmark, Search, TrendingUp,
  Hash, ChevronRight, Plus, Image, UploadCloud, Clock, CheckCircle,
  XCircle, Bell, Trash2, BookOpen
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_COLOR = {
  'Kinh nghiệm': { bg: 'oklch(75% 0.17 150 / 0.12)', color: 'oklch(68% 0.2 145)', border: 'oklch(75% 0.17 150 / 0.3)' },
  'Câu hỏi':     { bg: 'oklch(83.3% 0.145 321.434 / 0.12)', color: 'var(--primary)', border: 'oklch(83.3% 0.145 321.434 / 0.3)' },
  'Tài nguyên':  { bg: 'oklch(68% 0.16 230 / 0.12)', color: 'oklch(62% 0.18 230)', border: 'oklch(68% 0.16 230 / 0.3)' },
  'Thảo luận':   { bg: 'oklch(78% 0.14 60 / 0.12)', color: 'oklch(72% 0.18 60)', border: 'oklch(78% 0.14 60 / 0.3)' },
};

const STATUS_CONFIG = {
  pending:  { icon: Clock,         color: 'oklch(78% 0.18 80)',  label: 'Chờ duyệt',    bg: 'oklch(78% 0.18 80 / 0.1)' },
  approved: { icon: CheckCircle,   color: 'oklch(68% 0.2 145)',  label: 'Đã duyệt',     bg: 'oklch(68% 0.2 145 / 0.1)' },
  rejected: { icon: XCircle,       color: 'oklch(62% 0.22 25)',  label: 'Bị từ chối',   bg: 'oklch(62% 0.22 25 / 0.1)' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`
    }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'my-posts' | 'saved' | 'notifications'

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Thảo luận');
  const [newTags, setNewTags] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadFeed = async () => {
    setLoading(true);
    try {
      const [postsData, tagsData] = await Promise.all([
        api.getCommunityPosts(20, 0, search),
        api.getPopularTags()
      ]);
      setPosts(postsData.posts || []);
      setTags(tagsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getMyPosts(20, 0);
      setMyPosts(data.posts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await api.getCommunityPosts(20, 0, '', '', '');
      setSavedPosts([]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(20);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Đếm notifications khi mount
  useEffect(() => {
    api.getNotifications(1).then(d => setUnreadCount(d.unread_count || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'feed') {
      const t = setTimeout(loadFeed, 400);
      return () => clearTimeout(t);
    }
  }, [search, activeTab]);

  useEffect(() => {
    if (activeTab === 'my-posts') loadMyPosts();
    else if (activeTab === 'notifications') loadNotifications();
  }, [activeTab]);

  const toggleSave = async (id) => {
    try {
      const res = await api.toggleSavePost(id);
      setPosts(p => p.map(post => post.id === id ? { ...post, is_saved: res.saved } : post));
    } catch (err) { console.error(err); }
  };

  const toggleLike = async (id) => {
    try {
      const res = await api.toggleLikePost(id);
      setPosts(p => p.map(post => post.id === id ? { ...post, likes_count: res.likes_count, is_liked: res.liked } : post));
    } catch (err) { console.error(err); }
  };

  const handleDeleteMyPost = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    const ok = await api.deleteCommunityPost(id);
    if (ok) setMyPosts(p => p.filter(post => post.id !== id));
    else alert('Xóa bài thất bại.');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) setNewImageUrl(res.url);
    } catch (err) {
      alert("Lỗi tải ảnh lên: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return alert('Vui lòng nhập đủ tiêu đề và nội dung');
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t);
    try {
      const res = await api.createCommunityPost(newTitle, newContent, newCategory, tagsArray, newImageUrl || null);
      setShowCreate(false);
      setNewTitle(''); setNewContent(''); setNewTags(''); setNewImageUrl('');
      setSuccessMsg('🎉 Bài viết đã được gửi! Bài sẽ hiển thị sau khi admin kiểm duyệt.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert('Lỗi khi đăng bài');
    }
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(n => n.map(notif => ({ ...notif, is_read: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, is_read: true } : notif));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const TABS = [
    { id: 'feed',          label: 'Bảng tin',     icon: TrendingUp },
    { id: 'my-posts',      label: 'Bài của tôi',  icon: BookOpen },
    { id: 'notifications', label: 'Thông báo',    icon: Bell, badge: unreadCount },
  ];

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Community</span> 🤝
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Chia sẻ kinh nghiệm, hỏi đáp và kết nối với cộng đồng developer Việt Nam.
        </p>
      </div>

      {/* Success message */}
      {successMsg && (
        <div style={{
          marginBottom: '16px', padding: '14px 18px', borderRadius: '12px',
          background: 'oklch(68% 0.2 145 / 0.1)', border: '1px solid oklch(68% 0.2 145 / 0.3)',
          color: 'oklch(68% 0.2 145)', fontSize: '14px', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', fontSize: '13px', fontWeight: active ? 700 : 500,
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              background: 'none', border: 'none', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', marginBottom: '-1px'
            }}>
              <Icon size={14} /> {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: 'oklch(62% 0.22 25)', color: 'white',
                  borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                  padding: '1px 6px', minWidth: '18px', textAlign: 'center'
                }}>{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px', alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {/* === FEED TAB === */}
          {activeTab === 'feed' && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <Search className="input-icon" />
                  <input className="input-field" placeholder="Tìm kiếm bài viết..."
                    value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className="btn-primary" style={{ padding: '12px 20px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {showCreate ? 'Hủy' : '+ Đăng bài'}
                </button>
              </div>

              {/* Create Post Form */}
              {showCreate && (
                <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>Đăng bài viết mới</h3>
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
                    background: 'oklch(78% 0.18 80 / 0.1)', border: '1px solid oklch(78% 0.18 80 / 0.3)',
                    color: 'oklch(72% 0.18 60)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <Clock size={14} /> Bài viết sẽ được hiển thị sau khi admin kiểm duyệt.
                  </div>
                  <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input className="input-field" placeholder="Tiêu đề bài viết..." value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                    <select className="input-field" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                      <option value="Thảo luận">Thảo luận</option>
                      <option value="Kinh nghiệm">Kinh nghiệm</option>
                      <option value="Câu hỏi">Câu hỏi</option>
                      <option value="Tài nguyên">Tài nguyên</option>
                    </select>
                    <textarea className="input-field" placeholder="Nội dung bài viết..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} required></textarea>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div className="input-group" style={{ flex: 1 }}>
                        <Image className="input-icon" size={16} />
                        <input className="input-field" placeholder="Đường dẫn ảnh hoặc tải lên..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} style={{ paddingLeft: '44px' }} />
                      </div>
                      <label className="btn-ghost" style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <UploadCloud size={16} /> {uploadingImage ? 'Đang tải...' : 'Tải lên'}
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                      </label>
                    </div>
                    {newImageUrl && (
                      <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', height: '150px', background: 'oklch(18% 0.02 260 / 0.6)' }}>
                        <img src={newImageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                    <input className="input-field" placeholder="Tags (cách nhau bởi dấu phẩy, vd: react, js)" value={newTags} onChange={e => setNewTags(e.target.value)} />
                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }} disabled={uploadingImage}>Gửi bài</button>
                  </form>
                </div>
              )}

              {/* Posts */}
              <PostList posts={posts} loading={loading} onLike={toggleLike} onSave={toggleSave} showStatus={false} />
            </>
          )}

          {/* === MY POSTS TAB === */}
          {activeTab === 'my-posts' && (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Bài viết của tôi ({myPosts.length})</h3>
                <button onClick={() => { setActiveTab('feed'); setShowCreate(true); }} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
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
                      <button onClick={() => handleDeleteMyPost(post.id)} style={{
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
          )}

          {/* === NOTIFICATIONS TAB === */}
          {activeTab === 'notifications' && (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Thông báo</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>
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
                  background: notif.is_read ? '' : 'oklch(83.3% 0.145 321.434 / 0.04)',
                  borderColor: notif.is_read ? '' : 'oklch(83.3% 0.145 321.434 / 0.25)',
                  cursor: notif.is_read ? 'default' : 'pointer'
                }} onClick={() => !notif.is_read && handleMarkRead(notif.id)}>
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
          )}
        </div>

        {/* Sidebar */}
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
      </div>
    </div>
  );
}

function PostList({ posts, loading, onLike, onSave, showStatus }) {
  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải bài viết...</div>;
  if (posts.length === 0) return <div style={{ textAlign: 'center', padding: '40px' }}>Không có bài viết nào.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {posts.map(post => {
        const cat = CATEGORY_COLOR[post.category] || {};
        return (
          <div key={post.id} className="glass-card" style={{ padding: '22px', transition: 'all 0.25s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(83.3% 0.145 321.434 / 0.4)'; }}
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
              <div style={{ marginBottom: '14px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={post.image_url} alt="post" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {post.tags.map(t => (
                  <span key={t} style={{ fontSize: '11px', color: 'var(--primary-light)', background: 'oklch(83.3% 0.145 321.434 / 0.08)', border: '1px solid oklch(83.3% 0.145 321.434 / 0.15)', borderRadius: '999px', padding: '2px 8px' }}>
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
      })}
    </div>
  );
}
