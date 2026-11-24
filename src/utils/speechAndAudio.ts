import { Capacitor, registerPlugin } from '@capacitor/core';
import { LanguageCode, VoiceGender } from '../types';

interface BibleAudioNativePlugin {
  speak(options: {
    text: string;
    locale: string;
    pitch: number;
    rate: number;
    voiceGender: VoiceGender;
  }): Promise<{ completed?: boolean; unavailable?: boolean; error?: boolean }>;
  stop(): Promise<void>;
  playChime(options: {
    kind: 'correct' | 'wrong' | 'complete' | 'tap';
  }): Promise<void>;
}

const BibleAudio = registerPlugin<BibleAudioNativePlugin>('BibleAudio');

const LANG_BCP47: Record<LanguageCode, string> = {
  en: 'en-US',
  it: 'it-IT',
  sw: 'sw-KE',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-BR',
  de: 'de-DE',
  ar: 'ar-SA',
  hi: 'hi-IN',
  zh: 'zh-CN',
};

export const VOICE_PRESETS: Record<
  VoiceGender,
  { pitch: number; rate: number }
> = {
  kids: { pitch: 1.75, rate: 1.1 },
  teen: { pitch: 1.3, rate: 1.05 },
  female: { pitch: 1.05, rate: 0.95 },
  male: { pitch: 0.75, rate: 0.92 },
};

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
}

let activeSpeechToken = 0;

export function stopSpeaking(): void {
  activeSpeechToken += 1;
  if (Capacitor.isNativePlatform()) {
    void BibleAudio.stop().catch(() => {});
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

function prepareSpeechText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\s*—\s*/g, '. ')
    .replace(/(\d+):(\d+)/g, '$1, verse $2')
    .trim();
}

