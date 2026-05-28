import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Clock, Star, Trash2, Download, ArrowLeft,
  RefreshCw, AlertCircle, FileSearch, ChevronRight,
  Target, CheckCircle2, AlertTriangle, Lightbulb,
} from 'lucide-react';
import { api } from '../../services/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ScoreChip({ score }) {
  if (score == null) return <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span>;
  const s = Number(score);
  const [color, bg] =
    s >= 8   ? ['oklch(68% 0.2 145)', 'oklch(72% 0.18 145 / 0.12)'] :
    s >= 6.5 ? ['oklch(70% 0.18 80)', 'oklch(80% 0.18 80 / 0.12)'] :
               ['oklch(60% 0.22 25)', 'oklch(65% 0.22 25 / 0.12)'];
  return (
    <span style={{ fontWeight: 700, fontSize: '14px', color, background: bg, padding: '3px 10px', borderRadius: '999px' }}>
      {s.toFixed(1)}/10
    </span>
  );
}

function ScoreBar({ score, maxWidth = '100px' }) {
  const color =
    score >= 8   ? 'oklch(72% 0.18 145)' :
    score >= 6.5 ? 'oklch(80% 0.18 80)' :
                   'oklch(65% 0.22 25)';
  return (
    <div style={{ width: maxWidth, height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
    </div>
  );
}

/** Dialog xác nhận xóa */
function DeleteDialog({ filename, onConfirm, onCancel, deleting }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '32px', textAlign: 'center' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 20px',
          background: 'oklch(65% 0.22 25 / 0.12)', border: '1px solid oklch(65% 0.22 25 / 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Trash2 size={26} style={{ color: 'oklch(60% 0.22 25)' }} />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '10px' }}>Xóa bản đánh giá?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
          Bản đánh giá <strong>"{filename}"</strong> và file CV trên Cloudinary sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '10px 22px', borderRadius: '10px', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
          }}>
            Hủy
          </button>
          <button onClick={onConfirm} disabled={deleting} style={{
            padding: '10px 22px', borderRadius: '10px', border: 'none',
            background: 'oklch(60% 0.22 25)', color: 'white',
            cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px',
            opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            {deleting ? <><svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Đang xóa...</> : <><Trash2 size={14} /> Xóa bản đánh giá</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evaluation Result Panel (reusable, dùng trong Detail view)
// ---------------------------------------------------------------------------

function EvalResultPanel({ evaluation, onDelete, deleting }) {
  const result = evaluation.evaluation_result;
  if (!result) return null;

  const overall = Number(result.overall || evaluation.overall_score || 0);
  const overallColor =
    overall >= 8   ? 'oklch(72% 0.18 145)' :
    overall >= 6.5 ? 'oklch(80% 0.18 80)' :
                     'oklch(65% 0.22 25)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Overall */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center', minWidth: '72px' }}>
            <div style={{ fontSize: '40px', fontWeight: 900, lineHeight: 1, color: overallColor }}>{overall}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Điểm tổng</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
              {overall >= 8 ? '🎉 CV rất tốt!' : overall >= 6.5 ? '👍 CV ổn, cần cải thiện' : '⚠️ CV cần cải thiện nhiều'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={11} /> {formatDate(evaluation.evaluated_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {result.sections?.length > 0 && (
        <div className="glass-card" style={{ padding: '18px', flex: '1 0 auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={12} style={{ color: 'var(--primary)' }} /> Điểm theo từng phần
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {result.sections.map((s, i) => (
              <div key={i} style={{ borderBottom: i < result.sections.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < result.sections.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{s.name}</span>
                  <ScoreBar score={s.score} maxWidth="80px" />
                  <span style={{ fontWeight: 700, fontSize: '13px', minWidth: '28px', textAlign: 'right', color: s.score >= 8 ? 'oklch(72% 0.18 145)' : s.score >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)' }}>
                    {s.score}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{s.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={12} style={{ color: 'oklch(80% 0.18 80)' }} /> Gợi ý cải thiện
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'oklch(15% 0.01 250)', flexShrink: 0, marginTop: '1px' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={onDelete}
        disabled={deleting}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px', borderRadius: '12px', border: '1px solid oklch(65% 0.22 25 / 0.4)',
          background: 'oklch(65% 0.22 25 / 0.06)', color: 'oklch(60% 0.22 25)',
          cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600,
          opacity: deleting ? 0.6 : 1, transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!deleting) { e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.15)'; }}}
        onMouseLeave={e => { e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.06)'; }}
      >
        <Trash2 size={14} /> Xóa bản đánh giá này
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail View – layout 2 cột
// ---------------------------------------------------------------------------

function DetailView({ evaluation, onBack, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.deleteCvEvaluation(evaluation.id);
      onDelete(evaluation.id);
    } catch (err) {
      alert('Không thể xóa: ' + err.message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      {showDeleteDialog && (
        <DeleteDialog
          filename={evaluation.original_filename}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteDialog(false)}
          deleting={deleting}
        />
      )}

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
                // Fallback nếu ảnh lỗi
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
            onDelete={() => setShowDeleteDialog(true)}
            deleting={deleting}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cv-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
// List View – danh sách các bản đánh giá
// ---------------------------------------------------------------------------

function ListView({ evaluations, count, maxCount, loading, onSelect, onDelete, onRefresh }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteCvEvaluation(deleteTarget.id);
      onDelete(deleteTarget.id);
    } catch (err) {
      alert('Không thể xóa: ' + err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {deleteTarget && (
        <DeleteDialog
          filename={deleteTarget.original_filename}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Slot counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
          borderRadius: '10px', background: count < maxCount ? 'oklch(83.3% 0.145 321.434 / 0.08)' : 'oklch(65% 0.22 25 / 0.08)',
          border: `1px solid ${count < maxCount ? 'oklch(83.3% 0.145 321.434 / 0.3)' : 'oklch(65% 0.22 25 / 0.3)'}`,
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
                  background: 'oklch(83.3% 0.145 321.434 / 0.1)',
                  border: '1px solid oklch(83.3% 0.145 321.434 / 0.25)',
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
                      background: 'oklch(83.3% 0.145 321.434 / 0.1)', padding: '1px 8px', borderRadius: '6px' }}>
                      Bản #{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <ScoreChip score={ev.overall_score} />

                {/* Delete button (stop propagation) */}
                <button
                  onClick={e => { e.stopPropagation(); setDeleteTarget(ev); }}
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CVHistoryPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // Bản đang xem chi tiết

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCvEvaluations(10, 0);
      setEvaluations(data.evaluations || []);
      setCount(data.count || 0);
    } catch (err) {
      console.error('[CVHistoryPage] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvaluations(); }, [fetchEvaluations]);

  const handleDelete = (deletedId) => {
    setEvaluations(prev => prev.filter(ev => ev.id !== deletedId));
    setCount(prev => Math.max(0, prev - 1));
    if (selected?.id === deletedId) setSelected(null);
  };

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1100px' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Lịch sử đánh giá CV</span> 📋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Xem lại bản CV và kết quả phân tích đã lưu. Mỗi tài khoản được lưu tối đa <strong>2 bản</strong>.
        </p>
      </div>

      {selected ? (
        <DetailView
          evaluation={selected}
          onBack={() => setSelected(null)}
          onDelete={(id) => { handleDelete(id); setSelected(null); }}
        />
      ) : (
        <ListView
          evaluations={evaluations}
          count={count}
          maxCount={2}
          loading={loading}
          onSelect={setSelected}
          onDelete={handleDelete}
          onRefresh={fetchEvaluations}
        />
      )}
    </div>
  );
}
