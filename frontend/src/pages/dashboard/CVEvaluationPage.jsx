import React, { useState, useEffect, useCallback } from 'react';
import {
  UploadCloud, FileText, CheckCircle2, Star, Zap, Target, X,
  Save, BookmarkCheck, AlertTriangle, CheckCheck,
} from 'lucide-react';
import { api } from '../../services/api';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreBar({ score }) {
  const color =
    score >= 8 ? 'oklch(72% 0.18 145)' :
    score >= 6.5 ? 'oklch(80% 0.18 80)' :
    'oklch(65% 0.22 25)';
  return (
    <div style={{ width: '100px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
    </div>
  );
}

/** Toast thông báo nổi nhỏ ở góc phải */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = {
    success: { bg: 'oklch(72% 0.18 145 / 0.12)', border: 'oklch(72% 0.18 145 / 0.4)', text: 'oklch(60% 0.2 145)' },
    error:   { bg: 'oklch(65% 0.22 25 / 0.12)',  border: 'oklch(65% 0.22 25 / 0.4)',  text: 'oklch(55% 0.22 25)' },
    info:    { bg: 'oklch(83.3% 0.145 321.434 / 0.1)', border: 'oklch(83.3% 0.145 321.434 / 0.35)', text: 'var(--primary)' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, borderRadius: '14px', padding: '14px 20px',
      fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', backdropFilter: 'blur(12px)',
      animation: 'slideUp 0.3s ease',
    }}>
      {type === 'success' ? <CheckCheck size={16} /> : type === 'error' ? <AlertTriangle size={16} /> : null}
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: 0, display: 'flex' }}>
        <X size={14} />
      </button>
    </div>
  );
}

/** Banner xác nhận lưu phía trên kết quả */
function SaveBanner({ canSave, savedCount, maxCount, saving, onSave, onDismiss, alreadySaved }) {
  if (alreadySaved) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px', borderRadius: '14px', marginBottom: '20px',
        background: 'oklch(72% 0.18 145 / 0.08)', border: '1px solid oklch(72% 0.18 145 / 0.3)',
      }}>
        <BookmarkCheck size={18} style={{ color: 'oklch(60% 0.2 145)', flexShrink: 0 }} />
        <div style={{ flex: 1, fontSize: '14px', color: 'oklch(60% 0.2 145)', fontWeight: 600 }}>
          ✅ Đã lưu bản đánh giá này thành công!
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '18px 22px', borderRadius: '16px', marginBottom: '20px',
      background: canSave
        ? 'oklch(83.3% 0.145 321.434 / 0.07)'
        : 'oklch(65% 0.22 25 / 0.07)',
      border: `1px solid ${canSave ? 'oklch(83.3% 0.145 321.434 / 0.3)' : 'oklch(65% 0.22 25 / 0.3)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <Save size={18} style={{ color: canSave ? 'var(--primary)' : 'oklch(65% 0.22 25)', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            💾 Lưu bản đánh giá này?
          </div>
          {canSave ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Bạn đang sử dụng <strong>{savedCount}/{maxCount}</strong> bản lưu. Lưu lại để xem lại bất kỳ lúc nào trong <strong>CV History</strong>.
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'oklch(65% 0.22 25)' }}>
              ⚠️ Đã đạt giới hạn <strong>{maxCount}/{maxCount}</strong> bản lưu. Vào <strong>CV History</strong> để xóa bản cũ trước.
            </div>
          )}
        </div>
        {canSave && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: 'var(--gradient-primary)', color: 'oklch(15% 0.01 250)',
                fontSize: '13px', fontWeight: 700, opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              {saving ? (
                <><svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Đang lưu...</>
              ) : (
                <><BookmarkCheck size={14} /> Lưu bản đánh giá</>
              )}
            </button>
            <button
              onClick={onDismiss}
              style={{
                padding: '9px 16px', borderRadius: '10px', cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
              }}
            >
              Không, cảm ơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CVEvaluationPage() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);

  // Save state
  const [savedCount, setSavedCount] = useState(0);
  const [maxCount] = useState(2);
  const [saving, setSaving] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [showSaveBanner, setShowSaveBanner] = useState(true);
  const [toast, setToast] = useState(null);

  const handleFile = (f) => { if (f && f.type === 'application/pdf') setFile(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  // Khi có kết quả đánh giá mới, fetch số bản đã lưu
  const fetchCount = useCallback(async () => {
    try {
      const data = await api.getCvEvaluationCount();
      setSavedCount(data.count || 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (result) {
      setAlreadySaved(false);
      setShowSaveBanner(true);
      fetchCount();
    }
  }, [result, fetchCount]);

  const handleEvaluate = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setCvText('');
    try {
      const data = await api.evaluateCv(file);
      setResult(data.result);
      setCvText(data.cv_text || '');
    } catch (err) {
      setToast({ message: 'Lỗi khi phân tích CV: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!file || !result) return;
    setSaving(true);
    try {
      await api.saveCvEvaluation(file, result, cvText);
      setAlreadySaved(true);
      setSavedCount(prev => prev + 1);
      setToast({ message: '✅ Đã lưu bản đánh giá CV thành công!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Không thể lưu bản đánh giá.', type: 'error' });
      // Refresh count phòng trường hợp đã đầy
      await fetchCount();
    } finally {
      setSaving(false);
    }
  };

  const overallColor = result
    ? (result.overall >= 8 ? 'oklch(72% 0.18 145)' : result.overall >= 6.5 ? 'oklch(80% 0.18 80)' : 'oklch(65% 0.22 25)')
    : 'var(--primary)';

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 36px)', maxWidth: '900px' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          <span className="gradient-text">CV Evaluation</span> 📄
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          AI phân tích CV của bạn và đưa ra nhận xét chi tiết để tăng tỷ lệ lọc hồ sơ.
        </p>
      </div>

      {!result ? (
        /* ── Upload Form ── */
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
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Kéo &amp; thả CV vào đây</div>
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
              <><svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg> Đang phân tích CV...</>
            ) : (
              <><Zap size={16} /> Phân tích CV ngay</>
            )}
          </button>
        </div>
      ) : (
        /* ── Evaluation Result ── */
        <div>
          {/* Save Banner */}
          {showSaveBanner && (
            <SaveBanner
              canSave={savedCount < maxCount}
              savedCount={savedCount}
              maxCount={maxCount}
              saving={saving}
              onSave={handleSave}
              onDismiss={() => setShowSaveBanner(false)}
              alreadySaved={alreadySaved}
            />
          )}

          {/* Overall score */}
          <div className="glass-card" style={{
            padding: '28px', display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '20px',
          }}>
            <div style={{ textAlign: 'center', minWidth: '90px' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, color: overallColor }}>{result.overall}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Điểm tổng</div>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>
                {result.overall >= 8 ? '🎉 CV rất tốt!' : result.overall >= 6.5 ? '👍 CV ổn, cần cải thiện' : '⚠️ CV cần cải thiện nhiều'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                {result.overall >= 8
                  ? 'CV của bạn có chất lượng cao và sẽ gây ấn tượng tốt với nhà tuyển dụng.'
                  : 'Có một số điểm cần cải thiện để tăng tỷ lệ được chọn.'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <button className="btn-ghost" onClick={() => { setResult(null); setFile(null); setCvText(''); }} style={{ fontSize: '13px' }}>
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
