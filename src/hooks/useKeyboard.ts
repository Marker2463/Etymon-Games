import { useEffect } from 'react';
import { useGame } from '../context/GameContext';

export interface KeyboardActions {
  onOption?: (index: number) => void; // 0, 1, 2, 3 (for 1-4 or A-D)
  onLeft?: () => void; // Trap
  onRight?: () => void; // True
  onNumberKey?: (num: number) => void; // 1-N for chunk or letter tiles
  onEnter?: () => void; // Next word or Chop
  onReplay?: () => void; // R key
  onHint?: () => void; // H key
}

export function useKeyboard(actions: KeyboardActions, enabled = true) {
  const { state } = useGame();

  useEffect(() => {
    if (!enabled || !state.settings.keyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Do not bind Space (it natively activates focused buttons)
      if (e.key === ' ' || e.code === 'Space') {
        return;
      }

      const key = e.key.toUpperCase();

      // Enter key
      if (e.key === 'Enter') {
        if (actions.onEnter) {
          e.preventDefault();
          actions.onEnter();
        }
        return;
      }

      // Replay audio: 'R'
      if (key === 'R') {
        if (actions.onReplay) {
          e.preventDefault();
          actions.onReplay();
        }
        return;
      }

      // Hint: 'H'
      if (key === 'H') {
        if (actions.onHint) {
          e.preventDefault();
          actions.onHint();
        }
        return;
      }

      // Left / Right arrows
      if (e.key === 'ArrowLeft') {
        if (actions.onLeft) {
          e.preventDefault();
          actions.onLeft();
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        if (actions.onRight) {
          e.preventDefault();
          actions.onRight();
        }
        return;
      }

      // Option letters A-D
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const index = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (actions.onOption) {
          e.preventDefault();
          actions.onOption(index);
        }
        return;
      }

      // Numbers 1-9
      if (/^[1-9]$/.test(e.key)) {
        const num = parseInt(e.key, 10);
        // If onOption is also provided, numbers 1-4 can map to options
        if (actions.onOption && num >= 1 && num <= 4) {
          e.preventDefault();
          actions.onOption(num - 1);
        } else if (actions.onNumberKey) {
          e.preventDefault();
          actions.onNumberKey(num);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, enabled, state.settings.keyboardShortcuts]);
}
