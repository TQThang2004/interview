import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

const PAGE_SIZE = 20;

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminGetAuditLogs(PAGE_SIZE, page * PAGE_SIZE, '', action, entityType);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [action, entityType, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '1120px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
          <span className="gradient-text">Audit Log</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Theo dõi các hành động quản trị quan trọng trong hệ thống.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="input-field" value={action} onChange={e => { setAction(e.target.value); setPage(0); }} style={{ maxWidth: '220px', height: '40px' }}>
          <option value="">Tất cả hành động</option>
          <option value="create_user">Tạo user</option>
          <option value="update_user_role">Đổi role</option>
          <option value="delete_user">Xóa user</option>
          <option value="delete_interview">Xóa phỏng vấn</option>
          <option value="approve_post">Duyệt bài</option>
          <option value="reject_post">Từ chối bài</option>
          <option value="delete_post">Xóa bài</option>
          <option value="delete_cv_evaluation">Xóa đánh giá CV</option>
        </select>
        <select className="input-field" value={entityType} onChange={e => { setEntityType(e.target.value); setPage(0); }} style={{ maxWidth: '220px', height: '40px' }}>
          <option value="">Tất cả đối tượng</option>
          <option value="user">User</option>
          <option value="interview">Interview</option>
          <option value="community_post">Community post</option>
          <option value="cv_evaluation">CV evaluation</option>
        </select>
        <button onClick={loadLogs} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '56px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck size={34} style={{ opacity: 0.5, marginBottom: '10px' }} />
            <p>Chưa có audit log phù hợp.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Thời gian', 'Admin', 'Hành động', 'Đối tượng', 'Metadata'].map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700 }}>{log.actor_name || 'Admin'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{log.actor_email || log.actor_id}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--primary)' }}>{log.action}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{log.entity_type}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{log.entity_id || '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {JSON.stringify(log.metadata || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft size={14} /> Trước
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Trang {page + 1} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            Sau <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
