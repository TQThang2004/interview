/**
 * DashboardLayout.jsx
 * Layout khung chung cho Dashboard và Admin Panel.
 * Bao gồm: Sidebar + Topbar header + content area.
 */
import React, { useState } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeToggle from '../common/ThemeToggle';
import { getAvatar } from '../../utils/helpers';

export default function DashboardLayout({
  navItems,
  activePage,
  onNavigate,
  user,
  onLogout,
  onAvatarClick,
  brandLabel,
  topbarPrefix,
  roleLabel,
  bottomActions,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 68 : 280;
  const pageLabel = navItems.find(n => n.id === activePage)?.label ?? '';

  return (
    <div className="bg-animated" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Background orbs */}
      <div className="orb" style={{ width: '300px', height: '300px', background: 'var(--primary-glow)', top: '-80px', right: '10%', animation: 'orbFloat 7s ease-in-out infinite' }} />
      <div className="orb" style={{ width: '200px', height: '200px', background: 'oklch(65% 0.2 280 / 0.05)', bottom: '10%', right: '5%', animation: 'orbFloat 9s ease-in-out infinite', animationDelay: '3s' }} />

      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        active={activePage}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        user={user}
        onLogout={onLogout}
        brandLabel={brandLabel}
        roleLabel={roleLabel}
        bottomActions={bottomActions}
      />

      {/* Main content */}
      <main style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Top bar */}
        <header style={{
          height: '64px', display: 'flex', alignItems: 'center',
          padding: '0 clamp(16px, 3vw, 32px)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--topbar-bg)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 40,
          gap: '12px',
        }}>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '6px', borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{topbarPrefix}</span>
            {pageLabel && pageLabel !== topbarPrefix && (
              <>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pageLabel}</span>
              </>
            )}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right side: ThemeToggle + User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ThemeToggle />
            <div style={{ textAlign: 'right', display: window.innerWidth > 600 ? 'block' : 'none' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username || 'Người dùng'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email || ''}</div>
            </div>
            {onAvatarClick && (
              <button
                onClick={onAvatarClick}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  border: '2px solid var(--primary-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '12px', color: 'oklch(15% 0.01 250)', cursor: 'pointer', overflow: 'hidden', padding: 0
                }}
              >
                <img src={getAvatar(user)} alt="avatar" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 clamp(16px, 4vw, 40px)', display: 'flex', flexDirection: 'column' }}>
          <style>{`
            .dash-content-wrapper > div {
              margin: 0 auto !important;
              width: 100%;
            }
          `}</style>
          <div className="dash-content-wrapper" style={{ flex: 1, paddingBlock: '24px 40px' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
