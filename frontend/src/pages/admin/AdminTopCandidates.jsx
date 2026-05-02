import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Trophy, Star, Target, Medal, RefreshCw, TrendingUp, Award } from 'lucide-react';

const RANK_STYLES = [
  { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#7a4f00', icon: '🥇' },
  { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: '#444', icon: '🥈' },
  { bg: 'linear-gradient(135deg, #CD7F32, #A05C20)', color: '#fff', icon: '🥉' },
];

function CandidateRow({ candidate, index }) {
  const rank = RANK_STYLES[index];
  const isTop3 = index < 3;

  return (
    <tr
      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'oklch(22% 0.015 250 / 0.3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '16px', width: '60px', textAlign: 'center' }}>
        {isTop3 ? (
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: rank.bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px', margin: '0 auto',
          }}>
            {rank.icon}
          </div>
        ) : (
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-muted)' }}>{index + 1}</span>
        )}
      </td>
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: isTop3 ? rank.bg : 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '15px',
            color: isTop3 && index > 0 ? rank.color : 'oklch(15% 0.01 250)',
            flexShrink: 0,
          }}>
            {(candidate.username || '?').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{candidate.username}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{candidate.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{candidate.completed_interviews}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ {candidate.total_interviews} tổng</div>
      </td>
      <td style={{ padding: '16px', textAlign: 'center' }}>
        <span style={{
          fontWeight: 700, fontSize: '14px', color: 'oklch(72% 0.18 145)',
          background: 'oklch(72% 0.18 145 / 0.1)', padding: '4px 10px', borderRadius: '999px',
          display: 'inline-flex', alignItems: 'center', gap: '4px',
        }}>
          <Target size={12} /> {candidate.best_score != null ? Number(candidate.best_score).toFixed(1) : '—'}
        </span>
      </td>
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Star size={16} fill="var(--primary)" style={{ color: 'var(--primary)' }} />
          <span style={{
            fontWeight: 900, fontSize: '20px',
            background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {candidate.avg_score != null ? Number(candidate.avg_score).toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/10</span>
        </div>
      </td>
    </tr>
  );
}

export default function AdminTopCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetTopCandidates(limit);
      setCandidates(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [limit]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy style={{ color: 'oklch(80% 0.18 80)' }} size={26} />
          <span className="gradient-text">Top</span> Ứng viên xuất sắc
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[10, 20, 50].map(n => (
            <button key={n} onClick={() => setLimit(n)}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                background: limit === n ? 'var(--gradient-primary)' : 'transparent',
                borderColor: limit === n ? 'transparent' : 'var(--border)',
                color: limit === n ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
              }}>Top {n}</button>
          ))}
          <button onClick={loadData} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && candidates.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {[
            { icon: <Award size={18} />, label: 'Điểm TB cao nhất', value: `${Number(candidates[0]?.avg_score || 0).toFixed(1)}/10`, color: 'oklch(80% 0.18 80)' },
            { icon: <TrendingUp size={18} />, label: 'Phỏng vấn nhiều nhất', value: candidates.reduce((m, c) => Math.max(m, c.completed_interviews), 0), color: 'oklch(83.3% 0.145 321.434)' },
            { icon: <Target size={18} />, label: 'Điểm cao tuyệt đối', value: `${Math.max(...candidates.map(c => Number(c.best_score || 0))).toFixed(1)}/10`, color: 'oklch(72% 0.18 145)' },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: s.color, background: `${s.color.slice(0, -1).replace('oklch', 'oklch(')} / 0.12)`, padding: '8px', borderRadius: '10px', display: 'flex' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'oklch(22% 0.015 250 / 0.5)' }}>
              {['Rank', 'Ứng viên', 'Số PV hoàn thành', 'Điểm cao nhất', 'Điểm TB ⭐'].map(h => (
                <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Điểm TB ⭐' ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '8px' }} /><br />Đang tải...
              </td></tr>
            ) : candidates.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có đủ dữ liệu phỏng vấn.
              </td></tr>
            ) : candidates.map((c, i) => <CandidateRow key={c.id} candidate={c} index={i} />)}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
