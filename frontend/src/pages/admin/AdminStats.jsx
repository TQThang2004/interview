import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Mic, Trophy, Target, TrendingUp, BarChart3, RefreshCw, CheckCircle } from 'lucide-react';

function StatCard({ icon, label, value, sub, color, trend }) {
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
      {trend && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{trend}</div>}
    </div>
  );
}

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

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(14);

  const loadData = async () => {
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

  useEffect(() => { loadData(); }, [chartDays]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> Đang tải thống kê...
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
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
    { icon: <TrendingUp size={20} />, label: 'User mới (7 ngày)', value: stats.new_users_week, color: 'oklch(60% 0.17 320)' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          <span className="gradient-text">Tổng quan</span> hệ thống
        </h2>
        <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', transition: 'all 0.2s' }}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {CARDS.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Chart */}
      <div className="glass-card" style={{ padding: '24px' }}>
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
    </div>
  );
}
