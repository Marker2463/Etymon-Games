import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Volume2, Mail } from 'lucide-react';
import { COPY } from '../copy';

export const EditorialStandardsPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1F1B16] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1F1B16] font-semibold">Editorial Standards</span>
        </nav>
        <h1 className="text-h1 text-[#1F1B16]">Editorial Standards</h1>
        <p className="text-base text-[#5E564A]">
          How pronunciations and respellings are curated and verified for Etymon.
        </p>
      </div>

      <div className="bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 sm:p-10 flex flex-col gap-6 text-[#1F1B16]">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2E6B3F]" />
            <span>Pronunciation Curation & Auditing</span>
          </h2>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            Every entry in our word bank is curated to focus strictly on genuine spoken English pronunciation. Respelling pairs, silent letters, and dropped syllable chunks are checked and audited by ear.
          </p>
          <ul className="list-disc list-inside text-sm text-[#5E564A] space-y-1.5 pl-2">
            <li><strong>Curated Respellings:</strong> Written in intuitive uppercase-stress phonetic respellings (e.g. <code>KUR-nel</code>).</li>
            <li><strong>Audited by Ear:</strong> Speech synthesis tokens (<code>tts</code>) and audio recordings are verified to reflect authentic spoken cadence.</li>
            <li><strong>Dictionary Sourcing:</strong> Definitions and supplemental audio are provided via the Free Dictionary API.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-[#E2D8C3] flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#6B5A12]" />
            <span>Reporting an Issue</span>
          </h2>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            If you notice an inaccurate respelling, a broken sound string, or want to report a discrepancy in one of our puzzle modes, please let us know:
          </p>
          <div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 py-2 px-4 rounded-[10px] bg-[#F4EEE1] hover:bg-[#EBE3D2] border border-[#CFC3AA] text-xs font-semibold text-[#1F1B16] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#6B5A12]" />
              <span>Report an Issue via Contact</span>
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2D8C3] text-xs font-mono-respell text-[#6F6659]">
          {COPY.attribution}
        </div>
      </div>
    </div>
  );
};
