import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, CheckCircle2, AlertCircle, RefreshCw, Send, ChevronRight, GraduationCap, Mic, MicOff, Square, Edit3, Bot, Globe, Volume2 } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const TOPICS = [
  { id: "machine learning interview question", label: "Machine Learning" },
  { id: "software development interview question", label: "Software Development (DSA)" },
  { id: "Web development interview question", label: "Web Development" },
  { id: "data analysis interview question", label: "Data Analysis" },
  { id: "Application development interview question", label: "Application Development" },
  { id: "SQL interview question", label: "SQL" }
];

const LEVELS = ["Intern", "Junior", "Middle", "Senior"];

export default function App() {
  const [appState, setAppState] = useState("SETUP"); // SETUP, LOADING_QUESTIONS, INTERVIEWING, EVALUATING, FINISHED
  
  // Setup state
  const [topic, setTopic] = useState(TOPICS[0].id);
  const [level, setLevel] = useState(LEVELS[1]);
  const [language, setLanguage] = useState("vi");
  
  // Interview data
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  
  // Evaluation data
  const [evalResult, setEvalResult] = useState(null);
  const [history, setHistory] = useState([]); // luu tru scores tong ket

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeAudioRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const speak = async (text) => {
    try {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      const res = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        activeAudioRef.current = audio;
        audio.play();
      }
    } catch (err) {
      console.error("Loi TTS:", err);
    }
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setIsTranscribing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const res = await fetch(`${API_BASE}/transcribe`, {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            if (data.status === "success") {
              setUserAnswer(prev => prev + (prev ? " " : "") + data.text);
            } else {
              alert("Lỗi Whisper: " + data.detail);
            }
          } catch(err) {
            alert("Lỗi kết nối Whisper API: " + err.message);
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setIsEditing(false);
      } catch (err) {
        alert("Trình duyệt không thể truy cập Microphone! Vui lòng cấp quyền.");
        setIsEditing(true);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  const startInterview = async () => {
    setAppState("LOADING_QUESTIONS");
    try {
      const res = await fetch(`${API_BASE}/start-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, language })
      });
      const data = await res.json();
      if (data.status === "success" && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setAppState("INTERVIEWING");
        
        // Speak Intro + Question 1
        const introText = language === "vi" 
            ? "Chào bạn, tôi là trợ lý AI. Bây giờ chúng ta sẽ bắt đầu nhé. " 
            : "Hello, I am your AI mock interviewer. Let's begin. ";
        speak(introText + data.questions[0].question);

      } else {
        alert("Khong the tim thay cau hoi phu hop hoac he thong dang loi.");
        setAppState("SETUP");
      }
    } catch (err) {
      alert("Loi ket noi den Backend: " + err.message);
      setAppState("SETUP");
    }
  };

  const submitAnswer = async () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
    if (isTranscribing) {
      alert("Đang chờ Whisper xử lý văn bản, vui lòng đợi...");
      return;
    }
    if (!userAnswer.trim()) {
      alert("Ban chua chi tiet cau tra loi!");
      return;
    }
    setAppState("EVALUATING");
    try {
      const q = questions[currentIdx];
      const res = await fetch(`${API_BASE}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.question,
          reference: q.reference,
          answer: userAnswer,
          level: level,
          language: language
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setEvalResult(data.evaluation);
        setHistory(prev => [...prev, data.evaluation.score]);
        setAppState("INTERVIEWING"); // Quan TRONG: Phai doi lai state de hien thi component cham diem
      } else {
        alert("Khong the cham diem cau hoi luac nay.");
        setAppState("INTERVIEWING");
      }
    } catch (err) {
      alert("Loi ket noi den Backend: " + err.message);
      setAppState("INTERVIEWING");
    }
  };

  const nextQuestion = () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
    setEvalResult(null);
    setUserAnswer("");
    setIsEditing(false);
    if (currentIdx + 1 < questions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setAppState("INTERVIEWING");
      speak(questions[nextIdx].question);
    } else {
      setAppState("FINISHED");
    }
  };

  const restart = () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
    setQuestions([]);
    setHistory([]);
    setEvalResult(null);
    setUserAnswer("");
    setIsEditing(false);
    setCurrentIdx(0);
    setAppState("SETUP");
  };

  // --------------------------------------------------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------------------------------------------------

  if (appState === "SETUP") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Mock Interview AI</h1>
            <p className="text-gray-500 mt-2 text-center text-sm">Lenh tap ky nang phong van Ky thuat Phan mem voi AI</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-500"/> Ngôn ngữ</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors">
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English (US)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ đề Phỏng Vấn</label>
                  <select value={topic} onChange={e => setTopic(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors">
                    {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp độ Kinh nghiệm</label>
              <div className="grid grid-cols-2 gap-3">
                {LEVELS.map(lvl => (
                  <button key={lvl} onClick={() => setLevel(lvl)}
                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-all border ${level === lvl ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startInterview}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg">
              <PlayCircle className="w-5 h-5" /> Bat Dau Ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === "LOADING_QUESTIONS" || appState === "EVALUATING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">
          {appState === "LOADING_QUESTIONS" ? "Dang chuan bi cau hoi phong van..." : "AI Dang cham diem cau tra loi..."}
        </h2>
        <p className="text-gray-500 mt-2">Vui long doi trong giay lat</p>
      </div>
    );
  }

  if (appState === "FINISHED") {
    const avgScore = history.length ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1) : 0;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-center border border-gray-100">
          {avgScore >= 7.0 ? (
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          )}
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hoàn Thành!</h1>
          <p className="text-gray-600 mb-6">Ban da hoan thanh {questions.length} cau hoi chu de {TOPICS.find(t=>t.id===topic)?.label}.</p>
          
          <div className="bg-blue-50 py-6 rounded-xl mb-8 border border-blue-100">
            <div className="text-sm font-semibold text-blue-800 uppercase tracking-widest mb-1">Diem Trung Binh</div>
            <div className={`text-5xl font-black ${avgScore >= 7.0 ? 'text-green-600' : 'text-orange-600'}`}>
              {avgScore} <span className="text-2xl text-gray-400">/10</span>
            </div>
          </div>

          <button onClick={restart}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
            <RefreshCw className="w-5 h-5" /> Thu Lai Phien Khac
          </button>
        </div>
      </div>
    );
  }

  // INTERVIEWING hoac dang xem EVALUATION
  const q = questions[currentIdx];
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl">
        
        {/* Process bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
             {questions.map((_, i) => (
               <div key={i} className={`h-2 w-12 rounded-full transition-colors ${i <= currentIdx ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
             ))}
          </div>
          <div className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            Cau hoi {currentIdx + 1} / {questions.length}
          </div>
        </div>

        {/* Question Panel - AI Chat Bubble */}
        <div className="flex gap-4 mb-8 w-full">
           <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0 animate-fade-in-up mt-1">
              <Bot className="w-8 h-8 text-white" />
           </div>
           <div className="bg-white rounded-2xl rounded-tl-sm shadow-md border border-gray-200 p-6 relative flex-grow animate-fade-in-up">
              <button 
                 onClick={() => speak(q.question)} 
                 className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2.5 rounded-full"
                 title="Đọc lại câu hỏi bằng giọng AI"
              >
                  <Volume2 className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 leading-relaxed pr-10">
                {q.question}
              </h2>
           </div>
        </div>

        {/* Answer Box */}
        {!evalResult ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
             
             {/* Microphone button area */}
             <div className="relative mb-8 mt-4 flex items-center justify-center">
                {isRecording && (
                   <div className="absolute w-28 h-28 bg-blue-400 rounded-full animate-wave opacity-50"></div>
                )}
                <button 
                  onClick={handleToggleRecording}
                  className={`relative z-10 w-24 h-24 flex items-center justify-center rounded-full shadow-2xl transition-transform duration-300 transform outline-none ${isRecording ? 'bg-red-500 hover:bg-red-600 hover:-translate-y-1' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1'} text-white ring-4 ring-white`}
                >
                  {isRecording ? <Square className="w-10 h-10 fill-current" /> : <Mic className="w-12 h-12" />}
                </button>
             </div>
             
             <div className="text-center mb-6">
                <p className={`font-medium text-lg ${isRecording ? 'text-red-500 animate-pulse' : (isTranscribing ? 'text-blue-500 animate-pulse' : 'text-gray-500')}`}>
                  {isRecording ? 'Đang thu âm... Hãy nói câu trả lời của bạn' : (isTranscribing ? 'Đang xử lý Whisper AI...' : 'Bấm vào Mic để bắt đầu trả lời bằng giọng nói')}
                </p>
             </div>

             {/* Transcript/User Answer box */}
             <div className="w-full relative">
               <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
                 <span>Kết quả nhận diện (Whisper Model)</span>
                 {!isRecording && !isTranscribing && (
                    <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 shadow-sm font-bold">
                       <Edit3 className="w-3.5 h-3.5"/> {isEditing ? 'Đóng chế độ gõ phím' : 'Gõ phím thiết lập'}
                    </button>
                 )}
               </label>
               
               {isEditing ? (
                 <textarea 
                   value={userAnswer}
                   onChange={e => setUserAnswer(e.target.value)}
                   placeholder="Nhập hoặc chỉnh sửa câu trả lời của bạn vào đây..."                     
                   className="w-full h-32 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-4 outline-none resize-none transition-all shadow-inner font-medium text-lg leading-relaxed"
                 ></textarea>
               ) : (
                 <div className={`w-full min-h-[9rem] bg-gray-50 border flex items-start p-5 rounded-xl shadow-inner overflow-y-auto transition-all ${isRecording || isTranscribing ? 'border-blue-300 ring-2 ring-blue-100 blur-[0.3px]' : 'border-gray-200'} font-medium text-lg leading-relaxed`}>
                    {userAnswer ? (
                      <p className="text-gray-800 whitespace-pre-wrap">{userAnswer}</p>
                    ) : (
                      <p className="text-gray-400 italic">Dữ liệu giọng nói sẽ xuất hiện ở đây sau khi Whisper phân tích...</p>
                    )}
                 </div>
               )}
             </div>

             <div className="w-full flex justify-end mt-8 border-t border-gray-100 pt-6">
                <button onClick={submitAnswer} disabled={!userAnswer.trim() || isRecording || isTranscribing}
                  className={`font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg text-lg ${!userAnswer.trim() || isRecording || isTranscribing ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gray-900 hover:bg-gray-800 text-white transform hover:scale-105 hover:-translate-y-1'}`}>
                  {isRecording ? 'Đang Thu Âm...' : (isTranscribing ? 'Đang xử lý...' : 'Gửi Câu Trả Lời')} <Send className="w-5 h-5" />
                </button>
             </div>
          </div>
        ) : (
          /* Evaluation Results Box */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
               <h3 className="text-lg font-bold flex items-center gap-2"> <CheckCircle2 className="text-green-400" /> Nhan xet tu AI </h3>
               <div className="bg-gray-800 px-4 py-1.5 rounded-lg text-xl font-black text-blue-400">
                  {evalResult.score_str}
               </div>
            </div>
            <div className="p-6 space-y-6">
               <div>
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Diem Manh</h4>
                 <p className="text-gray-800">{evalResult.strengths || "Khong co dang ke."}</p>
               </div>
               <div>
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Diem Yeu / Thieu Sot</h4>
                 <p className="text-gray-800">{evalResult.weaknesses || "Rat tot, khong thieu sot lon."}</p>
               </div>
               <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                 <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Goi y bo sung</h4>
                 <p className="text-blue-900 text-sm">{evalResult.suggestions}</p>
               </div>

               <div className="flex justify-end pt-4 border-t border-gray-100">
                 <button onClick={nextQuestion}
                   className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-xl">
                   {currentIdx + 1 < questions.length ? "Cau tiep theo" : "Xem ket qua thomo"} <ChevronRight className="w-5 h-5"/>
                 </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
