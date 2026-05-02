import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

import SetupForm, { LEVELS } from '../components/SetupForm';
import LoadingScreen from '../components/LoadingScreen';
import InterviewPanel from '../components/InterviewPanel';
import EvaluationResult from '../components/EvaluationResult';
import FinalResult from '../components/FinalResult';

export default function InterviewPage() {
  const { user } = useAuth();

  // ── Cài đặt phỏng vấn ─────────────────────────────────────────────────────
  const [appState, setAppState] = useState("SETUP");
  const [cvFile, setCvFile] = useState(null);
  const [jd, setJd] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [language, setLanguage] = useState("vi");

  // ── Danh sách câu hỏi ─────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);

  /**
   * history: mảng các object { score, questionDbId }
   * questionDbId = id trong bảng interview_questions (để cập nhật sau khi chấm)
   */
  const [history, setHistory] = useState([]);

  // Lưu tất cả điểm (bao gồm câu cuối) để FinalResult tính đúng
  const [finalScores, setFinalScores] = useState([]);

  // ── DB tracking IDs ────────────────────────────────────────────────────────
  /**
   * interviewId: UUID của phiên phỏng vấn trong bảng interviews.
   * null = chưa tạo hoặc user chưa đăng nhập.
   */
  const interviewIdRef = useRef(null);

  /**
   * questionDbIds: Map<questionOrder, dbId> lưu id DB của từng câu hỏi đã lưu.
   * Dùng để cập nhật câu trả lời sau khi chấm.
   */
  const questionDbIdsRef = useRef({});

  // ── Refs khác ─────────────────────────────────────────────────────────────
  const activeAudioRef = useRef(null);
  const { isRecording, isTranscribing, toggleRecording, stopRecordingHard } = useAudioRecorder(setUserAnswer);

  // Đánh dấu đang trong phiên phỏng vấn để beforeunload biết cần gọi abandon
  const isInterviewingRef = useRef(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const speak = (text) => api.tts(text, language, activeAudioRef);

  /** Tạo topic label hiển thị và lưu vào DB */
  const buildTopicLabel = () => jd ? `${level} – ${jd.slice(0, 50)}` : `${level} – General`;

  // ── beforeunload: gọi abandon nếu đang phỏng vấn ─────────────────────────
  const handleBeforeUnload = useCallback(() => {
    if (isInterviewingRef.current && interviewIdRef.current) {
      // keepalive=true trong abandonInterview đảm bảo request không bị hủy
      api.abandonInterview(interviewIdRef.current);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Cleanup khi unmount component (navigate sang trang khác)
      if (activeAudioRef.current) activeAudioRef.current.pause();
      stopRecordingHard();
      if (isInterviewingRef.current && interviewIdRef.current) {
        api.abandonInterview(interviewIdRef.current);
        isInterviewingRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleBeforeUnload]);

  // ── Lưu câu hỏi vào DB khi chuyển sang câu mới ───────────────────────────
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
    setAppState("LOADING_QUESTIONS");
    try {
      const data = await api.startInterview(cvFile, jd, level, language);
      if (data.status === "success" && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setHistory([]);
        questionDbIdsRef.current = {};

        // Tạo record trong DB (chỉ khi đã đăng nhập)
        if (user) {
          const topic = buildTopicLabel();
          try {
            const record = await api.createInterviewRecord(topic, level, language);
            if (record?.interview?.id) {
              interviewIdRef.current = record.interview.id;
              // Lưu câu hỏi đầu tiên ngay
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
        alert("Lỗi tải câu hỏi.");
        setAppState("SETUP");
      }
    } catch (err) {
      alert("Lỗi BE: " + err);
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

        // Cập nhật DB: lưu câu trả lời + đánh giá (JSON có cấu trúc)
        const qDbId = questionDbIdsRef.current[currentIdx];
        if (interviewIdRef.current && qDbId) {
          const evalJson = JSON.stringify({
            score_str: evaluation.score_str,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            suggestions: evaluation.suggestions,
          });
          api.updateAnswer(
            interviewIdRef.current,
            qDbId,
            userAnswer,
            evalJson,
            evaluation.score
          ).catch(console.warn);
        }

        setHistory(prev => [...prev, evaluation.score]);
        setAppState("SHOW_EVAL");

      } else {
        alert("Lỗi chấm điểm");
        setAppState("INTERVIEWING");
      }
    } catch (err) {
      alert("Lỗi kết nối");
      setAppState("INTERVIEWING");
    }
  };

  // ── Câu hỏi tiếp theo ────────────────────────────────────────────────────
  /**
   * Nhận lastScore để tính avgScore chính xác khi kết thúc,
   * vì history state có thể chưa reflect score câu cuối (React setState async).
   */
  const nextQuestion = async (lastScore) => {
    setEvalResult(null);
    setUserAnswer("");
    const nextIdx = currentIdx + 1;

    if (nextIdx < questions.length) {
      // Lưu câu hỏi tiếp theo vào DB trước khi hiển thị
      await saveQuestionToDB(questions[nextIdx].question, nextIdx);
      setCurrentIdx(nextIdx);
      setAppState("INTERVIEWING");
      speak(questions[nextIdx].question);
    } else {
      // Kết thúc phỏng vấn – tính avgScore từ history + score câu cuối
      isInterviewingRef.current = false;
      const allScores = lastScore != null ? [...history, lastScore] : [...history];
      setFinalScores(allScores); // Lưu để FinalResult dùng
      if (interviewIdRef.current) {
        const avgScore = allScores.length
          ? parseFloat((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2))
          : 0;
        api.completeInterview(
          interviewIdRef.current,
          avgScore,
          `Hoàn thành ${questions.length} câu hỏi. Điểm trung bình: ${avgScore}/10.`
        ).catch(console.warn);
      }
      setAppState("FINISHED");
    }
  };

  // ── Bắt đầu lại ──────────────────────────────────────────────────────────
  const restart = () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    stopRecordingHard();

    // Nếu đang phỏng vấn mà restart → abandon
    if (isInterviewingRef.current && interviewIdRef.current) {
      api.abandonInterview(interviewIdRef.current).catch(console.warn);
    }

    isInterviewingRef.current = false;
    interviewIdRef.current = null;
    questionDbIdsRef.current = {};

    setQuestions([]);
    setHistory([]);
    setFinalScores([]);
    setEvalResult(null);
    setUserAnswer("");
    setCurrentIdx(0);
    setAppState("SETUP");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (appState === "SETUP")
    return <SetupForm {...{ cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage, onStart: startInterview }} />;

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
    return <EvaluationResult evalResult={evalResult} onNext={() => nextQuestion(evalResult?.score)} isLast={currentIdx + 1 === questions.length} />;


  return null;
}
