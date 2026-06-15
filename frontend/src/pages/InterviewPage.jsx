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
  const { showAlert, showConfirm } = useModal();

  // Interview setup state.
  const [appState, setAppState] = useState("SETUP");
  const [cvFile, setCvFile] = useState(null);
  const [jd, setJd] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [language, setLanguage] = useState("vi");
  const [serverError, setServerError] = useState("");

  // â”€â”€ Danh sÃ¡ch cÃ¢u há»i â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);

  // â”€â”€ LÆ°u Ä‘iá»ƒm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /**
   * scoresRef: máº£ng Ä‘iá»ƒm tÃ­ch lÅ©y dÃ¹ng Ref Ä‘á»ƒ trÃ¡nh stale closure.
   * LuÃ´n pháº£n Ã¡nh Ä‘Ãºng táº¥t cáº£ Ä‘iá»ƒm Ä‘Ã£ cháº¥m (ká»ƒ cáº£ ngay sau setState async).
   */
  const scoresRef = useRef([]);
  const [finalScores, setFinalScores] = useState([]);

  // â”€â”€ DB tracking IDs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const interviewIdRef = useRef(null);
  /**
   * questionDbIds: Map<questionOrder, dbId>
   * CÃ¢u há»i Ä‘Æ°á»£c lÆ°u VÃ€O ÄÃ‚Y khi báº¯t Ä‘áº§u há»i, trÆ°á»›c khi ngÆ°á»i dÃ¹ng tráº£ lá»i.
   */
  const questionDbIdsRef = useRef({});

  // â”€â”€ Refs khÃ¡c â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const activeAudioRef = useRef(null);
  const { isRecording, isTranscribing, toggleRecording, stopRecordingHard } = useAudioRecorder(setUserAnswer);
  const isInterviewingRef = useRef(false);

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const speak = (text) => api.tts(text, language, activeAudioRef);
  const buildFinalFeedback = (scores, totalQuestions) => {
    if (!scores.length) return 'Chua co cau tra loi nao duoc cham diem.';
    const avgScore = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    const lowScores = scores.filter(score => score < 6).length;
    const highScores = scores.filter(score => score >= 8).length;
    const completionRate = totalQuestions > 0 ? scores.length / totalQuestions : 0;

    const strengths = highScores >= Math.ceil(scores.length / 2)
      ? 'Diem manh: nhieu cau tra loi dat diem cao, nen tiep tuc giu cach trinh bay co cau truc va dua vi du cu the.'
      : 'Diem manh: da hoan thanh phien phong van va co du lieu de nhan dien nhom cau hoi can cai thien.';
    const weaknesses = lowScores > 0
      ? `Can cai thien: co ${lowScores} cau duoi 6 diem, can on lai kien thuc nen va luyen cach tra loi theo boi canh, cach lam, ket qua.`
      : 'Can cai thien: tang do sau va su ro rang khi giai thich de nang diem cac cau trung binh.';
    const roadmap = completionRate < 0.8
      ? 'Lo trinh: uu tien luyen hoan thanh tron bo phien phong van, sau do toi uu diem tung cau.'
      : avgScore >= 8
      ? 'Lo trinh: luyen cau hoi nang cao, system design va cac tinh huong trade-off.'
      : 'Lo trinh: on lai topic chinh, viet san khung tra loi STAR va luyen lai cac cau diem thap.';

    return `Hoan thanh ${scores.length}/${totalQuestions} cau hoi. Diem trung binh: ${avgScore}/10.\n${strengths}\n${weaknesses}\n${roadmap}`;
  };
  const buildTopicLabel = () => jd ? `${level} â€“ ${jd.slice(0, 50)}` : `${level} â€“ General`;

  // â”€â”€ beforeunload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // Persist each interview question before saving its answer.
  const saveQuestionToDB = async (questionText, order) => {
    if (!interviewIdRef.current) return null;
    try {
      const res = await api.saveQuestion(interviewIdRef.current, questionText, order);
      if (res?.question_id) {
        questionDbIdsRef.current[order] = res.question_id;
        return res.question_id;
      }
    } catch (err) {
      console.warn("[InterviewPage] KhÃ´ng lÆ°u Ä‘Æ°á»£c cÃ¢u há»i vÃ o DB:", err);
    }
    return null;
  };

  // â”€â”€ Báº¯t Ä‘áº§u phá»ng váº¥n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startInterview = async () => {
    setServerError("");
    setAppState("LOADING_QUESTIONS");
    try {
      const data = await api.startInterview(cvFile, jd, level, language);
      if (data.status === "success" && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        // Reset bá»™ Ä‘áº¿m Ä‘iá»ƒm
        scoresRef.current = [];
        setFinalScores([]);
        questionDbIdsRef.current = {};

        // Táº¡o record trong DB
        if (user) {
          const topic = buildTopicLabel();
          try {
            const record = await api.createInterviewRecord(topic, level, language);
            if (record?.interview?.id) {
              interviewIdRef.current = record.interview.id;
              // LÆ°u cÃ¢u há»i Ä‘áº§u tiÃªn (index 0)
              await saveQuestionToDB(data.questions[0].question, 0);
            }
          } catch (err) {
            console.warn("[InterviewPage] KhÃ´ng táº¡o Ä‘Æ°á»£c record phá»ng váº¥n:", err);
          }
        }

        isInterviewingRef.current = true;
        setAppState("INTERVIEWING");
        const intro = language === "vi" ? "Báº¯t Ä‘áº§u nhÃ©. " : "Let's begin. ";
        speak(intro + data.questions[0].question);
      } else {
        setServerError("KhÃ´ng táº£i Ä‘Æ°á»£c cÃ¢u há»i. Vui lÃ²ng kiá»ƒm tra láº¡i CV vÃ  JD.");
        setAppState("SETUP");
      }
    } catch (err) {
      setServerError(err.message || "Lá»—i káº¿t ná»‘i. Vui lÃ²ng thá»­ láº¡i.");
      setAppState("SETUP");
    }
  };

  // â”€â”€ Ná»™p cÃ¢u tráº£ lá»i â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

        // Cáº­p nháº­t DB: lÆ°u cÃ¢u tráº£ lá»i + Ä‘Ã¡nh giÃ¡
        const qDbId = questionDbIdsRef.current[currentIdx];

        if (interviewIdRef.current && qDbId) {
          const evalJson = JSON.stringify({
            score_str: evaluation.score_str,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            suggestions: evaluation.suggestions,
          });
          // Normalize score before saving to history.
          const scoreToSave = typeof evaluation.score === 'number' && !isNaN(evaluation.score)
            ? evaluation.score
            : 0.0;
          try {
            await api.updateAnswer(
              interviewIdRef.current,
              qDbId,
              userAnswer,
              evalJson,
              scoreToSave
            );
          } catch (dbErr) {
            console.error("[submitAnswer] Failed to save answer:", dbErr);
          }
        } else {
          console.warn(`[submitAnswer] Skip DB save: interviewId=${interviewIdRef.current}, qDbId=${qDbId}`);
        }

        // Keep scores in a ref to avoid stale closure issues.
        scoresRef.current = [...scoresRef.current, evaluation.score];

        setAppState("SHOW_EVAL");
      } else {
        showAlert("Lá»—i cháº¥m Ä‘iá»ƒm");
        setAppState("INTERVIEWING");
      }
    } catch (err) {
      showAlert("Lá»—i káº¿t ná»‘i");
      setAppState("INTERVIEWING");
    }
  };

  // â”€â”€ CÃ¢u há»i tiáº¿p theo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const nextQuestion = async () => {
    setEvalResult(null);
    setUserAnswer("");
    const nextIdx = currentIdx + 1;

    if (nextIdx < questions.length) {
      // Persist the next question before moving forward.
      await saveQuestionToDB(questions[nextIdx].question, nextIdx);
      setCurrentIdx(nextIdx);
      setAppState("INTERVIEWING");
      speak(questions[nextIdx].question);
    } else {
      // Háº¿t cÃ¢u â†’ káº¿t thÃºc phá»ng váº¥n
      finishInterview();
    }
  };

  // â”€â”€ Káº¿t thÃºc phá»ng váº¥n (helper chung) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const finishInterview = () => {
    isInterviewingRef.current = false;
    const allScores = scoresRef.current;
    setFinalScores([...allScores]);

    if (interviewIdRef.current && allScores.length > 0) {
      const avgScore = parseFloat(
        (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
      );
      api.completeInterview(
        interviewIdRef.current,
        avgScore,
        buildFinalFeedback(allScores, questions.length)
      ).catch(console.warn);
    } else if (interviewIdRef.current) {
      // No answered questions yet, mark the interview as abandoned.
      api.abandonInterview(interviewIdRef.current).catch(console.warn);
    }

    setAppState("FINISHED");
  };

  // â”€â”€ Bá» qua cÃ¢u há»i â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const skipQuestion = async () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    stopRecordingHard();

    // Ghi 0 Ä‘iá»ƒm cho cÃ¢u bá»‹ bá» qua
    scoresRef.current = [...scoresRef.current, 0];

    // LÆ°u DB: Ä‘Ã¡nh dáº¥u cÃ¢u bá»‹ skip
    const qDbId = questionDbIdsRef.current[currentIdx];
    if (interviewIdRef.current && qDbId) {
      const skipEvalJson = JSON.stringify({
        score_str: "0/10",
        strengths: "",
        weaknesses: "CÃ¢u há»i Ä‘Ã£ bá»‹ bá» qua.",
        suggestions: "HÃ£y cá»‘ gáº¯ng tráº£ lá»i táº¥t cáº£ cÃ¡c cÃ¢u há»i Ä‘á»ƒ Ä‘Æ°á»£c Ä‘Ã¡nh giÃ¡ Ä‘áº§y Ä‘á»§.",
      });
      try {
        await api.updateAnswer(interviewIdRef.current, qDbId, "(ÄÃ£ bá» qua)", skipEvalJson, 0);
      } catch (err) {
        console.warn("[skipQuestion] Lá»—i lÆ°u skip vÃ o DB:", err);
      }
    }

    // Chuyá»ƒn sang cÃ¢u tiáº¿p hoáº·c káº¿t thÃºc
    setUserAnswer("");
    setEvalResult(null);
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      await saveQuestionToDB(questions[nextIdx].question, nextIdx);
      setCurrentIdx(nextIdx);
      setAppState("INTERVIEWING");
      speak(questions[nextIdx].question);
    } else {
      finishInterview();
    }
  };

  // â”€â”€ Káº¿t thÃºc phá»ng váº¥n sá»›m â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const endInterviewEarly = async () => {
    const confirmed = await showConfirm(
      `Báº¡n Ä‘Ã£ tráº£ lá»i ${scoresRef.current.length}/${questions.length} cÃ¢u há»i. Báº¡n cÃ³ cháº¯c muá»‘n káº¿t thÃºc phá»ng váº¥n ngay bÃ¢y giá»?`,
      "Káº¿t thÃºc phá»ng váº¥n",
      { confirmText: "Káº¿t thÃºc", cancelText: "Tiáº¿p tá»¥c phá»ng váº¥n", danger: true }
    );
    if (!confirmed) return;

    if (activeAudioRef.current) activeAudioRef.current.pause();
    stopRecordingHard();
    setUserAnswer("");
    setEvalResult(null);
    finishInterview();
  };

  // â”€â”€ Báº¯t Ä‘áº§u láº¡i â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                KhÃ´ng thá»ƒ báº¯t Ä‘áº§u phá»ng váº¥n
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
            >Ã—</button>
          </div>
        )}
        <SetupForm {...{ cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage, onStart: startInterview }} />
      </>
    );

  if (appState === "LOADING_QUESTIONS" || appState === "EVALUATING")
    return <LoadingScreen message={appState === "LOADING_QUESTIONS" ? "Äang xÃ o náº¥u cÃ¢u há»i tá»« CV/JD..." : "Äang cháº¥m Ä‘iá»ƒm..."} />;

  if (appState === "FINISHED")
    return <FinalResult history={finalScores} topic={buildTopicLabel()} total={questions.length} onRestart={restart} />;

  if (appState === "INTERVIEWING")
    return (
      <InterviewPanel
        q={questions[currentIdx]} currentIdx={currentIdx} totalQuestions={questions.length}
        userAnswer={userAnswer} setUserAnswer={setUserAnswer}
        isRecording={isRecording} isTranscribing={isTranscribing} toggleRecording={toggleRecording}
        onSubmit={submitAnswer} onSpeak={() => speak(questions[currentIdx].question)}
        onSkip={skipQuestion} onEndInterview={endInterviewEarly}
      />
    );

  if (appState === "SHOW_EVAL")
    return <EvaluationResult evalResult={evalResult} onNext={nextQuestion} isLast={currentIdx + 1 === questions.length} />;

  return null;
}
