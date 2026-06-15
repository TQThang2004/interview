import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const data = await authService.forgotPassword(email);
      setResetToken(data.reset_token || '');
      setSent(true);
    } catch (err) {
      setError(err.message || 'Không thể tạo yêu cầu đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetToken || newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(resetToken, newPassword);
      setResetDone(true);
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-animated min-h-screen flex items-center justify-center p-4 relative">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 fade-in-up">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Quên mật khẩu?</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Nhập email và chúng tôi sẽ gửi link đặt lại mật khẩu
          </p>
        </div>

        <div className="glass-card p-8 fade-in-up fade-in-up-delay-1">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'oklch(72% 0.18 145 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid oklch(72% 0.18 145 / 0.3)' }}>
                <CheckCircle2 size={32} style={{ color: 'oklch(72% 0.18 145)' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '10px' }}>
                {resetDone ? 'Mật khẩu đã được đặt lại!' : 'Yêu cầu đã được tạo!'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                {resetDone
                  ? 'Bạn có thể quay lại trang đăng nhập và sử dụng mật khẩu mới.'
                  : <>Kiểm tra hộp thư <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{email}</span> và dùng token để đặt lại mật khẩu.</>}
              </p>
              {resetToken && !resetDone && (
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5, wordBreak: 'break-all', marginBottom: '18px' }}>
                  Token demo: {resetToken}
                </p>
              )}
              {!resetDone && (
                <form onSubmit={handleReset} style={{ marginBottom: '18px' }}>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ marginBottom: '12px' }}
                  />
                  {error && (
                    <p style={{ color: 'oklch(65% 0.22 25)', fontSize: '13px', marginBottom: '12px' }}>
                      {error}
                    </p>
                  )}
                  <button className="btn-primary w-full" disabled={loading || newPassword.length < 8}>
                    {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                  </button>
                </form>
              )}
              <Link to="/login">
                <button className="btn-primary w-full">Về trang đăng nhập</button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Email
                </label>
                <div className="input-group">
                  <Mail className="input-icon" />
                  <input
                    id="forgot-email"
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              {error && (
                <p style={{ color: 'oklch(65% 0.22 25)', fontSize: '13px', marginTop: '-12px', marginBottom: '16px' }}>
                  {error}
                </p>
              )}
              <button
                id="btn-forgot-submit"
                type="submit"
                className="btn-primary w-full"
                disabled={loading || !email}
                style={{ opacity: (loading || !email) ? 0.7 : 1 }}>
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6 fade-in-up fade-in-up-delay-2">
          <Link to="/login" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <ArrowLeft size={15} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
