import React, { useState } from 'react';
import { Send, Mic, Square, Edit3, Bot, Volume2 } from 'lucide-react';

export default function InterviewPanel({ 
  q, currentIdx, totalQuestions, 
  userAnswer, setUserAnswer, 
  isRecording, isTranscribing, toggleRecording,
  onSubmit, onSpeak
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
             {Array.from({ length: totalQuestions }).map((_, i) => (
               <div key={i} className={`h-2 w-12 rounded-full transition-colors ${i <= currentIdx ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
             ))}
          </div>
          <div className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            Câu hỏi {currentIdx + 1} / {totalQuestions}
          </div>
        </div>

        <div className="flex gap-4 mb-8 w-full">
           <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0 animate-fade-in-up mt-1">
              <Bot className="w-8 h-8 text-white" />
           </div>
           <div className="bg-white rounded-2xl rounded-tl-sm shadow-md border border-gray-200 p-6 relative flex-grow animate-fade-in-up">
              <button 
                 onClick={onSpeak} 
                 className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2.5 rounded-full"
                 title="Đọc lại câu hỏi"
              >
                  <Volume2 className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-800 leading-relaxed pr-10">
                {q?.question}
              </h2>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
           <div className="relative mb-8 mt-4 flex items-center justify-center">
              {isRecording && (
                 <div className="absolute w-28 h-28 bg-blue-400 rounded-full animate-wave opacity-50"></div>
              )}
              <button 
                onClick={() => { setIsEditing(false); toggleRecording(); }}
                className={`relative z-10 w-24 h-24 flex items-center justify-center rounded-full shadow-2xl transition-transform duration-300 transform outline-none ${isRecording ? 'bg-red-500 hover:bg-red-600 hover:-translate-y-1' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1'} text-white ring-4 ring-white`}
              >
                {isRecording ? <Square className="w-10 h-10 fill-current" /> : <Mic className="w-12 h-12" />}
              </button>
           </div>
           
           <div className="text-center mb-6">
              <p className={`font-medium text-lg ${isRecording ? 'text-red-500 animate-pulse' : (isTranscribing ? 'text-blue-500 animate-pulse' : 'text-gray-500')}`}>
                {isRecording ? 'Đang thu âm...' : (isTranscribing ? 'Đang xử lý Whisper AI...' : 'Bấm vào Mic để trả lời')}
              </p>
           </div>

           <div className="w-full relative">
             <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
               <span>Kết quả nhận diện</span>
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
                 placeholder="Nhập hoặc chỉnh sửa câu trả lời..."                     
                 className="w-full h-32 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-4 outline-none resize-none transition-all shadow-inner font-medium text-lg leading-relaxed"
               ></textarea>
             ) : (
               <div className={`w-full min-h-[9rem] bg-gray-50 border flex items-start p-5 rounded-xl shadow-inner overflow-y-auto transition-all ${isRecording || isTranscribing ? 'border-blue-300 ring-2 ring-blue-100 blur-[0.3px]' : 'border-gray-200'} font-medium text-lg leading-relaxed`}>
                  {userAnswer ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{userAnswer}</p>
                  ) : (
                    <p className="text-gray-400 italic">Dữ liệu giọng nói sẽ xuất hiện ở đây...</p>
                  )}
               </div>
             )}
           </div>

           <div className="w-full flex justify-end mt-8 border-t border-gray-100 pt-6">
              <button onClick={onSubmit} disabled={!userAnswer.trim() || isRecording || isTranscribing}
                className={`font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg text-lg ${!userAnswer.trim() || isRecording || isTranscribing ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gray-900 hover:bg-gray-800 text-white transform hover:scale-105 hover:-translate-y-1'}`}>
                {isRecording ? 'Đang Thu Âm...' : (isTranscribing ? 'Đang xử lý...' : 'Gửi Câu Trả Lời')} <Send className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
