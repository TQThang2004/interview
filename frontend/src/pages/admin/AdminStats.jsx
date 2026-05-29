import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Users, Mic, Trophy, Target, TrendingUp, BarChart3,
  RefreshCw, CheckCircle, Star, Award,
} from 'lucide-react';

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: `${color}15`, pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ color, background: `${color}18`, padding: '8px', borderRadius: '10px', display: 'flex' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '12px', color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

/* ─── Chart Bar ──────────────────────────────────────────────── */
function ChartBar({ date, total, completed, avgScore, maxTotal }) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700 }}>
        {avgScore != null ? avgScore : ''}
      </div>
      <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
        <div style={{ flex: 1, height: `${pct}%`, minHeight: total > 0 ? '4px' : 0, background: 'oklch(83.3% 0.145 321.434 / 0.3)', borderRadius: '4px 4px 0 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${completedPct}%`, background: 'var(--gradient-primary)', borderRadius: '4px 4px 0 0' }} />
        </div>
      </div>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
        {date ? date.slice(5) : ''}
      </div>
    </div>
  );
}

/* ─── Rank styles ────────────────────────────────────────────── */
const RANK_STYLES = [
  { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', icon: '🥇' },
  { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', icon: '🥈' },
  { bg: 'linear-gradient(135deg, #CD7F32, #A05C20)', icon: '🥉' },
];

/* ─── Candidate Row ──────────────────────────────────────────── */
function CandidateRow({ candidate, index }) {
  const rank = RANK_STYLES[index];
  const isTop3 = index < 3;
  return (
    <tr
      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '14px 16px', width: '56px', textAlign: 'center' }}>
        {isTop3 ? (
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: rank.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', margin: '0 auto' }}>
            {rank.icon}
          </div>
        ) : (
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-muted)' }}>{index + 1}</span>
        )}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: isTop3 ? rank.bg : 'var(--gradient-primary)',
            padding: isTop3 ? '2px' : '0', overflow: 'hidden',
          }}>
            <img src={candidate.avatar_url || '/avatar-default.jpg'} alt="avatar"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{candidate.username}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{candidate.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '14px' }}>{candidate.completed_interviews}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ {candidate.total_interviews} tổng</div>
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span style={{
          fontWeight: 700, fontSize: '13px', color: 'oklch(72% 0.18 145)',
          background: 'oklch(72% 0.18 145 / 0.1)', padding: '3px 9px', borderRadius: '999px',
          display: 'inline-flex', alignItems: 'center', gap: '4px',
        }}>
          <Target size={11} /> {candidate.best_score != null ? Number(candidate.best_score).toFixed(1) : '—'}
        </span>
      </td>
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Star size={14} fill="var(--primary)" style={{ color: 'var(--primary)' }} />
          <span style={{
            fontWeight: 900, fontSize: '18px',
            background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {candidate.avg_score != null ? Number(candidate.avg_score).toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/10</span>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(14);
  const [topLimit, setTopLimit] = useState(10);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        api.adminGetStats(),
        api.adminGetChartData(chartDays),
      ]);
      setStats(s);
      setChart(c || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const data = await api.adminGetTopCandidates(topLimit);
      setCandidates(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, [chartDays]);
  useEffect(() => { loadCandidates(); }, [topLimit]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> Đang tải thống kê...
    </div>
  );

  if (!stats) return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Không thể tải dữ liệu.</div>;

  const maxTotal = chart.length > 0 ? Math.max(...chart.map(d => d.total || 0), 1) : 1;

  const CARDS = [
    { icon: <Users size={20} />, label: 'Tổng người dùng', value: stats.total_users, sub: `+${stats.new_users_week} tuần này`, color: 'oklch(83.3% 0.145 321.434)' },
    { icon: <Mic size={20} />, label: 'Tổng phỏng vấn', value: stats.total_interviews, sub: `+${stats.interviews_week} tuần này`, color: 'oklch(68% 0.16 230)' },
    { icon: <CheckCircle size={20} />, label: 'Tỉ lệ hoàn thành', value: `${stats.completion_rate}%`, sub: `${stats.completed_interviews} / ${stats.total_interviews}`, color: 'oklch(72% 0.18 145)' },
    { icon: <Trophy size={20} />, label: 'Điểm trung bình', value: `${stats.avg_score}/10`, sub: stats.avg_score >= 7 ? 'Xuất sắc 🏆' : 'Cần cải thiện', color: 'oklch(80% 0.18 80)' },
    { icon: <Target size={20} />, label: 'Câu hỏi đã tạo', value: stats.total_questions, color: 'oklch(75% 0.17 150)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span className="gradient-text">Tổng quan</span> hệ thống
        </h2>
        <button onClick={() => { loadStats(); loadCandidates(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', transition: 'all 0.2s' }}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {CARDS.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Chart */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} /> Biểu đồ hoạt động
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[7, 14, 30].map(d => (
              <button key={d} onClick={() => setChartDays(d)}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                  background: chartDays === d ? 'var(--gradient-primary)' : 'transparent',
                  borderColor: chartDays === d ? 'transparent' : 'var(--border)',
                  color: chartDays === d ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
                }}>
                {d}N
              </button>
            ))}
          </div>
        </div>

        {chart.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '14px' }}>Chưa có dữ liệu biểu đồ.</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', padding: '0 4px' }}>
              {chart.slice(-chartDays).map((d, i) => (
                <ChartBar key={i} date={d.date} total={d.total || 0} completed={d.completed || 0} avgScore={d.avg_score} maxTotal={maxTotal} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--gradient-primary)', display: 'inline-block' }} /> Hoàn thành
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'oklch(83.3% 0.145 321.434 / 0.3)', display: 'inline-block' }} /> Tổng phỏng vấn
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)' }}>
                Số = Điểm TB ngày đó
              </span>
            </div>
          </>
        )}
      </div>

      {/* ─── Top Candidates ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} style={{ color: 'oklch(80% 0.18 80)' }} />
            <span className="gradient-text">Top</span> Ứng viên xuất sắc
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[10, 20, 50].map(n => (
              <button key={n} onClick={() => setTopLimit(n)}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                  background: topLimit === n ? 'var(--gradient-primary)' : 'transparent',
                  borderColor: topLimit === n ? 'transparent' : 'var(--border)',
                  color: topLimit === n ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
                }}>Top {n}</button>
            ))}
            <button onClick={loadCandidates} style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
              <RefreshCw size={13} style={candidatesLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          </div>
        </div>

        {/* Summary mini cards */}
        {!candidatesLoading && candidates.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {[
              { icon: <Award size={16} />, label: 'Điểm TB cao nhất', value: `${Number(candidates[0]?.avg_score || 0).toFixed(1)}/10`, color: 'oklch(80% 0.18 80)' },
              { icon: <TrendingUp size={16} />, label: 'PV nhiều nhất', value: candidates.reduce((m, c) => Math.max(m, c.completed_interviews), 0), color: 'oklch(83.3% 0.145 321.434)' },
              { icon: <Target size={16} />, label: 'Điểm tuyệt đối', value: `${Math.max(...candidates.map(c => Number(c.best_score || 0))).toFixed(1)}/10`, color: 'oklch(72% 0.18 145)' },
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: s.color, padding: '7px', borderRadius: '9px', display: 'flex', background: `${s.color} / 0.12` }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Rank', 'Ứng viên', 'Số PV hoàn thành', 'Điểm cao nhất', 'Điểm TB ⭐'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Điểm TB ⭐' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidatesLoading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '8px' }} /><br />Đang tải...
                </td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Chưa có đủ dữ liệu phỏng vấn.
                </td></tr>
              ) : candidates.map((c, i) => <CandidateRow key={c.id} candidate={c} index={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
