import React from 'react';
import { UploadCloud, FileText, CheckCircle2, X, Zap } from 'lucide-react';

export default function CVUploadForm({ file, setFile, loading, onEvaluate }) {
  const [dragging, setDragging] = React.useState(false);

  const handleFile = (f) => { if (f && f.type === 'application/pdf') setFile(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  return (
    <div className="glass-card" style={{ padding: '36px', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : file ? 'oklch(72% 0.18 145)' : 'var(--border)'}`,
          borderRadius: '16px', padding: '40px 24px', textAlign: 'center',
          background: dragging ? 'var(--primary-05)' : file ? 'oklch(72% 0.18 145 / 0.05)' : 'transparent',
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
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Kéo &amp; thả CV vào đây</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>hoặc nhấp để chọn file PDF</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <FileText size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Chỉ hỗ trợ file PDF · Tối đa 10MB</span>
      </div>

      <button id="btn-evaluate-cv" className="btn-primary" onClick={onEvaluate}
        disabled={!file || loading} style={{ width: '100%', opacity: (!file || loading) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {loading ? (
          <><svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Đang phân tích CV...</>
        ) : (
          <><Zap size={16} /> Phân tích CV ngay</>
        )}
      </button>
    </div>
  );
}
