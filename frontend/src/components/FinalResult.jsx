import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { TOPICS } from './SetupForm';

export default function FinalResult({ history, topic, total, onRestart }) {
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
        <p className="text-gray-600 mb-6">Bạn đã qua {total} câu chủ đề {TOPICS.find(t=>t.id===topic)?.label}.</p>
        
        <div className="bg-blue-50 py-6 rounded-xl mb-8 border border-blue-100">
          <div className="text-sm font-semibold text-blue-800 uppercase tracking-widest mb-1">Điểm Trung Bình</div>
          <div className={`text-5xl font-black ${avgScore >= 7.0 ? 'text-green-600' : 'text-orange-600'}`}>
            {avgScore} <span className="text-2xl text-gray-400">/10</span>
          </div>
        </div>

        <button onClick={onRestart}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
          <RefreshCw className="w-5 h-5" /> Thử Lại Phiên Khác
        </button>
      </div>
    </div>
  );
}
