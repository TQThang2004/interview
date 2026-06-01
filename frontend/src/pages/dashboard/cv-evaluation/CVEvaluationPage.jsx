import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import Toast from '../../../components/common/Toast';
import CVUploadForm from './CVUploadForm';
import SaveBanner from './SaveBanner';
import CVEvalResult from './CVEvalResult';

export default function CVEvaluationPage() {
  const [file, setFile] = useState(null);
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
        <CVUploadForm file={file} setFile={setFile} loading={loading} onEvaluate={handleEvaluate} />
      ) : (
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

          <CVEvalResult result={result} onReset={() => { setResult(null); setFile(null); setCvText(''); }} />
        </div>
      )}
    </div>
  );
}
