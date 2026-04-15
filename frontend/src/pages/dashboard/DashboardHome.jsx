import React from 'react';
import { Brain, Mic, BarChart3, Trophy, Clock, ArrowRight, PlayCircle, TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_RECENT = [
  { topic: 'ReactJS Fullstack', level: 'Junior', score: 8.2, date: '14/04/2026', questions: 7 },
  { topic: 'Node.js Backend', level: 'Middle', score: 6.5, date: '12/04/2026', questions: 7 },
  { topic: 'Python Data Analysis', level: 'Junior', score: 9.0, date: '10/04/2026', questions: 7 },
];

const QUICK_ACTIONS = [
  { icon: <PlayCircle size={22} />, label: 'Bắt đầu phỏng vấn', color: 'var(--primary)', bg: 'oklch(83.3% 0.145 321.434 / 0.12)', border: 'oklch(83.3% 0.145 321.434 / 0.3)', action: 'interview' },
  { icon: <BarChart3 size={22} />, label: 'Đánh giá CV', color: 'oklch(68% 0.16 230)', bg: 'oklch(68% 0.16 230 / 0.12)', border: 'oklch(68% 0.16 230 / 0.3)', action: 'cv-evaluation' },
  { icon: <TrendingUp size={22} />, label: 'Xem lịch sử', color: 'oklch(75% 0.17 150)', bg: 'oklch(75% 0.17 150 / 0.12)', border: 'oklch(75% 0.17 150 / 0.3)', action: 'history' },
];

function ScoreBadge({ score }) {
  const color = score >= 8 ? 'oklch(72% 0.18 145)' : score >= 6 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';
  return (
    <span style={{ color, fontWeight: 700, fontSize: '15px' }}>{score}/10</span>
  );
}

export default function DashboardHome({ onNavigate }) {
  const stats = [
    { label: 'Phiên phỏng vấn', value: '12', icon: <Mic size={20} />, color: 'oklch(83.3% 0.145 321.434)', trend: '+3 tuần này' },
    { label: 'Điểm trung bình', value: '7.9', icon: <Star size={20} />, color: 'oklch(80% 0.18 80)', trend: '+0.4 vs tuần trước' },
    { label: 'Câu hỏi đã trả lời', value: '84', icon: <Brain size={20} />, color: 'oklch(68% 0.16 230)', trend: '+21 tuần này' },
    { label: 'Phiên xuất sắc', value: '5', icon: <Trophy size={20} />, color: 'oklch(75% 0.17 150)', trend: 'score ≥ 8.5' },
  ];

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1100px' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Chào buổi sáng, <span className="gradient-text">Người dùng</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Hôm nay là ngày tốt để luyện tập thêm một phiên phỏng vấn!
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{s.label}</span>
              <div style={{ color: s.color, background: `${s.color.slice(0, -1)} / 0.12)`.replace('oklch(', 'oklch(').replace(' / 0.12)', ' / 0.12)'), padding: '6px', borderRadius: '8px', display: 'flex' }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 'clamp(26px, 3vw, 32px)', fontWeight: 900, marginBottom: '4px', color: 'var(--text-primary)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: s.color, fontWeight: 500 }}>{s.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px' }}>
        {/* Quick actions */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic size={16} style={{ color: 'var(--primary)' }} /> Bắt đầu nhanh
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {QUICK_ACTIONS.map((a, i) => (
              <button key={i} onClick={() => onNavigate(a.action)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 16px', borderRadius: '12px',
                  background: a.bg, border: `1px solid ${a.border}`,
                  cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span style={{ color: a.color }}>{a.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>{a.label}</span>
                <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Recent interviews */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'oklch(68% 0.16 230)' }} /> Phiên gần đây
            </h2>
            <button onClick={() => onNavigate('history')} style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Xem tất cả →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOCK_RECENT.map((r, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'oklch(22% 0.015 250 / 0.5)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{r.topic}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {r.level} · {r.questions} câu · {r.date}
                  </div>
                </div>
                <ScoreBadge score={r.score} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="glass-card" style={{
        marginTop: '20px', padding: '24px 28px',
        background: 'oklch(83.3% 0.145 321.434 / 0.06)',
        border: '1px solid oklch(83.3% 0.145 321.434 / 0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '17px', marginBottom: '4px' }}>
            Sẵn sàng cho phiên tiếp theo? 🎯
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Upload CV + JD để nhận câu hỏi cá nhân hóa cho vị trí bạn đang ứng tuyển.
          </p>
        </div>
        <button id="dash-start-interview-btn" className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => onNavigate('interview')}>
          <PlayCircle size={16} /> Bắt đầu ngay
        </button>
      </div>
    </div>
  );
}
