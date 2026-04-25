import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8)              score++;
    if (/[A-Z]/.test(password))           score++;
    if (/[0-9]/.test(password))           score++;
    if (/[^A-Za-z0-9]/.test(password))   score++;
    const levels = [
      { level: 1, label: 'Yếu', color: 'oklch(60% 0.22 25)' },
      { level: 2, label: 'Trung bình', color: 'oklch(75% 0.18 75)' },
      { level: 3, label: 'Khá', color: 'oklch(72% 0.18 145)' },
      { level: 4, label: 'Mạnh', color: 'oklch(72% 0.2 145)' },
    ];
    return levels[score - 1] || { level: 0, label: '', color: 'transparent' };
  };

  const s = getStrength();

  if (!password) return null;
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i <= s.level ? s.color : 'var(--border)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>
      {s.label && (
        <span style={{ fontSize: '12px', color: s.color }}>{s.label}</span>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm]         = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.trim().length < 3)
      e.username = 'Tên người dùng phải có ít nhất 3 ký tự.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Email không hợp lệ.';
    if (!form.password || form.password.length < 8)
      e.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    return e;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setApiError('');
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!userInfoRes.ok) throw new Error('Không thể lấy thông tin Google.');
        const userInfo = await userInfoRes.json();

        const res = await fetch('http://localhost:8000/api/auth/google/callback', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: tokenResponse.access_token,
            user_info: userInfo,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Đăng ký Google thất bại.');

        window.location.href = '/dashboard';
      } catch (err) {
        setApiError(err.message || 'Đăng ký Google thất bại, vui lòng thử lại.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setApiError('Đã hủy hoặc gặp lỗi khi đăng nhập Google.');
    },
  });

  const update = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(err => ({ ...err, [field]: '' }));
  };


  return (
    <div className="bg-animated min-h-screen flex items-center justify-center p-4 relative">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-card p-8 fade-in-up fade-in-up-delay-1">
          {/* Google */}
          <button
            id="btn-google-register"
            onClick={() => handleGoogleRegister()}
            disabled={googleLoading || loading}
            className="btn-google mb-6"
            style={{ opacity: (googleLoading || loading) ? 0.75 : 1, cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer' }}
          >
            {googleLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                Đang kết nối Google...
              </span>
            ) : (
              <>
                <GoogleIcon />
                Đăng ký với Google
              </>
            )}
          </button>

          <div className="divider mb-6">hoặc</div>

          <form onSubmit={handleRegister} noValidate>
            {/* Username */}
            <div className="mb-4">
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Tên người dùng
              </label>
              <div className="input-group">
                <User className="input-icon" />
                <input
                  id="register-username"
                  type="text"
                  className="input-field"
                  placeholder="nguyenvana"
                  value={form.username}
                  onChange={update('username')}
                  autoComplete="username"
                  style={{ borderColor: errors.username ? 'oklch(65% 0.22 25)' : undefined }}
                />
              </div>
              {errors.username && (
                <div className="error-msg">
                  <AlertCircle size={14} />{errors.username}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <div className="input-group">
                <Mail className="input-icon" />
                <input
                  id="register-email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                  autoComplete="email"
                  style={{ borderColor: errors.email ? 'oklch(65% 0.22 25)' : undefined }}
                />
              </div>
              {errors.email && (
                <div className="error-msg">
                  <AlertCircle size={14} />{errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Mật khẩu
              </label>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Ít nhất 8 ký tự"
                  value={form.password}
                  onChange={update('password')}
                  autoComplete="new-password"
                  style={{
                    paddingRight: '44px',
                    borderColor: errors.password ? 'oklch(65% 0.22 25)' : undefined
                  }}
                />
                <button
                  type="button"
                  id="toggle-password-register"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: 0, display: 'flex', alignItems: 'center'
                  }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {errors.password && (
                <div className="error-msg">
                  <AlertCircle size={14} />{errors.password}
                </div>
              )}
            </div>

            {/* Benefits chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', marginBottom: '4px' }}>
              {['Phỏng vấn không giới hạn', 'Chấm điểm AI', 'Hỗ trợ CV/JD'].map(b => (
                <span key={b} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', color: 'var(--primary-light)',
                  background: 'oklch(83.3% 0.145 321.434 / 0.08)',
                  border: '1px solid oklch(83.3% 0.145 321.434 / 0.2)',
                  borderRadius: '999px', padding: '3px 10px'
                }}>
                  <CheckCircle2 size={11} style={{ color: 'var(--primary)' }} />
                  {b}
                </span>
              ))}
            </div>

            {/* API Error */}
            {apiError && (
              <div className="error-msg mt-3">
                <AlertCircle size={14} />
                {apiError}
              </div>
            )}

            <button
              id="btn-register-submit"
              type="submit"
              className="btn-primary w-full mt-5"
              disabled={loading}
              style={{ opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : 'Đăng ký'}
            </button>

          </form>

          <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-link">Đăng nhập</Link>
          </p>
        </div>

        <p className="text-center mt-6 fade-in-up fade-in-up-delay-2"
          style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <span className="text-link">Điều khoản dịch vụ</span> và{' '}
          <span className="text-link">Chính sách quyền riêng tư</span>
        </p>
      </div>
    </div>
  );
}
