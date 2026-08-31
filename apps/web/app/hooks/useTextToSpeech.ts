import { useState, useRef, useCallback, useEffect } from "react";

export interface UseTextToSpeechOptions {
  /** Language/locale for the voice (default: "en-US") */
  lang?: string;
  /** Speech rate: 0.1–10. Default 1 */
  rate?: number;
  /** Speech pitch: 0–2. Default 1 */
  pitch?: number;
  /** Speech volume: 0–1. Default 1 */
  volume?: number;
  /** Preferred voice name (partial match). Falls back to first available voice for the lang. */
  voiceName?: string;
}

export interface UseTextToSpeechReturn {
  /** Whether TTS is currently playing */
  isSpeaking: boolean;
  /** Whether TTS is supported in this browser */
  isSupported: boolean;
  /** Whether auto-read is enabled */
  autoRead: boolean;
  /** Toggle auto-read on/off */
  toggleAutoRead: () => void;
  /** Speak the provided text immediately */
  speak: (text: string) => void;
  /** Stop any ongoing speech */
  stop: () => void;
}

export function useTextToSpeech(
  options: UseTextToSpeechOptions = {},
): UseTextToSpeechReturn {
  const {
    lang = "en-US",
    rate = 1,
    pitch = 1,
    volume = 1,
    voiceName,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

  /** Resolve the best available voice */
  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!isSupported) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    if (voiceName) {
      const named = voices.find((v) =>
        v.name.toLowerCase().includes(voiceName.toLowerCase()),
      );
      if (named) return named;
    }

    // Prefer a local voice for the given lang
    const local = voices.find((v) => v.lang.startsWith(lang) && v.localService);
    if (local) return local;

    // Fall back to any voice matching the lang
    return voices.find((v) => v.lang.startsWith(lang)) ?? voices[0] ?? null;
  }, [isSupported, lang, voiceName]);

  const stop = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;

      // Cancel anything currently playing
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const voice = getVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        // "interrupted" fires when we call cancel() ourselves — not a real error
        if (e.error !== "interrupted") {
          console.error("TTS error:", e.error);
        }
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, lang, rate, pitch, volume, getVoice],
  );

  const toggleAutoRead = useCallback(() => {
    setAutoRead((prev) => {
      const next = !prev;
      // If turning off, stop any ongoing speech
      if (!next) {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return { isSpeaking, isSupported, autoRead, toggleAutoRead, speak, stop };
}
