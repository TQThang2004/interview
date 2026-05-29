import React, { useState, useEffect } from 'react';
import {
  Search, Trash2, FileText, Star, ChevronLeft, ChevronRight,
  RefreshCw, ExternalLink, User, Calendar, HardDrive
} from 'lucide-react';
import { api } from '../../services/api';

const PAGE_SIZE = 15;

function ScoreBadge({ score }) {
  if (score == null) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>;
  const s = parseFloat(score);
  const color = s >= 8 ? 'oklch(68% 0.2 145)' : s >= 6 ? 'oklch(78% 0.18 80)' : 'oklch(62% 0.22 25)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
      color, background: `${color}1a`, border: `1px solid ${color}44`
    }}>
      <Star size={11} fill={color} /> {s.toFixed(1)}/10
    </span>
  );
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminCVEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetCVEvaluations(PAGE_SIZE, page * PAGE_SIZE, search);
      setEvaluations(data.evaluations || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvaluations(); }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleDelete = async (evalId, filename, username) => {
    if (!window.confirm(`Xóa đánh giá CV "${filename}" của ${username}?\nFile sẽ bị xóa khỏi Cloudinary.`)) return;
    setActionLoading(evalId);
    try {
      const ok = await api.adminDeleteCVEvaluation(evalId);
      if (ok) {
        setEvaluations(e => e.filter(ev => ev.id !== evalId));
        setTotal(t => t - 1);
        showToast('🗑️ Đã xóa đánh giá CV.');
      } else {
        showToast('Xóa thất bại', 'error');
      }
    } catch (err) {
      showToast('Xóa thất bại', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1200px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
          background: toast.type === 'error' ? 'oklch(62% 0.22 25 / 0.95)' : 'oklch(68% 0.2 145 / 0.95)',
          color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 800, marginBottom: '6px' }}>
          <span className="gradient-text">Quản lý đánh giá CV</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Xem và quản lý tất cả đánh giá CV của người dùng trên hệ thống.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>{total}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tổng đánh giá</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
            <Search className="input-icon" size={16} />
            <input className="input-field" placeholder="Tìm theo username, email, tên file..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: '40px', height: '40px' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>Tìm kiếm</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(0); }} style={{
              padding: '8px 14px', fontSize: '13px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)'
            }}>Xóa lọc</button>
          )}
          <button type="button" onClick={loadEvaluations} style={{
            padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)'
          }}>
            <RefreshCw size={15} />
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Đang tải...</p>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <FileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Không có đánh giá CV nào.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Người dùng', 'File CV', 'Điểm', 'Dung lượng', 'Ngày đánh giá', 'Hành động'].map(col => (
                    <th key={col} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: '11px',
                      fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev, idx) => (
                  <tr key={ev.id} style={{
                    borderBottom: idx < evaluations.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    {/* User */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--gradient-primary)', overflow: 'hidden'
                        }}>
                          <img src={ev.avatar_url || '/avatar-default.jpg'} alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.username}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* File */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={14} style={{ color: 'oklch(62% 0.18 230)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.original_filename}
                          </div>
                          {ev.cloudinary_url && (
                            <a href={ev.cloudinary_url} target="_blank" rel="noopener noreferrer" style={{
                              fontSize: '11px', color: 'var(--primary)', textDecoration: 'none',
                              display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px'
                            }}>
                              <ExternalLink size={10} /> Xem PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td style={{ padding: '14px 16px' }}>
                      <ScoreBadge score={ev.overall_score} />
                    </td>

                    {/* File size */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      <HardDrive size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {formatBytes(ev.file_size_bytes)}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      {ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleString('vi-VN') : '—'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => handleDelete(ev.id, ev.original_filename, ev.username)}
                        disabled={actionLoading === ev.id} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '7px 12px', fontSize: '12px', fontWeight: 600, borderRadius: '8px',
                          background: 'oklch(62% 0.22 25 / 0.1)', color: 'oklch(62% 0.22 25)',
                          border: '1px solid oklch(62% 0.22 25 / 0.3)', cursor: 'pointer',
                          opacity: actionLoading === ev.id ? 0.6 : 1, transition: 'all 0.2s'
                        }}>
                        <Trash2 size={12} /> {actionLoading === ev.id ? '...' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
                padding: '8px 14px', borderRadius: '10px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', cursor: page === 0 ? 'not-allowed' : 'pointer',
                color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px'
              }}>
                <ChevronLeft size={14} /> Trước
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Trang {page + 1} / {totalPages} ({total} bản ghi)
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{
                padding: '8px 14px', borderRadius: '10px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px'
              }}>
                Sau <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
