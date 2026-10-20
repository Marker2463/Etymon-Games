import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';

export function useSpeech() {
  const { state } = useGame();
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check support and load voices asynchronously
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
      }
    };

    updateVoices();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;

      // 2-second retry in case voices haven't loaded yet
      const timer = setTimeout(() => {
        updateVoices();
      }, 2000);

      return () => {
        clearTimeout(timer);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  const selectBestVoice = useCallback((): SpeechSynthesisVoice | undefined => {
    if (!voices || voices.length === 0) return undefined;

    // 1. Google US English
    const googleUs = voices.find(v => v.name.includes('Google US English'));
    if (googleUs) return googleUs;

    // 2. Any voice with lang "en-US"
    const enUs = voices.find(v => v.lang === 'en-US' || v.lang === 'en_US');
    if (enUs) return enUs;

    // 3. Any "en*" voice
    const anyEn = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (anyEn) return anyEn;

    // 4. Default voice
    return voices.find(v => v.default) || voices[0];
  }, [voices]);

  const speak = useCallback((ttsText: string, audioUrl?: string) => {
    // If sound is turned off in Settings, do not speak
    if (!state.settings.sound) return;

    // If custom audio file provided, play that
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play().catch(() => setIsSpeaking(false));
      return;
    }

    if (!isSupported || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech first

      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.lang = 'en-US';
      utterance.rate = state.settings.slowSpeech ? 0.6 : 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const chosenVoice = selectBestVoice();
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Etymon: Speech synthesis error', e);
      setIsSpeaking(false);
    }
  }, [isSupported, selectBestVoice, state.settings.slowSpeech, state.settings.sound]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
