import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Bell, CheckCircle } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';

import CommunityFeed from './CommunityFeed';
import CommunityMyPosts from './CommunityMyPosts';
import CommunityNotifications from './CommunityNotifications';
import CommunitySidebar from './CommunitySidebar';

export default function CommunityPage() {
  useAuth();
  const { showAlert, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'my-posts' | 'notifications'

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
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

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(20);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Count notifications on mount.
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
    if (!await showConfirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await api.deleteCommunityPost(id);
      setMyPosts(p => p.filter(post => post.id !== id));
    } catch (err) {
      showAlert(err.message || 'Xóa bài thất bại.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) setNewImageUrl(res.url);
    } catch (err) {
      showAlert("Lỗi tải ảnh lên: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showAlert('Vui lòng nhập đủ tiêu đề và nội dung');
      return;
    }
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t);
    try {
      const result = await api.createCommunityPost(newTitle, newContent, newCategory, tagsArray, newImageUrl || null);
      if (!result?.post) throw new Error('Không nhận được dữ liệu bài viết từ server.');
      setShowCreate(false);
      setNewTitle(''); setNewContent(''); setNewTags(''); setNewImageUrl('');
      setSuccessMsg('Bài viết đã được gửi. Bài sẽ hiển thị sau khi admin kiểm duyệt.');
      if (activeTab === 'my-posts') loadMyPosts();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showAlert(err.message || 'Lỗi khi đăng bài');
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
    { id: 'feed',          label: 'Bảng tin',       icon: TrendingUp },
    { id: 'my-posts',      label: 'Bài của tôi',    icon: BookOpen },
    { id: 'notifications', label: 'Thông báo',      icon: Bell, badge: unreadCount },
  ];

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Community</span>
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
          {activeTab === 'feed' && (
            <CommunityFeed
              posts={posts} loading={loading}
              search={search} setSearch={setSearch}
              showCreate={showCreate} setShowCreate={setShowCreate}
              onLike={toggleLike} onSave={toggleSave}
              newTitle={newTitle} setNewTitle={setNewTitle}
              newContent={newContent} setNewContent={setNewContent}
              newCategory={newCategory} setNewCategory={setNewCategory}
              newTags={newTags} setNewTags={setNewTags}
              newImageUrl={newImageUrl} setNewImageUrl={setNewImageUrl}
              uploadingImage={uploadingImage}
              onImageUpload={handleImageUpload}
              onCreatePost={handleCreatePost}
            />
          )}

          {activeTab === 'my-posts' && (
            <CommunityMyPosts
              myPosts={myPosts} loading={loading}
              onDelete={handleDeleteMyPost}
              onNewPost={() => { setActiveTab('feed'); setShowCreate(true); }}
            />
          )}

          {activeTab === 'notifications' && (
            <CommunityNotifications
              notifications={notifications} loading={loading}
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
            />
          )}
        </div>

        {/* Sidebar */}
        <CommunitySidebar tags={tags} />
      </div>
    </div>
  );
}
