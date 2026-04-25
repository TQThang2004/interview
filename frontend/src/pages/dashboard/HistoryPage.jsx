import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Star, ChevronDown, ChevronUp, Search, Filter, BarChart3, TrendingUp, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScoreChip({ score }) {
  if (score == null) return <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span>;
  const [color, bg] = score >= 8
    ? ['oklch(68% 0.2 145)', 'oklch(72% 0.18 145 / 0.12)']
    : score >= 6.5
    ? ['oklch(70% 0.18 80)', 'oklch(80% 0.18 80 / 0.12)']
    : ['oklch(60% 0.22 25)', 'oklch(65% 0.22 25 / 0.12)'];
  return (
    <span style={{ fontWeight: 700, fontSize: '14px', color, background: bg, padding: '3px 10px', borderRadius: '999px' }}>
      {Number(score).toFixed(1)}/10
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Hoàn thành', color: 'oklch(68% 0.2 145)', bg: 'oklch(72% 0.18 145 / 0.1)' },
    in_progress: { label: 'Đang diễn ra', color: 'oklch(70% 0.18 80)', bg: 'oklch(80% 0.18 80 / 0.1)' },
    cancelled: { label: 'Đã thoát', color: 'oklch(60% 0.22 25)', bg: 'oklch(65% 0.22 25 / 0.1)' },
  };
  const s = map[status] || { label: status, color: 'var(--text-muted)', bg: 'transparent' };
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, color: s.color, background: s.bg,
      padding: '2px 8px', borderRadius: '6px', border: `1px solid ${s.color}33`,
    }}>
      {s.label}
    </span>
  );
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function calcDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return null;
  const ms = new Date(completedAt) - new Date(startedAt);
  const mins = Math.round(ms / 60000);
  return mins > 0 ? `${mins} phút` : '< 1 phút';
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function HistoryPage() {
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Theo dõi tiến trình luyện tập của bạn.</p>
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
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: '1 1 180px' }}>
          <Search className="input-icon" />
          <input className="input-field" placeholder="Tìm kiếm chủ đề..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {['all', 'Intern', 'Junior', 'Middle', 'Senior'].map(l => (
            <button key={l} onClick={() => setFilterLevel(l)}
              style={{
                padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                background: filterLevel === l ? 'var(--gradient-primary)' : 'transparent',
                borderColor: filterLevel === l ? 'transparent' : 'var(--border)',
                color: filterLevel === l ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
              }}>
              {l === 'all' ? 'Tất cả' : l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Mọi TT' },
            { key: 'completed', label: '✅ Hoàn thành' },
            { key: 'cancelled', label: '⏹ Đã thoát' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilterStatus(s.key)}
              style={{
                padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                background: filterStatus === s.key ? 'var(--gradient-primary)' : 'transparent',
                borderColor: filterStatus === s.key ? 'transparent' : 'var(--border)',
                color: filterStatus === s.key ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

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
          ) : filtered.map((h) => {
            const detail = expandedData[h.id];
            const duration = calcDuration(h.started_at, h.completed_at);
            return (
              <div key={h.id} className="glass-card" style={{ overflow: 'hidden', transition: 'all 0.25s' }}>
                {/* ── Row chính ── */}
                <div
                  style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                  onClick={() => toggleExpand(h.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{h.topic}</span>
                      <StatusBadge status={h.status} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={11} /> {h.level}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {formatDate(h.started_at)}
                        {duration && ` · ${duration}`}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {h.answered_questions}/{h.total_questions} câu đã trả lời
                      </span>
                    </div>
                  </div>
                  <ScoreChip score={h.overall_score} />
                  {loadingDetail === h.id
                    ? <RefreshCw size={16} style={{ color: 'var(--text-muted)', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                    : (expanded === h.id
                      ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />)
                  }
                </div>

                {/* ── Detail expand ── */}
                {expanded === h.id && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 22px', background: 'oklch(22% 0.015 250 / 0.4)' }}>
                    {!detail ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                        Đang tải chi tiết...
                      </div>
                    ) : detail.questions?.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                        Chưa có câu hỏi nào được lưu.
                      </div>
                    ) : (
                      <>
                        {detail.overall_feedback && (
                          <div style={{ marginBottom: '14px', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nhận xét tổng quan</span>
                            {detail.overall_feedback}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Chi tiết {detail.questions.length} câu hỏi
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {detail.questions.map((q, i) => (
                            <div key={q.id} style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: q.user_answer ? '8px' : 0 }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>#{i + 1}</span>
                                <span style={{ fontSize: '13px', flex: 1, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4 }}>{q.question_text}</span>
                                {q.score != null && (
                                  <span style={{ fontWeight: 700, fontSize: '13px', flexShrink: 0, color: q.score >= 8 ? 'oklch(68% 0.2 145)' : q.score >= 6.5 ? 'oklch(70% 0.18 80)' : 'oklch(60% 0.22 25)' }}>
                                    {Number(q.score).toFixed(1)}/10
                                  </span>
                                )}
                              </div>
                              {q.user_answer && (
                                <div style={{ paddingLeft: '24px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '2px solid var(--border)' }}>
                                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Trả lời: </span>
                                  {q.user_answer.length > 200 ? q.user_answer.slice(0, 200) + '…' : q.user_answer}
                                </div>
                              )}
                              {!q.user_answer && (
                                <div style={{ paddingLeft: '24px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                  (Chưa trả lời)
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Animation spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
