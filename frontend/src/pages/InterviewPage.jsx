import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

import SetupForm, { LEVELS } from '../components/SetupForm';
import LoadingScreen from '../components/LoadingScreen';
import InterviewPanel from '../components/InterviewPanel';
import EvaluationResult from '../components/EvaluationResult';
import FinalResult from '../components/FinalResult';

export default function InterviewPage() {
  const [appState, setAppState] = useState("SETUP");
  const [cvFile, setCvFile] = useState(null);
  const [jd, setJd] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [language, setLanguage] = useState("vi");

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [history, setHistory] = useState([]);

  const activeAudioRef = useRef(null);
  const { isRecording, isTranscribing, toggleRecording, stopRecordingHard } = useAudioRecorder(setUserAnswer);

  useEffect(() => {
    return () => {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      stopRecordingHard();
    };
  }, []);

  const speak = (text) => api.tts(text, language, activeAudioRef);

  const startInterview = async () => {
    setAppState("LOADING_QUESTIONS");
    try {
      const data = await api.startInterview(cvFile, jd, level, language);
      if (data.status === "success" && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
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

  const submitAnswer = async () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    stopRecordingHard();
    setAppState("EVALUATING");
    try {
      const q = questions[currentIdx];
      const data = await api.evaluate(q.question, q.reference, userAnswer, level, language);
      if (data.status === "success") {
        setEvalResult(data.evaluation);
        setHistory(prev => [...prev, data.evaluation.score]);
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

  const nextQuestion = () => {
    setEvalResult(null);
    setUserAnswer("");
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setAppState("INTERVIEWING");
      speak(questions[currentIdx + 1].question);
    } else {
      setAppState("FINISHED");
    }
  };

  const restart = () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    stopRecordingHard();
    setQuestions([]);
    setHistory([]);
    setEvalResult(null);
    setUserAnswer("");
    setCurrentIdx(0);
    setAppState("SETUP");
  };

  if (appState === "SETUP")
    return <SetupForm {...{ cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage, onStart: startInterview }} />;
  if (appState === "LOADING_QUESTIONS" || appState === "EVALUATING")
    return <LoadingScreen message={appState === "LOADING_QUESTIONS" ? "Đang xào nấu câu hỏi từ CV/JD..." : "Đang chấm điểm..."} />;
  if (appState === "FINISHED")
    return <FinalResult history={history} topic={jd ? "Phỏng vấn Tùy chỉnh" : "Phỏng vấn RAG"} total={questions.length} onRestart={restart} />;
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
