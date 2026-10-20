import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1F1B16] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1F1B16] font-semibold">Contact</span>
        </nav>
        <h1 className="text-h1 text-[#1F1B16]">Contact Us</h1>
        <p className="text-base text-[#5E564A]">
          Get in touch with the editorial team behind Etymon.
        </p>
      </div>

      <div className="bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 sm:p-10 flex flex-col gap-6 max-w-xl text-[#1F1B16]">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#6B5A12]" />
            <span>Editorial Inquiries & Corrections</span>
          </h2>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            Have a question about a word’s pronunciation, spotted a respelling discrepancy, or want to suggest an English word that doesn't sound the way it looks?
          </p>
          <div className="pt-2">
            {/* mailto link with placeholder address */}
            <a
              href="mailto:editorial@etymon.app?subject=Etymon%20Inquiry%20or%20Correction"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-[12px] bg-[#1F1B16] hover:bg-[#1F1B16]/90 text-[#FDF8EC] text-sm font-semibold transition-colors shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>Email: editorial@etymon.app</span>
            </a>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E2D8C3] text-xs text-[#6F6659] leading-relaxed">
          <p>
            We review pronunciation reports and update the active word bank weekly.
          </p>
        </div>
      </div>
    </div>
  );
};
