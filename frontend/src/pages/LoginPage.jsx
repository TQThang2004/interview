import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { AUTH_BASE_URL } from '../constants/api';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // useGoogleLogin trả về credential dạng id_token (flow='implicit' mặc định trả access_token)
  // Dùng flow='auth-code' sẽ cần backend exchange code. Ở đây ta dùng id_token qua responseType
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // tokenResponse.credential chỉ có với GoogleLogin component (One Tap).
      // useGoogleLogin trả về access_token. Ta cần id_token nên dùng credential popup.
      // Nhưng để đơn giản, ta lấy userinfo qua Google API rồi gửi access_token.
      // Backend sẽ nhận access_token và gọi Google userinfo endpoint.
      setGoogleLoading(true);
      setError('');
      try {
        // Gọi Google userinfo để lấy thông tin người dùng
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!userInfoRes.ok) throw new Error('Không thể lấy thông tin Google.');
        const userInfo = await userInfoRes.json();

        // Gửi lên backend theo dạng custom - chúng ta dùng access_token thay credential
        const res = await fetch(`${AUTH_BASE_URL}/google/callback`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: tokenResponse.access_token,
            user_info: userInfo,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Đăng nhập Google thất bại.');

        // Cập nhật state qua loginWithGoogle – nhưng ở đây ta đã có data
        // Reload session qua /me để đồng bộ
        if (data?.user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        setError(err.message || 'Đăng nhập Google thất bại, vui lòng thử lại.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Đã hủy hoặc gặp lỗi khi đăng nhập Google.');
    },
  });

  return (
    <div className="bg-animated min-h-screen flex items-center justify-center p-4 relative">
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-8 fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-primary)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="oklch(15% 0.01 250)" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-1">
            <span className="gradient-text">Chào mừng trở lại</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Đăng nhập để tiếp tục luyện phỏng vấn AI
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 fade-in-up fade-in-up-delay-1">
          {/* Google button */}
          <button
            id="btn-google-login"
            onClick={() => handleGoogleLogin()}
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
                Đăng nhập với Google
              </>
            )}
          </button>

          <div className="divider mb-6">hoặc</div>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <div className="input-group">
                <Mail className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Mật khẩu
                </label>
                <Link to="/forgot-password" className="text-link" style={{ fontSize: '13px' }}>
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  id="toggle-password-login"
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
            </div>

            {/* Error */}
            {error && (
              <div className="error-msg mt-3">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              className="btn-primary w-full mt-6"
              disabled={loading || googleLoading}
              style={{ opacity: (loading || googleLoading) ? 0.75 : 1, cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Switch to register */}
          <p className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 fade-in-up fade-in-up-delay-2"
          style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <span className="text-link">Điều khoản dịch vụ</span> và{' '}
          <span className="text-link">Chính sách quyền riêng tư</span>
        </p>
      </div>
    </div>
  );
}
