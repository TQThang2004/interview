import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Mic, Trophy,
  User, ArrowLeft, Brain, Menu, X, ChevronRight, LogOut,
} from 'lucide-react';

import AdminStats from './admin/AdminStats';
import AdminUsers from './admin/AdminUsers';
import AdminInterviews from './admin/AdminInterviews';
import AdminTopCandidates from './admin/AdminTopCandidates';
import ProfilePage from './dashboard/ProfilePage';

function getAvatar(user) {
  if (!user) return '?';
  return user.username?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || '?';
}

const NAV = [
  { id: 'stats', label: 'Thống kê', icon: <LayoutDashboard size={18} /> },
  { id: 'users', label: 'Người dùng', icon: <Users size={18} /> },
  { id: 'interviews', label: 'Lịch sử phỏng vấn', icon: <Mic size={18} /> },
  { id: 'candidates', label: 'Top Ứng viên', icon: <Trophy size={18} /> },
  { id: 'profile', label: 'Profile Admin', icon: <User size={18} /> },
];

function AdminSidebar({ active, onNavigate, collapsed, onToggle, user, onLogout }) {
  return (
    <aside style={{
      width: collapsed ? '80px' : '280px',
      minHeight: '100vh',
      background: 'oklch(16% 0.018 250 / 0.8)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '24px 0' : '28px 24px',
        minHeight: '84px',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 8px 20px oklch(83.3% 0.145 321.434 / 0.3)'
            }}>
              <Brain size={20} style={{ color: 'oklch(15% 0.01 250)' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              <span className="gradient-text">Admin</span> Panel
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px oklch(83.3% 0.145 321.434 / 0.3)'
          }}>
            <Brain size={22} style={{ color: 'oklch(15% 0.01 250)' }} />
          </div>
        )}
        <button onClick={onToggle}
          style={{
            background: 'oklch(22% 0.015 250)', border: '1px solid var(--border)',
            cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '8px',
            transition: 'all 0.2s', position: collapsed ? 'absolute' : 'static',
            right: collapsed ? '-999px' : 'auto', flexShrink: 0,
          }}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <div style={{ padding: collapsed ? '0 12px' : '0 24px', marginBottom: '24px' }}>
        <div style={{
          padding: collapsed ? '12px 0' : '12px 14px',
          background: 'oklch(22% 0.015 250 / 0.4)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          display: 'flex', flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center', gap: '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '18px', color: 'var(--primary)',
            cursor: 'pointer',
          }} title={user?.username}>
            {getAvatar(user)}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'Người dùng'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px', fontWeight: 'bold' }}>ADMINISTRATOR</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: collapsed ? '0 16px' : '0 24px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', textAlign: collapsed ? 'center' : 'left' }}>
        {collapsed ? '—' : 'Menu Admin'}
      </div>
      <nav style={{ flex: 1, padding: collapsed ? '0 12px' : '0 16px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '14px', padding: collapsed ? '14px 0' : '14px 18px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                borderRadius: '14px', border: 'none',
                boxShadow: isActive ? '0 8px 16px oklch(83.3% 0.145 321.434 / 0.25)' : 'none',
                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                color: isActive ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
                textAlign: 'left', position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'oklch(22% 0.015 250 / 0.8)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.8, display: 'flex' }}>
                {React.cloneElement(item.icon, { size: 20 })}
              </span>
              {!collapsed && (
                <>
                  <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '15px', flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                  {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'oklch(15% 0.01 250)' }} />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: collapsed ? '20px 12px' : '24px', display: 'flex', flexDirection: collapsed ? 'column' : 'row', gap: '8px' }}>
        {!collapsed && (
          <button title="Đăng xuất" onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px', background: 'oklch(20% 0.015 250)',
              border: '1px solid var(--border)', borderRadius: '12px',
              cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s', gap: '8px',
            }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        )}
        {collapsed && (
          <button title="Đăng xuất" onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px', background: 'oklch(20% 0.015 250)',
              border: '1px solid var(--border)', borderRadius: '12px',
              cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s',
            }}>
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('stats');
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 68 : 280;

  const renderContent = () => {
    switch (activePage) {
      case 'stats':       return <AdminStats />;
      case 'users':       return <AdminUsers />;
      case 'interviews':  return <AdminInterviews />;
      case 'candidates':  return <AdminTopCandidates />;
      case 'profile':     return <ProfilePage />;
      default:            return <AdminStats />;
    }
  };

  const pageLabel = NAV.find(n => n.id === activePage)?.label ?? 'Thống kê';

  return (
    <div className="bg-animated" style={{ minHeight: '100vh', display: 'flex' }}>
      <div className="orb" style={{ width: '300px', height: '300px', background: 'oklch(83.3% 0.145 321.434 / 0.06)', top: '-80px', right: '10%', animation: 'orbFloat 7s ease-in-out infinite' }} />
      <div className="orb" style={{ width: '200px', height: '200px', background: 'oklch(65% 0.2 280 / 0.05)', bottom: '10%', right: '5%', animation: 'orbFloat 9s ease-in-out infinite', animationDelay: '3s' }} />

      <AdminSidebar
        active={activePage}
        onNavigate={setActivePage}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <header style={{
          height: '64px', display: 'flex', alignItems: 'center',
          padding: '0 clamp(16px, 3vw, 32px)',
          borderBottom: '1px solid var(--border)',
          background: 'oklch(14% 0.018 250 / 0.7)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 40,
          gap: '12px',
        }}>
          <button onClick={() => setCollapsed(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '6px', borderRadius: '8px' }}>
            <Menu size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Admin Panel</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pageLabel}</span>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px clamp(16px, 4vw, 40px)', display: 'flex', flexDirection: 'column' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
