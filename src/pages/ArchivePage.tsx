import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import {
  LAUNCH_DATE,
  getLocalDateString,
  getDailyMixNumber,
  MIX_ROUNDS,
} from '../utils/daily';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';

export const ArchivePage: React.FC = () => {
  const { state } = useGame();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 30;

  // Build list of dates from yesterday back to LAUNCH_DATE
  const datesList = React.useMemo(() => {
    const list: string[] = [];
    const today = new Date();
    // Start at yesterday
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const launch = new Date(LAUNCH_DATE + 'T00:00:00');

    while (current >= launch) {
      list.push(getLocalDateString(current));
      current.setDate(current.getDate() - 1);
    }
    return list;
  }, []);

  const totalPages = Math.max(1, Math.ceil(datesList.length / itemsPerPage));
  const displayedDates = datesList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1F1B16] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1F1B16] font-semibold">Archive</span>
        </nav>
        <h1 className="text-h1 text-[#1F1B16]">Daily Mix Archive</h1>
        <p className="text-sm text-[#5E564A]">
          Revisit past Daily Mixes since launch on January 1, 2026. Archive plays do not affect your active daily streak.
        </p>
      </div>

      {/* Mixes List */}
      <div className="bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon divide-y divide-[#E2D8C3] overflow-hidden">
        {displayedDates.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#5E564A]">
            No past mixes available yet. Today is the inaugural day!
          </div>
        ) : (
          displayedDates.map(dateStr => {
            const mixNo = getDailyMixNumber(dateStr);
            const saved = state.mixes[dateStr];
            const isCompleted = saved?.completed;
            const correctCount = saved?.results?.filter(r => r === 'first' || r === 'second').length || 0;

            return (
              <div
                key={dateStr}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#F4EEE1]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[10px] bg-[#F4EEE1] border border-[#E2D8C3] flex items-center justify-center text-[#1F1B16]">
                    <Calendar className="w-5 h-5 text-[#6B5A12]" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-base text-[#1F1B16]">
                        Daily Mix No. {mixNo}
                      </span>
                      <span className="font-mono-respell text-xs text-[#5E564A]">
                        {dateStr}
                      </span>
                    </div>
                    <span className="text-xs text-[#5E564A]">
                      {isCompleted
                        ? `${correctCount} of ${saved?.rounds || MIX_ROUNDS}`
                        : 'Not played yet'}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/archive/${dateStr}`}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-[10px] bg-[#F4EEE1] hover:bg-[#1F1B16] hover:text-[#FDF8EC] text-xs font-semibold text-[#1F1B16] transition-colors"
                >
                  <span>{isCompleted ? 'View / Replay' : 'Play'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 py-2 px-3 rounded-[8px] bg-[#FFFFFF] border border-[#E2D8C3] text-xs font-semibold text-[#1F1B16] disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="font-mono-respell text-xs text-[#5E564A]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 py-2 px-3 rounded-[8px] bg-[#FFFFFF] border border-[#E2D8C3] text-xs font-semibold text-[#1F1B16] disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
