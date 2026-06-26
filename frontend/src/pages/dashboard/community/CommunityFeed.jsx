import React from 'react';
import { Search } from 'lucide-react';
import { PostList } from './PostCard';
import CommunityCreateForm from './CommunityCreateForm';

export default function CommunityFeed({
  posts, loading, search, setSearch,
  showCreate, setShowCreate,
  onLike, onSave, onViewDetail,
  // Create form props
  newTitle, setNewTitle, newContent, setNewContent,
  newCategory, setNewCategory, newTags, setNewTags,
  newImageUrl, setNewImageUrl, uploadingImage,
  onImageUpload, onCreatePost,
}) {
  return (
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
        <CommunityCreateForm
          newTitle={newTitle} setNewTitle={setNewTitle}
          newContent={newContent} setNewContent={setNewContent}
          newCategory={newCategory} setNewCategory={setNewCategory}
          newTags={newTags} setNewTags={setNewTags}
          newImageUrl={newImageUrl} setNewImageUrl={setNewImageUrl}
          uploadingImage={uploadingImage}
          onImageUpload={onImageUpload}
          onSubmit={onCreatePost}
        />
      )}

      {/* Posts */}
      <PostList posts={posts} loading={loading} onLike={onLike} onSave={onSave} onViewDetail={onViewDetail} showStatus={false} />
    </>
  );
}
