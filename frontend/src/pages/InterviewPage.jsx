import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useModal } from '../context/ModalContext';
import { AlertCircle } from 'lucide-react';

import SetupForm, { LEVELS } from '../components/interview/SetupForm';
import LoadingScreen from '../components/common/LoadingScreen';
import InterviewPanel from '../components/interview/InterviewPanel';
import EvaluationResult from '../components/interview/EvaluationResult';
import FinalResult from '../components/interview/FinalResult';

export default function InterviewPage() {
  const { user } = useAuth();
  const { showAlert } = useModal();

  // ── Cài đặt phỏng vấn ─────────────────────────────────────────────────────
  const [appState, setAppState] = useState("SETUP");
  const [cvFile, setCvFile] = useState(null);
  const [jd, setJd] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [language, setLanguage] = useState("vi");
  const [serverError, setServerError] = useState("");

  // ── Danh sách câu hỏi ─────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);

  // ── Lưu điểm ──────────────────────────────────────────────────────────────
  /**
   * scoresRef: mảng điểm tích lũy dùng Ref để tránh stale closure.
   * Luôn phản ánh đúng tất cả điểm đã chấm (kể cả ngay sau setState async).
   */
  const scoresRef = useRef([]);
  const [finalScores, setFinalScores] = useState([]);

  // ── DB tracking IDs ────────────────────────────────────────────────────────
  const interviewIdRef = useRef(null);
  /**
   * questionDbIds: Map<questionOrder, dbId>
   * Câu hỏi được lưu VÀO ĐÂY khi bắt đầu hỏi, trước khi người dùng trả lời.
   */
  const questionDbIdsRef = useRef({});

  // ── Refs khác ─────────────────────────────────────────────────────────────
  const activeAudioRef = useRef(null);
  const { isRecording, isTranscribing, toggleRecording, stopRecordingHard } = useAudioRecorder(setUserAnswer);
  const isInterviewingRef = useRef(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const speak = (text) => api.tts(text, language, activeAudioRef);
  const buildTopicLabel = () => jd ? `${level} – ${jd.slice(0, 50)}` : `${level} – General`;

  // ── beforeunload ──────────────────────────────────────────────────────────
  const handleBeforeUnload = useCallback(() => {
    if (isInterviewingRef.current && interviewIdRef.current) {
      api.abandonInterview(interviewIdRef.current);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (activeAudioRef.current) activeAudioRef.current.pause();
      stopRecordingHard();
      if (isInterviewingRef.current && interviewIdRef.current) {
        api.abandonInterview(interviewIdRef.current);
        isInterviewingRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleBeforeUnload]);

  // ── Lưu câu hỏi vào DB ────────────────────────────────────────────────────
  const saveQuestionToDB = async (questionText, order) => {
    if (!interviewIdRef.current) return null;
    try {
      const res = await api.saveQuestion(interviewIdRef.current, questionText, order);
      if (res?.question_id) {
        questionDbIdsRef.current[order] = res.question_id;
        return res.question_id;
      }
    } catch (err) {
      console.warn("[InterviewPage] Không lưu được câu hỏi vào DB:", err);
    }
    return null;
  };

  // ── Bắt đầu phỏng vấn ────────────────────────────────────────────────────
  const startInterview = async () => {
    setServerError("");
    setAppState("LOADING_QUESTIONS");
    try {
      const data = await api.startInterview(cvFile, jd, level, language);
      if (data.status === "success" && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        // Reset bộ đếm điểm
        scoresRef.current = [];
        setFinalScores([]);
        questionDbIdsRef.current = {};

        // Tạo record trong DB
        if (user) {
          const topic = buildTopicLabel();
          try {
            const record = await api.createInterviewRecord(topic, level, language);
            if (record?.interview?.id) {
              interviewIdRef.current = record.interview.id;
              // Lưu câu hỏi đầu tiên (index 0)
              await saveQuestionToDB(data.questions[0].question, 0);
            }
          } catch (err) {
            console.warn("[InterviewPage] Không tạo được record phỏng vấn:", err);
          }
        }

        isInterviewingRef.current = true;
        setAppState("INTERVIEWING");
        const intro = language === "vi" ? "Bắt đầu nhé. " : "Let's begin. ";
        speak(intro + data.questions[0].question);
      } else {
        setServerError("Không tải được câu hỏi. Vui lòng kiểm tra lại CV và JD.");
        setAppState("SETUP");
      }
    } catch (err) {
      setServerError(err.message || "Lỗi kết nối. Vui lòng thử lại.");
      setAppState("SETUP");
    }
  };

  // ── Nộp câu trả lời ──────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    stopRecordingHard();
    setAppState("EVALUATING");
    try {
      const q = questions[currentIdx];
      const data = await api.evaluate(q.question, q.reference, userAnswer, level, language);
      if (data.status === "success") {
        const evaluation = data.evaluation;
        setEvalResult(evaluation);

        // Cập nhật DB: lưu câu trả lời + đánh giá
        const qDbId = questionDbIdsRef.current[currentIdx];
        console.log(`[submitAnswer] Câu ${currentIdx}: qDbId=${qDbId}, score=${evaluation.score}, interviewId=${interviewIdRef.current}`);
        console.log(`[submitAnswer] questionDbIdsRef:`, { ...questionDbIdsRef.current });

        if (interviewIdRef.current && qDbId) {
          const evalJson = JSON.stringify({
            score_str: evaluation.score_str,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            suggestions: evaluation.suggestions,
          });
          // Đảm bảo score là số float hợp lệ
          const scoreToSave = typeof evaluation.score === 'number' && !isNaN(evaluation.score)
            ? evaluation.score
            : 0.0;
          try {
            const ok = await api.updateAnswer(
              interviewIdRef.current,
              qDbId,
              userAnswer,
              evalJson,
              scoreToSave
            );
            console.log(`[submitAnswer] updateAnswer kết quả:`, ok, `| score gửi:`, scoreToSave);
          } catch (dbErr) {
            console.error(`[submitAnswer] Lỗi lưu câu trả lời vào DB:`, dbErr);
          }
        } else {
          console.warn(`[submitAnswer] Bỏ qua lưu DB: interviewId=${interviewIdRef.current}, qDbId=${qDbId}`);
        }

        // Tích lũy điểm vào Ref (tránh stale closure)
        scoresRef.current = [...scoresRef.current, evaluation.score];

        setAppState("SHOW_EVAL");
      } else {
        showAlert("Lỗi chấm điểm");
        setAppState("INTERVIEWING");
      }
    } catch (err) {
      showAlert("Lỗi kết nối");
      setAppState("INTERVIEWING");
    }
  };

  // ── Câu hỏi tiếp theo ────────────────────────────────────────────────────
  const nextQuestion = async () => {
    setEvalResult(null);
    setUserAnswer("");
    const nextIdx = currentIdx + 1;

    if (nextIdx < questions.length) {
      // Còn câu tiếp theo → lưu câu hỏi kế vào DB rồi chuyển
      await saveQuestionToDB(questions[nextIdx].question, nextIdx);
      setCurrentIdx(nextIdx);
      setAppState("INTERVIEWING");
      speak(questions[nextIdx].question);
    } else {
      // Hết câu → kết thúc phỏng vấn
      isInterviewingRef.current = false;

      // Dùng scoresRef để đảm bảo có đủ tất cả điểm (không phụ thuộc setState async)
      const allScores = scoresRef.current;
      setFinalScores([...allScores]);

      if (interviewIdRef.current && allScores.length > 0) {
        const avgScore = parseFloat(
          (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
        );
        console.log(`[InterviewPage] Hoàn thành: ${allScores.length} câu, avgScore=${avgScore}`, allScores);
        api.completeInterview(
          interviewIdRef.current,
          avgScore,
          `Hoàn thành ${allScores.length} câu hỏi. Điểm trung bình: ${avgScore}/10.`
        ).catch(console.warn);
      }

      setAppState("FINISHED");
    }
  };

  // ── Bắt đầu lại ──────────────────────────────────────────────────────────
  const restart = () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    stopRecordingHard();

    if (isInterviewingRef.current && interviewIdRef.current) {
      api.abandonInterview(interviewIdRef.current).catch(console.warn);
    }

    isInterviewingRef.current = false;
    interviewIdRef.current = null;
    questionDbIdsRef.current = {};
    scoresRef.current = [];

    setQuestions([]);
    setFinalScores([]);
    setEvalResult(null);
    setUserAnswer("");
    setCurrentIdx(0);
    setServerError("");
    setAppState("SETUP");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (appState === "SETUP")
    return (
      <>
        {serverError && (
          <div style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, maxWidth: '520px', width: '90%',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '14px 18px', borderRadius: '14px',
            background: 'oklch(14% 0.025 25)', border: '1px solid oklch(65% 0.2 25 / 0.5)',
            boxShadow: '0 8px 32px oklch(0% 0 0 / 0.45)'
          }}>
            <AlertCircle size={18} style={{ color: 'oklch(65% 0.2 25)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'oklch(82% 0.12 25)' }}>
                Không thể bắt đầu phỏng vấn
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'oklch(68% 0.08 25)', lineHeight: 1.5 }}>
                {serverError}
              </p>
            </div>
            <button
              onClick={() => setServerError("")}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 6px', fontSize: '18px', color: 'var(--text-muted)',
                lineHeight: 1
              }}
            >×</button>
          </div>
        )}
        <SetupForm {...{ cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage, onStart: startInterview }} />
      </>
    );

  if (appState === "LOADING_QUESTIONS" || appState === "EVALUATING")
    return <LoadingScreen message={appState === "LOADING_QUESTIONS" ? "Đang xào nấu câu hỏi từ CV/JD..." : "Đang chấm điểm..."} />;

  if (appState === "FINISHED")
    return <FinalResult history={finalScores} topic={buildTopicLabel()} total={questions.length} onRestart={restart} />;

  if (appState === "INTERVIEWING")
    return (
      <InterviewPanel
        q={questions[currentIdx]} currentIdx={currentIdx} totalQuestions={questions.length}
        userAnswer={userAnswer} setUserAnswer={setUserAnswer}
        isRecording={isRecording} isTranscribing={isTranscribing} toggleRecording={toggleRecording}
        onSubmit={submitAnswer} onSpeak={() => speak(questions[currentIdx].question)}
      />
    );

  if (appState === "SHOW_EVAL")
    return <EvaluationResult evalResult={evalResult} onNext={nextQuestion} isLast={currentIdx + 1 === questions.length} />;

  return null;
}
