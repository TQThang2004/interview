import React from 'react';
import { PlayCircle, Globe, GraduationCap, UploadCloud } from 'lucide-react';

const LEVELS = ["Intern", "Junior", "Middle", "Senior"];

export default function SetupForm({ cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage, onStart }) {
  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '580px', padding: 'clamp(24px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', marginBottom: '16px',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <GraduationCap size={28} style={{ color: 'oklch(15% 0.01 250)' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 26px)', fontWeight: 800, marginBottom: '6px', textAlign: 'center' }}>
            <span className="gradient-text">Mock Interview AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
            Cá nhân hóa bộ câu hỏi theo CV và JP của bạn
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* File Upload */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <UploadCloud size={16} style={{ color: 'var(--primary)' }}/> Tải lên CV (PDF)
            </label>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: '100%', minHeight: '100px',
              border: `2px dashed ${cvFile ? 'oklch(72% 0.18 145)' : 'var(--border)'}`,
              borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
              background: cvFile ? 'oklch(72% 0.18 145 / 0.08)' : 'oklch(22% 0.015 250 / 0.4)',
              padding: '20px'
            }}
            onMouseEnter={e => { if(!cvFile) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'oklch(83.3% 0.145 321.434 / 0.05)'; } }}
            onMouseLeave={e => { if(!cvFile) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'oklch(22% 0.015 250 / 0.4)'; } }}
            >
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: cvFile ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: cvFile ? 600 : 500, margin: 0 }}>
                  {cvFile ? cvFile.name : "Nhấn để chọn file CV (PDF)"}
                </p>
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} style={{ display: 'none' }} />
            </label>
          </div>

          {/* JD Input */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
              Mô tả công việc (JD / Kỹ năng mong muốn)
            </label>
            <textarea 
              value={jd} 
              onChange={e => setJd(e.target.value)}
              placeholder="Dán mô tả công việc (JD) hoặc các công nghệ cần phỏng vấn vào đây..."
              className="input-field"
              style={{ minHeight: '110px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Globe size={16} /> Ngôn ngữ
              </label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English (US)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                Cấp độ
              </label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="input-field">
                {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>

          <button onClick={onStart} className="btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <PlayCircle size={20} /> Bắt Đầu Phỏng Vấn
          </button>
        </div>
      </div>
    </div>
  );
}

export { LEVELS };
