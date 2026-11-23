import { LanguageCode, VoiceGender } from '../types';

const LANG_BCP47: Record<LanguageCode, string> = {
  en: 'en-US',
  lg: 'en-GB',
  sw: 'sw-KE',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-BR',
  de: 'de-DE',
  ar: 'ar-SA',
  hi: 'hi-IN',
  zh: 'zh-CN',
};

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(
  text: string,
  lang: LanguageCode,
  voiceGender: VoiceGender,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const targetLocale = LANG_BCP47[lang] || 'en-US';
  utterance.lang = targetLocale;

  const voices = window.speechSynthesis.getVoices();
  const prefix = targetLocale.split('-')[0].toLowerCase();
  const matchingVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(prefix)
  );

  if (matchingVoices.length > 0) {
    const wantsFemaleLike =
      voiceGender === 'female' || voiceGender === 'kids' || voiceGender === 'teen';
    const picked =
      matchingVoices.find((v) => {
        const lower = v.name.toLowerCase();
        return wantsFemaleLike
          ? lower.includes('female') ||
              lower.includes('samantha') ||
              lower.includes('google') ||
              lower.includes('zira') ||
              lower.includes('karen')
          : lower.includes('male') ||
              lower.includes('daniel') ||
              lower.includes('alex') ||
              lower.includes('david');
      }) || matchingVoices[0];
    utterance.voice = picked;
  }

  switch (voiceGender) {
    case 'kids':
      utterance.pitch = 1.32;
      utterance.rate = 1.0;
      break;
    case 'teen':
      utterance.pitch = 1.12;
      utterance.rate = 1.04;
      break;
    case 'female':
      utterance.pitch = 1.06;
      utterance.rate = 0.96;
      break;
    case 'male':
      utterance.pitch = 0.82;
      utterance.rate = 0.94;
      break;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playChime(
  kind: 'correct' | 'wrong' | 'complete' | 'tap',
  enabled: boolean
): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playTone = (
    freq: number,
    startOffset: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.12
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + startOffset);
    gain.gain.setValueAtTime(0.001, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + startOffset + duration
    );
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.02);
  };

  if (kind === 'tap') {
    playTone(540, 0, 0.07, 'sine', 0.06);
  } else if (kind === 'correct') {
    playTone(523.25, 0, 0.14, 'triangle', 0.12);
    playTone(659.25, 0.09, 0.16, 'triangle', 0.12);
    playTone(783.99, 0.18, 0.24, 'triangle', 0.14);
  } else if (kind === 'wrong') {
    playTone(310, 0, 0.16, 'sine', 0.1);
    playTone(245, 0.13, 0.22, 'sine', 0.1);
  } else if (kind === 'complete') {
    playTone(523.25, 0, 0.14, 'triangle', 0.12);
    playTone(659.25, 0.1, 0.14, 'triangle', 0.12);
    playTone(783.99, 0.2, 0.14, 'triangle', 0.12);
    playTone(1046.5, 0.3, 0.36, 'triangle', 0.15);
  }
}
