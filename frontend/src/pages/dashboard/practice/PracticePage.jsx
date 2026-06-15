/**
 * PracticePage.jsx
 * Trang chính Luyện tập theo Chủ đề – state machine:
 *
 *   SELECT_TOPIC → LOADING → QUIZ → GRADING → RESULT
 *
 * Phương án B: ứng viên trả lời tất cả câu → nộp 1 lần → xem kết quả.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../../../services/api';
import { useModal } from '../../../context/ModalContext';

import TopicSelector from './TopicSelector';
import QuizPanel     from './QuizPanel';
import QuizResult    from './QuizResult';
import LoadingScreen from '../../../components/common/LoadingScreen';

export default function PracticePage() {
  const { showConfirm, showAlert } = useModal();

  // ── State machine ──────────────────────────────────────────────────────────
  const [appState, setAppState] = useState('SELECT_TOPIC');
  // SELECT_TOPIC | LOADING | QUIZ | GRADING | RESULT

  // ── Quiz data ──────────────────────────────────────────────────────────────
  const [currentSettings, setCurrentSettings] = useState(null); // {topic, level, numQuestions}
  const [questions, setQuestions] = useState([]);
  const [quizResult, setQuizResult] = useState(null);

  // ── DB tracking ────────────────────────────────────────────────────────────
  const sessionIdRef = useRef(null);
  const isActiveRef  = useRef(false);
  const [sessionId, setSessionId] = useState(null);

  // ── Abandon khi rời trang ─────────────────────────────────────────────────
  const handleBeforeUnload = useCallback(() => {
    if (isActiveRef.current && sessionIdRef.current) {
      api.abandonPractice(sessionIdRef.current);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isActiveRef.current && sessionIdRef.current) {
        api.abandonPractice(sessionIdRef.current);
        isActiveRef.current = false;
      }
    };
  }, [handleBeforeUnload]);

  // ── Bắt đầu bài kiểm tra ──────────────────────────────────────────────────
  const handleStart = async ({ topic, level, numQuestions }) => {
    setCurrentSettings({ topic, level, numQuestions });
    setAppState('LOADING');

    try {
      const data = await api.startPractice(topic, level, 'vi', numQuestions);
      if (!data.questions || data.questions.length === 0) {
        await showAlert('Không tìm thấy câu hỏi cho chủ đề này. Vui lòng thử chủ đề khác.');
        setAppState('SELECT_TOPIC');
        return;
      }
      sessionIdRef.current = data.session_id;
      setSessionId(data.session_id);
      isActiveRef.current = true;
      setQuestions(data.questions);
      setAppState('QUIZ');
    } catch (err) {
      await showAlert(err.message || 'Lỗi kết nối. Vui lòng thử lại.');
      setAppState('SELECT_TOPIC');
    }
  };

  // ── Nộp bài (Phương án B) ─────────────────────────────────────────────────
  const handleSubmit = async (answersPayload) => {
    setAppState('GRADING');
    try {
      const result = await api.submitPractice(sessionIdRef.current, answersPayload);
      isActiveRef.current = false;
      setQuizResult(result);
      setAppState('RESULT');
    } catch (err) {
      await showAlert(err.message || 'Lỗi khi nộp bài. Vui lòng thử lại.');
      setAppState('QUIZ');
    }
  };

  // ── Huỷ bài ───────────────────────────────────────────────────────────────
  const handleAbandon = async () => {
    const confirmed = await showConfirm(
      'Bạn có chắc muốn huỷ bài kiểm tra? Kết quả sẽ không được lưu.',
      'Huỷ bài kiểm tra',
      { confirmText: 'Huỷ bài', cancelText: 'Tiếp tục làm', danger: true }
    );
    if (!confirmed) return;

    if (sessionIdRef.current) {
      await api.abandonPractice(sessionIdRef.current);
      isActiveRef.current = false;
    }
    resetToSelect();
  };

  // ── Làm lại chủ đề hiện tại ───────────────────────────────────────────────
  const handleRetry = () => {
    sessionIdRef.current = null;
    setSessionId(null);
    setQuizResult(null);
    setQuestions([]);
    if (currentSettings) {
      handleStart(currentSettings);
    } else {
      resetToSelect();
    }
  };

  // ── Về trang chọn chủ đề ──────────────────────────────────────────────────
  const resetToSelect = () => {
    sessionIdRef.current = null;
    setSessionId(null);
    isActiveRef.current = false;
    setQuestions([]);
    setQuizResult(null);
    setCurrentSettings(null);
    setAppState('SELECT_TOPIC');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  switch (appState) {
    case 'SELECT_TOPIC':
      return <TopicSelector onStart={handleStart} />;

    case 'LOADING':
      return (
        <LoadingScreen
          message={`Đang chuẩn bị bài kiểm tra ${currentSettings?.topic}...`}
        />
      );

    case 'QUIZ':
      return (
        <QuizPanel
          sessionId={sessionId}
          topic={currentSettings?.topic}
          level={currentSettings?.level}
          questions={questions}
          onSubmit={handleSubmit}
          onAbandon={handleAbandon}
          isSubmitting={false}
        />
      );

    case 'GRADING':
      return <LoadingScreen message="Đang chấm điểm bài kiểm tra..." />;

    case 'RESULT':
      return (
        <QuizResult
          result={quizResult}
          topic={currentSettings?.topic}
          level={currentSettings?.level}
          onRetry={handleRetry}
          onSelectTopic={resetToSelect}
        />
      );

    default:
      return <TopicSelector onStart={handleStart} />;
  }
}