function splitIntoNaturalChunks(text: string): string[] {
  const cleaned = prepareSpeechText(text);
  if (cleaned.length <= 150) return [cleaned];
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let buffer = '';
  for (const s of sentences) {
    if (buffer && buffer.length + s.length + 1 > 160) {
      chunks.push(buffer.trim());
      buffer = s;
    } else {
      buffer = buffer ? `${buffer} ${s}` : s;
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks.length > 0 ? chunks : [cleaned];
}

function isFemaleVoiceName(name: string): boolean {
  return (
    /\bfemale\b|\bwoman\b|\bgirl\b|\bchild\b|\bkid\b/.test(name) ||
    [
      'samantha',
      'aria',
      'jenny',
      'sonia',
      'libby',
      'ava',
      'allison',
      'karen',
      'victoria',
      'moira',
      'tessa',
      'serena',
      'zira',
      'hazel',
      'susan',
      'fiona',
      'emma',
      'claire',
      'sara',
      'sofia',
      'elsa',
      'helena',
      'paulina',
      'monica',
      'amelie',
      'alice',
      'katja',
      'hedda',
      'luciana',
      'lekha',
      'ting-ting',
      'tingting',
      'google us english',
    ].some((hint) => name.includes(hint))
  );
}

function isMaleVoiceName(name: string): boolean {
  return (
    /\bmale\b|\bman\b|\bboy\b/.test(name) ||
    [
      'daniel',
      'alex',
      'arthur',
      'oliver',
      'david',
      'george',
      'guy',
      'ryan',
      'mark',
      'christopher',
      'eric',
      'andrew',
      'thomas',
      'matthew',
      'rishi',
      'aaron',
      'gordon',
      'fred',
      'jorge',
      'diego',
      'luca',
      'stefan',
      'henrik',
      'maged',
      'tarik',
      'liam',
      'james',
      'reed',
      'eddy',
      'rocko',
      'sandy',
    ].some((hint) => name.includes(hint))
  );
}

function scoreSystemVoice(
  voice: SpeechSynthesisVoice,
  targetLocale: string,
  voiceGender: VoiceGender
): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  const prefix = targetLocale.split('-')[0].toLowerCase();

  let score = 0;

  // Reject novelty/robotic voices strongly
  const lowQualityPatterns = [
    'espeak',
    'compact',
    'zarvox',
    'trinoids',
    'boing',
    'bubbles',
    'bells',
    'whisper',
    'wobble',
    'cellos',
    'organ',
    'albert',
    'bad news',
    'good news',
    'hysterical',
    'deranged',
    'ralph',
    'kathy',
    'princess',
    'junior',
    'jester',
    'superstar',
  ];
  if (lowQualityPatterns.some((p) => name.includes(p))) {
    score -= 200;
  }

  // Language match
  if (lang === targetLocale.toLowerCase()) score += 80;
  else if (lang.startsWith(prefix)) score += 50;
  else score -= 80;

  // Neural / Natural / Enhanced voice quality bonuses
  if (
    name.includes('natural') ||
    name.includes('neural') ||
    name.includes('online') ||
    name.includes('enhanced') ||
    name.includes('premium') ||
    name.includes('wavenet') ||
    name.includes('siri')
  ) {
    score += 65;
  }
  if (name.includes('google')) score += 35;

  const isOffline =
    typeof navigator !== 'undefined' && navigator.onLine === false;
  if (isOffline) {
    if (voice.localService) score += 90;
    else score -= 120;
  } else if (!voice.localService) {
    score += 15;
  }

  const isFemale = isFemaleVoiceName(name);
  const isMale = isMaleVoiceName(name);

  if (voiceGender === 'male') {
    if (isMale) score += 120;
    if (isFemale) score -= 120;
  } else if (voiceGender === 'kids') {
    if (/\bchild\b|\bkid\b|\bgirl\b/.test(name)) score += 90;
    if (isFemale) score += 85;
    if (isMale) score -= 120;
  } else if (voiceGender === 'female') {
    if (isFemale) score += 110;
    if (isMale) score -= 110;
  } else {
    // teen: prefer youthful / brighter female or neutral voices
    if (isFemale) score += 60;
    if (isMale) score -= 40;
  }

  return score;
}

function pickSystemVoice(
  voices: SpeechSynthesisVoice[],
  targetLocale: string,
  voiceGender: VoiceGender
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  const isOffline =
    typeof navigator !== 'undefined' && navigator.onLine === false;
  const prefix = targetLocale.split('-')[0].toLowerCase();
  const localeVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(prefix)
  );
  const basePool = localeVoices.length > 0 ? localeVoices : voices;
  const localPool = isOffline
    ? basePool.filter((v) => v.localService)
    : [];
  const pool = localPool.length > 0 ? localPool : basePool;

  // Explicit gender pass for Male vs Female/Kids before fallback scoring
  if (voiceGender === 'male') {
    const maleMatches = pool.filter((v) =>
      isMaleVoiceName(v.name.toLowerCase())
    );
    if (maleMatches.length > 0) {
      return maleMatches.reduce((best, cur) =>
        scoreSystemVoice(cur, targetLocale, voiceGender) >
        scoreSystemVoice(best, targetLocale, voiceGender)
          ? cur
          : best
      );
    }
  } else if (voiceGender === 'female' || voiceGender === 'kids') {
    const femaleMatches = pool.filter((v) =>
      isFemaleVoiceName(v.name.toLowerCase())
    );
    if (femaleMatches.length > 0) {
      return femaleMatches.reduce((best, cur) =>
        scoreSystemVoice(cur, targetLocale, voiceGender) >
        scoreSystemVoice(best, targetLocale, voiceGender)
          ? cur
          : best
      );
    }
  }

  let best = pool[0];
  let bestScore = -Infinity;
  for (const v of pool) {
    const s = scoreSystemVoice(v, targetLocale, voiceGender);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

function speakWithWebSpeech(
  text: string,
  lang: LanguageCode,
  voiceGender: VoiceGender,
  options: SpeakOptions,
  token: number,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  const preset = VOICE_PRESETS[voiceGender] || VOICE_PRESETS.female;
  const targetPitch = clamp(options.pitch ?? preset.pitch, 0.7, 1.85);
  const targetRate = clamp(options.rate ?? preset.rate, 0.7, 1.3);

  const runChunks = () => {
    if (token !== activeSpeechToken) return;
    const synth = window.speechSynthesis;
    const wasBusy = synth.speaking || synth.pending;
    synth.cancel();

    const targetLocale = LANG_BCP47[lang] || 'en-US';
    const voices = synth.getVoices();
    const picked = pickSystemVoice(voices, targetLocale, voiceGender);
    const chunks = splitIntoNaturalChunks(text);

    const speakChunk = (idx: number) => {
      if (token !== activeSpeechToken) return;
      if (idx >= chunks.length) {
        onEnd?.();
        return;
      }

      const chunkText = chunks[idx];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = targetLocale;
      if (picked) {
        utterance.voice = picked;
      }
      utterance.pitch = targetPitch;
      utterance.rate = targetRate;
      utterance.volume = 1;

      let settled = false;
      let startGuardTimer: number | null = null;
      let maxDurationTimer: number | null = null;

      const clearTimers = () => {
        if (startGuardTimer !== null) {
          window.clearTimeout(startGuardTimer);
          startGuardTimer = null;
        }
        if (maxDurationTimer !== null) {
          window.clearTimeout(maxDurationTimer);
          maxDurationTimer = null;
        }
      };

      const finishSequenceEarly = () => {
        if (settled) return;
        settled = true;
        clearTimers();
        try {
          synth.cancel();
        } catch {
          // ignore
        }
        if (token === activeSpeechToken) {
          onEnd?.();
        }
      };

      utterance.onstart = () => {
        if (startGuardTimer !== null) {
          window.clearTimeout(startGuardTimer);
          startGuardTimer = null;
        }
        const estimatedMs = Math.max(
          7000,
          Math.round((chunkText.length * 140) / targetRate)
        );
        maxDurationTimer = window.setTimeout(() => {
          finishSequenceEarly();
        }, estimatedMs);
      };

      utterance.onend = () => {
        if (settled) return;
        settled = true;
        clearTimers();
        if (token !== activeSpeechToken) return;
        speakChunk(idx + 1);
      };

      utterance.onerror = () => {
        if (settled) return;
        settled = true;
        clearTimers();
        if (token !== activeSpeechToken) return;
        onEnd?.();
      };

      // Guard against browsers/iframes that silently block speechSynthesis without firing onerror/onend
      startGuardTimer = window.setTimeout(() => {
        if (
          !settled &&
          token === activeSpeechToken &&
          !synth.speaking &&
          !synth.pending
        ) {
          finishSequenceEarly();
        }
      }, 2200);

      try {
        synth.speak(utterance);
      } catch {
        finishSequenceEarly();
      }
    };

    if (wasBusy) {
      window.setTimeout(() => speakChunk(0), 50);
    } else {
      speakChunk(0);
    }
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    runChunks();
    return;
  }

  let started = false;
  const startOnce = () => {
    if (started) return;
    started = true;
    window.speechSynthesis.removeEventListener('voiceschanged', startOnce);
    runChunks();
  };
  window.speechSynthesis.addEventListener('voiceschanged', startOnce);
  window.setTimeout(startOnce, 250);
}

export function speakText(
  text: string,
  lang: LanguageCode,
  voiceGender: VoiceGender,
  onEnd?: () => void,
  options: SpeakOptions = {}
): void {
  if (typeof window === 'undefined') {
    onEnd?.();
    return;
  }

  stopSpeaking();
  const token = activeSpeechToken;
  const cleanedText = prepareSpeechText(text);
  const preset = VOICE_PRESETS[voiceGender] || VOICE_PRESETS.female;
  const targetPitch = clamp(options.pitch ?? preset.pitch, 0.7, 1.85);
  const targetRate = clamp(options.rate ?? preset.rate, 0.7, 1.3);
  const targetLocale = LANG_BCP47[lang] || 'en-US';

  if (Capacitor.isNativePlatform()) {
    void BibleAudio.speak({
      text: cleanedText,
      locale: targetLocale,
      pitch: targetPitch,
      rate: targetRate,
      voiceGender,
    })
      .then((res) => {
        if (token !== activeSpeechToken) return;
        if (res?.unavailable || res?.error) {
          speakWithWebSpeech(
            cleanedText,
            lang,
            voiceGender,
            options,
            token,
            onEnd
          );
          return;
        }
        onEnd?.();
      })
      .catch(() => {
        if (token !== activeSpeechToken) return;
        speakWithWebSpeech(cleanedText, lang, voiceGender, options, token, onEnd);
      });
    return;
  }

  speakWithWebSpeech(cleanedText, lang, voiceGender, options, token, onEnd);
}

let audioCtx: AudioContext | null = null;
let gestureUnlockInstalled = false;

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
  return audioCtx;
}

function unlockWebAudioOnGesture(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined' && !gestureUnlockInstalled) {
  gestureUnlockInstalled = true;
  const handleFirstGesture = () => {
    unlockWebAudioOnGesture();
    if (audioCtx && audioCtx.state === 'running') {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    }
  };
  window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
  window.addEventListener('touchstart', handleFirstGesture, { passive: true });
  window.addEventListener('keydown', handleFirstGesture, { passive: true });
}

function playWebAudioChime(
  kind: 'correct' | 'wrong' | 'complete' | 'tap'
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const scheduleNotes = () => {
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
      gain.gain.exponentialRampToValueAtTime(
        gainLevel,
        now + startOffset + 0.02
      );
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
  };

  if (ctx.state === 'suspended') {
    ctx
      .resume()
      .then(scheduleNotes)
      .catch(() => {});
  } else {
    scheduleNotes();
  }
}

export function playChime(
  kind: 'correct' | 'wrong' | 'complete' | 'tap',
  enabled: boolean
): void {
  if (!enabled) return;

  if (Capacitor.isNativePlatform()) {
    void BibleAudio.playChime({ kind }).catch(() => {
      playWebAudioChime(kind);
    });
    return;
  }

  playWebAudioChime(kind);
}
