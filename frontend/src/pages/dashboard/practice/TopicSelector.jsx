/**
 * TopicSelector.jsx
 * Giao diện chọn chủ đề luyện tập – grid card với icon, thống kê luyện tập.
 */
import React, { useState, useEffect } from 'react';
import {
  Atom, FileCode, Terminal, Coffee, Database, Server, Box,
  GitBranch, Boxes, Brain, Network, Leaf, BarChart3,
  BookOpen, PlayCircle, GraduationCap,
} from 'lucide-react';
import { api } from '../../../services/api';

/* ── Icon map theo topic id ── */
const TOPIC_ICONS = {
  'React':          <Atom size={28} />,
  'JavaScript':     <FileCode size={28} />,
  'Python':         <Terminal size={28} />,
  'Java':           <Coffee size={28} />,
  'SQL':            <Database size={28} />,
  'NodeJS':         <Server size={28} />,
  'Docker':         <Box size={28} />,
  'Git':            <GitBranch size={28} />,
  'OOP':            <Boxes size={28} />,
  'Machine Learning': <Brain size={28} />,
  'System Design':  <Network size={28} />,
  'Spring':         <Leaf size={28} />,
  'Data Analysis':  <BarChart3 size={28} />,
};

const TOPIC_COLORS = {
  'React':          'oklch(70% 0.18 210)',
  'JavaScript':     'oklch(80% 0.17 80)',
  'Python':         'oklch(73% 0.15 250)',
  'Java':           'oklch(65% 0.18 30)',
  'SQL':            'oklch(68% 0.16 220)',
  'NodeJS':         'oklch(72% 0.18 145)',
  'Docker':         'oklch(65% 0.16 215)',
  'Git':            'oklch(68% 0.2 25)',
  'OOP':            'oklch(70% 0.15 300)',
  'Machine Learning': 'oklch(72% 0.16 175)',
  'System Design':  'oklch(68% 0.17 260)',
  'Spring':         'oklch(70% 0.2 145)',
  'Data Analysis':  'oklch(72% 0.14 180)',
};

const LEVELS = ['Intern', 'Junior', 'Middle', 'Senior'];
const NUM_Q_OPTIONS = [5, 10, 15];

export default function TopicSelector({ onStart }) {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({});   // {topicId: {total_sessions, avg_score}}
  const [selected, setSelected] = useState(null);
  const [level, setLevel] = useState('Junior');
  const [numQ, setNumQ] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [topicsData, statsData] = await Promise.all([
          api.getPracticeTopics(),
          api.getPracticeStats(),
        ]);
        setTopics(topicsData);
        // Build stats map
        const sMap = {};
        statsData.forEach(s => { sMap[s.topic] = s; });
        setStats(sMap);
      } catch (err) {
        console.error('Failed to load topics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStart = () => {
    if (!selected) return;
    onStart({ topic: selected, level, numQuestions: numQ });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách chủ đề...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)',
          }}>
            <GraduationCap size={24} style={{ color: 'var(--primary-contrast)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              <span className="gradient-text">Luyện tập</span> theo Chủ đề
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Chọn chủ đề và làm bài kiểm tra để ôn luyện kiến thức kỹ thuật
            </p>
          </div>
        </div>
      </div>

      {/* Topic grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '14px',
        marginBottom: '28px',
      }}>
        {topics.map(topic => {
          const isSelected = selected === topic.id;
          const color = TOPIC_COLORS[topic.id] || 'var(--primary)';
          const stat = stats[topic.id];

          return (
            <button
              key={topic.id}
              onClick={() => setSelected(topic.id)}
              style={{
                position: 'relative',
                padding: '20px 16px',
                borderRadius: '16px',
                border: `2px solid ${isSelected ? color : 'var(--border)'}`,
                background: isSelected
                  ? `${color.replace(')', ' / 0.12)').replace('oklch(', 'oklch(')}`
                  : 'var(--bg-elevated)',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
                textAlign: 'left',
                boxShadow: isSelected ? `0 4px 20px ${color.replace(')', ' / 0.25)').replace('oklch(', 'oklch(')}` : 'none',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              {/* Selected check */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div style={{ color, marginBottom: '10px', display: 'flex' }}>
                {TOPIC_ICONS[topic.id] || <BookOpen size={28} />}
              </div>

              {/* Label */}
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {topic.label}
              </div>

              {/* Stats */}
              {stat ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div>{stat.total_sessions} phiên</div>
                  <div style={{ color, fontWeight: 600 }}>TB: {stat.avg_score}/10</div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Chưa luyện tập
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Settings + Start */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          alignItems: 'end',
        }}>
          {/* Level */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Cấp độ
            </label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Số câu */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Số câu hỏi
            </label>
            <select
              value={numQ}
              onChange={e => setNumQ(Number(e.target.value))}
              className="input-field"
              style={{ width: '100%' }}
            >
              {NUM_Q_OPTIONS.map(n => <option key={n} value={n}>{n} câu</option>)}
            </select>
          </div>

          {/* Start button */}
          <div>
            <button
              id="btn-start-practice"
              onClick={handleStart}
              disabled={!selected}
              className="btn-primary"
              style={{
                width: '100%', padding: '13px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '15px', fontWeight: 700,
                opacity: selected ? 1 : 0.4,
                cursor: selected ? 'pointer' : 'not-allowed',
              }}
            >
              <PlayCircle size={18} />
              {selected ? `Bắt đầu – ${selected}` : 'Chọn chủ đề để bắt đầu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
