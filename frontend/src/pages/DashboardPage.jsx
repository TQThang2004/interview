import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import {
  LayoutDashboard, Users, FileText, Mic, History,
  User, ArrowLeft, LogOut, FileSearch,
} from 'lucide-react';

import DashboardLayout  from '../components/layout/DashboardLayout';
import DashboardHome    from './dashboard/DashboardHome';
import CommunityPage    from './dashboard/community/CommunityPage';
import CVEvaluationPage from './dashboard/cv-evaluation/CVEvaluationPage';
import CVHistoryPage    from './dashboard/cv-history/CVHistoryPage';
import HistoryPage      from './dashboard/history/HistoryPage';
import ProfilePage      from './dashboard/ProfilePage';
import InterviewPage    from './InterviewPage';

/* ── Nav items ── */
const NAV = [
  { id: 'dashboard',     label: 'Dashboard',     icon: <LayoutDashboard size={18} /> },
  { id: 'community',     label: 'Community',     icon: <Users size={18} /> },
  { id: 'cv-evaluation', label: 'CV Evaluation', icon: <FileText size={18} /> },
  { id: 'interview',     label: 'Interview',     icon: <Mic size={18} /> },
  { id: 'history',       label: 'History',       icon: <History size={18} /> },
  { id: 'cv-history',    label: 'CV History',    icon: <FileSearch size={18} /> },
  { id: 'profile',       label: 'Profile',       icon: <User size={18} /> },
];

/* ── Bottom sidebar actions ── */
function DashboardBottomActions({ collapsed, onLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', gap: '8px' }}>
      <Link to="/" style={{ textDecoration: 'none', flex: 1 }}>
        <button
          id="btn-back-landing"
          title="Về trang chủ"
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
            padding: collapsed ? '12px 0' : '14px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: '12px', cursor: 'pointer', color: 'var(--text-secondary)',
            fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <ArrowLeft size={16} />
          {!collapsed && <span>Trang chủ</span>}
        </button>
      </Link>
      {!collapsed && (
        <button
          id="btn-logout"
          title="Đăng xuất"
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '14px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: '12px',
            cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(65% 0.22 25 / 0.8)'; e.currentTarget.style.color = 'oklch(65% 0.22 25)'; e.currentTarget.style.background = 'oklch(65% 0.22 25 / 0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
        >
          <LogOut size={16} />
        </button>
      )}
    </div>
  );
}

/* ── Content renderer ── */
function renderContent(activePage, setActivePage) {
  switch (activePage) {
    case 'dashboard':     return <DashboardHome onNavigate={setActivePage} />;
    case 'community':     return <CommunityPage />;
    case 'cv-evaluation': return <CVEvaluationPage />;
    case 'interview':     return <InterviewPage />;
    case 'history':       return <HistoryPage />;
    case 'cv-history':    return <CVHistoryPage />;
    case 'profile':       return <ProfilePage />;
    default:              return <DashboardHome onNavigate={setActivePage} />;
  }
}

/* ── Main Dashboard Page ── */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { showConfirm } = useModal();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = async () => {
    const isConfirmed = await showConfirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (isConfirmed) {
      navigate('/');
      await logout();
    }
  };

  return (
    <DashboardLayout
      navItems={NAV}
      activePage={activePage}
      onNavigate={setActivePage}
      user={user}
      onLogout={handleLogout}
      onAvatarClick={() => setActivePage('profile')}
      brandLabel="AI Interviewer"
      topbarPrefix="Dashboard"
      bottomActions={({ collapsed }) => (
        <DashboardBottomActions collapsed={collapsed} onLogout={handleLogout} />
      )}
    >
      {renderContent(activePage, setActivePage)}
    </DashboardLayout>
  );
}
