import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, Brain, BarChart3, FileText, Zap, Shield,
  ChevronRight, Star, ArrowRight, Play, CheckCircle
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';

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

/* ── FAQ Item (accordion) ────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="glass-card"
      style={{ padding: 0, overflow: 'hidden', transition: 'border-color 0.25s', cursor: 'pointer', borderColor: open ? 'oklch(83.3% 0.145 321.434 / 0.4)' : '' }}
      onClick={() => setOpen(v => !v)}
    >
      <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{q}</span>
        <span style={{
          flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%',
          background: open ? 'var(--gradient-primary)' : 'oklch(83.3% 0.145 321.434 / 0.1)',
          border: '1px solid oklch(83.3% 0.145 321.434 / 0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, lineHeight: 1,
          color: open ? 'oklch(15% 0.01 250)' : 'var(--primary)',
          transition: 'all 0.25s',
        }}>
          {open ? '−' : '+'}
        </span>
      </div>
      {open && (
        <div style={{ padding: '0 24px 18px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: '14px' }}>{a}</div>
        </div>
      )}
    </div>
  );
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
  { num: '01', title: 'Upload CV & JD', desc: 'Tải lên CV (PDF) và dán Job Description – AI sẽ phân tích kỹ năng, kinh nghiệm và gap để tạo câu hỏi cá nhân hóa.' },
  { num: '02', title: 'Chọn cấp độ', desc: 'Chọn cấp độ phỏng vấn: Intern, Junior, Middle hoặc Senior. AI điều chỉnh độ khó tương ứng.' },
  { num: '03', title: 'Phỏng vấn thực chiến', desc: 'AI đọc câu hỏi bằng giọng nói. Bạn trả lời qua mic hoặc gõ văn bản – thoải mái như phỏng vấn thật.' },
  { num: '04', title: 'Nhận phản hồi chi tiết', desc: 'Xem điểm số từng câu, phân tích điểm mạnh – yếu, gợi ý tài liệu học thêm cụ thể.' },
];

const TESTIMONIALS = [
  { name: 'Nguyễn Minh Tuấn', role: 'Frontend Developer tại VNG', avatar: 'MT', rating: 5, text: 'Sau 3 tuần luyện tập mỗi ngày với AI Interviewer, mình đã pass vòng technical của VNG. Câu hỏi React rất sát thực tế, đặc biệt phần hooks và performance.' },
  { name: 'Trần Khánh Linh', role: 'Backend Engineer tại Tiki', avatar: 'KL', rating: 5, text: 'Mình thích nhất là AI phân tích được gap giữa CV và JD. Nó hỏi đúng vào điểm mình chưa mạnh, giúp mình chuẩn bị có mục tiêu hơn nhiều.' },
  { name: 'Lê Hoàng Nam', role: 'Fullstack Developer tại VNPT', avatar: 'HN', rating: 5, text: 'Tính năng nhận diện giọng nói cực tốt với Tiếng Việt pha IT. Mình dùng trước mỗi vòng phỏng vấn như warm-up – tăng tự tin rõ rệt.' },
];

const TECH_STACK = ['React', 'Node.js', 'Python', 'SQL', 'Docker', 'AWS', 'TypeScript', 'MongoDB', 'Redis', 'System Design'];

const FAQ = [
  { q: 'AI Interviewer có miễn phí không?', a: 'Hoàn toàn miễn phí! Bạn có thể thực hiện không giới hạn phiên phỏng vấn mà không cần thẻ tín dụng.' },
  { q: 'AI có hiểu tiếng Việt không?', a: 'Có! Hệ thống hỗ trợ cả tiếng Việt lẫn tiếng Anh. Đặc biệt, AI hiểu Vinglish (tiếng Việt pha thuật ngữ IT) rất tốt.' },
  { q: 'Câu hỏi được tạo ra như thế nào?', a: 'AI phân tích CV và JD của bạn qua Gap Analysis, kết hợp knowledge base 15,000+ câu hỏi kỹ thuật, để tạo ra bộ câu hỏi cá nhân hóa.' },
  { q: 'Tôi cần upload CV không?', a: 'Không bắt buộc. Bạn có thể bỏ qua và chọn chủ đề + cấp độ để nhận câu hỏi tổng quát.' },
];

/* ── 3D Floating Tech Cubes ─────────────────────────────────── */
const TECH_CUBES = [
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', color: '#F7DF1E', size: 70, x: 15, y: 40, z: 40, delay: 0 },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', color: '#3776AB', size: 85, x: 75, y: 45, z: 0, delay: 0.5 },
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', color: '#61DAFB', size: 100, x: 45, y: 70, z: 80, delay: 1.2 },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', color: '#339933', size: 65, x: 20, y: 90, z: -20, delay: 0.8 },
  { name: 'Java', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg', color: '#007396', size: 75, x: 80, y: 85, z: 30, delay: 1.5 },
  { name: 'Spring', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg', color: '#6DB33F', size: 60, x: 50, y: 35, z: -40, delay: 0.3 },
  { name: 'Machine Learning', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg', color: '#FF6F00', size: 80, x: 30, y: 15, z: -10, delay: 1.8 },
  { name: 'OOP', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg', color: '#00599C', size: 60, x: 90, y: 60, z: -50, delay: 0.9 },
  { name: 'AI', text: 'AI', color: '#8B5CF6', size: 75, x: 70, y: 15, z: 20, delay: 0.6 },
  { name: 'SQL', text: 'SQL', color: '#3B82F6', size: 60, x: 10, y: 65, z: -30, delay: 2.1 },
];

function FloatingTechCubes() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      
      if (sceneRef.current) {
        sceneRef.current.style.transform = `rotateY(${current.current.x * 40}deg) rotateX(${-current.current.y * 40}deg)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    target.current.x = (e.clientX - rect.left) / rect.width - 0.5;
    target.current.y = (e.clientY - rect.top) / rect.height - 0.5;
  };

  const handleMouseLeave = () => {
    target.current.x = 0;
    target.current.y = 0;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}
    >
      <style>{`
        @keyframes float-cube {
          0%, 100% { transform: translate3d(-50%, -50%, var(--z)) translateY(0); }
          50% { transform: translate3d(-50%, -50%, var(--z)) translateY(-25px); }
        }
        @keyframes spin-cube {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(720deg) rotateZ(360deg); }
        }
        .cube-scene {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }
        .tech-cube-wrapper {
          position: absolute;
          transform-style: preserve-3d;
          animation: float-cube 6s ease-in-out infinite;
          will-change: transform;
        }
        .tech-cube {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: spin-cube 20s linear infinite;
          will-change: transform;
        }
        .tech-cube-face {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          backface-visibility: visible;
        }
      `}</style>
      
      <div 
        ref={sceneRef}
        className="cube-scene"
      >
        {TECH_CUBES.map((cube, i) => {
          const half = cube.size / 2;
          const faceStyle = {
            width: `${cube.size}px`,
            height: `${cube.size}px`,
            border: `1px solid ${cube.color}66`,
            boxShadow: `inset 0 0 20px ${cube.color}33`,
          };
          
          const faceContent = cube.text ? (
            <span style={{ fontSize: `${cube.size * 0.4}px`, fontWeight: 800, color: cube.color, letterSpacing: '-1px' }}>{cube.text}</span>
          ) : (
            <img src={cube.icon} alt={cube.name} style={{ width: '65%', height: '65%' }} draggable={false} />
          );
          
          return (
            <div 
              key={i}
              className="tech-cube-wrapper"
              style={{
                left: `${cube.x}%`,
                top: `${cube.y}%`,
                width: `${cube.size}px`,
                height: `${cube.size}px`,
                '--z': `${cube.z}px`,
                animationDelay: `${cube.delay}s`,
                zIndex: Math.round(cube.z)
              }}
            >
              <div 
                className="tech-cube"
                style={{ animationDelay: `${-cube.delay * 5}s`, animationDuration: `${25 + i*4}s` }}
              >
                <div className="tech-cube-face" style={{ ...faceStyle, transform: `translateZ(${half}px)` }}>
                  {faceContent}
                </div>
                <div className="tech-cube-face" style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${half}px)` }}>
                  {faceContent}
                </div>
                <div className="tech-cube-face" style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${half}px)` }}>
                  {faceContent}
                </div>
                <div className="tech-cube-face" style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${half}px)` }}>
                  {faceContent}
                </div>
                <div className="tech-cube-face" style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${half}px)` }}>
                  {faceContent}
                </div>
                <div className="tech-cube-face" style={{ ...faceStyle, transform: `rotateX(-90deg) translateZ(${half}px)` }}>
                  {faceContent}
                  <div style={{ position: 'absolute', width: '80%', height: '80%', background: cube.color, filter: 'blur(20px)', opacity: 0.3, borderRadius: '50%' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Central glow */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
        opacity: 0.2,
        filter: 'blur(50px)',
        transform: 'translateZ(-200px)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-animated" style={{ minHeight: '100vh' }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        background: isScrolled ? 'var(--navbar-scrolled-bg)' : 'transparent',
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
            {!user && (
              <Link to="/login" style={{
                color: 'var(--text-secondary)', textDecoration: 'none',
                fontSize: '15px', fontWeight: 500, transition: 'color 0.2s'
              }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >Đăng nhập</Link>
            )}
            <ThemeToggle />
            <Link to="/dashboard">
              <button id="nav-cta-btn" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                {user ? 'My Dashboard' : 'Bắt đầu miễn phí'}
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
              Được hỗ trợ bởi LLM AI
            </div>

            <h1 className="fade-in-up fade-in-up-delay-1" style={{
              fontSize: 'clamp(32px, 5.5vw, 66px)', fontWeight: 800,
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
                  {user ? 'My Dashboard' : 'Bắt đầu miễn phí'} <ArrowRight size={17} />
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

          {/* ── RIGHT: 3D Floating Tech Cubes ── */}
          <div className="fade-in-up fade-in-up-delay-2" style={{ position: 'relative' }}>
            <FloatingTechCubes />
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section style={{ paddingInline: '24px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-card scroll-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', borderRadius: '20px', overflow: 'hidden' }}>
            {[
              { label: 'Người dùng active', value: 500, suffix: '+' },
              { label: 'Câu hỏi trong kho', value: 15000, suffix: '+' },
              { label: 'Phiên phỏng vấn', value: 3200, suffix: '+' },
              { label: 'Tỷ lệ pass phỏng vấn', value: 87, suffix: '%' },
            ].map((s, i, arr) => (
              <div key={i} style={{
                padding: '32px 20px', textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, marginBottom: '6px' }}>
                  <span className="gradient-text">
                    <AnimatedNumber target={s.value} suffix={s.suffix} />
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tech stack badges */}
          <div className="scroll-reveal scroll-reveal-delay-1" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <div style={{ width: '100%', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Hỗ trợ kiến thức kỹ thuật về</div>
            {TECH_STACK.map(tech => (
              <span key={tech} style={{
                padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                background: 'oklch(83.3% 0.145 321.434 / 0.08)',
                border: '1px solid oklch(83.3% 0.145 321.434 / 0.2)',
                color: 'var(--primary-light)',
              }}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" style={{ paddingInline: '24px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
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

          <div className="scroll-reveal scroll-reveal-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Cách hoạt động
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Chỉ <span className="gradient-text">4 bước</span> đơn giản
            </h2>
          </div>

          <div className="scroll-reveal scroll-reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Đánh giá
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Họ đã <span className="gradient-text">thành công</span>
            </h2>
          </div>

          <div className="scroll-reveal scroll-reveal-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section style={{ paddingInline: '24px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Câu hỏi <span className="gradient-text">thường gặp</span>
            </h2>
          </div>
          <div className="scroll-reveal scroll-reveal-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section style={{ paddingInline: '24px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div className="glass-card scroll-reveal" style={{
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
              <Link to={user ? "/dashboard" : "/register"}>
                <button id="banner-cta-btn" className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {user ? 'My Dashboard' : 'Bắt đầu ngay – Miễn phí'} <ArrowRight size={18} />
                </button>
              </Link>
              {!user && (
                <Link to="/login">
                  <button className="btn-ghost" style={{ padding: '16px 28px', fontSize: '16px' }}>
                    Đã có tài khoản
                  </button>
                </Link>
              )}
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
