import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVELS } from '../components/interview/SetupForm';
import { api } from '../services/api';

export function normalizeScore(score) {
  return typeof score === 'number' && !Number.isNaN(score) ? score : 0.0;
}

export function buildFinalFeedback(scores, totalQuestions) {
  if (!scores.length) return 'Chưa có câu trả lời nào được chấm điểm.';
  const avgScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
  const lowScores = scores.filter(score => score < 6).length;
  const highScores = scores.filter(score => score >= 8).length;
  const completionRate = totalQuestions > 0 ? scores.length / totalQuestions : 0;

  const strengths = highScores >= Math.ceil(scores.length / 2)
    ? 'Điểm mạnh: nhiều câu trả lời đạt điểm cao, nên tiếp tục giữ cách trình bày có cấu trúc và đưa ví dụ cụ thể.'
    : 'Điểm mạnh: đã hoàn thành phiên phỏng vấn và có dữ liệu để nhận diện nhóm câu hỏi cần cải thiện.';
  const weaknesses = lowScores > 0
    ? `Cần cải thiện: có ${lowScores} câu dưới 6 điểm, cần ôn lại kiến thức nền và luyện cách trả lời theo bối cảnh, cách làm, kết quả.`
    : 'Cần cải thiện: tăng độ sâu và sự rõ ràng khi giải thích để nâng điểm các câu trung bình.';
  const roadmap = completionRate < 0.8
    ? 'Lộ trình: ưu tiên luyện hoàn thành trọn bộ phiên phỏng vấn, sau đó tối ưu điểm từng câu.'
    : avgScore >= 8
      ? 'Lộ trình: luyện câu hỏi nâng cao, system design và các tình huống trade-off.'
      : 'Lộ trình: ôn lại topic chính, viết sẵn khung trả lời STAR và luyện lại các câu điểm thấp.';

  return `Hoàn thành ${scores.length}/${totalQuestions} câu hỏi. Điểm trung bình: ${avgScore}/10.\n${strengths}\n${weaknesses}\n${roadmap}`;
}

export function buildTopicLabel(level, jd) {
  return jd ? `${level} - ${jd.slice(0, 50)}` : `${level} - General`;
}

