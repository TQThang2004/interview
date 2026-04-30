import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.adminGetStats();
        setStats(data);
      } catch (error) {
        console.error("Lỗi khi load thống kê:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (!stats) return <div>Không thể tải dữ liệu.</div>;

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Thống kê tổng quan</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tổng số User</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>{stats.total_users}</div>
          <div style={{ fontSize: '12px', color: 'oklch(75% 0.17 150)', marginTop: '4px' }}>+{stats.new_users_week} tuần này</div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tổng phiên phỏng vấn</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>{stats.total_interviews}</div>
          <div style={{ fontSize: '12px', color: 'oklch(75% 0.17 150)', marginTop: '4px' }}>+{stats.interviews_week} tuần này</div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tỉ lệ hoàn thành</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>{stats.completion_rate}%</div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Điểm trung bình</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>{stats.avg_score} / 10</div>
        </div>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Câu hỏi đã tạo</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>{stats.total_questions}</div>
        </div>
      </div>
    </div>
  );
}
