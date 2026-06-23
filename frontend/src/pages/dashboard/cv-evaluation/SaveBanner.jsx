import React from 'react';
import { Save, BookmarkCheck } from 'lucide-react';

export default function SaveBanner({ canSave, savedCount, maxCount, saving, onSave, onDismiss, alreadySaved }) {
  if (alreadySaved) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px', borderRadius: '14px', marginBottom: '20px',
        background: 'oklch(72% 0.18 145 / 0.08)', border: '1px solid oklch(72% 0.18 145 / 0.3)',
      }}>
        <BookmarkCheck size={18} style={{ color: 'oklch(60% 0.2 145)', flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: '14px', color: 'oklch(60% 0.2 145)', fontWeight: 600 }}>
          ✅ Đã lưu bản đánh giá này thành công!
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '18px 22px', borderRadius: '16px', marginBottom: '20px',
      background: canSave
        ? 'var(--primary-07)'
        : 'oklch(65% 0.22 25 / 0.07)',
      border: `1px solid ${canSave ? 'var(--primary-30)' : 'oklch(65% 0.22 25 / 0.3)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <Save size={18} style={{ color: canSave ? 'var(--primary)' : 'oklch(65% 0.22 25)', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            💾 Lưu bản đánh giá này?
          </div>
          {canSave ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Bạn đang sử dụng <strong>{savedCount}/{maxCount}</strong> bản lưu. Lưu lại để xem lại bất kỳ lúc nào trong <strong>CV History</strong>.
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'oklch(65% 0.22 25)' }}>
              ⚠️ Đã đạt giới hạn <strong>{maxCount}/{maxCount}</strong> bản lưu. Vào <strong>CV History</strong> để xóa bản cũ trước.
            </div>
          )}
        </div>
        {canSave && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: 'var(--gradient-primary)', color: 'var(--primary-contrast)',
                fontSize: '13px', fontWeight: 700, opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              {saving ? (
                <><svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Đang lưu...</>
              ) : (
                <><BookmarkCheck size={14} /> Lưu bản đánh giá</>
              )}
            </button>
            <button
              onClick={onDismiss}
              style={{
                padding: '9px 16px', borderRadius: '10px', cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
              }}
            >
              Không, cảm ơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
