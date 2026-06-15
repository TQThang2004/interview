import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminRAGStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      setStatus(await api.adminGetRagStatus());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const topics = status?.topics || {};
  const missing = status?.missing_topics || [];

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>RAG Status</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Kiểm tra collection ChromaDB và độ phủ topic luyện phỏng vấn.
          </p>
        </div>
        <button className="btn-primary" onClick={loadStatus} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} /> Tải lại
        </button>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Đang tải trạng thái RAG...</p>
        ) : !status ? (
          <p style={{ color: 'oklch(65% 0.22 25)' }}>Không thể tải trạng thái RAG.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Tổng vectors</div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{status.total_vectors || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Collection</div>
                <div style={{ fontWeight: 700 }}>{status.collection_name || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Topic thiếu</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: missing.length ? 'oklch(65% 0.22 25)' : 'oklch(72% 0.18 145)' }}>
                  {missing.length}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {missing.length ? (
                <AlertTriangle size={18} style={{ color: 'oklch(65% 0.22 25)' }} />
              ) : (
                <CheckCircle2 size={18} style={{ color: 'oklch(72% 0.18 145)' }} />
              )}
              <span style={{ color: missing.length ? 'oklch(70% 0.16 25)' : 'oklch(72% 0.18 145)', fontWeight: 700 }}>
                {missing.length ? 'Vector store chưa đủ topic.' : 'Vector store đã đủ topic.'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {Object.entries(topics).map(([topic, count]) => (
                <div key={topic || 'empty'} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={14} style={{ color: 'var(--primary)' }} />
                    {topic || '(không có topic)'}
                  </span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            {missing.length > 0 && (
              <p style={{ marginTop: 18, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                Cần chạy lại `data_pipeline/scripts/parse_datasets.py`, sau đó `embed_all_datasets.py`, rồi kiểm tra bằng `check_rag_status.py`.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
