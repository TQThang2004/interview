import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, Brain, BarChart3, FileText, Zap, Shield,
  ChevronRight, Star, ArrowRight, Play, CheckCircle
} from 'lucide-react';

/* ── Animated counter ────────────────────────────────────────── */
function AnimatedNumber({ target, suffix = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step = () => {
        start += Math.ceil(target / 60);
        if (start >= target) { setValue(target); return; }
        setValue(start);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      observer.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

/* ── Feature card data ───────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Brain size={28} />, title: 'AI Thông minh',
    desc: 'Gemini 2.5 Flash phân tích CV & JD, tạo câu hỏi phù hợp với từng vị trí và cấp độ.',
    color: 'oklch(83.3% 0.145 321.434)',
  },
  {
    icon: <Mic size={28} />, title: 'Nhận diện giọng nói',
    desc: 'Nói chuyện tự nhiên – AI lắng nghe, chép lời và chấm điểm câu trả lời của bạn.',
    color: 'oklch(72% 0.18 280)',
  },
  {
    icon: <BarChart3 size={28} />, title: 'Đánh giá Chi tiết',
    desc: 'Nhận xét điểm mạnh, điểm yếu và gợi ý cải thiện cụ thể cho từng câu trả lời.',
    color: 'oklch(68% 0.16 230)',
  },
  {
    icon: <FileText size={28} />, title: 'Hỗ trợ CV & JD',
    desc: 'Upload CV và Job Description để hệ thống tạo bộ câu hỏi cá nhân hóa cho bạn.',
    color: 'oklch(75% 0.17 150)',
  },
  {
    icon: <Zap size={28} />, title: 'Instant Feedback',
    desc: 'Kết quả đánh giá ngay lập tức sau mỗi câu trả lời, không phải chờ đợi.',
    color: 'oklch(80% 0.18 80)',
  },
  {
    icon: <Shield size={28} />, title: 'RAG Knowledge Base',
    desc: 'Hệ thống câu hỏi được xây dựng từ cơ sở kiến thức kỹ thuật phong phú, luôn cập nhật.',
    color: 'oklch(60% 0.17 320)',
  },
];

const STEPS = [
  { num: '01', title: 'Upload CV & JD', desc: 'Tải lên CV của bạn và Job Description vị trí muốn ứng tuyển (hoặc bỏ qua để dùng câu hỏi chung).' },
  { num: '02', title: 'Chọn cấp độ', desc: 'Chọn cấp độ phỏng vấn: Intern, Junior, Middle hoặc Senior để nhận câu hỏi phù hợp.' },
  { num: '03', title: 'Phỏng vấn AI', desc: 'Nghe câu hỏi, trả lời bằng micro hoặc gõ văn bản – AI sẽ lắng nghe và đánh giá.' },
  { num: '04', title: 'Nhận kết quả', desc: 'Xem điểm số, nhận xét chi tiết và gợi ý cải thiện để phát triển bản thân.' },
];

const TESTIMONIALS = [
  { name: 'Nguyễn Văn A', role: 'Frontend Developer', avatar: 'NV', rating: 5, text: 'Cực kỳ hữu ích! Sau 2 tuần luyện tập với AI Interviewer, tôi tự tin hơn rất nhiều và đã pass vòng phỏng vấn kỹ thuật.' },
  { name: 'Trần Thị B', role: 'Backend Engineer', avatar: 'TB', rating: 5, text: 'Tính năng nhận diện giọng nói rất chính xác, kể cả khi nói Tiếng Việt pha thuật ngữ IT. Câu hỏi sát với thực tế.' },
  { name: 'Lê Minh C', role: 'Fullstack Developer', avatar: 'LM', rating: 5, text: 'Phân tích CV + JD ra câu hỏi cực kỳ sát. Tôi dùng trước mỗi buổi phỏng vấn thật, như warm-up vậy!' },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-animated" style={{ minHeight: '100vh' }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        background: isScrolled ? 'oklch(14% 0.018 250 / 0.92)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-primary)',
            }}>
              <Brain size={20} style={{ color: 'oklch(15% 0.01 250)' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
              <span className="gradient-text">AI</span>
              <span style={{ color: 'var(--text-primary)' }}> Interviewer</span>
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {[['#features', 'Tính năng'], ['#how-it-works', 'Cách dùng'], ['#testimonials', 'Đánh giá']].map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'var(--text-secondary)', textDecoration: 'none',
                fontSize: '15px', fontWeight: 500, transition: 'color 0.2s'
              }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                className="hidden md:block"
              >{label}</a>
            ))}
            <Link to="/login" style={{
              color: 'var(--text-secondary)', textDecoration: 'none',
              fontSize: '15px', fontWeight: 500, transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = 'var(--primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >Đăng nhập</Link>
            <Link to="/dashboard">
              <button id="nav-cta-btn" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Bắt đầu miễn phí
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ paddingTop: '120px', paddingBottom: '100px', paddingInline: '24px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-1" style={{ top: '-100px', right: '-60px', opacity: 0.7 }} />
        <div className="orb orb-2" style={{ bottom: '0', left: '-80px' }} />

        {/* ── 2-column grid ── */}
        <div style={{
          maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center',
        }}>

          {/* ── LEFT: Text content ── */}
          <div style={{ textAlign: 'left' }}>
            {/* Badge */}
            <div className="fade-in-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px',
              background: 'oklch(83.3% 0.145 321.434 / 0.1)',
              border: '1px solid oklch(83.3% 0.145 321.434 / 0.25)',
              borderRadius: '999px', padding: '6px 16px',
              fontSize: '13px', color: 'var(--primary-light)', fontWeight: 500,
            }}>
              <Zap size={13} style={{ color: 'var(--primary)' }} />
              Được hỗ trợ bởi Gemini 2.5 Flash
            </div>

            <h1 className="fade-in-up fade-in-up-delay-1" style={{
              fontSize: 'clamp(36px, 5.5vw, 66px)', fontWeight: 900,
              lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '24px',
            }}>
              Luyện phỏng vấn<br />
              <span className="gradient-text">thông minh hơn</span><br />
              với AI
            </h1>

            <p className="fade-in-up fade-in-up-delay-2" style={{
              fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px',
            }}>
              Upload CV, nhập Job Description – AI sẽ tạo ngay bộ câu hỏi phỏng vấn kỹ thuật
              cá nhân hóa, chấm điểm và nhận xét chi tiết từng câu trả lời của bạn.
            </p>

            {/* CTA buttons */}
            <div className="fade-in-up fade-in-up-delay-3" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link to="/dashboard">
                <button id="hero-cta-primary" className="btn-primary"
                  style={{ padding: '15px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Bắt đầu miễn phí <ArrowRight size={17} />
                </button>
              </Link>
              <Link to="/dashboard">
                <button id="hero-cta-demo" className="btn-ghost"
                  style={{ padding: '15px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={15} /> Xem Demo
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="oklch(80% 0.18 80)" style={{ color: 'oklch(80% 0.18 80)' }} />
                ))}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>4.9/5</strong> · 500+ người dùng
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', color: 'oklch(72% 0.18 145)',
                background: 'oklch(72% 0.18 145 / 0.1)',
                border: '1px solid oklch(72% 0.18 145 / 0.25)',
                borderRadius: '999px', padding: '3px 10px',
              }}>
                <CheckCircle size={11} /> Miễn phí
              </span>
            </div>
          </div>

          {/* ── RIGHT: Hero image ── */}
          <div className="fade-in-up fade-in-up-delay-2" style={{ position: 'relative' }}>
            {/* Glow behind image */}
            <div style={{
              position: 'absolute', inset: '-20px',
              background: 'radial-gradient(ellipse 80% 70% at 50% 50%, oklch(83.3% 0.145 321.434 / 0.18) 0%, transparent 70%)',
              borderRadius: '32px',
              pointerEvents: 'none',
              animation: 'orbFloat 5s ease-in-out infinite',
            }} />

            {/* Image frame */}
            <div style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid oklch(83.3% 0.145 321.434 / 0.25)',
              boxShadow: '0 32px 80px oklch(0% 0 0 / 0.5), 0 0 0 1px oklch(83.3% 0.145 321.434 / 0.1)',
              transform: 'perspective(1000px) rotateY(-3deg) rotateX(1deg)',
              transition: 'transform 0.4s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.01)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'perspective(1000px) rotateY(-3deg) rotateX(1deg)'; }}
            >
              <img
                src="/hero-mockup.png"
                alt="AI Interviewer – giao diện phỏng vấn thông minh"
                style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
                draggable={false}
              />
              {/* Overlay gradient bottom */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                background: 'linear-gradient(to top, oklch(13% 0.02 250 / 0.6), transparent)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Floating badge: Score */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '-20px',
              background: 'oklch(18% 0.02 260 / 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid oklch(83.3% 0.145 321.434 / 0.35)',
              borderRadius: '14px', padding: '12px 16px',
              boxShadow: '0 8px 24px oklch(0% 0 0 / 0.4)',
              animation: 'orbFloat 4s ease-in-out infinite',
              animationDelay: '1s',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>Điểm đánh giá</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>8.5</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/10</span>
              </div>
            </div>

            {/* Floating badge: AI */}
            <div style={{
              position: 'absolute', top: '16px', right: '-16px',
              background: 'oklch(18% 0.02 260 / 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid oklch(65% 0.2 280 / 0.4)',
              borderRadius: '12px', padding: '10px 14px',
              boxShadow: '0 8px 24px oklch(0% 0 0 / 0.35)',
              animation: 'orbFloat 4.5s ease-in-out infinite',
              animationDelay: '2s',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'oklch(65% 0.2 280 / 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={16} style={{ color: 'oklch(72% 0.18 280)' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1 }}>Powered by</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>Gemini AI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section style={{ paddingInline: '24px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderRadius: '20px', overflow: 'hidden' }}>
            {[
              { label: 'Người dùng', value: 500, suffix: '+' },
              { label: 'Câu hỏi đã sinh', value: 15000, suffix: '+' },
              { label: 'Tỷ lệ pass phỏng vấn', value: 87, suffix: '%' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '32px 24px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '6px' }}>
                  <span className="gradient-text">
                    <AnimatedNumber target={s.value} suffix={s.suffix} />
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" style={{ paddingInline: '24px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Tính năng
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
              Mọi thứ bạn cần để<br />
              <span className="gradient-text">chinh phục phỏng vấn</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
              Bộ công cụ toàn diện được thiết kế để giúp bạn tự tin hơn trong mỗi buổi phỏng vấn kỹ thuật.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="glass-card" style={{
                padding: '28px', transition: 'all 0.3s ease',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = f.color + '55';
                  e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}22, var(--shadow-card)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}33`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '10px', color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how-it-works" style={{ paddingInline: '24px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Cách hoạt động
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Chỉ <span className="gradient-text">4 bước</span> đơn giản
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STEPS.map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px 32px', display: 'flex', alignItems: 'flex-start', gap: '24px', transition: 'all 0.3s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.borderColor = 'oklch(83.3% 0.145 321.434 / 0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = ''; }}>
                <div style={{
                  minWidth: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: 'var(--gradient-primary)', color: 'oklch(15% 0.01 250)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '16px', boxShadow: 'var(--shadow-primary)',
                }}>{s.num}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/register">
              <button id="howitworks-cta" className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Thử ngay – Miễn phí <ChevronRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section id="testimonials" style={{ paddingInline: '24px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Đánh giá
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Họ đã <span className="gradient-text">thành công</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-card" style={{ padding: '28px', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="oklch(80% 0.18 80)" style={{ color: 'oklch(80% 0.18 80)' }} />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, fontSize: '14px',
                    color: 'oklch(15% 0.01 250)',
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section style={{ paddingInline: '24px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div className="glass-card" style={{
            padding: 'clamp(40px, 6vw, 72px) clamp(28px, 6vw, 72px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            background: 'oklch(83.3% 0.145 321.434 / 0.06)',
            border: '1px solid oklch(83.3% 0.145 321.434 / 0.3)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, oklch(83.3% 0.145 321.434 / 0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '16px', position: 'relative' }}>
              Sẵn sàng để <span className="gradient-text">ace phỏng vấn</span> tiếp theo?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.6, position: 'relative' }}>
              Hàng trăm developer đã dùng AI Interviewer để chuẩn bị và tự tin hơn. Lượt bạn rồi!
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              <Link to="/register">
                <button id="banner-cta-btn" className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Bắt đầu ngay – Miễn phí <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/login">
                <button className="btn-ghost" style={{ padding: '16px 28px', fontSize: '16px' }}>
                  Đã có tài khoản
                </button>
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
              {['Không cần thẻ tín dụng', 'Bắt đầu trong 30 giây', 'Hoàn toàn miễn phí'].map(item => (
                <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  <CheckCircle size={14} style={{ color: 'var(--primary)' }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', paddingInline: '24px', paddingBlock: '40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={15} style={{ color: 'oklch(15% 0.01 250)' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>
              <span className="gradient-text">AI</span> Interviewer
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © 2026 AI Interviewer. Được xây dựng với ❤️ cho cộng đồng developer Việt Nam.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Điều khoản', 'Quyền riêng tư', 'Liên hệ'].map(l => (
              <a key={l} href="#" className="text-link" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
