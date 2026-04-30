import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetInterviews(50, 0, statusFilter);
      setInterviews(data.interviews || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const getStatusDisplay = (status) => {
    if (status === 'completed') return <span style={{ color: 'oklch(72% 0.18 145)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14}/> Hoàn thành</span>;
    if (status === 'cancelled') return <span style={{ color: 'oklch(65% 0.22 25)', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={14}/> Đã hủy</span>;
    return <span style={{ color: 'oklch(80% 0.18 80)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> Đang tiến hành</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Lịch sử phỏng vấn ({total})</h2>
        <select 
          className="input-field" 
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="completed">Hoàn thành</option>
          <option value="in_progress">Đang tiến hành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'oklch(22% 0.015 250 / 0.5)' }}>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Chủ đề / Ngôn ngữ</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Người dùng</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Trạng thái</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Tiến độ</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'right' }}>Điểm / 10</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</td></tr>
            ) : interviews.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Không có dữ liệu.</td></tr>
            ) : interviews.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600 }}>{i.topic}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{i.level} • {i.language}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 500 }}>{i.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{i.email}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '13px' }}>
                  {getStatusDisplay(i.status)}
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {i.answered_questions} / {i.total_questions} câu
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, fontSize: '16px', color: i.overall_score >= 8 ? 'oklch(72% 0.18 145)' : (i.overall_score >= 5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)') }}>
                  {i.overall_score != null ? i.overall_score : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
