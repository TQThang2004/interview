import React, { useState } from 'react';
import { FileText, ArrowLeft, ChevronRight, Star, Download, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';
import DeleteDialog from './DeleteDialog';
import EvalResultPanel from './EvalResultPanel';
import { useModal } from '../../../context/ModalContext';

export default function CVHistoryDetailView({ evaluation, onBack, onDelete }) {
  const { showAlert, showConfirm } = useModal();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!await showConfirm('Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.')) return;
    
    setDeleting(true);
    try {
      await api.deleteCvEvaluation(evaluation.id);
      onDelete(evaluation.id);
    } catch (err) {
      showAlert('Không thể xóa: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '7px 14px', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
        }}>
          <ArrowLeft size={14} /> Danh sách
        </button>
        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
          {evaluation.original_filename}
        </span>
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* LEFT: PDF Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={12} /> CV Preview
          </div>
          <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '16px', padding: 0, background: 'var(--bg-elevated)', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={evaluation.cloudinary_url.replace(/\.pdf$/i, '.jpg')}
              alt={`CV: ${evaluation.original_filename}`}
              style={{
                width: '100%',
                maxHeight: '680px',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px', color: 'var(--text-muted)' }}>
              <AlertTriangle size={32} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Không thể tải trước bản xem trước.</p>
                <p style={{ fontSize: '13px' }}>Vui lòng tải file xuống để xem chi tiết.</p>
              </div>
            </div>
          </div>
          {/* Download button */}
          <a
            href={evaluation.cloudinary_url}
            target="_blank"
            rel="noopener noreferrer"
            download={evaluation.original_filename}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '10px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Download size={14} /> Tải file PDF về máy
          </a>
        </div>

        {/* RIGHT: Evaluation Result */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={12} style={{ color: 'var(--primary)' }} /> Kết quả đánh giá
          </div>
          <EvalResultPanel
            evaluation={evaluation}
            onDelete={handleDelete}
            deleting={deleting}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cv-detail-grid { grid-template-columns: 1fr !important; }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}
