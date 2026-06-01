import React from 'react';
import { Image, UploadCloud, Clock } from 'lucide-react';

export default function CommunityCreateForm({
  newTitle, setNewTitle,
  newContent, setNewContent,
  newCategory, setNewCategory,
  newTags, setNewTags,
  newImageUrl, setNewImageUrl,
  uploadingImage,
  onImageUpload,
  onSubmit,
}) {
  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>Đăng bài viết mới</h3>
      <div style={{
        padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
        background: 'oklch(78% 0.18 80 / 0.1)', border: '1px solid oklch(78% 0.18 80 / 0.3)',
        color: 'oklch(72% 0.18 60)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <Clock size={14} /> Bài viết sẽ được hiển thị sau khi admin kiểm duyệt.
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            <input type="file" hidden accept="image/*" onChange={onImageUpload} disabled={uploadingImage} />
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
  );
}
