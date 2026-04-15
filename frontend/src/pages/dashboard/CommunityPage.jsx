import React, { useState } from 'react';
import { Users, MessageSquare, ThumbsUp, Bookmark, Search, TrendingUp, Hash, ChevronRight } from 'lucide-react';

const MOCK_POSTS = [
  {
    id: 1, author: 'Nguyễn Minh Tú', avatar: 'NT', role: 'Fullstack Developer',
    time: '2 giờ trước', category: 'Kinh nghiệm',
    title: 'Chia sẻ kinh nghiệm vượt qua vòng kỹ thuật tại công ty nước ngoài',
    content: 'Mình vừa pass phỏng vấn tại một startup Singapore sau 3 tháng luyện tập. Đây là những tips mình tổng hợp...',
    likes: 48, comments: 12, saved: false,
    tags: ['kinh-nghiem', 'frontend', 'startup'],
  },
  {
    id: 2, author: 'Trần Thị Lan', avatar: 'TL', role: 'Backend Engineer',
    time: '5 giờ trước', category: 'Câu hỏi',
    title: 'Giải thích về Microservices vs Monolith khi phỏng vấn như thế nào cho đúng?',
    content: 'Hôm qua mình bị hỏi câu này và trả lời khá lung tung. Mọi người có thể tư vấn cách trình bày rõ ràng không?',
    likes: 31, comments: 24, saved: true,
    tags: ['backend', 'architecture', 'system-design'],
  },
  {
    id: 3, author: 'Lê Đức Anh', avatar: 'LA', role: 'Mobile Developer',
    time: '1 ngày trước', category: 'Tài nguyên',
    title: 'Tổng hợp 50 câu hỏi React phỏng vấn thường gặp năm 2026',
    content: 'Mình đã compile danh sách từ nhiều nguồn và kinh nghiệm thực tế. File đầy đủ ở dưới comment...',
    likes: 127, comments: 45, saved: false,
    tags: ['react', 'frontend', 'tailieu'],
  },
];

const TAGS = ['#reactjs', '#nodejs', '#system-design', '#backend', '#frontend', '#algorithms', '#career'];

const CATEGORY_COLOR = {
  'Kinh nghiệm': { bg: 'oklch(75% 0.17 150 / 0.12)', color: 'oklch(68% 0.2 145)', border: 'oklch(75% 0.17 150 / 0.3)' },
  'Câu hỏi':     { bg: 'oklch(83.3% 0.145 321.434 / 0.12)', color: 'var(--primary)', border: 'oklch(83.3% 0.145 321.434 / 0.3)' },
  'Tài nguyên':  { bg: 'oklch(68% 0.16 230 / 0.12)', color: 'oklch(62% 0.18 230)', border: 'oklch(68% 0.16 230 / 0.3)' },
};

export default function CommunityPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [search, setSearch] = useState('');

  const toggleSave = (id) => setPosts(p => p.map(post => post.id === id ? { ...post, saved: !post.saved } : post));
  const toggleLike = (id) => setPosts(p => p.map(post => post.id === id ? { ...post, likes: post.likes + (post.liked ? -1 : 1), liked: !post.liked } : post));

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
            <button className="btn-primary" style={{ padding: '12px 20px', fontSize: '14px', whiteSpace: 'nowrap' }}>
              + Đăng bài
            </button>
          </div>

          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {posts.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase())).map(post => {
              const cat = CATEGORY_COLOR[post.category] || {};
              return (
                <div key={post.id} className="glass-card" style={{ padding: '22px', transition: 'all 0.25s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(83.3% 0.145 321.434 / 0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}>
                  {/* Author + category */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'oklch(15% 0.01 250)' }}>
                        {post.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{post.author}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.role} · {post.time}</div>
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
                    <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: post.liked ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      <ThumbsUp size={14} /> {post.likes}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      <MessageSquare size={14} /> {post.comments}
                    </button>
                    <button onClick={() => toggleSave(post.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: post.saved ? 'oklch(80% 0.18 80)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', fontWeight: 500 }}>
                      <Bookmark size={14} fill={post.saved ? 'oklch(80% 0.18 80)' : 'none'} /> {post.saved ? 'Đã lưu' : 'Lưu'}
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
              {TAGS.map(t => (
                <button key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  <Hash size={12} />{t.slice(1)}
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
