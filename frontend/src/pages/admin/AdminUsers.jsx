import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import {
  Trash2, UserCog, User, AlertCircle, Search,
  RefreshCw, X, Shield, Mail, Calendar, Mic, Star, Plus
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';

function Avatar({ name, avatar_url, size = 36 }) {
  const url = avatar_url || '/avatar-default.jpg';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden'
    }}>
      <img src={url} alt={name || 'avatar'} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      background: isAdmin ? 'oklch(65% 0.22 25 / 0.15)' : 'oklch(83.3% 0.145 321.434 / 0.15)',
      color: isAdmin ? 'oklch(65% 0.22 25)' : 'var(--primary)',
      border: `1px solid ${isAdmin ? 'oklch(65% 0.22 25 / 0.3)' : 'oklch(83.3% 0.145 321.434 / 0.3)'}`,
    }}>
      {isAdmin ? '👑 ADMIN' : 'USER'}
    </span>
  );
}

// Modal chi tiết user
function UserDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetUserDetail(userId).then(u => { setUser(u); setLoading(false); });
  }, [userId]);

  if (!userId) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'oklch(0% 0 0 / 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '560px', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>Chi tiết người dùng</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : !user ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy user.</div>
        ) : (
          <div style={{ padding: '24px' }}>
            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <Avatar name={user.username} avatar_url={user.avatar_url} size={52} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '4px' }}>{user.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '6px' }}>
                  <Mail size={12} /> {user.email}
                </div>
                <RoleBadge role={user.role} />
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { icon: <Mic size={14} />, label: 'Phỏng vấn', value: user.interviews?.length || 0 },
                { icon: <Star size={14} />, label: 'Đã hoàn thành', value: user.interviews?.filter(i => i.status === 'completed').length || 0 },
                { icon: <Calendar size={14} />, label: 'Tham gia', value: user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—' },
                { icon: <Shield size={14} />, label: 'Role', value: user.role?.toUpperCase() },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Recent interviews */}
            {user.interviews?.length > 0 && (
              <>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  Phỏng vấn gần đây
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {user.interviews.map((iv, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{iv.topic}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{iv.level} · {new Date(iv.started_at).toLocaleDateString('vi-VN')}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {iv.overall_score != null && (
                          <div style={{ fontWeight: 800, fontSize: '14px', color: iv.overall_score >= 8 ? 'oklch(68% 0.2 145)' : iv.overall_score >= 6 ? 'oklch(70% 0.18 80)' : 'oklch(60% 0.22 25)' }}>
                            {Number(iv.overall_score).toFixed(1)}/10
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: iv.status === 'completed' ? 'oklch(68% 0.2 145)' : 'var(--text-muted)' }}>
                          {iv.status === 'completed' ? '✅' : iv.status === 'cancelled' ? '⏹' : '🔄'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// Modal tạo user mới
function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.adminCreateUser(formData);
      onSuccess('Tạo người dùng thành công!');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'oklch(0% 0 0 / 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>Thêm mới người dùng</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={20} /></button>
        </div>
        {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'oklch(65% 0.22 25 / 0.1)', color: 'oklch(65% 0.22 25)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Tên đăng nhập</label>
            <input required className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Email</label>
            <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Mật khẩu</label>
            <input required type="password" minLength={6} className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>Vai trò</label>
            <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Đang tạo...' : 'Tạo người dùng'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Removed local ConfirmModal

export default function AdminUsers() {
  const { showConfirm } = useModal();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminGetUsers(100, 0, search);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      setError('Không thể tải danh sách user');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleRoleChange = async (userId, newRole, username) => {
    const msg = newRole === 'admin' ? `Cấp quyền Admin cho "${username}"?` : `Hạ quyền "${username}" xuống User?`;
    if (!await showConfirm(msg)) return;
    try {
      await api.adminUpdateUserRole(userId, newRole);
      showToast(`Đã ${newRole === 'admin' ? 'cấp quyền Admin' : 'hạ xuống User'} thành công!`);
      loadData();
    } catch { showToast('Lỗi khi đổi quyền', false); }
  };

  const handleDelete = async (userId, username) => {
    if (!await showConfirm(`Xóa vĩnh viễn tài khoản "${username}"? Mọi dữ liệu phỏng vấn sẽ mất.`, 'Xác nhận', { danger: true })) return;
    try {
      await api.adminDeleteUser(userId);
      showToast('Đã xóa user thành công!');
      loadData();
    } catch { showToast('Lỗi khi xóa user', false); }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 400,
          padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
          background: toast.success ? 'oklch(68% 0.2 145)' : 'oklch(65% 0.22 25)',
          color: 'white', boxShadow: '0 8px 24px oklch(0% 0 0 / 0.4)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.success ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Removed local ConfirmModal */}

      {/* User detail modal */}
      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={(msg) => {
            setShowCreateModal(false);
            showToast(msg);
            loadData();
          }} 
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Quản lý người dùng <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>({total})</span>
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Thêm mới
          </button>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '36px', width: '240px' }}
              placeholder="Tìm username, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', transition: 'all 0.2s' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'oklch(65% 0.22 25 / 0.1)', border: '1px solid oklch(65% 0.22 25 / 0.3)', color: 'oklch(65% 0.22 25)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              {['Người dùng', 'Email', 'Role', 'Thống kê', 'Ngày tham gia', 'Hành động'].map(h => (
                <th key={h} style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '8px' }} /><br />Đang tải...
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy người dùng nào.</td></tr>
            ) : users.map(u => (
              <tr key={u.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar name={u.username} avatar_url={u.avatar_url} size={36} />
                    <div>
                      <button
                        onClick={() => setSelectedUserId(u.id)}
                        style={{ fontWeight: 600, fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 0, textAlign: 'left' }}
                        onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                      >
                        {u.username}
                      </button>
                      {u.phone_number && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.phone_number}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{u.email}</td>
                <td style={{ padding: '14px 16px' }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div>{u.total_interviews} phỏng vấn</div>
                  <div style={{ fontSize: '12px', color: u.avg_score >= 8 ? 'oklch(68% 0.2 145)' : 'var(--text-muted)' }}>
                    TB: {u.avg_score ? Number(u.avg_score).toFixed(1) : '—'}/10
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    {u.role === 'user' ? (
                      <button
                        onClick={() => handleRoleChange(u.id, 'admin', u.username)}
                        title="Cấp quyền Admin"
                        style={{ padding: '7px', background: 'oklch(83.3% 0.145 321.434 / 0.1)', border: '1px solid oklch(83.3% 0.145 321.434 / 0.3)', borderRadius: '8px', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}
                      >
                        <UserCog size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(u.id, 'user', u.username)}
                        title="Hạ quyền User"
                        style={{ padding: '7px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                      >
                        <User size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      title="Xóa User"
                      style={{ padding: '7px', background: 'oklch(65% 0.22 25 / 0.1)', border: '1px solid oklch(65% 0.22 25 / 0.3)', borderRadius: '8px', cursor: 'pointer', color: 'oklch(65% 0.22 25)', display: 'flex' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>
    </div>
  );
}
