import { Capacitor, registerPlugin } from '@capacitor/core';
import type { LanguageCode, VoiceGender } from '../types';

interface BibleAudioPlugin {
  speak(options: {
    text: string;
    locale: string;
    pitch: number;
    rate: number;
    voiceGender: VoiceGender;
  }): Promise<{ unavailable?: boolean; error?: string }>;
  stop(): Promise<void>;
  playChime(options: { kind: 'tap' | 'correct' | 'wrong' | 'complete' }): Promise<void>;
}

const BibleAudio = registerPlugin<BibleAudioPlugin>('BibleAudio');

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

const VERSE_WORD_BY_LANG: Record<LanguageCode, string> = {
  en: 'verse',
  fr: 'verset',
  pt: 'versículo',
  ar: 'الآية',
  hi: 'पद',
  it: 'versetto',
  sw: 'mstari',
  es: 'versículo',
  de: 'Vers',
  zh: '节',
};

export const VOICE_PRESETS: Record<VoiceGender, { pitch: number; rate: number }> = {
  kids: { pitch: 1.75, rate: 1.1 },
  teen: { pitch: 1.3, rate: 1.05 },
  female: { pitch: 1.05, rate: 0.95 },
  male: { pitch: 0.75, rate: 0.92 },
};

const GOOGLE_TTS_CLIENT_MAP: Record<LanguageCode, string> = {
  en: 'en',
  it: 'it',
  sw: 'sw',
  fr: 'fr',
  es: 'es',
  pt: 'pt',
  de: 'de',
  ar: 'ar',
  hi: 'hi',
  zh: 'zh-CN',
};

let activeSpeechToken = 0;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesPreloadAttached = false;
let activeHtmlAudio: HTMLAudioElement | null = null;
const cloudAudioBlobCache = new Map<string, string>();

export function preloadSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  try {
    const synth = window.speechSynthesis;
    const current = synth.getVoices();
    if (current.length > 0) {
      cachedVoices = current;
    }
    if (!voicesPreloadAttached) {
      voicesPreloadAttached = true;
      synth.addEventListener('voiceschanged', () => {
        const loaded = synth.getVoices();
        if (loaded.length > 0) cachedVoices = loaded;
      });
    }
    return cachedVoices;
  } catch {
    return cachedVoices;
  }
}

export function warmUpSpeechGesture(): void {
  unlockWebAudioOnGesture();
  preloadSpeechVoices();
}

