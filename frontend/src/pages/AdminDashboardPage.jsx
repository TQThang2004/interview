import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Mic, Trophy, User, LogOut,
} from 'lucide-react';

import DashboardLayout     from '../components/layout/DashboardLayout';
import AdminStats          from './admin/AdminStats';
import AdminUsers          from './admin/AdminUsers';
import AdminInterviews     from './admin/AdminInterviews';
import AdminTopCandidates  from './admin/AdminTopCandidates';
import ProfilePage         from './dashboard/ProfilePage';

/* ── Nav items ── */
const NAV = [
  { id: 'stats',      label: 'Thống kê',          icon: <LayoutDashboard size={18} /> },
  { id: 'users',      label: 'Người dùng',         icon: <Users size={18} /> },
  { id: 'interviews', label: 'Lịch sử phỏng vấn',  icon: <Mic size={18} /> },
  { id: 'candidates', label: 'Top Ứng viên',        icon: <Trophy size={18} /> },
  { id: 'profile',    label: 'Profile Admin',       icon: <User size={18} /> },
];

/* ── Bottom sidebar actions ── */
function AdminBottomActions({ collapsed, onLogout }) {
  return (
    <button
      title="Đăng xuất"
      onClick={onLogout}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px',
        padding: collapsed ? '12px 0' : '14px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: '12px', cursor: 'pointer', color: 'var(--text-muted)',
        transition: 'all 0.2s', fontSize: '14px', fontWeight: 600,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(65% 0.22 25 / 0.8)'; e.currentTarget.style.color = 'oklch(65% 0.22 25)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      <LogOut size={16} />
      {!collapsed && <span>Đăng xuất</span>}
    </button>
  );
}

/* ── Content renderer ── */
function renderContent(activePage) {
  switch (activePage) {
    case 'stats':      return <AdminStats />;
    case 'users':      return <AdminUsers />;
    case 'interviews': return <AdminInterviews />;
    case 'candidates': return <AdminTopCandidates />;
    case 'profile':    return <ProfilePage />;
    default:           return <AdminStats />;
  }
}

/* ── Main Admin Dashboard Page ── */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('stats');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      navItems={NAV}
      activePage={activePage}
      onNavigate={setActivePage}
      user={user}
      onLogout={handleLogout}
      brandLabel="Admin Panel"
      topbarPrefix="Admin Panel"
      roleLabel="ADMINISTRATOR"
      bottomActions={({ collapsed }) => (
        <AdminBottomActions collapsed={collapsed} onLogout={handleLogout} />
      )}
    >
      {renderContent(activePage)}
    </DashboardLayout>
  );
}
