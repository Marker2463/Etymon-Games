import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Volume2, VolumeX, Gauge, Keyboard, Trash2, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state, updateSettings, resetAllData } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-lg p-6 flex flex-col gap-5 text-[#1F1B16]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E2D8C3]">
          <h2 id="settings-modal-title" className="font-display text-xl font-bold text-[#1F1B16]">
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-[8px] text-[#5E564A] hover:bg-[#F4EEE1] hover:text-[#1F1B16] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F4EEE1] flex items-center justify-center text-[#1F1B16]">
                {state.settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[#1F1B16]">Sound Effects & TTS</span>
                <span className="text-xs text-[#5E564A]">Enable speech pronunciations</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.settings.sound}
              onClick={() => updateSettings({ sound: !state.settings.sound })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                state.settings.sound ? 'bg-[#1F1B16]' : 'bg-[#E2D8C3]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-[#FFFFFF] transition-transform ${
                  state.settings.sound ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Slow Speech Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F4EEE1] flex items-center justify-center text-[#1F1B16]">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[#1F1B16]">Slow Speech</span>
                <span className="text-xs text-[#5E564A]">Speaks at 0.6x conversational speed</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.settings.slowSpeech}
              onClick={() => updateSettings({ slowSpeech: !state.settings.slowSpeech })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                state.settings.slowSpeech ? 'bg-[#1F1B16]' : 'bg-[#E2D8C3]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-[#FFFFFF] transition-transform ${
                  state.settings.slowSpeech ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Shortcuts Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F4EEE1] flex items-center justify-center text-[#1F1B16]">
                <Keyboard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[#1F1B16]">Keyboard Shortcuts</span>
                <span className="text-xs text-[#5E564A]">Use keys 1-4, Left/Right, Enter, R, H</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.settings.keyboardShortcuts}
              onClick={() => updateSettings({ keyboardShortcuts: !state.settings.keyboardShortcuts })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                state.settings.keyboardShortcuts ? 'bg-[#1F1B16]' : 'bg-[#E2D8C3]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-[#FFFFFF] transition-transform ${
                  state.settings.keyboardShortcuts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F4EEE1] flex items-center justify-center text-[#1F1B16]">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-[#1F1B16]">Haptics</span>
                <span className="text-xs text-[#5E564A]">Vibrate on correct picks</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={state.settings.haptics}
              onClick={() => updateSettings({ haptics: !state.settings.haptics })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                state.settings.haptics ? 'bg-[#1F1B16]' : 'bg-[#E2D8C3]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-[#FFFFFF] transition-transform ${
                  state.settings.haptics ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data Reset Section */}
        <div className="pt-4 mt-2 border-t border-[#E2D8C3]">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] bg-[#F4EEE1] hover:bg-[#EBE3D2] text-[#A63A2B] font-medium text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Game Progress</span>
            </button>
          ) : (
            <div className="p-3 bg-[#F9E0DB] border border-[#A63A2B]/40 rounded-[12px] flex flex-col gap-2.5">
              <p className="text-xs text-[#A63A2B] font-medium">
                Are you sure? This will clear your streaks, personal bests, and unlocked lexicon words.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 py-1.5 px-3 rounded-[8px] bg-[#A63A2B] text-[#FFFFFF] text-xs font-semibold hover:bg-[#A63A2B]/90 transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-1.5 px-3 rounded-[8px] bg-[#FFFFFF] border border-[#CFC3AA] text-[#1F1B16] text-xs font-medium hover:bg-[#F4EEE1] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
