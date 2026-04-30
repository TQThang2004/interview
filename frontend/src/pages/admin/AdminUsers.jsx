import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Trash2, UserCog, User, AlertCircle } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetUsers(50, 0, search);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Xác nhận đổi quyền thành ${newRole}?`)) {
      try {
        await api.adminUpdateUserRole(userId, newRole);
        loadData();
      } catch (err) {
        alert("Lỗi khi đổi quyền");
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa user này vĩnh viễn? Mọi dữ liệu phỏng vấn sẽ bị xóa theo.")) {
      try {
        await api.adminDeleteUser(userId);
        loadData();
      } catch (err) {
        alert("Lỗi khi xóa user");
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Quản lý người dùng ({total})</h2>
        <input 
          className="input-field"
          style={{ width: '300px' }}
          placeholder="Tìm kiếm username, email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="error-msg"><AlertCircle size={14}/> {error}</div>}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'oklch(22% 0.015 250 / 0.5)' }}>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>User</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Role</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Thống kê</th>
              <th style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Không tìm thấy người dùng nào.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.username}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    background: u.role === 'admin' ? 'oklch(65% 0.22 25 / 0.2)' : 'oklch(83.3% 0.145 321.434 / 0.15)',
                    color: u.role === 'admin' ? 'oklch(65% 0.22 25)' : 'var(--primary)'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {u.total_interviews} phỏng vấn<br/>Điểm TB: {u.avg_score || '-'}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {u.role === 'user' ? (
                      <button onClick={() => handleRoleChange(u.id, 'admin')} title="Cấp quyền Admin" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <UserCog size={18} />
                      </button>
                    ) : (
                      <button onClick={() => handleRoleChange(u.id, 'user')} title="Hạ quyền User" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <User size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(u.id)} title="Xóa User" style={{ background: 'none', border: 'none', color: 'oklch(65% 0.22 25)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
