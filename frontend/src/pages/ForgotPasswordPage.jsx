import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // TODO: kết nối API gửi email reset
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
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
              <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '10px' }}>Email đã được gửi!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                Kiểm tra hộp thư <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{email}</span> và nhấp vào link để đặt lại mật khẩu.
              </p>
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
