import React, { useState } from 'react';
import { PlayCircle, Globe, GraduationCap, UploadCloud, AlertCircle, CheckCircle, X } from 'lucide-react';

const LEVELS = ["Intern", "Junior", "Middle", "Senior"];

export default function SetupForm({ cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage, onStart }) {
  const [errors, setErrors] = useState({});

  // ── Validate từng trường ───────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!cvFile) {
      newErrors.cv = "Vui lòng tải lên file CV của bạn.";
    } else if (cvFile.type !== "application/pdf" && !cvFile.name.toLowerCase().endsWith(".pdf")) {
      newErrors.cv = "CV phải là file PDF. Vui lòng chọn lại file đúng định dạng.";
    }

    if (!jd || !jd.trim()) {
      newErrors.jd = "Vui lòng nhập mô tả công việc (JD) hoặc các kỹ năng cần phỏng vấn.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Xử lý khi chọn file CV ────────────────────────────────────────────────
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Xoá lỗi CV khi người dùng chọn file mới
    setErrors(prev => ({ ...prev, cv: undefined }));

    // Validate định dạng ngay khi chọn
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setCvFile(null);
      setErrors(prev => ({ ...prev, cv: "CV phải là file PDF. Vui lòng chọn lại file đúng định dạng." }));
      // Reset input để có thể chọn lại cùng file sau khi sửa
      e.target.value = "";
      return;
    }

    setCvFile(file);
  };

  // ── Xoá CV đã chọn ────────────────────────────────────────────────────────
  const removeCv = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCvFile(null);
    setErrors(prev => ({ ...prev, cv: undefined }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (validate()) {
      onStart();
    }
  };

  const hasError = (field) => !!errors[field];

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '580px', padding: 'clamp(24px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', marginBottom: '16px',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <GraduationCap size={28} style={{ color: 'var(--primary-contrast)' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 26px)', fontWeight: 800, marginBottom: '6px', textAlign: 'center' }}>
            <span className="gradient-text">Mock Interview AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>
            Cá nhân hóa bộ câu hỏi theo CV và JD của bạn
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── File Upload CV ──────────────────────────────────────────────── */}
          <div>
            <label style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px'
            }}>
              <UploadCloud size={16} style={{ color: 'var(--primary)' }} />
              Tải lên CV (PDF) <span style={{ color: 'oklch(65% 0.2 25)' }}>*</span>
            </label>

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: '100%', minHeight: '100px', position: 'relative',
              border: `2px dashed ${hasError('cv') ? 'oklch(65% 0.2 25)' : cvFile ? 'oklch(72% 0.18 145)' : 'var(--border)'}`,
              borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
              background: hasError('cv')
                ? 'oklch(65% 0.2 25 / 0.07)'
                : cvFile
                  ? 'oklch(72% 0.18 145 / 0.08)'
                  : 'var(--bg-elevated)',
              padding: '20px'
            }}
              onMouseEnter={e => {
                if (!cvFile && !hasError('cv')) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'var(--primary-05)';
                }
              }}
              onMouseLeave={e => {
                if (!cvFile && !hasError('cv')) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                }
              }}
            >
              <div style={{ textAlign: 'center' }}>
                {cvFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} style={{ color: 'oklch(72% 0.18 145)', flexShrink: 0 }} />
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                      {cvFile.name}
                    </p>
                    <button
                      onClick={removeCv}
                      title="Xóa file"
                      style={{
                        background: 'oklch(50% 0.15 25 / 0.15)', border: 'none', borderRadius: '50%',
                        width: '22px', height: '22px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0
                      }}
                    >
                      <X size={12} style={{ color: 'oklch(65% 0.2 25)' }} />
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
                    Nhấn để chọn file CV (chỉ chấp nhận <strong>.pdf</strong>)
                  </p>
                )}
              </div>
              <input
                id="cv-upload-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleCvChange}
                style={{ display: 'none' }}
              />
            </label>

            {/* Thông báo lỗi CV */}
            {hasError('cv') && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px',
                padding: '10px 12px', borderRadius: '10px',
                background: 'oklch(65% 0.2 25 / 0.1)', border: '1px solid oklch(65% 0.2 25 / 0.3)'
              }}>
                <AlertCircle size={15} style={{ color: 'oklch(65% 0.2 25)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: 'oklch(75% 0.15 25)', lineHeight: 1.5 }}>
                  {errors.cv}
                </p>
              </div>
            )}
          </div>

          {/* ── JD Input ────────────────────────────────────────────────────── */}
          <div>
            <label style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
              display: 'block', marginBottom: '10px'
            }}>
              Mô tả công việc (JD / Kỹ năng mong muốn) <span style={{ color: 'oklch(65% 0.2 25)' }}>*</span>
            </label>
            <textarea
              value={jd}
              onChange={e => {
                setJd(e.target.value);
                if (e.target.value.trim()) setErrors(prev => ({ ...prev, jd: undefined }));
              }}
              placeholder="Dán mô tả công việc (JD) hoặc các công nghệ cần phỏng vấn vào đây..."
              className="input-field"
              style={{
                minHeight: '110px', resize: 'vertical',
                borderColor: hasError('jd') ? 'oklch(65% 0.2 25)' : undefined,
                boxShadow: hasError('jd') ? '0 0 0 2px oklch(65% 0.2 25 / 0.2)' : undefined
              }}
            />

            {/* Thông báo lỗi JD */}
            {hasError('jd') && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px',
                padding: '10px 12px', borderRadius: '10px',
                background: 'oklch(65% 0.2 25 / 0.1)', border: '1px solid oklch(65% 0.2 25 / 0.3)'
              }}>
                <AlertCircle size={15} style={{ color: 'oklch(65% 0.2 25)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: 'oklch(75% 0.15 25)', lineHeight: 1.5 }}>
                  {errors.jd}
                </p>
              </div>
            )}
          </div>

          {/* ── Ngôn ngữ & Cấp độ ──────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px'
              }}>
                <Globe size={16} /> Ngôn ngữ
              </label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English (US)</option>
              </select>
            </div>
            <div>
              <label style={{
                fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
                display: 'block', marginBottom: '10px'
              }}>
                Cấp độ
              </label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="input-field">
                {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>

          {/* ── Nút bắt đầu ─────────────────────────────────────────────────── */}
          <button
            id="btn-start-interview"
            onClick={handleStart}
            className="btn-primary"
            style={{
              width: '100%', marginTop: '12px', padding: '16px', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}
          >
            <PlayCircle size={20} /> Bắt Đầu Phỏng Vấn
          </button>

          {/* Gợi nhắc bắt buộc */}
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '-8px' }}>
            <span style={{ color: 'oklch(65% 0.2 25)' }}>*</span> Các trường bắt buộc
          </p>
        </div>
      </div>
    </div>
  );
}

export { LEVELS };
