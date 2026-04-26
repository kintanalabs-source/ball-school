import React from 'react';
import { useLoading } from '../utils/loading';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-medium text-lg">{loadingMessage}</p>
          <p className="text-gray-400 text-sm mt-1">Veuillez patienter...</p>
        </div>
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-2" />
      </div>
    </div>
  );
};

export default LoadingOverlay;