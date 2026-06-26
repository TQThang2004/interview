import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import CVHistoryListView from './CVHistoryListView';
import CVHistoryDetailView from './CVHistoryDetailView';

export default function CVHistoryPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // Bản đang xem chi tiết

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCvEvaluations(10, 0);
      setEvaluations(data.evaluations || []);
      setCount(data.count || 0);
    } catch (err) {
      console.error('[CVHistoryPage] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvaluations(); }, [fetchEvaluations]);

  const handleDelete = (deletedId) => {
    setEvaluations(prev => prev.filter(ev => ev.id !== deletedId));
    setCount(prev => Math.max(0, prev - 1));
    if (selected?.id === deletedId) setSelected(null);
  };

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1100px' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Lịch sử đánh giá CV</span> 📋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Xem lại bản CV và kết quả phân tích đã lưu. Mỗi tài khoản được lưu tối đa <strong>5 bản</strong>.
        </p>
      </div>

      {selected ? (
        <CVHistoryDetailView
          evaluation={selected}
          onBack={() => setSelected(null)}
          onDelete={(id) => { handleDelete(id); setSelected(null); }}
        />
      ) : (
        <CVHistoryListView
          evaluations={evaluations}
          count={count}
          maxCount={5}
          loading={loading}
          onSelect={setSelected}
          onDelete={handleDelete}
          onRefresh={fetchEvaluations}
        />
      )}
    </div>
  );
}
