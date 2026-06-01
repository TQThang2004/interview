import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';
import { useModal } from '../../../context/ModalContext';
import HistoryFilters from './HistoryFilters';
import HistoryCard from './HistoryCard';

export default function HistoryPage() {
  const { showConfirm } = useModal();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [expandedData, setExpandedData] = useState({}); // { [id]: detail }
  const [loadingDetail, setLoadingDetail] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInterviews(50, 0);
      setInterviews(data);
    } catch (err) {
      setError('Không thể tải lịch sử phỏng vấn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const toggleExpand = async (id) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!expandedData[id]) {
      setLoadingDetail(id);
      try {
        const detail = await api.getInterviewDetail(id);
        if (detail) setExpandedData(prev => ({ ...prev, [id]: detail }));
      } catch (_) {}
      setLoadingDetail(null);
    }
  };

  const handleDelete = async (id) => {
    if (!await showConfirm("Bạn có chắc chắn muốn xóa lịch sử phỏng vấn này?", "Xác nhận xóa", { danger: true })) return;
    try {
      await api.deleteInterview(id);
      fetchHistory(); // Reload data
    } catch (e) {
      alert("Xóa thất bại: " + (e.message || "Lỗi không xác định"));
    }
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filtered = interviews.filter(h => {
    const matchSearch = !search || h.topic.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || h.level === filterLevel;
    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
    return matchSearch && matchLevel && matchStatus;
  });

  // ── Stats (chỉ tính completed + cancelled có điểm) ──────────────────────────
  const scoredSessions = interviews.filter(h => h.overall_score != null);
  const avgScore = scoredSessions.length
    ? (scoredSessions.reduce((a, b) => a + Number(b.overall_score), 0) / scoredSessions.length).toFixed(1)
    : '—';
  const bestScore = scoredSessions.length
    ? Math.max(...scoredSessions.map(h => Number(h.overall_score))).toFixed(1)
    : '—';
  const completedCount = interviews.filter(h => h.status === 'completed').length;

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '900px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            <span className="gradient-text">Lịch sử phỏng vấn</span> 📊
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Theo dõi tiến trình luyện tập và xem gợi ý AI chi tiết.</p>
        </div>
        <button
          onClick={fetchHistory}
          title="Làm mới"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Làm mới
        </button>
      </div>

      {/* ── Mini stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { icon: <BarChart3 size={18} />, label: 'Hoàn thành', value: loading ? '…' : completedCount, color: 'oklch(83.3% 0.145 321.434)' },
          { icon: <TrendingUp size={18} />, label: 'Điểm TB', value: loading ? '…' : avgScore, color: 'oklch(80% 0.18 80)' },
          { icon: <Trophy size={18} />, label: 'Điểm cao nhất', value: loading ? '…' : bestScore, color: 'oklch(75% 0.17 150)' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: s.color, background: `oklch(from ${s.color} l c h / 0.12)`, padding: '8px', borderRadius: '10px', display: 'flex' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <HistoryFilters
        search={search} setSearch={setSearch}
        filterLevel={filterLevel} setFilterLevel={setFilterLevel}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
      />

      {/* ── Content ── */}
      {loading ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div>Đang tải lịch sử...</div>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'oklch(65% 0.22 25)' }}>
          <AlertCircle size={32} style={{ marginBottom: '12px' }} />
          <div style={{ marginBottom: '16px' }}>{error}</div>
          <button onClick={fetchHistory} className="btn-primary" style={{ padding: '10px 24px' }}>Thử lại</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {interviews.length === 0
                ? 'Bạn chưa có phiên phỏng vấn nào. Hãy bắt đầu luyện tập ngay!'
                : 'Không tìm thấy phiên nào phù hợp với bộ lọc.'}
            </div>
          ) : filtered.map((h) => (
            <HistoryCard
              key={h.id}
              historyItem={h}
              expanded={expanded}
              toggleExpand={toggleExpand}
              loadingDetail={loadingDetail}
              detailData={expandedData[h.id]}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Animation spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
