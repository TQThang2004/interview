import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useCommunityPage({ activeTab, search, showAlert, showConfirm }) {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Thảo luận');
  const [newTags, setNewTags] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Post detail + comments
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [postsData, tagsData] = await Promise.all([
        api.getCommunityPosts(20, 0, search),
        api.getPopularTags(),
      ]);
      setPosts(postsData.posts || []);
      setTags(tagsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadMyPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMyPosts(20, 0);
      setMyPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(20);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getNotifications(1).then(d => setUnreadCount(d.unread_count || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'feed') {
      const timer = setTimeout(loadFeed, 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeTab, loadFeed]);

  useEffect(() => {
    if (activeTab === 'my-posts') loadMyPosts();
    else if (activeTab === 'notifications') loadNotifications();
  }, [activeTab, loadMyPosts, loadNotifications]);

  const toggleSave = useCallback(async (id) => {
    try {
      const res = await api.toggleSavePost(id);
      setPosts(p => p.map(post => post.id === id ? { ...post, is_saved: res.saved } : post));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const toggleLike = useCallback(async (id) => {
    try {
      const res = await api.toggleLikePost(id);
      setPosts(p => p.map(post => post.id === id ? {
        ...post,
        likes_count: res.likes_count,
        is_liked: res.liked,
      } : post));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleDeleteMyPost = useCallback(async (id) => {
    if (!await showConfirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await api.deleteCommunityPost(id);
      setMyPosts(p => p.filter(post => post.id !== id));
    } catch (err) {
      showAlert(err.message || 'Xóa bài thất bại.');
    }
  }, [showAlert, showConfirm]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res?.url) setNewImageUrl(res.url);
    } catch (err) {
      showAlert(`Lỗi tải ảnh lên: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  }, [showAlert]);

  const handleCreatePost = useCallback(async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showAlert('Vui lòng nhập đủ tiêu đề và nội dung');
      return;
    }
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      const result = await api.createCommunityPost(
        newTitle,
        newContent,
        newCategory,
        tagsArray,
        newImageUrl || null
      );
      if (!result?.post) throw new Error('Không nhận được dữ liệu bài viết từ server.');
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setNewImageUrl('');
      setSuccessMsg('Bài viết đã được gửi. Bài sẽ hiển thị sau khi admin kiểm duyệt.');
      if (activeTab === 'my-posts') loadMyPosts();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      showAlert(err.message || 'Lỗi khi đăng bài');
    }
  }, [
    activeTab,
    loadMyPosts,
    newCategory,
    newContent,
    newImageUrl,
    newTags,
    newTitle,
    showAlert,
  ]);

  const handleMarkAllRead = useCallback(async () => {
    await api.markAllNotificationsRead();
    setNotifications(n => n.map(notif => ({ ...notif, is_read: true })));
    setUnreadCount(0);
  }, []);

  const handleMarkRead = useCallback(async (id) => {
    await api.markNotificationRead(id);
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, is_read: true } : notif));
    setUnreadCount(c => Math.max(0, c - 1));
  }, []);

  // ── Post Detail & Comments ──

  const openPostDetail = useCallback(async (postId) => {
    setCommentsLoading(true);
    try {
      const data = await api.getPostDetail(postId);
      if (data?.post) {
        setSelectedPost(data.post);
        setComments(data.post.comments || []);
      }
    } catch (err) {
      console.error('Failed to load post detail:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const closePostDetail = useCallback(() => {
    setSelectedPost(null);
    setComments([]);
  }, []);

  const handleAddComment = useCallback(async (postId, content) => {
    try {
      const result = await api.addComment(postId, content);
      if (result?.comment) {
        setComments(prev => [...prev, result.comment]);
        // Update comments_count on posts list
        const updateCount = (list) =>
          list.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p);
        setPosts(updateCount);
        setMyPosts(updateCount);
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));
        }
      }
    } catch (err) {
      showAlert(err.message || 'Gửi bình luận thất bại.');
    }
  }, [selectedPost, showAlert]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!await showConfirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      // Update comments_count on posts list
      if (selectedPost) {
        const postId = selectedPost.id;
        const updateCount = (list) =>
          list.map(p => p.id === postId ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) - 1) } : p);
        setPosts(updateCount);
        setMyPosts(updateCount);
        setSelectedPost(prev => ({ ...prev, comments_count: Math.max(0, (prev.comments_count || 0) - 1) }));
      }
    } catch (err) {
      showAlert(err.message || 'Xóa bình luận thất bại.');
    }
  }, [selectedPost, showAlert, showConfirm]);

  return {
    posts,
    myPosts,
    notifications,
    unreadCount,
    tags,
    loading,
    showCreate,
    setShowCreate,
    newTitle,
    setNewTitle,
    newContent,
    setNewContent,
    newCategory,
    setNewCategory,
    newTags,
    setNewTags,
    newImageUrl,
    setNewImageUrl,
    uploadingImage,
    successMsg,
    toggleSave,
    toggleLike,
    handleDeleteMyPost,
    handleImageUpload,
    handleCreatePost,
    handleMarkAllRead,
    handleMarkRead,
    // Post detail & comments
    selectedPost,
    comments,
    commentsLoading,
    openPostDetail,
    closePostDetail,
    handleAddComment,
    handleDeleteComment,
  };
}
