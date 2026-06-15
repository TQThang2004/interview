import React, { useState, useEffect } from 'react';
import { Brain, Mic, BarChart3, Trophy, Clock, ArrowRight, PlayCircle, TrendingUp, Star, BookOpen, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { API_BASE_URL } from '../../constants/api';

/* ── Topic icon map (emoji) ── */
const TOPIC_EMOJI = {
  'React':           '⚛️',
  'JavaScript':      '📜',
  'Python':          '🐍',
  'Java':            '☕',
  'SQL':             '🗄️',
  'NodeJS':          '🟢',
  'Docker':          '🐳',
  'Git':             '🔀',
  'OOP':             '📦',
  'Machine Learning':'🧠',
  'System Design':   '🏗️',
  'Spring':          '🍃',
  'Data Analysis':   '📊',
};

const QUICK_ACTIONS = [
  { icon: <PlayCircle size={22} />, label: 'Bắt đầu phỏng vấn', color: 'var(--primary)', bg: 'oklch(83.3% 0.145 321.434 / 0.12)', border: 'oklch(83.3% 0.145 321.434 / 0.3)', action: 'interview' },
  { icon: <BookOpen size={22} />, label: 'Luyện tập chủ đề', color: 'oklch(72% 0.18 145)', bg: 'oklch(72% 0.18 145 / 0.12)', border: 'oklch(72% 0.18 145 / 0.3)', action: 'practice' },
  { icon: <BarChart3 size={22} />, label: 'Đánh giá CV', color: 'oklch(68% 0.16 230)', bg: 'oklch(68% 0.16 230 / 0.12)', border: 'oklch(68% 0.16 230 / 0.3)', action: 'cv-evaluation' },
  { icon: <TrendingUp size={22} />, label: 'Xem lịch sử', color: 'oklch(75% 0.17 150)', bg: 'oklch(75% 0.17 150 / 0.12)', border: 'oklch(75% 0.17 150 / 0.3)', action: 'history' },
];

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>—</span>;
  const numScore = parseFloat(score);
  const color = numScore >= 8 ? 'oklch(72% 0.18 145)' : numScore >= 6 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';
  return <span style={{ color, fontWeight: 700, fontSize: '15px' }}>{numScore.toFixed(1)}/10</span>;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Hôm qua';
  if (diff < 7) return `${diff} ngày trước`;
  return d.toLocaleDateString('vi-VN');
}

export default function DashboardHome({ onNavigate }) {
  const [interviews, setInterviews] = useState([]);
  const [practiceStats, setPracticeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [data, stats] = await Promise.all([
          api.getInterviews(10, 0),
          api.getPracticeStats(),
        ]);
        setInterviews(data);
        setPracticeStats(stats);
        const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
        if (res.ok) setUser(await res.json());
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length > 0
    ? (completed.reduce((sum, i) => sum + (parseFloat(i.overall_score) || 0), 0) / completed.length).toFixed(1)
    : '0.0';
  const totalQuestions = completed.reduce((sum, i) => sum + (i.answered_questions || i.total_questions || 0), 0);
  const excellentSessions = completed.filter(i => parseFloat(i.overall_score) >= 8.5).length;

  const stats = [
    { label: 'Phiên phỏng vấn', value: interviews.length, icon: <Mic size={20} />, color: 'oklch(83.3% 0.145 321.434)' },
    { label: 'Điểm trung bình', value: avgScore, icon: <Star size={20} />, color: 'oklch(80% 0.18 80)' },
    { label: 'Câu hỏi đã trả lời', value: totalQuestions, icon: <Brain size={20} />, color: 'oklch(68% 0.16 230)' },
    { label: 'Phiên xuất sắc', value: excellentSessions, icon: <Trophy size={20} />, color: 'oklch(75% 0.17 150)' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1100px' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          {greeting}, <span className="gradient-text">{user?.username || 'Người dùng'}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Hôm nay là ngày tốt để luyện tập thêm một bài kiểm tra!
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{s.label}</span>
              <div style={{ color: s.color, padding: '6px', borderRadius: '8px', display: 'flex', background: `${s.color.replace(')', ' / 0.12)')}` }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 'clamp(26px, 3vw, 32px)', fontWeight: 900, color: 'var(--text-primary)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Quick actions */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: 'var(--primary)' }} /> Bắt đầu nhanh
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
            {loading ? <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Đang tải...</div> :
              interviews.slice(0, 3).map((r, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: '10px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{r.topic}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {r.level} · {r.answered_questions || r.total_questions || 0} câu · {new Date(r.started_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <ScoreBadge score={r.overall_score} />
              </div>
            ))}
            {!loading && interviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                Chưa có phiên phỏng vấn nào.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bảng tần suất luyện tập ── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} style={{ color: 'oklch(72% 0.18 145)' }} /> Tần suất luyện tập
          </h2>
          <button
            onClick={() => onNavigate('practice')}
            style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Luyện tập ngay →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : practiceStats.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '28px 20px',
            background: 'oklch(72% 0.18 145 / 0.05)',
            border: '1px dashed oklch(72% 0.18 145 / 0.3)',
            borderRadius: '12px',
          }}>
            <BookOpen size={32} style={{ color: 'oklch(72% 0.18 145 / 0.5)', marginBottom: '10px', display: 'block', margin: '0 auto 10px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              Bạn chưa hoàn thành bài luyện tập nào.{' '}
              <button onClick={() => onNavigate('practice')} style={{ color: 'oklch(72% 0.18 145)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', padding: 0 }}>
                Bắt đầu luyện tập →
              </button>
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
              <thead>
                <tr>
                  {['Chủ đề', 'Số bài', 'Điểm TB', 'Điểm cao nhất', 'Lần cuối'].map(h => (
                    <th key={h} style={{
                      padding: '6px 14px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {practiceStats.map((s, idx) => (
                  <tr
                    key={s.topic}
                    onClick={() => onNavigate('practice')}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{
                      padding: '11px 14px', borderRadius: '10px 0 0 10px',
                      fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
                      background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent',
                    }}>
                      <span style={{ marginRight: '8px' }}>{TOPIC_EMOJI[s.topic] || '📚'}</span>
                      {s.topic}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '14px', color: 'var(--text-secondary)', background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent' }}>
                      {s.total_sessions} bài
                    </td>
                    <td style={{ padding: '11px 14px', background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent' }}>
                      <ScoreBadge score={s.avg_score} />
                    </td>
                    <td style={{ padding: '11px 14px', background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent' }}>
                      <ScoreBadge score={s.best_score} />
                    </td>
                    <td style={{
                      padding: '11px 14px', borderRadius: '0 10px 10px 0',
                      fontSize: '13px', color: 'var(--text-muted)',
                      background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent',
                    }}>
                      {formatDate(s.last_practiced)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
