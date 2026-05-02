import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { Clock, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

function StatusBadge({ status }) {
  if (status === 'completed')
    return <span style={{ color: 'oklch(72% 0.18 145)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><CheckCircle size={13} /> Hoàn thành</span>;
  if (status === 'cancelled')
    return <span style={{ color: 'oklch(65% 0.22 25)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><XCircle size={13} /> Đã hủy</span>;
  return <span style={{ color: 'oklch(80% 0.18 80)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><Clock size={13} /> Đang tiến hành</span>;
}

function ScoreCell({ score }) {
  if (score == null) return <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>;
  const color = score >= 8 ? 'oklch(72% 0.18 145)' : score >= 6 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';
  return (
    <span style={{ fontWeight: 800, fontSize: '15px', color }}>
      {Number(score).toFixed(1)}<span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>/10</span>
    </span>
  );
}

// Modal xem chi tiết phỏng vấn (câu hỏi + câu trả lời)
function InterviewDetailModal({ interview, onClose }) {
  if (!interview) return null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'oklch(0% 0 0 / 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{interview.topic}</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={interview.status} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{interview.level} · {interview.language?.toUpperCase()}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{interview.username} — {interview.email}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ScoreCell score={interview.overall_score} />
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Tổng câu', value: interview.total_questions },
              { label: 'Đã trả lời', value: interview.answered_questions },
              { label: 'Bắt đầu', value: interview.started_at ? new Date(interview.started_at).toLocaleString('vi-VN') : '—' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', minWidth: '110px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.value}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Tiến độ: {interview.answered_questions}/{interview.total_questions} câu ({interview.total_questions > 0 ? Math.round((interview.answered_questions / interview.total_questions) * 100) : 0}%)
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: 'var(--gradient-primary)',
                width: `${interview.total_questions > 0 ? (interview.answered_questions / interview.total_questions) * 100 : 0}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 15;

export default function AdminInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminGetInterviews(PAGE_SIZE, page * PAGE_SIZE, statusFilter);
      setInterviews(data.interviews || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = (val) => { setStatusFilter(val); setPage(0); };

  return (
    <div>
      {selected && <InterviewDetailModal interview={selected} onClose={() => setSelected(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Lịch sử phỏng vấn <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>({total})</span>
        </h2>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[
            { val: '', label: 'Tất cả' },
            { val: 'completed', label: '✅ Hoàn thành' },
            { val: 'in_progress', label: '🔄 Đang tiến hành' },
            { val: 'cancelled', label: '⏹ Đã hủy' },
          ].map(opt => (
            <button key={opt.val} onClick={() => handleStatusChange(opt.val)}
              style={{
                padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                background: statusFilter === opt.val ? 'var(--gradient-primary)' : 'transparent',
                borderColor: statusFilter === opt.val ? 'transparent' : 'var(--border)',
                color: statusFilter === opt.val ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
              }}>
              {opt.label}
            </button>
          ))}
          <button onClick={loadData} style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'oklch(22% 0.015 250 / 0.5)' }}>
              {['Chủ đề / Cấp độ', 'Người dùng', 'Trạng thái', 'Tiến độ', 'Điểm', 'Thao tác'].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '8px' }} /><br />Đang tải...
              </td></tr>
            ) : interviews.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Không có dữ liệu.</td></tr>
            ) : interviews.map(iv => (
              <tr key={iv.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'oklch(22% 0.015 250 / 0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{iv.topic}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{iv.level} · {iv.language?.toUpperCase()}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{iv.username}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{iv.email}</div>
                </td>
                <td style={{ padding: '14px 16px' }}><StatusBadge status={iv.status} /></td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {iv.answered_questions}/{iv.total_questions} câu
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'var(--bg-elevated)', width: '80px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px', background: 'var(--gradient-primary)',
                      width: `${iv.total_questions > 0 ? (iv.answered_questions / iv.total_questions) * 100 : 0}%`,
                    }} />
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}><ScoreCell score={iv.overall_score} /></td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => setSelected(iv)}
                    title="Xem chi tiết"
                    style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                  >
                    <Eye size={14} /> Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: page === 0 ? 'not-allowed' : 'pointer', color: page === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', display: 'flex' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Trang {page + 1} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-secondary)', display: 'flex' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
