import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingScreen({ message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
      <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
    </div>
  );
}
