/**
 * Sidebar.jsx
 * Component Sidebar tái sử dụng cho cả Dashboard và Admin Panel.
 * Nhận props: navItems, active, onNavigate, collapsed, onToggle,
 *             user, onLogout, brandLabel, bottomActions
 */
import React from 'react';
import { Brain, Menu, X } from 'lucide-react';
import { getAvatar } from '../../utils/helpers';

export default function Sidebar({
  navItems,
  active,
  onNavigate,
  collapsed,
  onToggle,
  user,
  onLogout,
  brandLabel = 'AI Interviewer',
  bottomActions = null,
  roleLabel = null,
}) {
  return (
    <aside style={{
      width: collapsed ? '80px' : '280px',
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      overflow: 'hidden',
    }}>

      {/* ── Logo + collapse toggle ── */}
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
              flexShrink: 0, boxShadow: 'var(--shadow-primary)',
            }}>
              <Brain size={20} style={{ color: 'oklch(15% 0.01 250)' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              <span className="gradient-text">{brandLabel.split(' ')[0]}</span>{' '}
              {brandLabel.split(' ').slice(1).join(' ')}
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)',
          }}>
            <Brain size={22} style={{ color: 'oklch(15% 0.01 250)' }} />
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '8px',
            transition: 'all 0.2s',
            position: collapsed ? 'absolute' : 'static',
            right: collapsed ? '-999px' : 'auto', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* ── User info ── */}
      <div style={{ padding: collapsed ? '0 12px' : '0 24px', marginBottom: '24px' }}>
        <div style={{
          padding: collapsed ? '12px 0' : '12px 14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          display: 'flex', flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center', gap: '12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '18px', color: 'var(--primary)', cursor: 'pointer', overflow: 'hidden'
          }} title={user?.username}>
            <img src={getAvatar(user)} alt="avatar" style={{width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover'}} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username || 'Người dùng'}
              </div>
              {roleLabel ? (
                <div style={{ fontSize: '12px', color: 'var(--primary)', whiteSpace: 'nowrap', fontWeight: 700, marginTop: '2px' }}>
                  {roleLabel}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                  {user?.email || ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Nav label ── */}
      <div style={{ padding: collapsed ? '0 16px' : '0 24px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', textAlign: collapsed ? 'center' : 'left' }}>
        {collapsed ? '—' : 'Menu'}
      </div>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: collapsed ? '0 12px' : '0 16px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '14px', padding: collapsed ? '14px 0' : '14px 18px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                borderRadius: '14px', border: 'none',
                boxShadow: isActive ? '0 8px 16px var(--primary-glow)' : 'none',
                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                color: isActive ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
                textAlign: 'left', position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
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
                  <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '15px', flex: 1, whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'oklch(15% 0.01 250)' }} />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom actions ── */}
      <div style={{ padding: collapsed ? '20px 12px' : '24px' }}>
        {bottomActions ? bottomActions({ collapsed, onLogout }) : (
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: collapsed ? '12px 0' : '14px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '12px', cursor: 'pointer', color: 'var(--text-muted)',
              fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(65% 0.22 25 / 0.8)'; e.currentTarget.style.color = 'oklch(65% 0.22 25)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
