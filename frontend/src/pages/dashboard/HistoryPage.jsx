import React, { useState } from 'react';
import { Clock, Star, ChevronDown, ChevronUp, Search, Filter, BarChart3, TrendingUp, Trophy } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 1, topic: 'ReactJS Fullstack', level: 'Junior', score: 8.2, date: '14/04/2026', duration: '22 phút', questions: 7, detail: [{ q: 'Virtual DOM là gì?', score: 9 }, { q: 'useState vs useReducer?', score: 8 }, { q: 'React lifecycle?', score: 7.5 }] },
  { id: 2, topic: 'Node.js Backend', level: 'Middle', score: 6.5, date: '12/04/2026', duration: '18 phút', questions: 7, detail: [{ q: 'Event loop Node.js?', score: 7 }, { q: 'Cluster module?', score: 5.5 }, { q: 'Stream vs Buffer?', score: 7 }] },
  { id: 3, topic: 'Python Data Analysis', level: 'Junior', score: 9.0, date: '10/04/2026', duration: '25 phút', questions: 7, detail: [{ q: 'Pandas vs NumPy?', score: 9.5 }, { q: 'Data cleaning techniques?', score: 9 }, { q: 'Matplotlib basics?', score: 8.5 }] },
  { id: 4, topic: 'System Design', level: 'Senior', score: 7.2, date: '08/04/2026', duration: '35 phút', questions: 7, detail: [] },
  { id: 5, topic: 'Java Spring Boot', level: 'Middle', score: 8.8, date: '06/04/2026', duration: '20 phút', questions: 7, detail: [] },
];

function ScoreChip({ score }) {
  const [color, bg] = score >= 8 ? ['oklch(68% 0.2 145)', 'oklch(72% 0.18 145 / 0.12)'] : score >= 6.5 ? ['oklch(70% 0.18 80)', 'oklch(80% 0.18 80 / 0.12)'] : ['oklch(60% 0.22 25)', 'oklch(65% 0.22 25 / 0.12)'];
  return (
    <span style={{ fontWeight: 700, fontSize: '14px', color, background: bg, padding: '3px 10px', borderRadius: '999px' }}>
      {score}/10
    </span>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');

  const filtered = MOCK_HISTORY.filter(h =>
    (!search || h.topic.toLowerCase().includes(search.toLowerCase())) &&
    (filterLevel === 'all' || h.level === filterLevel)
  );

  const avgScore = (MOCK_HISTORY.reduce((a, b) => a + b.score, 0) / MOCK_HISTORY.length).toFixed(1);
  const best = Math.max(...MOCK_HISTORY.map(h => h.score));

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Lịch sử phỏng vấn</span> 📊
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Theo dõi tiến trình luyện tập của bạn.</p>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { icon: <BarChart3 size={18} />, label: 'Tổng phiên', value: MOCK_HISTORY.length, color: 'oklch(83.3% 0.145 321.434)' },
          { icon: <TrendingUp size={18} />, label: 'Điểm TB', value: avgScore, color: 'oklch(80% 0.18 80)' },
          { icon: <Trophy size={18} />, label: 'Điểm cao nhất', value: best, color: 'oklch(75% 0.17 150)' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: s.color, background: `${s.color.slice(0, -1)} / 0.12)`.replace('oklch(', 'oklch('), padding: '8px', borderRadius: '10px', display: 'flex' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: '1 1 200px' }}>
          <Search className="input-icon" />
          <input className="input-field" placeholder="Tìm kiếm chủ đề..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '44px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {['all', 'Intern', 'Junior', 'Middle', 'Senior'].map(l => (
            <button key={l} onClick={() => setFilterLevel(l)}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                border: '1px solid', transition: 'all 0.15s',
                background: filterLevel === l ? 'var(--gradient-primary)' : 'transparent',
                borderColor: filterLevel === l ? 'transparent' : 'var(--border)',
                color: filterLevel === l ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
              }}>
              {l === 'all' ? 'Tất cả' : l}
            </button>
          ))}
        </div>
      </div>

      {/* History list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không tìm thấy phiên nào phù hợp.
          </div>
        ) : filtered.map((h) => (
          <div key={h.id} className="glass-card" style={{ overflow: 'hidden', transition: 'all 0.25s' }}>
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
              {/* Left */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{h.topic}</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={11} /> {h.level}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {h.date} · {h.duration}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.questions} câu hỏi</span>
                </div>
              </div>
              <ScoreChip score={h.score} />
              {h.detail.length > 0 ? (expanded === h.id ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />) : null}
            </div>

            {/* Detail expand */}
            {expanded === h.id && h.detail.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '16px 22px', background: 'oklch(22% 0.015 250 / 0.4)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chi tiết các câu hỏi</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {h.detail.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-card)' }}>
                      <span style={{ fontSize: '13px', flex: 1, color: 'var(--text-secondary)' }}>{d.q}</span>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: d.score >= 8 ? 'oklch(68% 0.2 145)' : d.score >= 6.5 ? 'oklch(70% 0.18 80)' : 'oklch(60% 0.22 25)' }}>
                        {d.score}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
