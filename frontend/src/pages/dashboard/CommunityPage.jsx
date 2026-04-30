import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, ThumbsUp, Bookmark, Search, TrendingUp, Hash, ChevronRight, AlertCircle, Plus } from 'lucide-react';
import { api } from '../../services/api';

const MOCK_POSTS = []; // Removed mock data
const TAGS = []; // Removed mock data

const CATEGORY_COLOR = {
  'Kinh nghiệm': { bg: 'oklch(75% 0.17 150 / 0.12)', color: 'oklch(68% 0.2 145)', border: 'oklch(75% 0.17 150 / 0.3)' },
  'Câu hỏi':     { bg: 'oklch(83.3% 0.145 321.434 / 0.12)', color: 'var(--primary)', border: 'oklch(83.3% 0.145 321.434 / 0.3)' },
  'Tài nguyên':  { bg: 'oklch(68% 0.16 230 / 0.12)', color: 'oklch(62% 0.18 230)', border: 'oklch(68% 0.16 230 / 0.3)' },
};

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Thảo luận');
  const [newTags, setNewTags] = useState('');

  const loadData = async () => {
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const toggleSave = async (id) => {
    try {
      const res = await api.toggleSavePost(id);
      setPosts(p => p.map(post => post.id === id ? { ...post, is_saved: res.saved } : post));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (id) => {
    try {
      const res = await api.toggleLikePost(id);
      setPosts(p => p.map(post => post.id === id ? { ...post, likes_count: res.likes_count, is_liked: res.liked } : post));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return alert('Vui lòng nhập đủ tiêu đề và nội dung');
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t);
    try {
      await api.createCommunityPost(newTitle, newContent, newCategory, tagsArray);
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      loadData();
    } catch (err) {
      alert('Lỗi khi đăng bài');
    }
  };

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Community</span> 🤝
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Chia sẻ kinh nghiệm, hỏi đáp và kết nối với cộng đồng developer Việt Nam.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '20px', alignItems: 'start' }}>
        {/* Main feed */}
        <div>
          {/* Search + Post button */}
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
              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input className="input-field" placeholder="Tiêu đề bài viết..." value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                <select className="input-field" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                  <option value="Thảo luận">Thảo luận</option>
                  <option value="Kinh nghiệm">Kinh nghiệm</option>
                  <option value="Câu hỏi">Câu hỏi</option>
                  <option value="Tài nguyên">Tài nguyên</option>
                </select>
                <textarea className="input-field" placeholder="Nội dung bài viết..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} required></textarea>
                <input className="input-field" placeholder="Tags (cách nhau bởi dấu phẩy, vd: react, js)" value={newTags} onChange={e => setNewTags(e.target.value)} />
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>Đăng bài</button>
              </form>
            </div>
          )}

          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải bài viết...</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Không có bài viết nào.</div>
            ) : posts.map(post => {
              const cat = CATEGORY_COLOR[post.category] || {};
              return (
                <div key={post.id} className="glass-card" style={{ padding: '22px', transition: 'all 0.25s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(83.3% 0.145 321.434 / 0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}>
                  {/* Author + category */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'oklch(15% 0.01 250)' }}>
                        {post.author_avatar ? <img src={post.author_avatar} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : (post.author_name ? post.author_name.substring(0,2).toUpperCase() : 'U')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{post.author_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString('vi-VN')}</div>
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                      {post.category}
                    </span>
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.65, marginBottom: '14px' }}>{post.content}</p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {post.tags.map(t => (
                      <span key={t} style={{ fontSize: '11px', color: 'var(--primary-light)', background: 'oklch(83.3% 0.145 321.434 / 0.08)', border: '1px solid oklch(83.3% 0.145 321.434 / 0.15)', borderRadius: '999px', padding: '2px 8px' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: post.is_liked ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      <ThumbsUp size={14} /> {post.likes_count}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      <MessageSquare size={14} /> {post.comments_count}
                    </button>
                    <button onClick={() => toggleSave(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: post.is_saved ? 'oklch(80% 0.18 80)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
                      <Bookmark size={14} fill={post.is_saved ? 'oklch(80% 0.18 80)' : 'none'} /> {post.is_saved ? 'Đã lưu' : 'Lưu'}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Đọc thêm <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: trending tags */}
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
        </div>
      </div>
    </div>
  );
}
