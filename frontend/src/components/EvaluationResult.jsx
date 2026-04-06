import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function EvaluationResult({ evalResult, onNext, isLast }) {
  if (!evalResult) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
             <h3 className="text-lg font-bold flex items-center gap-2"> <CheckCircle2 className="text-green-400" /> Nhận xét từ AI </h3>
             <div className="bg-gray-800 px-4 py-1.5 rounded-lg text-xl font-black text-blue-400">
                {evalResult.score_str}
             </div>
          </div>
          <div className="p-6 space-y-6">
             <div>
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Điểm Mạnh</h4>
               <p className="text-gray-800">{evalResult.strengths || "Không có đáng kể."}</p>
             </div>
             <div>
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Điểm Yếu / Thiếu Sót</h4>
               <p className="text-gray-800">{evalResult.weaknesses || "Rất tốt."}</p>
             </div>
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
               <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Gợi ý bổ sung</h4>
               <p className="text-blue-900 text-sm">{evalResult.suggestions}</p>
             </div>

             <div className="flex justify-end pt-4 border-t border-gray-100">
               <button onClick={onNext}
                 className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-xl">
                 {isLast ? "Xem kết quả chung cuộc" : "Câu tiếp theo"} <ChevronRight className="w-5 h-5"/>
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
