import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Flame, Settings, Menu, X, ChevronDown } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const Header: React.FC = () => {
  const { state } = useGame();
  const location = useLocation();
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const playMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  useEffect(() => {
    setPlayMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlayMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside play dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (playMenuRef.current && !playMenuRef.current.contains(e.target as Node)) {
        setPlayMenuOpen(false);
      }
    };
    if (playMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [playMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a, button, input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [mobileMenuOpen]);

  const isDailyActive = location.pathname === '/' || location.pathname.startsWith('/archive');
  const isLexiconActive = location.pathname.startsWith('/lexicon');
  const isHowItWorksActive = location.pathname === '/how-it-works';

  const modes = [
    {
      title: 'Sound Match',
      path: '/sound-match',
      desc: 'Read the word, then pick how it is really said.',
      tint: 'bg-[#F2D46B]',
    },
    {
      title: 'True or Trap',
      path: '/true-vs-trap',
      desc: 'Is this pronunciation real, or a trap?',
      tint: 'bg-[#A9DDB0]',
    },
    {
      title: 'Impostor Letter',
      path: '/impostor-letter',
      desc: 'Find the letter that never gets said.',
      tint: 'bg-[#B7D4EE]',
    },
    {
      title: 'Syllable Chopper',
      path: '/syllable-chopper',
      desc: 'Find the written chunk that disappears when you say it.',
      tint: 'bg-[#F2B8AE]',
    },
  ];

  return (
    <>
      <header className="h-[72px] w-full border-b border-[#E2D8C3] bg-[#FDF8EC]/95 backdrop-blur-xs sticky top-0 z-40 select-none">
        <div className="max-w-[1088px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 group focus-visible:rounded"
              aria-label="Etymon Home"
            >
              <span className="font-display text-[28px] font-bold text-[#1F1B16] tracking-tight group-hover:opacity-90">
                Etymon
              </span>
              <span className="font-mono-respell text-[11px] font-medium uppercase tracking-wider text-[#6B5A12] bg-[#F4EEE1] border border-[#E2D8C3] px-1.5 py-0.5 rounded-[6px]">
                GAMES
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#5E564A]">
              {/* Play Dropdown */}
              <div className="relative" ref={playMenuRef}>
                <button
                  type="button"
                  onClick={() => setPlayMenuOpen(!playMenuOpen)}
                  aria-expanded={playMenuOpen}
                  aria-haspopup="true"
                  className="inline-flex items-center gap-1 hover:text-[#1F1B16] py-1 cursor-pointer transition-colors"
                >
                  <span>Play</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${playMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {playMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-lg p-2 flex flex-col gap-1 z-50">
                    {modes.map(mode => (
                      <Link
                        key={mode.path}
                        to={mode.path}
                        onClick={() => setPlayMenuOpen(false)}
                        className="flex flex-col p-2.5 rounded-[12px] hover:bg-[#F4EEE1] transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${mode.tint}`} />
                          <span className="font-display text-sm font-semibold text-[#1F1B16]">
                            {mode.title}
                          </span>
                        </div>
                        <span className="text-xs text-[#5E564A] mt-0.5 leading-snug">
                          {mode.desc}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily Link */}
              <Link
                to="/"
                className={`py-1 transition-colors hover:text-[#1F1B16] ${
                  isDailyActive ? 'text-[#1F1B16] font-semibold border-b-2 border-[#1F1B16]' : ''
                }`}
              >
                Daily
              </Link>

              {/* Lexicon Link */}
              <Link
                to="/lexicon"
                className={`py-1 transition-colors hover:text-[#1F1B16] ${
                  isLexiconActive ? 'text-[#1F1B16] font-semibold border-b-2 border-[#1F1B16]' : ''
                }`}
              >
                Lexicon
              </Link>

              {/* How it works Link */}
              <Link
                to="/how-it-works"
                className={`py-1 transition-colors hover:text-[#1F1B16] ${
                  isHowItWorksActive ? 'text-[#1F1B16] font-semibold border-b-2 border-[#1F1B16]' : ''
                }`}
              >
                How it works
              </Link>
            </nav>
          </div>

          {/* Right: Streak Chip & Settings & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Streak Chip */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[999px] bg-[#F4EEE1] border border-[#E2D8C3] text-[#1F1B16] font-semibold text-sm"
              title={`Current Daily Streak: ${state.streak} days`}
              aria-label={`Current Daily Streak: ${state.streak} days`}
            >
              <Flame className="w-4 h-4 text-[#A63A2B] fill-[#A63A2B]" />
              <span className="font-mono-respell tabular-nums">{state.streak}</span>
            </div>

            {/* Settings Trigger */}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              className="w-10 h-10 rounded-[12px] bg-[#F4EEE1] border border-[#E2D8C3] hover:bg-[#EBE3D2] flex items-center justify-center text-[#1F1B16] transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden w-10 h-10 rounded-[12px] bg-[#F4EEE1] border border-[#E2D8C3] hover:bg-[#EBE3D2] flex items-center justify-center text-[#1F1B16] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation with Focus Trap & Esc */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 md:hidden bg-[#FDF8EC] flex flex-col p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#E2D8C3]">
            <div className="flex items-center gap-2">
              <span id="mobile-menu-title" className="font-display text-2xl font-bold text-[#1F1B16]">
                Etymon
              </span>
              <span className="font-mono-respell text-[10px] uppercase font-semibold text-[#6B5A12] bg-[#F4EEE1] px-1.5 py-0.5 rounded">
                GAMES
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 rounded-[12px] bg-[#F4EEE1] flex items-center justify-center text-[#1F1B16]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col py-6 gap-6 flex-1">
            <div className="flex flex-col gap-2">
              <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                Daily Game
              </span>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-[12px] bg-[#FFFFFF] border border-[#E2D8C3] font-display text-lg font-semibold text-[#1F1B16]"
              >
                Today's Daily Mix
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                Arcade Modes
              </span>
              <div className="flex flex-col gap-2">
                {modes.map(mode => (
                  <Link
                    key={mode.path}
                    to={mode.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-[12px] bg-[#FFFFFF] border border-[#E2D8C3] flex flex-col"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${mode.tint}`} />
                      <span className="font-display text-base font-semibold text-[#1F1B16]">
                        {mode.title}
                      </span>
                    </div>
                    <span className="text-xs text-[#5E564A] mt-1">{mode.desc}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                Reference & About
              </span>
              <Link
                to="/lexicon"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-[8px] hover:bg-[#F4EEE1] text-[#1F1B16] font-medium"
              >
                Lexicon Dictionary
              </Link>
              <Link
                to="/archive"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-[8px] hover:bg-[#F4EEE1] text-[#1F1B16] font-medium"
              >
                Past Mix Archive
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-[8px] hover:bg-[#F4EEE1] text-[#1F1B16] font-medium"
              >
                How it works
              </Link>
              <Link
                to="/editorial-standards"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-[8px] hover:bg-[#F4EEE1] text-[#1F1B16] font-medium"
              >
                Editorial Standards
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};
