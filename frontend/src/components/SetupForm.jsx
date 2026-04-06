import React from 'react';
import { PlayCircle, Globe, GraduationCap } from 'lucide-react';

const TOPICS = [
  { id: "machine learning interview question", label: "Machine Learning" },
  { id: "software development interview question", label: "Software Development (DSA)" },
  { id: "Web development interview question", label: "Web Development" },
  { id: "data analysis interview question", label: "Data Analysis" },
  { id: "Application development interview question", label: "Application Development" },
  { id: "SQL interview question", label: "SQL" }
];
const LEVELS = ["Intern", "Junior", "Middle", "Senior"];

export default function SetupForm({ topic, setTopic, level, setLevel, language, setLanguage, onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Mock Interview AI</h1>
          <p className="text-gray-500 mt-2 text-center text-sm">Luyện tập kỹ năng phỏng vấn cùng AI</p>
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

          <button onClick={onStart}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg">
            <PlayCircle className="w-5 h-5" /> Bắt Đầu Ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export { TOPICS, LEVELS };
