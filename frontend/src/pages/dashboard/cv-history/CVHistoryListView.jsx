import React from 'react';
import { FileText, Clock, RefreshCw, CheckCircle2, AlertTriangle, FileSearch, ChevronRight, Trash2 } from 'lucide-react';
import { api } from '../../../services/api';
import ScoreChip from '../../../components/common/ScoreChip';
import { formatDate, formatSize } from './cvHistoryHelpers';
import { useModal } from '../../../context/ModalContext';

export default function CVHistoryListView({ evaluations, count, maxCount, loading, onSelect, onDelete, onRefresh }) {
  const { showAlert, showConfirm } = useModal();

  const handleDelete = async (e, ev) => {
    e.stopPropagation();
    if (!await showConfirm('Bạn có chắc chắn muốn xóa bản ghi CV này?')) return;
    
    try {
      await api.deleteCvEvaluation(ev.id);
      onDelete(ev.id);
    } catch (err) {
      showAlert('Không thể xóa: ' + err.message);
    }
  };

  return (
    <>
      {/* Slot counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
          borderRadius: '10px', background: count < maxCount ? 'var(--primary-08)' : 'oklch(65% 0.22 25 / 0.08)',
          border: `1px solid ${count < maxCount ? 'var(--primary-30)' : 'oklch(65% 0.22 25 / 0.3)'}`,
        }}>
          {count < maxCount
            ? <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
            : <AlertTriangle size={14} style={{ color: 'oklch(60% 0.22 25)' }} />
          }
          <span style={{ fontSize: '13px', fontWeight: 600, color: count < maxCount ? 'var(--primary)' : 'oklch(60% 0.22 25)' }}>
            {count}/{maxCount} bản đã lưu
          </span>
        </div>
        <button onClick={onRefresh} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
          borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent',
          cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px',
        }}>
          <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div>Đang tải...</div>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <FileSearch size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Chưa có bản đánh giá nào</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Vào <strong>CV Evaluation</strong> để phân tích CV và lưu kết quả.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {evaluations.map((ev, idx) => (
            <div
              key={ev.id}
              className="glass-card"
              style={{ overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
              onClick={() => onSelect(ev)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}
            >
              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* File icon + index */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: 'var(--primary-10)',
                  border: '1px solid var(--primary-25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={20} style={{ color: 'var(--primary)' }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.original_filename}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {formatDate(ev.evaluated_at)}
                    </span>
                    {ev.file_size_bytes && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatSize(ev.file_size_bytes)}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)',
                      background: 'var(--primary-10)', padding: '1px 8px', borderRadius: '6px' }}>
                      Bản #{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <ScoreChip score={ev.overall_score} />

                {/* Delete button (stop propagation) */}
                <button
                  onClick={e => handleDelete(e, ev)}
                  title="Xóa bản đánh giá"
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                    background: 'transparent', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.1)'; e.currentTarget.style.borderColor = 'oklch(65% 0.22 25 / 0.5)'; e.currentTarget.style.color = 'oklch(60% 0.22 25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Trash2 size={14} />
                </button>

                <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
