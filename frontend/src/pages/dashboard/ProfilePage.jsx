import React, { useState } from 'react';
import { User, Mail, Lock, Camera, Save, Eye, EyeOff, Bell, Globe, Shield, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [tab, setTab] = useState('info');
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    username: 'nguyenvana',
    bio: 'Fullstack Developer | ReactJS & Node.js | Đam mê xây dựng sản phẩm',
    level: 'Junior',
    notifications: true,
    language: 'vi',
  });

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS = [
    { id: 'info', label: 'Thông tin', icon: <User size={14} /> },
    { id: 'security', label: 'Bảo mật', icon: <Shield size={14} /> },
    { id: 'settings', label: 'Cài đặt', icon: <Bell size={14} /> },
  ];

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '760px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">Hồ sơ cá nhân</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Quản lý thông tin tài khoản của bạn.</p>
      </div>

      {/* Avatar section */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 900, color: 'oklch(15% 0.01 250)',
            boxShadow: 'var(--shadow-primary)',
          }}>
            {form.name.split(' ').map(w => w[0]).slice(-2).join('')}
          </div>
          <button style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'var(--bg-elevated)', border: '2px solid var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--primary)',
          }}>
            <Camera size={12} />
          </button>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>{form.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{form.email}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '12px', color: 'oklch(72% 0.18 145)', background: 'oklch(72% 0.18 145 / 0.1)', border: '1px solid oklch(72% 0.18 145 / 0.25)', borderRadius: '999px', padding: '2px 10px' }}>
            <CheckCircle2 size={11} /> Đã xác minh
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'oklch(18% 0.02 260 / 0.6)', borderRadius: '14px', marginBottom: '20px', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: tab === t.id ? 'var(--gradient-primary)' : 'transparent',
              color: tab === t.id ? 'oklch(15% 0.01 250)' : 'var(--text-secondary)',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass-card" style={{ padding: '28px' }}>
        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { label: 'Họ và tên', key: 'name', icon: <User size={16} />, type: 'text', placeholder: 'Nguyễn Văn A' },
              { label: 'Email', key: 'email', icon: <Mail size={16} />, type: 'email', placeholder: 'you@example.com' },
              { label: 'Tên người dùng', key: 'username', icon: <User size={16} />, type: 'text', placeholder: 'username' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{f.label}</label>
                <div className="input-group">
                  <span className="input-icon">{f.icon}</span>
                  <input type={f.type} className="input-field" placeholder={f.placeholder}
                    value={form[f.key]} onChange={update(f.key)} style={{ paddingLeft: '44px' }} />
                </div>
              </div>
            ))}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Bio</label>
              <textarea className="input-field" rows={3} placeholder="Giới thiệu ngắn về bạn..."
                value={form.bio} onChange={update('bio')} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Cấp độ hiện tại</label>
              <select className="input-field" value={form.level} onChange={update('level')}>
                {['Intern', 'Junior', 'Middle', 'Senior'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Đổi mật khẩu tài khoản của bạn.</p>
            {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map((label, i) => (
              <div key={i}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{label}</label>
                <div className="input-group">
                  <Lock className="input-icon" />
                  <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="••••••••"
                    style={{ paddingLeft: '44px', paddingRight: '44px' }} />
                  {i === 2 && (
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Thông báo email', desc: 'Nhận email về kết quả phỏng vấn và cập nhật hệ thống', key: 'notifications', icon: <Bell size={16} /> },
            ].map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'oklch(22% 0.015 250 / 0.5)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--primary)' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.desc}</div>
                  </div>
                </div>
                <button onClick={update(s.key)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', background: form[s.key] ? 'var(--primary)' : 'var(--border)', transition: 'background 0.2s' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: form[s.key] ? '22px' : '3px', transition: 'left 0.2s' }} />
                </button>
              </div>
            ))}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Globe size={14} /> Ngôn ngữ giao diện
              </label>
              <select className="input-field" value={form.language} onChange={update('language')}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        )}

        {/* Save button */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button id="btn-save-profile" className="btn-primary" onClick={handleSave}
            style={{ padding: '11px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saved ? <><CheckCircle2 size={15} /> Đã lưu!</> : <><Save size={15} /> Lưu thay đổi</>}
          </button>
          {saved && <span style={{ fontSize: '13px', color: 'oklch(72% 0.18 145)' }}>Thông tin đã được cập nhật.</span>}
        </div>
      </div>
    </div>
  );
}
