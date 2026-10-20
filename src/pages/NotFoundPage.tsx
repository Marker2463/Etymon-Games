import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center gap-6">
      <div className="w-16 h-16 rounded-[16px] bg-[#F4EEE1] border border-[#E2D8C3] flex items-center justify-center font-mono-respell text-2xl font-bold text-[#6B5A12]">
        404
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-[#1F1B16]">Page Not Found</h1>
        <p className="text-sm text-[#5E564A] max-w-md">
          The requested orthographic path does not exist. Perhaps an impostor letter slipped into the URL.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 py-3 px-6 rounded-[12px] bg-[#1F1B16] hover:bg-[#1F1B16]/90 text-[#FDF8EC] text-sm font-semibold transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Etymon Home</span>
      </Link>
    </div>
  );
};
