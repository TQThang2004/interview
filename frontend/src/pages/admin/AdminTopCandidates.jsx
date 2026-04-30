import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Trophy, Star, Target } from 'lucide-react';

export default function AdminTopCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.adminGetTopCandidates(15);
        setCandidates(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy style={{ color: 'oklch(80% 0.18 80)' }} /> Top Ứng viên Xuất sắc
      </h2>
      
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'oklch(22% 0.015 250 / 0.5)' }}>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)', width: '60px' }}>Rank</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Ứng viên</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>Số phỏng vấn</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>Điểm cao nhất</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'right' }}>Điểm TB</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</td></tr>
            ) : candidates.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Chưa có đủ dữ liệu.</td></tr>
            ) : candidates.map((c, index) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                  {index === 0 ? <span style={{ color: 'gold' }}>1</span> : 
                   index === 1 ? <span style={{ color: 'silver' }}>2</span> : 
                   index === 2 ? <span style={{ color: '#cd7f32' }}>3</span> : index + 1}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600 }}>{c.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.email}</div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {c.completed_interviews} / {c.total_interviews}
                </td>
                <td style={{ padding: '16px', textAlign: 'center', color: 'oklch(72% 0.18 145)', fontWeight: 600 }}>
                  <Target size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {c.best_score}
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>
                  <Star size={16} fill="var(--primary)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {c.avg_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