export function stopSpeaking(): void {
  activeSpeechToken += 1;
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
      activeHtmlAudio.src = '';
    } catch {}
    activeHtmlAudio = null;
  }
  if (Capacitor.isNativePlatform()) {
    BibleAudio.stop().catch(() => {});
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

function prepareSpeechText(raw: string, lang: LanguageCode = 'en'): string {
  const verseWord = VERSE_WORD_BY_LANG[lang] || 'verse';
  const separator = lang === 'ar' ? '، ' : ', ';
  return raw
    .replace(/[«»“”„‟〔〕]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*—\s*/g, '. ')
    .replace(/(\d+):(\d+)/g, `$1${separator}${verseWord} $2`)
    .trim();
}

function splitIntoNaturalChunks(text: string, lang: LanguageCode): string[] {
  const cleaned = prepareSpeechText(text, lang);
  if (cleaned.length <= 165) return [cleaned];
  const sentences = cleaned.split(/(?<=[.!?।؟。！？،؛,;:])\s*/).filter(Boolean);
  const chunks: string[] = [];
  let buffer = '';
  for (const s of sentences) {
    if (s.length > 175) {
      if (buffer.trim()) {
        chunks.push(buffer.trim());
        buffer = '';
      }
      const words = s.split(/\s+/).filter(Boolean);
      let wordBuf = '';
      for (const w of words) {
        if (wordBuf && wordBuf.length + w.length + 1 > 175) {
          chunks.push(wordBuf.trim());
          wordBuf = w;
        } else {
          wordBuf = wordBuf ? `${wordBuf} ${w}` : w;
        }
      }
      if (wordBuf.trim()) chunks.push(wordBuf.trim());
    } else if (buffer && buffer.length + s.length + 1 > 175) {
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
  if (
    [
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
    ].some((p) => name.includes(p))
  ) {
    score -= 200;
  }
  if (lang === targetLocale.toLowerCase()) score += 80;
  else if (lang.startsWith(prefix)) score += 50;
  else score -= 80;

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

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
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
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const prefix = targetLocale.split('-')[0].toLowerCase();
  const localeVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  if (localeVoices.length === 0) {
    if (prefix !== 'en') return undefined;
  }
  const basePool = localeVoices.length > 0 ? localeVoices : voices;
  const localPool = isOffline ? basePool.filter((v) => v.localService) : [];
  const pool = localPool.length > 0 ? localPool : basePool;

  if (voiceGender === 'male') {
    const maleMatches = pool.filter((v) => isMaleVoiceName(v.name.toLowerCase()));
    if (maleMatches.length > 0) {
      return maleMatches.reduce((best, cur) =>
        scoreSystemVoice(cur, targetLocale, voiceGender) >
        scoreSystemVoice(best, targetLocale, voiceGender)
          ? cur
          : best
      );
    }
  } else if (voiceGender === 'female' || voiceGender === 'kids') {
    const femaleMatches = pool.filter((v) => isFemaleVoiceName(v.name.toLowerCase()));
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

export interface SpeakOptions {
  pitch?: number;
  rate?: number;
}

function playAudioSourceUrl(
  src: string,
  rate: number,
  token: number
): Promise<boolean> {
  return new Promise((resolve) => {
    if (token !== activeSpeechToken || typeof Audio === 'undefined') {
      resolve(false);
      return;
    }

    const audio = new Audio(src);
    audio.playbackRate = clamp(rate, 0.75, 1.35);
    activeHtmlAudio = audio;
    let done = false;

    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
      audio.onended = null;
      audio.onerror = null;
      resolve(ok);
    };

    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);

    audio.play().catch(() => finish(false));
  });
}

async function speakWithCloudAudio(
  rawText: string,
  lang: LanguageCode,
  voiceGender: VoiceGender,
  options: SpeakOptions,
  token: number,
  onEnd?: () => void
): Promise<boolean> {
  if (typeof window === 'undefined' || token !== activeSpeechToken) {
    onEnd?.();
    return false;
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  const preset = VOICE_PRESETS[voiceGender] || VOICE_PRESETS.female;
  const targetRate = clamp(options.rate ?? preset.rate, 0.75, 1.3);
  const cleaned = prepareSpeechText(rawText, lang);
  if (!cleaned) {
    onEnd?.();
    return true;
  }

  if (!Capacitor.isNativePlatform()) {
    const cacheKey = `${lang}:${voiceGender}:${cleaned}`;
    let blobUrl = cloudAudioBlobCache.get(cacheKey);
    if (!blobUrl) {
      try {
        const resp = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleaned,
            lang,
            gender: voiceGender,
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (resp.ok) {
          const blob = await resp.blob();
          if (blob.size > 0) {
            if (cloudAudioBlobCache.size >= 60) {
              const firstKey = cloudAudioBlobCache.keys().next().value;
              if (firstKey) {
                const oldUrl = cloudAudioBlobCache.get(firstKey);
                if (oldUrl) URL.revokeObjectURL(oldUrl);
                cloudAudioBlobCache.delete(firstKey);
              }
            }
            blobUrl = URL.createObjectURL(blob);
            cloudAudioBlobCache.set(cacheKey, blobUrl);
          }
        }
      } catch {
        // Fall through to direct chunked audio playback below
      }
    }

    if (token !== activeSpeechToken) return false;
    if (blobUrl) {
      const ok = await playAudioSourceUrl(blobUrl, targetRate, token);
      if (token !== activeSpeechToken) return false;
      if (ok) {
        onEnd?.();
        return true;
      }
    }
  }

  // Fallback for Capacitor Android APK or when /api/tts is unavailable:
  // HTML5 <audio> plays cross-origin MP3 chunks cleanly without CORS restrictions.
  const tl = GOOGLE_TTS_CLIENT_MAP[lang] || 'en';
  const chunks = splitIntoNaturalChunks(cleaned, lang);
  for (let i = 0; i < chunks.length; i++) {
    if (token !== activeSpeechToken) return false;
    const chunk = chunks[i];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(chunk)}&total=${chunks.length}&idx=${i}&textlen=${chunk.length}`;
    const ok = await playAudioSourceUrl(url, targetRate, token);
    if (!ok) {
      return false;
    }
  }
  if (token === activeSpeechToken) onEnd?.();
  return true;
}

function speakWithWebSpeech(
  rawText: string,
  lang: LanguageCode,
  voiceGender: VoiceGender,
  options: SpeakOptions,
  token: number,
  onEnd?: () => void
): void {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    void speakWithCloudAudio(rawText, lang, voiceGender, options, token, onEnd).then((ok) => {
      if (!ok && token === activeSpeechToken) onEnd?.();
    });
    return;
  }

  const preset = VOICE_PRESETS[voiceGender] || VOICE_PRESETS.female;
  const targetPitch = clamp(options.pitch ?? preset.pitch, 0.7, 1.85);
  const targetRate = clamp(options.rate ?? preset.rate, 0.7, 1.3);

  const runChunks = () => {
    if (token !== activeSpeechToken) return;
    const synth = window.speechSynthesis;
    try {
      synth.cancel();
    } catch {
      // ignore cancel errors
    }
    const availableVoices = preloadSpeechVoices();
    const targetLocale = LANG_BCP47[lang] || 'en-US';
    const prefix = targetLocale.split('-')[0].toLowerCase();
    const picked = pickSystemVoice(availableVoices, targetLocale, voiceGender);
    const hasNativeVoice = availableVoices.some((v) =>
      v.lang.toLowerCase().startsWith(prefix)
    );

    // For Arabic when online (or any language lacking an installed voice in browser/OS),
    // never fall back to an English/stub voice that only reads numbers. Use Cloud Audio.
    if (isOnline && (!hasNativeVoice || lang === 'ar')) {
      void speakWithCloudAudio(rawText, lang, voiceGender, options, token, onEnd).then(
        (ok) => {
          if (!ok && token === activeSpeechToken) {
            onEnd?.();
          }
        }
      );
      return;
    }

    if (!hasNativeVoice && lang !== 'en') {
      onEnd?.();
      return;
    }

    const chunks = splitIntoNaturalChunks(rawText, lang);

    const speakChunk = (idx: number) => {
      if (token !== activeSpeechToken) return;
      if (idx >= chunks.length) {
        onEnd?.();
        return;
      }

      const chunkText = chunks[idx];
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = targetLocale;
      if (picked) utterance.voice = picked;
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

      const fallbackToCloudOrEnd = () => {
        if (settled) return;
        settled = true;
        clearTimers();
        try {
          synth.cancel();
        } catch {}
        if (token !== activeSpeechToken) return;
        if (isOnline && idx === 0) {
          void speakWithCloudAudio(rawText, lang, voiceGender, options, token, onEnd).then(
            (ok) => {
              if (!ok && token === activeSpeechToken) onEnd?.();
            }
          );
          return;
        }
        onEnd?.();
      };

      utterance.onstart = () => {
        if (startGuardTimer !== null) {
          window.clearTimeout(startGuardTimer);
          startGuardTimer = null;
        }
        const estimatedMs = Math.max(7000, Math.round((chunkText.length * 140) / targetRate));
        maxDurationTimer = window.setTimeout(() => {
          fallbackToCloudOrEnd();
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
        fallbackToCloudOrEnd();
      };

      startGuardTimer = window.setTimeout(() => {
        if (!settled && token === activeSpeechToken && !synth.speaking && !synth.pending) {
          fallbackToCloudOrEnd();
        }
      }, 1400);

      try {
        synth.speak(utterance);
      } catch {
        fallbackToCloudOrEnd();
      }
    };

    speakChunk(0);
  };

  if (preloadSpeechVoices().length > 0) {
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
  window.setTimeout(startOnce, 120);
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
  const cleanedText = prepareSpeechText(text, lang);
  const preset = VOICE_PRESETS[voiceGender] || VOICE_PRESETS.female;
  const targetPitch = clamp(options.pitch ?? preset.pitch, 0.7, 1.85);
  const targetRate = clamp(options.rate ?? preset.rate, 0.7, 1.3);
  const targetLocale = LANG_BCP47[lang] || 'en-US';

  if (Capacitor.isNativePlatform()) {
    BibleAudio.speak({
      text: cleanedText,
      locale: targetLocale,
      pitch: targetPitch,
      rate: targetRate,
      voiceGender,
    })
      .then((res) => {
        if (token !== activeSpeechToken) return;
        if (res?.unavailable || res?.error) {
          speakWithWebSpeech(text, lang, voiceGender, options, token, onEnd);
          return;
        }
        onEnd?.();
      })
      .catch(() => {
        if (token !== activeSpeechToken) return;
        speakWithWebSpeech(text, lang, voiceGender, options, token, onEnd);
      });
    return;
  }

  speakWithWebSpeech(text, lang, voiceGender, options, token, onEnd);
}

let audioCtx: AudioContext | null = null;
let gestureUnlockInstalled = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
    ctx.resume().catch(() => {});
  }
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {}
}

if (typeof window !== 'undefined' && !gestureUnlockInstalled) {
  gestureUnlockInstalled = true;
  preloadSpeechVoices();
  const handleFirstGesture = () => {
    unlockWebAudioOnGesture();
    preloadSpeechVoices();
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

function playWebAudioChime(kind: 'tap' | 'correct' | 'wrong' | 'complete'): void {
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
      gain.gain.exponentialRampToValueAtTime(gainLevel, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
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
    ctx.resume().then(scheduleNotes).catch(() => {});
  } else {
    scheduleNotes();
  }
}

export function playChime(kind: 'tap' | 'correct' | 'wrong' | 'complete', enabled: boolean): void {
  if (!enabled) return;
  if (Capacitor.isNativePlatform()) {
    BibleAudio.playChime({ kind }).catch(() => {
      playWebAudioChime(kind);
    });
    return;
  }
  playWebAudioChime(kind);
}
