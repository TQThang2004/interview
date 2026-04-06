import React from 'react';
import { PlayCircle, Globe, GraduationCap, UploadCloud } from 'lucide-react';

const LEVELS = ["Intern", "Junior", "Middle", "Senior"];

export default function SetupForm({ cvFile, setCvFile, jd, setJd, level, setLevel, language, setLanguage, onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Mock Interview AI</h1>
          <p className="text-gray-500 mt-2 text-center text-sm">Cá nhân hóa theo CV và JD của bạn</p>
        </div>

        <div className="space-y-5">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-gray-500"/> Tải lên CV (PDF)
            </label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">{cvFile ? cvFile.name : "Nhấn để chọn file CV"}</span>
                        </p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} />
                </label>
            </div>
          </div>

          {/* JD Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả công việc (JD / Kỹ năng mong muốn)</label>
            <textarea 
              value={jd} 
              onChange={e => setJd(e.target.value)}
              placeholder="Dán mô tả công việc hoặc các công nghệ cần phỏng vấn vào đây..."
              className="w-full h-24 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none resize-none transition-colors"
            />
          </div>

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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cấp độ</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-colors">
                {LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>

          <button onClick={onStart}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg">
            <PlayCircle className="w-5 h-5" /> Bắt Đầu Ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export { LEVELS };
