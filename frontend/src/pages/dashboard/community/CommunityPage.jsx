import { useState } from 'react';
import { TrendingUp, BookOpen, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../context/ModalContext';
import { useCommunityPage } from '../../../hooks/useCommunityPage';

import CommunityFeed from './CommunityFeed';
import CommunityMyPosts from './CommunityMyPosts';
import CommunityNotifications from './CommunityNotifications';
import CommunitySidebar from './CommunitySidebar';
import PostDetailModal from './PostDetailModal';

export default function CommunityPage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState('feed');
  const [search, setSearch] = useState('');
  const community = useCommunityPage({ activeTab, search, showAlert, showConfirm });

  const tabs = [
    { id: 'feed', label: 'Bảng tin', icon: TrendingUp },
    { id: 'my-posts', label: 'Bài của tôi', icon: BookOpen },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: community.unreadCount },
  ];

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Community</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Chia sẻ kinh nghiệm, hỏi đáp và kết nối với cộng đồng developer Việt Nam.
        </p>
      </div>

      {community.successMsg && (
        <div style={{
          marginBottom: '16px', padding: '14px 18px', borderRadius: '12px',
          background: 'oklch(68% 0.2 145 / 0.1)', border: '1px solid oklch(68% 0.2 145 / 0.3)',
          color: 'oklch(68% 0.2 145)', fontSize: '14px', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle size={16} /> {community.successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(tab => {
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
        <div>
          {activeTab === 'feed' && (
            <CommunityFeed
              posts={community.posts} loading={community.loading}
              search={search} setSearch={setSearch}
              showCreate={community.showCreate} setShowCreate={community.setShowCreate}
              onLike={community.toggleLike} onSave={community.toggleSave}
              onViewDetail={community.openPostDetail}
              newTitle={community.newTitle} setNewTitle={community.setNewTitle}
              newContent={community.newContent} setNewContent={community.setNewContent}
              newCategory={community.newCategory} setNewCategory={community.setNewCategory}
              newTags={community.newTags} setNewTags={community.setNewTags}
              newImageUrl={community.newImageUrl} setNewImageUrl={community.setNewImageUrl}
              uploadingImage={community.uploadingImage}
              onImageUpload={community.handleImageUpload}
              onCreatePost={community.handleCreatePost}
            />
          )}

          {activeTab === 'my-posts' && (
            <CommunityMyPosts
              myPosts={community.myPosts} loading={community.loading}
              onDelete={community.handleDeleteMyPost}
              onNewPost={() => { setActiveTab('feed'); community.setShowCreate(true); }}
            />
          )}

          {activeTab === 'notifications' && (
            <CommunityNotifications
              notifications={community.notifications} loading={community.loading}
              unreadCount={community.unreadCount}
              onMarkAllRead={community.handleMarkAllRead}
              onMarkRead={community.handleMarkRead}
            />
          )}
        </div>

        <CommunitySidebar tags={community.tags} />
      </div>

      {/* Post Detail Modal */}
      {community.selectedPost && (
        <PostDetailModal
          post={community.selectedPost}
          comments={community.comments}
          commentsLoading={community.commentsLoading}
          currentUserId={user?.id}
          onClose={community.closePostDetail}
          onLike={community.toggleLike}
          onSave={community.toggleSave}
          onAddComment={community.handleAddComment}
          onDeleteComment={community.handleDeleteComment}
        />
      )}
    </div>
  );
}