export function useInterviewSession({ user, showAlert, showConfirm, audio }) {
  const [appState, setAppState] = useState('SETUP');
  const [cvFile, setCvFile] = useState(null);
  const [jd, setJd] = useState('');
  const [level, setLevel] = useState(LEVELS[1]);
  const [language, setLanguage] = useState('vi');
  const [serverError, setServerError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [finalScores, setFinalScores] = useState([]);

  const scoresRef = useRef([]);
  const interviewIdRef = useRef(null);
  const questionDbIdsRef = useRef({});
  const isInterviewingRef = useRef(false);

  const topicLabel = useCallback(() => buildTopicLabel(level, jd), [jd, level]);

  const saveQuestionToDB = useCallback(async (questionText, order) => {
    if (!interviewIdRef.current) return null;
    try {
      const res = await api.saveQuestion(interviewIdRef.current, questionText, order);
      if (res?.question_id) {
        questionDbIdsRef.current[order] = res.question_id;
        return res.question_id;
      }
    } catch (err) {
      console.warn('[InterviewPage] Không lưu được câu hỏi vào DB:', err);
    }
    return null;
  }, []);

  const finishInterview = useCallback(() => {
    isInterviewingRef.current = false;
    const allScores = scoresRef.current;
    setFinalScores([...allScores]);

    if (interviewIdRef.current && allScores.length > 0) {
      const avgScore = Number((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2));
      api.completeInterview(
        interviewIdRef.current,
        avgScore,
        buildFinalFeedback(allScores, questions.length)
      ).catch(console.warn);
    } else if (interviewIdRef.current) {
      api.abandonInterview(interviewIdRef.current).catch(console.warn);
    }

    setAppState('FINISHED');
  }, [questions.length]);

  const startInterview = useCallback(async () => {
    setServerError('');
    setAppState('LOADING_QUESTIONS');
    try {
      const data = await api.startInterview(cvFile, jd, level, language);
      if (data.status === 'success' && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        scoresRef.current = [];
        setFinalScores([]);
        questionDbIdsRef.current = {};

        if (user) {
          try {
            const record = await api.createInterviewRecord(topicLabel(), level, language);
            if (record?.interview?.id) {
              interviewIdRef.current = record.interview.id;
              await saveQuestionToDB(data.questions[0].question, 0);
            }
          } catch (err) {
            console.warn('[InterviewPage] Không tạo được record phỏng vấn:', err);
          }
        }

        isInterviewingRef.current = true;
        setAppState('INTERVIEWING');
        const intro = language === 'vi' ? 'Bắt đầu nhé. ' : "Let's begin. ";
        audio.speak(intro + data.questions[0].question, language);
      } else {
        setServerError('Không tải được câu hỏi. Vui lòng kiểm tra lại CV và JD.');
        setAppState('SETUP');
      }
    } catch (err) {
      setServerError(err.message || 'Lỗi kết nối. Vui lòng thử lại.');
      setAppState('SETUP');
    }
  }, [audio, cvFile, jd, language, level, saveQuestionToDB, topicLabel, user]);

  const submitAnswer = useCallback(async () => {
    audio.stopAllAudio();
    setAppState('EVALUATING');
    try {
      const q = questions[currentIdx];
      const data = await api.evaluate(q.question, q.reference, userAnswer, level, language);
      if (data.status === 'success') {
        const evaluation = data.evaluation;
        setEvalResult(evaluation);
        const qDbId = questionDbIdsRef.current[currentIdx];

        if (interviewIdRef.current && qDbId) {
          const evalJson = JSON.stringify({
            score_str: evaluation.score_str,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            suggestions: evaluation.suggestions,
          });
          try {
            await api.updateAnswer(
              interviewIdRef.current,
              qDbId,
              userAnswer,
              evalJson,
              normalizeScore(evaluation.score)
            );
          } catch (dbErr) {
            console.error('[submitAnswer] Failed to save answer:', dbErr);
          }
        } else {
          console.warn(`[submitAnswer] Skip DB save: interviewId=${interviewIdRef.current}, qDbId=${qDbId}`);
        }

        scoresRef.current = [...scoresRef.current, normalizeScore(evaluation.score)];
        setAppState('SHOW_EVAL');
      } else {
        showAlert('Lỗi chấm điểm');
        setAppState('INTERVIEWING');
      }
    } catch {
      showAlert('Lỗi kết nối');
      setAppState('INTERVIEWING');
    }
  }, [audio, currentIdx, language, level, questions, showAlert, userAnswer]);

  const nextQuestion = useCallback(async () => {
    setEvalResult(null);
    setUserAnswer('');
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      await saveQuestionToDB(questions[nextIdx].question, nextIdx);
      setCurrentIdx(nextIdx);
      setAppState('INTERVIEWING');
      audio.speak(questions[nextIdx].question, language);
    } else {
      finishInterview();
    }
  }, [audio, currentIdx, finishInterview, language, questions, saveQuestionToDB]);

  const skipQuestion = useCallback(async () => {
    audio.stopAllAudio();
    scoresRef.current = [...scoresRef.current, 0];

    const qDbId = questionDbIdsRef.current[currentIdx];
    if (interviewIdRef.current && qDbId) {
      const skipEvalJson = JSON.stringify({
        score_str: '0/10',
        strengths: '',
        weaknesses: 'Câu hỏi đã bị bỏ qua.',
        suggestions: 'Hãy cố gắng trả lời tất cả các câu hỏi để được đánh giá đầy đủ.',
      });
      try {
        await api.updateAnswer(interviewIdRef.current, qDbId, '(Đã bỏ qua)', skipEvalJson, 0);
      } catch (err) {
        console.warn('[skipQuestion] Lỗi lưu skip vào DB:', err);
      }
    }

    setUserAnswer('');
    setEvalResult(null);
    const nextIdx = currentIdx + 1;
    if (nextIdx < questions.length) {
      await saveQuestionToDB(questions[nextIdx].question, nextIdx);
      setCurrentIdx(nextIdx);
      setAppState('INTERVIEWING');
      audio.speak(questions[nextIdx].question, language);
    } else {
      finishInterview();
    }
  }, [audio, currentIdx, finishInterview, language, questions, saveQuestionToDB]);

  const endInterviewEarly = useCallback(async () => {
    const confirmed = await showConfirm(
      `Bạn đã trả lời ${scoresRef.current.length}/${questions.length} câu hỏi. Bạn có chắc muốn kết thúc phỏng vấn ngay bây giờ?`,
      'Kết thúc phỏng vấn',
      { confirmText: 'Kết thúc', cancelText: 'Tiếp tục phỏng vấn', danger: true }
    );
    if (!confirmed) return;

    audio.stopAllAudio();
    setUserAnswer('');
    setEvalResult(null);
    finishInterview();
  }, [audio, finishInterview, questions.length, showConfirm]);

  const restart = useCallback(() => {
    audio.stopAllAudio();
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
    setUserAnswer('');
    setCurrentIdx(0);
    setServerError('');
    setAppState('SETUP');
  }, [audio]);

  const handleBeforeUnload = useCallback(() => {
    if (isInterviewingRef.current && interviewIdRef.current) {
      api.abandonInterview(interviewIdRef.current);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      audio.stopAllAudio();
      if (isInterviewingRef.current && interviewIdRef.current) {
        api.abandonInterview(interviewIdRef.current);
        isInterviewingRef.current = false;
      }
    };
  }, [audio, handleBeforeUnload]);

  return {
    appState,
    setup: { cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage },
    serverError,
    setServerError,
    questions,
    currentIdx,
    userAnswer,
    setUserAnswer,
    evalResult,
    finalScores,
    topicLabel: topicLabel(),
    startInterview,
    submitAnswer,
    nextQuestion,
    skipQuestion,
    endInterviewEarly,
    restart,
  };
}
