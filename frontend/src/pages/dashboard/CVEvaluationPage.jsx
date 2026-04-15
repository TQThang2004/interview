import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Star, Zap, Target, X } from 'lucide-react';

const MOCK_RESULT = {
  overall: 7.8,
  sections: [
    { name: 'Thông tin cá nhân', score: 9, feedback: 'Đầy đủ thông tin liên hệ, LinkedIn và GitHub rõ ràng.' },
    { name: 'Kỹ năng kỹ thuật', score: 8.5, feedback: 'Stack công nghệ phong phú, nên nhóm theo Frontend/Backend/DevOps.' },
    { name: 'Kinh nghiệm làm việc', score: 7.5, feedback: 'Mô tả công việc còn chung chung. Thêm số liệu cụ thể (tăng 30% performance, giảm 40% bug...).' },
    { name: 'Dự án cá nhân', score: 8, feedback: 'Có link GitHub, nhưng cần thêm mô tả kết quả đạt được và impact.' },
    { name: 'Học vấn & Chứng chỉ', score: 6.5, feedback: 'Thiếu các chứng chỉ cloud hoặc chứng chỉ kỹ thuật. Nên thêm nếu có.' },
  ],
  suggestions: [
    'Dùng từ khóa từ JD vào CV để pass ATS (Applicant Tracking System)',
    'Thêm số liệu định lượng vào các bullet điểm kinh nghiệm',
    'Giới hạn CV trong 1-2 trang, bỏ thông tin không liên quan',
    'Dùng action verb mạnh: Led, Built, Optimized, Reduced...',
  ],
};

function ScoreBar({ score }) {
  const color = score >= 8 ? 'oklch(72% 0.18 145)' : score >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)';
  return (
    <div style={{ width: '100px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
    </div>
  );
}

export default function CVEvaluationPage() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => { if (f && f.type === 'application/pdf') setFile(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const handleEvaluate = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setResult(MOCK_RESULT); }, 1800);
  };

  const overallColor = result ? (result.overall >= 8 ? 'oklch(72% 0.18 145)' : result.overall >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)') : 'var(--primary)';

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">CV Evaluation</span> 📄
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          AI phân tích CV của bạn và đưa ra nhận xét chi tiết để tăng tỷ lệ lọc hồ sơ.
        </p>
      </div>

      {!result ? (
        <div className="glass-card" style={{ padding: '36px', maxWidth: '600px' }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? 'var(--primary)' : file ? 'oklch(72% 0.18 145)' : 'var(--border)'}`,
              borderRadius: '16px', padding: '40px 24px', textAlign: 'center',
              background: dragging ? 'oklch(83.3% 0.145 321.434 / 0.05)' : file ? 'oklch(72% 0.18 145 / 0.05)' : 'transparent',
              transition: 'all 0.25s', cursor: 'pointer', marginBottom: '24px',
            }}
            onClick={() => document.getElementById('cv-file-input').click()}>
            <input id="cv-file-input" type="file" accept=".pdf" hidden onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div>
                <CheckCircle2 size={40} style={{ color: 'oklch(72% 0.18 145)', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{file.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB · PDF</div>
                <button onClick={e => { e.stopPropagation(); setFile(null); }}
                  style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <X size={12} /> Xóa file
                </button>
              </div>
            ) : (
              <div>
                <UploadCloud size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Kéo & thả CV vào đây</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>hoặc nhấp để chọn file PDF</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <FileText size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Chỉ hỗ trợ file PDF · Tối đa 10MB</span>
          </div>

          <button id="btn-evaluate-cv" className="btn-primary" onClick={handleEvaluate}
            disabled={!file || loading} style={{ width: '100%', opacity: (!file || loading) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? (
              <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Đang phân tích CV...</>
            ) : (
              <><Zap size={16} /> Phân tích CV ngay</>
            )}
          </button>
        </div>
      ) : (
        <div>
          {/* Overall score */}
          <div className="glass-card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '20px', background: `${overallColor.slice(0, -1)} / 0.06)`.replace('oklch(', 'oklch('), border: `1px solid ${overallColor.slice(0, -1)} / 0.25)`.replace('oklch(', 'oklch(') }}>
            <div style={{ textAlign: 'center', minWidth: '90px' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, color: overallColor }}>{result.overall}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Điểm tổng</div>
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>
                {result.overall >= 8 ? '🎉 CV rất tốt!' : result.overall >= 6.5 ? '👍 CV ổn, cần cải thiện' : '⚠️ CV cần cải thiện nhiều'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                {result.overall >= 8 ? 'CV của bạn có chất lượng cao và sẽ gây ấn tượng tốt với nhà tuyển dụng.' : 'Có một số điểm cần cải thiện để tăng tỷ lệ được chọn.'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-ghost" onClick={() => { setResult(null); setFile(null); }} style={{ fontSize: '13px' }}>
                Đánh giá lại
              </button>
            </div>
          </div>

          {/* Section scores */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={15} style={{ color: 'var(--primary)' }} /> Điểm theo từng phần
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {result.sections.map((s, i) => (
                <div key={i} style={{ borderBottom: i < result.sections.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < result.sections.length - 1 ? '14px' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>{s.name}</span>
                    <ScoreBar score={s.score} />
                    <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '32px', textAlign: 'right', color: s.score >= 8 ? 'oklch(72% 0.18 145)' : s.score >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)' }}>
                      {s.score}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={15} style={{ color: 'oklch(80% 0.18 80)' }} /> Gợi ý cải thiện
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.suggestions.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'oklch(15% 0.01 250)', flexShrink: 0, marginTop: '1px' }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
