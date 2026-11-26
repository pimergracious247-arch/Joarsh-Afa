import { Capacitor } from '@capacitor/core';
import type { AgeGroup, BibleBookMeta, LanguageCode, StoryTheme, VerseItem } from '../types';
import {
  BIBLE_BOOKS,
  BOLLS_TRANSLATION_MAP,
  SECONDARY_BOLLS_TRANSLATION_MAP,
  findBookById,
  findBookByQuery,
  getLocalizedBookName,
  getTranslationCodesForLang,
} from '../data/bibleBooks';
import { getQuizCategoryById } from '../data/categories';
import { TRANSLATIONS } from '../data/translations';
import { getLocalizedTreasuryCard, TREASURY_CARDS } from '../data/treasuryCards';
import { BIBLE_VERSES } from '../data/verses';
import {
  getAllCachedChaptersFromIDB,
  getCachedChapterFromIDB,
  getLoadedPreCachedDailyVerses,
  getSavedVersesFromIDB,
  getViewedVerses,
  loadPreCachedDailyVerses,
  saveCachedChapterToIDB,
} from './offlineVerseStore';

export { BOLLS_TRANSLATION_MAP };

interface QuizPrompts {
  nameWithCluePrompt: string;
  nameInRefPrompt: string;
  numberWithCluePrompt: string;
  numberInRefPrompt: string;
  wordWithCluePrompt: string;
  wordInRefPrompt: string;
  chapterPrompt: string;
  chapterOption: string;
  bookPrompt: string;
  nextBookPrompt: string;
}

const QUIZ_PROMPTS_BY_LANG: Record<LanguageCode, QuizPrompts> = {
  en: {
    nameWithCluePrompt: 'In {ref}, which name appears with "{clue}"?',
    nameInRefPrompt: 'Which person or place is named in {ref}?',
    numberWithCluePrompt: 'In {ref}, which number is linked to "{clue}"?',
    numberInRefPrompt: 'Which number is recorded in {ref}?',
    wordWithCluePrompt: 'In {ref}, which word appears with "{clue}"?',
    wordInRefPrompt: 'Which of these words is found in {ref}?',
    chapterPrompt: 'Which chapter of {book} says: "{snippet}"?',
    chapterOption: 'Chapter {n}',
    bookPrompt: 'Which Bible book says: "{snippet}"?',
    nextBookPrompt: 'Which Bible book comes right after {book}?',
  },
  it: {
    nameWithCluePrompt: 'In {ref}, quale nome appare con "{clue}"?',
    nameInRefPrompt: 'Quale persona o luogo è nominato in {ref}?',
    numberWithCluePrompt: 'In {ref}, quale numero è legato a "{clue}"?',
    numberInRefPrompt: 'Quale numero è riportato in {ref}?',
    wordWithCluePrompt: 'In {ref}, quale parola appare con "{clue}"?',
    wordInRefPrompt: 'Quale di queste parole si trova in {ref}?',
    chapterPrompt: 'Quale capitolo di {book} dice: "{snippet}"?',
    chapterOption: 'Capitolo {n}',
    bookPrompt: 'Quale libro della Bibbia dice: "{snippet}"?',
    nextBookPrompt: 'Quale libro della Bibbia viene subito dopo {book}?',
  },
  sw: {
    nameWithCluePrompt: 'Katika {ref}, ni jina lipi linaloonekana na "{clue}"?',
    nameInRefPrompt: 'Ni mtu au mahali gani pametajwa katika {ref}?',
    numberWithCluePrompt: 'Katika {ref}, ni namba ipi inayohusiana na "{clue}"?',
    numberInRefPrompt: 'Ni namba ipi iliyoandikwa katika {ref}?',
    wordWithCluePrompt: 'Katika {ref}, ni neno lipi linaloonekana na "{clue}"?',
    wordInRefPrompt: 'Ni neno lipi kati ya haya lipo katika {ref}?',
    chapterPrompt: 'Ni sura gani ya {book} inayosema: "{snippet}"?',
    chapterOption: 'Sura ya {n}',
    bookPrompt: 'Ni kitabu gani cha Biblia kinachosema: "{snippet}"?',
    nextBookPrompt: 'Ni kitabu gani cha Biblia kinachofuata baada ya {book}?',
  },
  fr: {
    nameWithCluePrompt: 'Dans {ref}, quel nom apparaît avec « {clue} » ?',
    nameInRefPrompt: 'Quelle personne ou quel lieu est nommé dans {ref} ?',
    numberWithCluePrompt: 'Dans {ref}, quel nombre est lié à « {clue} » ?',
    numberInRefPrompt: 'Quel nombre est mentionné dans {ref} ?',
    wordWithCluePrompt: 'Dans {ref}, quel mot apparaît avec « {clue} » ?',
    wordInRefPrompt: 'Lequel de ces mots se trouve dans {ref} ?',
    chapterPrompt: 'Quel chapitre de {book} dit : « {snippet} » ?',
    chapterOption: 'Chapitre {n}',
    bookPrompt: 'Quel livre de la Bible dit : « {snippet} » ?',
    nextBookPrompt: 'Quel livre de la Bible vient juste après {book} ?',
  },
  es: {
    nameWithCluePrompt: 'En {ref}, ¿qué nombre aparece junto a "{clue}"?',
    nameInRefPrompt: '¿Qué persona o lugar se nombra en {ref}?',
    numberWithCluePrompt: 'En {ref}, ¿qué número se relaciona con "{clue}"?',
    numberInRefPrompt: '¿Qué número se registra en {ref}?',
    wordWithCluePrompt: 'En {ref}, ¿qué palabra aparece junto a "{clue}"?',
    wordInRefPrompt: '¿Cuál de estas palabras aparece en {ref}?',
    chapterPrompt: '¿Qué capítulo de {book} dice: "{snippet}"?',
    chapterOption: 'Capítulo {n}',
    bookPrompt: '¿Qué libro de la Biblia dice: "{snippet}"?',
    nextBookPrompt: '¿Qué libro de la Biblia sigue después de {book}?',
  },
  pt: {
    nameWithCluePrompt: 'Em {ref}, qual nome aparece com "{clue}"?',
    nameInRefPrompt: 'Qual pessoa ou lugar é citado em {ref}?',
    numberWithCluePrompt: 'Em {ref}, qual número está ligado a "{clue}"?',
    numberInRefPrompt: 'Qual número está registrado em {ref}?',
    wordWithCluePrompt: 'Em {ref}, qual palavra aparece com "{clue}"?',
    wordInRefPrompt: 'Qual destas palavras aparece em {ref}?',
    chapterPrompt: 'Qual capítulo de {book} diz: "{snippet}"?',
    chapterOption: 'Capítulo {n}',
    bookPrompt: 'Qual livro da Bíblia diz: "{snippet}"?',
    nextBookPrompt: 'Qual livro da Bíblia vem logo após {book}?',
  },
  de: {
    nameWithCluePrompt: 'Welcher Name steht in {ref} bei „{clue}“?',
    nameInRefPrompt: 'Welche Person oder welcher Ort wird in {ref} genannt?',
    numberWithCluePrompt: 'Welche Zahl steht in {ref} bei „{clue}“?',
    numberInRefPrompt: 'Welche Zahl wird in {ref} genannt?',
    wordWithCluePrompt: 'Welches Wort steht in {ref} bei „{clue}“?',
    wordInRefPrompt: 'Welches dieser Wörter steht in {ref}?',
    chapterPrompt: 'Welches Kapitel in {book} sagt: „{snippet}“?',
    chapterOption: 'Kapitel {n}',
    bookPrompt: 'Welches Bibelbuch sagt: „{snippet}“?',
    nextBookPrompt: 'Welches Bibelbuch folgt direkt nach {book}?',
  },
  ar: {
    nameWithCluePrompt: 'في {ref}، أي اسم ورد مع "{clue}"؟',
    nameInRefPrompt: 'أي شخص أو مكان ذُكر في {ref}؟',
    numberWithCluePrompt: 'في {ref}، أي رقم ارتبط بـ "{clue}"؟',
    numberInRefPrompt: 'أي رقم ورد في {ref}؟',
    wordWithCluePrompt: 'في {ref}، أي كلمة وردت مع "{clue}"؟',
    wordInRefPrompt: 'أي من هذه الكلمات وردت في {ref}؟',
    chapterPrompt: 'في أي أصحاح من {book} ورد: "{snippet}"؟',
    chapterOption: 'الأصحاح {n}',
    bookPrompt: 'أي سفر في الكتاب المقدس يقول: "{snippet}"؟',
    nextBookPrompt: 'أي سفر في الكتاب المقدس يأتي بعد {book} مباشرة؟',
  },
  hi: {
    nameWithCluePrompt: '{ref} में "{clue}" के साथ कौन-सा नाम आता है?',
    nameInRefPrompt: '{ref} में किस व्यक्ति या स्थान का नाम है?',
    numberWithCluePrompt: '{ref} में "{clue}" से कौन-सी संख्या जुड़ी है?',
    numberInRefPrompt: '{ref} में कौन-सी संख्या दर्ज है?',
    wordWithCluePrompt: '{ref} में "{clue}" के साथ कौन-सा शब्द आता है?',
    wordInRefPrompt: 'इनमें से कौन-सा शब्द {ref} में मिलता है?',
    chapterPrompt: '{book} के किस अध्याय में लिखा है: "{snippet}"?',
    chapterOption: 'अध्याय {n}',
    bookPrompt: 'बाइबिल की किस पुस्तक में लिखा है: "{snippet}"?',
    nextBookPrompt: 'बाइबिल में {book} के ठीक बाद कौन-सी पुस्तक आती है?',
  },
  zh: {
    nameWithCluePrompt: '在{ref}中，与“{clue}”一起出现的是哪个名字？',
    nameInRefPrompt: '{ref}中提到了哪个人物或地点？',
    numberWithCluePrompt: '在{ref}中，与“{clue}”相关的数字是多少？',
    numberInRefPrompt: '{ref}中记载了哪个数字？',
    wordWithCluePrompt: '在{ref}中，与“{clue}”一起出现的是哪个词？',
    wordInRefPrompt: '以下哪个词出现在{ref}中？',
    chapterPrompt: '《{book}》第几章记载：“{snippet}”？',
    chapterOption: '第 {n} 章',
    bookPrompt: '哪卷圣经记载：“{snippet}”？',
    nextBookPrompt: '圣经中紧接在《{book}》之后的是哪一卷？',
  },
};

const COMMON_STOP_WORDS = new Set([
  'that', 'this', 'with', 'from', 'they', 'were', 'have', 'been', 'will', 'shall', 'your',
  'their', 'them', 'when', 'then', 'there', 'which', 'what', 'into', 'upon', 'unto',
  'before', 'after', 'about', 'because', 'said', 'saying', 'also', 'more', 'than',
  'these', 'those', 'some', 'such', 'only', 'even', 'very', 'over', 'under', 'through',
  'where', 'while', 'would', 'could', 'should', 'every', 'each', 'other', 'much', 'many',
  'well', 'thus', 'therefore', 'neither', 'either', 'both', 'anyone', 'someone',
  'everyone', 'nothing', 'anything', 'something', 'everything', 'another', 'certain',
  'whether', 'between', 'without', 'within', 'among', 'until', 'unless', 'enough',
  'behold', 'indeed', 'already', 'always', 'never', 'against', 'himself', 'herself',
  'themselves', 'ourselves', 'yourselves', 'myself', 'yourself', 'whose', 'whom', 'since',
  'hence', 'still', 'again', 'forth', 'pour', 'dans', 'avec', 'mais', 'nous', 'vous',
  'elle', 'elles', 'leur', 'leurs', 'cette', 'sont', 'être', 'fait', 'tout', 'tous',
  'plus', 'comme', 'quand', 'aussi', 'para', 'como', 'pero', 'más', 'este', 'esta',
  'estos', 'estas', 'sobre', 'entre', 'todo', 'todos', 'porque', 'cuando', 'dijo',
  'ellos', 'ellas', 'nuestro', 'vuestro', 'dass', 'nicht', 'auch', 'noch', 'aber',
  'oder', 'sind', 'wird', 'sein', 'seine', 'seiner', 'seinem', 'seinen', 'einen',
  'einem', 'einer', 'eines', 'wenn', 'dann', 'doch', 'schon', 'durch', 'gegen',
  'unter', 'über', 'alle', 'alles', 'nach', 'mehr', 'sehr', 'ihre', 'ihnen',
  'che', 'non', 'per', 'con', 'una', 'sono', 'alla', 'dalla', 'della', 'nella',
  'come', 'anche', 'perché', 'quando', 'disse', 'loro', 'questo', 'questa',
  'questi', 'queste', 'quello', 'quella', 'sopra', 'sotto', 'molto', 'tutti',
  'tutte', 'aveva', 'erano', 'siamo', 'siete', 'essere', 'fatto', 'katika',
  'kwa', 'hii', 'wale', 'yake', 'wao', 'lakini', 'kwamba', 'kama', 'basi',
  'naye', 'nao', 'hata', 'tena', 'wote', 'yote', 'mwenye', 'kutoka', 'kwenda',
  'juu', 'chini', 'kila', 'huyo', 'hawa', 'yule', 'vile', 'sana', 'pamoja',
  'disse', 'porque', 'quando', 'sobre', 'entre', 'todos', 'todas', 'muito',
  'também', 'estava', 'foram', 'eram', 'seus', 'suas', 'nosso', 'vosso',
]);

const WEAK_TRAILING_CLUE_WORDS = new Set([
  'the', 'a', 'an', 'of', 'and', 'to', 'in', 'for', 'with', 'by', 'on', 'at', 'from',
  'that', 'which', 'as', 'is', 'was', 'are', 'were', 'or', 'into', 'unto', 'upon',
  'his', 'her', 'their', 'your', 'our', 'my', 'el', 'la', 'los', 'las', 'un', 'una',
  'unos', 'unas', 'de', 'del', 'al', 'en', 'con', 'por', 'para', 'y', 'o', 'que',
  'su', 'sus', 'se', 'le', 'les', 'du', 'des', 'et', 'il', 'lo', 'gli', 'i', 'le',
  'di', 'da', 'per', 'che', 'e', 'o', 'in', 'a', 'su', 'con', 'dei', 'degli', 'delle',
  'der', 'die', 'das', 'dem', 'den', 'des', 'ein', 'eine', 'und', 'mit', 'zu', 'zur',
  'zum', 'von', 'vom', 'auf', 'aus', 'bei', 'nach', 'für', 'na', 'ya', 'wa', 'za',
  'kwa', 'katika', 'ni', 'au', 'la', 'cha', 'vya', 'o', 'os', 'as', 'um', 'uma',
  'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'com', 'por',
]);

const NUMBER_WORDS = new Set([
  'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'hundred',
  'thousand', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh',
  'eighth', 'ninth', 'tenth', 'twelfth',
]);

type WordCategory = 'number' | 'proper' | 'noun_abstract' | 'past_ed' | 'ing' | 'ly' | 'plural_s' | 'general';

function stripBibleHtml(raw: string): string {
  return raw
    .replace(/<S>.*?<\/S>/gi, '')
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<(?:br|\/?p|\/?div)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHighlightPrefix(text: string): string {
  const commaIdx = text.indexOf(',');
  if (commaIdx > 8 && commaIdx < 65) return text.slice(0, commaIdx + 1);
  const words = text.split(' ');
  return words.slice(0, Math.min(6, words.length)).join(' ');
}

const LOCALIZED_NUMBER_WORDS: Record<LanguageCode, string[]> = {
  en: ['three', 'four', 'five', 'six', 'seven', 'ten', 'twelve', 'forty'],
  fr: ['trois', 'quatre', 'cinq', 'six', 'sept', 'dix', 'douze', 'quarante'],
  pt: ['três', 'quatro', 'cinco', 'seis', 'sete', 'dez', 'doze', 'quarenta'],
  ar: ['ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'عشرة', 'اثني عشر', 'أربعين'],
  hi: ['तीन', 'चार', 'पाँच', 'छह', 'सात', 'दस', 'बारह', 'चालीस'],
  it: ['tre', 'quattro', 'cinque', 'sei', 'sette', 'dieci', 'dodici', 'quaranta'],
  sw: ['tatu', 'nne', 'tano', 'sita', 'saba', 'kumi', 'kumi na mbili', 'arobaini'],
  es: ['tres', 'cuatro', 'cinco', 'seis', 'siete', 'diez', 'doce', 'cuarenta'],
  de: ['drei', 'vier', 'fünf', 'sechs', 'sieben', 'zehn', 'zwölf', 'vierzig'],
  zh: ['三', '四', '五', '六', '七', '十', '十二', '四十'],
};

function tokenizeVerseText(text: string): string[] {
  if (/\p{Script=Han}/u.test(text)) {
    const clauses = text.split(/[，。；：、！？「」『』《》〈〉（）()\s]+/).filter(Boolean);
    const out: string[] = [];
    for (const c of clauses) {
      const subs = c.split(/[的了着在是和与于乃也必]+/).filter(Boolean);
      for (const s of subs) {
        if (s.length >= 2 && s.length <= 6) {
          out.push(s);
        } else if (s.length > 6) {
          for (let i = 0; i + 2 <= s.length; i += 2) {
            out.push(s.slice(i, Math.min(i + 2, s.length)));
          }
        }
      }
    }
    return out;
  }
  return text.split(/\s+/).filter(Boolean);
}

function stripTokenPunctuation(token: string): string {
  return token.replace(/^[^\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+$/gu, '');
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function classifyStoryTheme(bookName: string, verseText: string): StoryTheme {
  const combined = `${bookName} ${verseText}`.toLowerCase();
  if (/(noah|ark|flood|rainbow|dove|creation|genesis)/i.test(combined)) return 'noah';
  if (/(whale|jonah|sea|ocean|waves|ship|fish|boat|storm|waters)/i.test(combined)) return 'whale';
  if (/(david|goliath|sling|king|throne|sword|battle|psalm|crown|kingdom)/i.test(combined)) return 'david';
  if (/(jesus|christ|shepherd|lamb|sheep|flock|hill|parable|grace|mercy|gospel)/i.test(combined)) return 'shepherd';
  return 'bible';
}

function classifyWordCategory(cleanWord: string, isProperOrMidCap: boolean): WordCategory {
  const lower = cleanWord.toLowerCase();
  if (/^\d[\d,]*$/.test(cleanWord) || NUMBER_WORDS.has(lower)) return 'number';
  if (isProperOrMidCap) return 'proper';
  if (/(?:tion|sion|ment|ness|ship|dom|ance|ence|ity)$/i.test(cleanWord)) return 'noun_abstract';
  if (/ed$/i.test(cleanWord) && cleanWord.length >= 5) return 'past_ed';
  if (/ing$/i.test(cleanWord) && cleanWord.length >= 6) return 'ing';
  if (/ly$/i.test(cleanWord) && cleanWord.length >= 5) return 'ly';
  if (/s$/i.test(cleanWord) && !/(?:ss|us|is|as|os)$/i.test(cleanWord) && cleanWord.length >= 5) {
    return 'plural_s';
  }
  return 'general';
}

function buildShuffledOptions(correctOption: string, distractors: string[]): { options: string[]; correctIndex: number } {
  const unique = [correctOption];
  const seenLower = new Set([correctOption.toLowerCase()]);
  for (const d of distractors) {
    const cleaned = d.trim();
    if (!cleaned || seenLower.has(cleaned.toLowerCase())) continue;
    seenLower.add(cleaned.toLowerCase());
    unique.push(cleaned);
    if (unique.length === 4) break;
  }
  const shuffled = shuffleArray(
    unique.map((label, idx) => ({
      label,
      isCorrect: idx === 0,
    }))
  );
  const correctIdx = shuffled.findIndex((e) => e.isCorrect);
  return {
    options: shuffled.map((e) => e.label),
    correctIndex: correctIdx >= 0 ? correctIdx : 0,
  };
}

function makeConciseSnippet(text: string, maxWords = 11): string {
  const words = text.replace(/^[“”"'«»„]+|[“”"'«»„]+$/g, '').trim().split(/\s+/).filter(Boolean);
  const joined = (words.length <= maxWords ? words : words.slice(0, maxWords))
    .join(' ')
    .replace(/^[“”"'«»„]+/, '')
    .replace(/[,:;—\-“”"'«»„]+$/, '')
    .trim();
  return words.length <= maxWords ? joined : `${joined}...`;
}

function extractContextClue(
  tokens: string[],
  targetIdx: number,
  targetClean: string,
  blockedWords: string[] = []
): string | null {
  const targetLower = targetClean.toLowerCase();
  const blockedSet = new Set(blockedWords.map((w) => w.toLowerCase()));
  const containsForbidden = (slice: string[]) =>
    slice.some((tok) => {
      const stripped = stripTokenPunctuation(tok).toLowerCase();
      return stripped === targetLower || blockedSet.has(stripped);
    });

  const candidateRanges: Array<[number, number]> = [
    [targetIdx + 1, Math.min(tokens.length, targetIdx + 6)],
    [Math.max(0, targetIdx - 5), targetIdx],
    [0, Math.min(tokens.length, 5)],
    [Math.max(0, tokens.length - 5), tokens.length],
  ];

  for (const [rawStart, rawEnd] of candidateRanges) {
    if (rawEnd - rawStart < 2) continue;
    const slice = tokens.slice(rawStart, rawEnd);
    if (containsForbidden(slice)) continue;
    const trimmed = [...slice];
    while (trimmed.length > 2 && WEAK_TRAILING_CLUE_WORDS.has(stripTokenPunctuation(trimmed[trimmed.length - 1]).toLowerCase())) {
      trimmed.pop();
    }
    while (trimmed.length > 2 && WEAK_TRAILING_CLUE_WORDS.has(stripTokenPunctuation(trimmed[0]).toLowerCase())) {
      trimmed.shift();
    }
    if (trimmed.length < 2) continue;
    const clue = trimmed
      .join(' ')
      .replace(/[“”"'«»„]/g, '')
      .replace(/^[,.;:!?—\-]+|[,.;:!?—\-]+$/g, '')
      .trim();
    const meaningfulCount = trimmed.filter((t) => stripTokenPunctuation(t).length >= 4).length;
    if (clue.length >= 9 && meaningfulCount >= 1) return clue;
  }
  return null;
}

const chapterMemoryCache = new Map<string, Array<{ verse: number; text: string }>>();

async function fetchBibleApiComChapterFallback(
  bookNameEn: string,
  chapter: number,
  signal?: AbortSignal
): Promise<Array<{ verse: number; text: string }>> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const forwardAbort = () => controller.abort();
    signal?.addEventListener('abort', forwardAbort, { once: true });
    try {
      const url = `https://bible-api.com/${encodeURIComponent(`${bookNameEn} ${chapter}`)}?translation=web`;
      const resp = await fetch(url, { signal: controller.signal });
      if (!resp.ok) return [];
      const data = (await resp.json()) as {
        verses?: Array<{ verse?: number; text?: string }>;
      };
      if (!Array.isArray(data?.verses)) return [];
      return data.verses
        .filter(
          (row): row is { verse: number; text: string } =>
            typeof row.verse === 'number' && typeof row.text === 'string'
        )
        .map((row) => ({
          verse: row.verse,
          text: stripBibleHtml(row.text),
        }))
        .filter((row) => row.text.length > 0);
    } finally {
      window.clearTimeout(timeout);
      signal?.removeEventListener('abort', forwardAbort);
    }
  } catch {
    return [];
  }
}

async function fetchBollsChapterClient(
  translation: string,
  bookId: number,
  chapter: number,
  signal?: AbortSignal,
  timeoutMs = 3500
): Promise<Array<{ verse: number; text: string }>> {
  const cacheKey = `${translation}:${bookId}:${chapter}`;
  const memHit = chapterMemoryCache.get(cacheKey);
  if (memHit && memHit.length > 0) return memHit;

  const idbHit = await getCachedChapterFromIDB(translation, bookId, chapter);
  if (idbHit && idbHit.length > 0) {
    chapterMemoryCache.set(cacheKey, idbHit);
    return idbHit;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return [];
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    const url = `https://bolls.life/get-text/${encodeURIComponent(translation)}/${bookId}/${chapter}/`;
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!Array.isArray(data)) return [];
    const cleaned = data
      .filter((row: unknown): row is { verse: number; text: string } => {
        return (
          typeof row === 'object' &&
          row !== null &&
          typeof (row as { verse?: unknown }).verse === 'number' &&
          typeof (row as { text?: unknown }).text === 'string'
        );
      })
      .map((row) => ({
        verse: row.verse,
        text: stripBibleHtml(row.text),
      }))
      .filter((row) => row.text.length > 0);
    if (cleaned.length > 0) {
      chapterMemoryCache.set(cacheKey, cleaned);
      void saveCachedChapterToIDB(translation, bookId, chapter, cleaned);
    }
    return cleaned;
  } catch {
    return [];
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

export async function preWarmOfflineQuizChapters(lang: LanguageCode): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  const primaryTrans = BOLLS_TRANSLATION_MAP[lang] || 'ESV';
  const starterChapters: Array<{ bookId: number; chapter: number }> = [
    { bookId: 1, chapter: 1 },
    { bookId: 1, chapter: 6 },
    { bookId: 9, chapter: 17 },
    { bookId: 19, chapter: 23 },
    { bookId: 40, chapter: 5 },
    { bookId: 43, chapter: 3 },
  ];
  await Promise.allSettled([
    loadPreCachedDailyVerses(),
    ...starterChapters.map(({ bookId, chapter }) =>
      fetchBollsChapterClient(primaryTrans, bookId, chapter)
    ),
  ]);
}

export interface ClientQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  reference: string;
  storyTheme: StoryTheme;
}

interface WordPoolEntry {
  word: string;
  isProperOrMidCap: boolean;
  category: WordCategory;
}

interface VerseCandidateRow {
  bookId: number;
  bookName: string;
  chapters: number;
  chapter: number;
  verse: number;
  text: string;
  transCode: string;
}

function buildBundledOfflineVerses(
  lang: LanguageCode,
  primaryTrans: string,
  daily50: VerseItem[],
  viewed: VerseItem[],
  saved: VerseItem[]
): VerseCandidateRow[] {
  const seenIds = new Set<string>();
  const rows: VerseCandidateRow[] = [];

  const pushVerse = (
    bookId: number,
    bookName: string,
    chapter: number,
    verse: number,
    text: string,
    transCode: string
  ) => {
    const clean = text.trim();
    if (clean.length < 22) return;
    const key = `${bookId}:${chapter}:${verse}:${transCode}`;
    if (seenIds.has(key)) return;
    seenIds.add(key);
    const meta = findBookById(bookId);
    rows.push({
      bookId,
      bookName: meta ? getLocalizedBookName(meta.id, lang) : bookName,
      chapters: meta?.chapters || 10,
      chapter,
      verse,
      text: clean,
      transCode,
    });
  };

  for (const v of BIBLE_VERSES) {
    const tr = v.translations[lang] || v.translations.en;
    const bookMeta =
      (v.bookId ? findBookById(v.bookId) : undefined) ||
      findBookByQuery(v.book) ||
      BIBLE_BOOKS[42];
    pushVerse(
      bookMeta.id,
      getLocalizedBookName(bookMeta.id, lang),
      v.chapter || 1,
      v.verseNumber || 1,
      tr.text,
      primaryTrans
    );
  }

  const extraItems = lang === 'en' ? [...saved, ...viewed, ...daily50] : [...saved, ...viewed];
  for (const item of extraItems) {
    if (item.lang !== lang) continue;
    pushVerse(
      item.bookId,
      getLocalizedBookName(item.bookId, lang),
      item.chapter,
      item.verse,
      item.text,
      primaryTrans
    );
  }

  for (const baseCard of TREASURY_CARDS) {
    const card = getLocalizedTreasuryCard(baseCard, lang);
    const m = baseCard.reference.match(/^(.+?)\s+(\d+):(\d+)/);
    const bookMeta = m ? findBookByQuery(m[1]) : undefined;
    if (bookMeta && m) {
      pushVerse(
        bookMeta.id,
        getLocalizedBookName(bookMeta.id, lang),
        parseInt(m[2], 10),
        parseInt(m[3], 10),
        card.verseText,
        primaryTrans
      );
    }
  }

  return rows;
}

export async function generateClientBibleQuizRound(params: {
  lang: LanguageCode;
  ageGroup: AgeGroup;
  bookFilter: string;
  categoryId?: string;
  askedQuestions: string[];
  count?: number;
  signal?: AbortSignal;
}): Promise<ClientQuizQuestion[]> {
  const targetCount = params.count ?? 6;
  const primaryTrans = BOLLS_TRANSLATION_MAP[params.lang] || 'ESV';
  const prompts = QUIZ_PROMPTS_BY_LANG[params.lang] || QUIZ_PROMPTS_BY_LANG.en;
  const categoryMeta = params.categoryId ? getQuizCategoryById(params.categoryId) : undefined;
  const categoryBooks = categoryMeta
    ? categoryMeta.bookIds.map((id) => findBookById(id)).filter((b): b is BibleBookMeta => Boolean(b))
    : undefined;
  const effectiveAgeGroup: AgeGroup = categoryMeta?.hardMode ? 'adults' : params.ageGroup;
  const effectiveSingleBook =
    (categoryMeta && categoryBooks && categoryBooks.length === 1
      ? categoryBooks[0]
      : !categoryMeta && params.bookFilter !== 'all'
      ? findBookByQuery(params.bookFilter) || null
      : null) || (categoryBooks && categoryBooks.length === 1 ? categoryBooks[0] : null);

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const candidateTargets: Array<{ book: BibleBookMeta; chapter: number }> = [];
  if (effectiveSingleBook) {
    const pickedChapters = shuffleArray(
      Array.from({ length: effectiveSingleBook.chapters }, (_, i) => i + 1)
    ).slice(0, Math.min(effectiveSingleBook.chapters, 5));
    for (const ch of pickedChapters) {
      candidateTargets.push({ book: effectiveSingleBook, chapter: ch });
    }
  } else if (categoryBooks && categoryBooks.length > 1) {
    const pickedBooks = shuffleArray(categoryBooks);
    for (let i = 0; i < 5; i++) {
      const book = pickedBooks[i % pickedBooks.length];
      const ch = Math.floor(Math.random() * book.chapters) + 1;
      if (!candidateTargets.some((t) => t.book.id === book.id && t.chapter === ch)) {
        candidateTargets.push({ book, chapter: ch });
      }
    }
  } else {
    const pickedBooks = shuffleArray(BIBLE_BOOKS).slice(0, 5);
    for (const book of pickedBooks) {
      const ch = Math.floor(Math.random() * book.chapters) + 1;
      candidateTargets.push({ book, chapter: ch });
    }
  }

  const cachedChaptersPromise = getAllCachedChaptersFromIDB();
  const daily50Promise =
    getLoadedPreCachedDailyVerses().length > 0
      ? Promise.resolve(getLoadedPreCachedDailyVerses())
      : loadPreCachedDailyVerses();
  const viewedPromise = getViewedVerses(50);
  const savedPromise = getSavedVersesFromIDB();

  const secondaryTrans = SECONDARY_BOLLS_TRANSLATION_MAP[params.lang];
  const allowedTransSet = new Set(getTranslationCodesForLang(params.lang));
  const fetchedResults: VerseCandidateRow[] = [];
  if (!isOffline) {
    const fetchAll = Promise.allSettled(
      candidateTargets.map(async ({ book, chapter }) => {
        let usedTrans = primaryTrans;
        let rows = await fetchBollsChapterClient(primaryTrans, book.id, chapter, params.signal);
        if (rows.length === 0 && secondaryTrans && secondaryTrans !== primaryTrans) {
          rows = await fetchBollsChapterClient(secondaryTrans, book.id, chapter, params.signal);
          if (rows.length > 0) usedTrans = secondaryTrans;
        }
        for (const r of rows) {
          if (r.text.length >= 16) {
            fetchedResults.push({
              bookId: book.id,
              bookName: getLocalizedBookName(book.id, params.lang),
              chapters: book.chapters,
              chapter,
              verse: r.verse,
              text: r.text,
              transCode: usedTrans,
            });
          }
        }
      })
    );
    // Soft budget of 2.2s so quiz never stalls on slow chapters
    await Promise.race([
      fetchAll,
      new Promise<void>((resolve) => window.setTimeout(resolve, 2200)),
    ]);
  }

  const [cachedChapters, daily50, viewed, saved] = await Promise.all([
    cachedChaptersPromise,
    daily50Promise,
    viewedPromise,
    savedPromise,
  ]);

  const targetBookIdSet = effectiveSingleBook
    ? new Set([effectiveSingleBook.id])
    : categoryBooks && categoryBooks.length > 0
      ? new Set(categoryBooks.map((b) => b.id))
      : null;

  const cachedChapterRows: VerseCandidateRow[] = [];
  for (const ch of cachedChapters) {
    if (!allowedTransSet.has(ch.trans)) continue;
    const bookMeta = findBookById(ch.bookId);
    if (!bookMeta) continue;
    for (const r of ch.rows) {
      if (r.text.length >= 16) {
        cachedChapterRows.push({
          bookId: ch.bookId,
          bookName: getLocalizedBookName(bookMeta.id, params.lang),
          chapters: bookMeta.chapters,
          chapter: ch.chapter,
          verse: r.verse,
          text: r.text,
          transCode: ch.trans,
        });
      }
    }
  }

  const offlineStaticRows = buildBundledOfflineVerses(
    params.lang,
    primaryTrans,
    daily50,
    viewed,
    saved
  );

  const combinedAll = [...fetchedResults, ...cachedChapterRows, ...offlineStaticRows].filter((v) =>
    allowedTransSet.has(v.transCode)
  );
  const scopedRows = targetBookIdSet
    ? combinedAll.filter((v) => targetBookIdSet.has(v.bookId))
    : combinedAll;

  const allVerses = scopedRows.length >= 8 ? scopedRows : combinedAll;
  if (allVerses.length === 0) return [];

  const wordPoolsByTrans = new Map<string, WordPoolEntry[]>();
  const seenWordsByTrans = new Map<string, Set<string>>();
  const minTokenLen = params.lang === 'zh' ? 2 : params.lang === 'hi' || params.lang === 'ar' ? 3 : 4;

  for (const v of allVerses) {
    if (!wordPoolsByTrans.has(v.transCode)) {
      wordPoolsByTrans.set(v.transCode, []);
      seenWordsByTrans.set(v.transCode, new Set());
    }
    const pool = wordPoolsByTrans.get(v.transCode)!;
    const seen = seenWordsByTrans.get(v.transCode)!;
    const rawTokens = tokenizeVerseText(v.text);
    for (let ti = 0; ti < rawTokens.length; ti++) {
      const clean = stripTokenPunctuation(rawTokens[ti]);
      const isDigitToken = /^\d[\d,]*$/.test(clean);
      const isAlphaToken =
        clean.length >= minTokenLen && clean.length <= 16 && /^[\p{L}\p{M}]+$/u.test(clean);
      if (
        (isDigitToken || isAlphaToken) &&
        !COMMON_STOP_WORDS.has(clean.toLowerCase()) &&
        !seen.has(clean.toLowerCase())
      ) {
        seen.add(clean.toLowerCase());
        const startsUpper = /^[A-Z]/.test(clean);
        const prevEndedSentence = ti === 0 || /[.!?]["”']?$/.test(rawTokens[ti - 1] || '');
        const isProperOrMidCap = startsUpper && !prevEndedSentence;
        pool.push({
          word: clean,
          isProperOrMidCap,
          category: classifyWordCategory(clean, isProperOrMidCap),
        });
      }
    }
  }

  const uniqueTextVerses: typeof allVerses = [];
  const seenVerseTexts = new Set<string>();
  for (const v of shuffleArray(allVerses)) {
    const textKey = v.text.toLowerCase();
    if (seenVerseTexts.has(textKey)) continue;
    seenVerseTexts.add(textKey);
    uniqueTextVerses.push(v);
  }

  const poolForSelection =
    effectiveAgeGroup === 'kids'
      ? [
          ...uniqueTextVerses.filter((v) => v.text.length >= 35 && v.text.length <= 145),
          ...uniqueTextVerses.filter((v) => v.text.length < 35 || v.text.length > 145),
        ]
      : [
          ...uniqueTextVerses.filter((v) => v.text.length >= 50),
          ...uniqueTextVerses.filter((v) => v.text.length < 50),
        ];

  const buckets = new Map<string, typeof allVerses>();
  for (const v of poolForSelection) {
    const key = `${v.bookId}:${v.chapter}`;
    const list = buckets.get(key) || [];
    list.push(v);
    buckets.set(key, list);
  }

  const orderedVerses: typeof allVerses = [];
  let added = true;
  while (added) {
    added = false;
    for (const list of buckets.values()) {
      const nextItem = list.shift();
      if (nextItem) {
        orderedVerses.push(nextItem);
        added = true;
      }
    }
  }

  const askedSet = new Set(params.askedQuestions.map((q) => q.trim().toLowerCase()));
  const builtQuestions: ClientQuizQuestion[] = [];
  const usedVerseIds = new Set<string>();
  const seedBase = Math.floor(Math.random() * 1e9);

  const pickAdjacentChapters = (targetChapter: number, totalChapters: number): number[] => {
    const nearby = (
      effectiveAgeGroup === 'kids'
        ? [-4, -3, -2, 2, 3, 4, -5, 5, -1, 1]
        : [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5]
    )
      .map((off) => targetChapter + off)
      .filter((ch) => ch >= 1 && ch <= totalChapters && ch !== targetChapter);
    const uniqueNearby = Array.from(new Set(nearby));
    if (uniqueNearby.length >= 3) return shuffleArray(uniqueNearby.slice(0, 6)).slice(0, 3);
    return shuffleArray(
      Array.from({ length: totalChapters }, (_, i) => i + 1).filter((ch) => ch !== targetChapter)
    ).slice(0, 3);
  };

  const pickNumberDistractors = (cleanAnswer: string, pool: WordPoolEntry[]): string[] => {
    const isDigits = /^\d[\d,]*$/.test(cleanAnswer);
    const poolMatches = pool
      .filter(
        (e) =>
          e.category === 'number' &&
          e.word.toLowerCase() !== cleanAnswer.toLowerCase() &&
          /^\d[\d,]*$/.test(e.word) === isDigits
      )
      .map((e) => e.word);
    const curated = (
      isDigits
        ? ['3', '4', '7', '10', '12', '24', '40', '42', '70', '144']
        : LOCALIZED_NUMBER_WORDS[params.lang] || LOCALIZED_NUMBER_WORDS.en
    ).filter((n) => n.toLowerCase() !== cleanAnswer.toLowerCase());
    return Array.from(new Set([...shuffleArray(poolMatches), ...shuffleArray(curated)])).slice(0, 3);
  };

  const tryBuildQuestionForVerse = (
    v: (typeof allVerses)[number],
    mechanicIdx: number,
    allowRepeat: boolean
  ): ClientQuizQuestion | null => {
    const verseKey = `${v.bookId}:${v.chapter}:${v.verse}`;
    if (usedVerseIds.has(verseKey)) return null;
    const ref = `${v.bookName} ${v.chapter}:${v.verse}`;
    const theme = classifyStoryTheme(v.bookName, v.text);
    const verseLower = v.text.toLowerCase();

    const buildBookLocator = (): ClientQuizQuestion | null => {
      if (effectiveSingleBook) return null;
      const snippet = makeConciseSnippet(v.text, 9);
      const question = prompts.bookPrompt.replace('{snippet}', snippet);
      if (!allowRepeat && askedSet.has(question.toLowerCase())) return null;
      const currentTestament = BIBLE_BOOKS.find((m) => m.id === v.bookId)?.testament || 'OT';
      const sameTestament = BIBLE_BOOKS.filter((b) => b.id !== v.bookId && b.testament === currentTestament);
      const otherBooks = shuffleArray(
        sameTestament.length >= 3 ? sameTestament : BIBLE_BOOKS.filter((b) => b.id !== v.bookId)
      )
        .slice(0, 3)
        .map((b) => getLocalizedBookName(b.id, params.lang));
      const { options, correctIndex } = buildShuffledOptions(v.bookName, otherBooks);
      usedVerseIds.add(verseKey);
      return {
        id: `apk-${seedBase}-${builtQuestions.length}`,
        question,
        options,
        correctIndex,
        reference: ref,
        storyTheme: theme,
      };
    };

    const buildChapterLocator = (): ClientQuizQuestion | null => {
      if (v.chapters < 4) return null;
      const snippet = makeConciseSnippet(v.text, 9);
      const question = prompts.chapterPrompt
        .replace('{book}', v.bookName)
        .replace('{snippet}', snippet);
      if (!allowRepeat && askedSet.has(question.toLowerCase())) return null;
      const candidateChapters = pickAdjacentChapters(v.chapter, v.chapters);
      const { options, correctIndex } = buildShuffledOptions(
        prompts.chapterOption.replace('{n}', String(v.chapter)),
        candidateChapters.map((ch) => prompts.chapterOption.replace('{n}', String(ch)))
      );
      usedVerseIds.add(verseKey);
      return {
        id: `apk-${seedBase}-${builtQuestions.length}`,
        question,
        options,
        correctIndex,
        reference: ref,
        storyTheme: theme,
      };
    };

    if (!effectiveSingleBook && mechanicIdx % 4 === 1) {
      const bookQ = buildBookLocator();
      if (bookQ) return bookQ;
    } else if (effectiveSingleBook && mechanicIdx % 3 === 1) {
      const chapQ = buildChapterLocator();
      if (chapQ) return chapQ;
    }

    const tokens = tokenizeVerseText(v.text);
    const wordPool = wordPoolsByTrans.get(v.transCode) || [];
    const candidates: Array<{ idx: number; clean: string; category: WordCategory; score: number }> = [];

    for (let i = 0; i < tokens.length; i++) {
      const clean = stripTokenPunctuation(tokens[i]);
      const isDigitToken = /^\d[\d,]*$/.test(clean);
      const isAlphaToken =
        clean.length >= minTokenLen && clean.length <= 16 && /^[\p{L}\p{M}]+$/u.test(clean);
      if (!isDigitToken && !isAlphaToken) continue;
      if (COMMON_STOP_WORDS.has(clean.toLowerCase())) continue;
      if (
        /^(?:LORD|GOD|JESUS|CHRIST|Alas|Woe|Amen|Truly|Surely|Blessed|Behold|Holy|Therefore|Moreover|Nevertheless|Meanwhile|However|Indeed|Saying)$/.test(
          clean
        )
      ) {
        continue;
      }
      const startsUpper = /^[A-Z]/.test(clean);
      const prevEndedSentence = i === 0 || /[.!?:;“"«—]$/.test(tokens[i - 1] || '');
      const category = classifyWordCategory(clean, startsUpper && !prevEndedSentence);
      let score = clean.length * 2;
      if (category === 'proper') score += 55;
      else if (category === 'number') score += 50;
      else if (category === 'noun_abstract') score += 32;
      else if (category === 'plural_s' || category === 'past_ed') score += 20;
      else if (clean.length >= 7) score += 18;
      candidates.push({ idx: i, clean, category, score });
    }

    candidates.sort((a, b) => b.score - a.score);

    for (const cand of candidates) {
      const isTitleCase = /^[A-Z]/.test(cand.clean);
      let formattedDistractors: string[] = [];
      if (cand.category === 'number') {
        formattedDistractors = pickNumberDistractors(cand.clean, wordPool)
          .filter((w) => !verseLower.includes(w.toLowerCase()))
          .map((w) => (isTitleCase ? w.charAt(0).toUpperCase() + w.slice(1) : w));
      } else {
        const notInVerse = (w: WordPoolEntry) =>
          w.word.toLowerCase() !== cand.clean.toLowerCase() &&
          !verseLower.includes(w.word.toLowerCase()) &&
          !/^(?:LORD|GOD)$/i.test(w.word);
        const sameCategoryClose = wordPool.filter(
          (w) =>
            notInVerse(w) &&
            w.category === cand.category &&
            Math.abs(w.word.length - cand.clean.length) <= 4
        );
        const sameCategoryAny = wordPool.filter((w) => notInVerse(w) && w.category === cand.category);
        const fallbackGeneral =
          cand.category === 'proper'
            ? []
            : wordPool.filter(
                (w) =>
                  notInVerse(w) &&
                  !w.isProperOrMidCap &&
                  w.category !== 'number' &&
                  Math.abs(w.word.length - cand.clean.length) <= 3
              );

        formattedDistractors = shuffleArray(
          sameCategoryClose.length >= 3
            ? sameCategoryClose
            : sameCategoryAny.length >= 3
            ? sameCategoryAny
            : [...sameCategoryAny, ...fallbackGeneral]
        )
          .slice(0, 6)
          .map((w) =>
            isTitleCase || w.isProperOrMidCap
              ? w.word.charAt(0).toUpperCase() + w.word.slice(1)
              : w.word.toLowerCase()
          );
      }

      if (formattedDistractors.length < 3) continue;
      const { options, correctIndex } = buildShuffledOptions(cand.clean, formattedDistractors);
      if (new Set(options.map((o) => o.toLowerCase())).size !== 4) continue;

      const clue = extractContextClue(tokens, cand.idx, cand.clean, options);
      let question: string;
      if (cand.category === 'proper') {
        question = clue
          ? prompts.nameWithCluePrompt.replace('{ref}', ref).replace('{clue}', clue)
          : prompts.nameInRefPrompt.replace('{ref}', ref);
      } else if (cand.category === 'number') {
        question = clue
          ? prompts.numberWithCluePrompt.replace('{ref}', ref).replace('{clue}', clue)
          : prompts.numberInRefPrompt.replace('{ref}', ref);
      } else {
        question = clue
          ? prompts.wordWithCluePrompt.replace('{ref}', ref).replace('{clue}', clue)
          : prompts.wordInRefPrompt.replace('{ref}', ref);
      }

      if (!allowRepeat && askedSet.has(question.toLowerCase())) continue;
      usedVerseIds.add(verseKey);
      return {
        id: `apk-${seedBase}-${builtQuestions.length}`,
        question,
        options,
        correctIndex,
        reference: ref,
        storyTheme: theme,
      };
    }

    const fallbackBookQ = buildBookLocator();
    if (fallbackBookQ) return fallbackBookQ;
    const fallbackChapterQ = buildChapterLocator();
    if (fallbackChapterQ) return fallbackChapterQ;
    return null;
  };

  for (let i = 0; i < orderedVerses.length && builtQuestions.length < targetCount; i++) {
    const q = tryBuildQuestionForVerse(orderedVerses[i], builtQuestions.length, false);
    if (q) builtQuestions.push(q);
  }
  if (builtQuestions.length < targetCount) {
    for (let i = 0; i < orderedVerses.length && builtQuestions.length < targetCount; i++) {
      const q = tryBuildQuestionForVerse(orderedVerses[i], builtQuestions.length, true);
      if (q) builtQuestions.push(q);
    }
  }
  if (builtQuestions.length < targetCount) {
    const shuffledBooks = shuffleArray(
      BIBLE_BOOKS.slice(0, BIBLE_BOOKS.length - 1)
    );
    for (const b of shuffledBooks) {
      if (builtQuestions.length >= targetCount) break;
      const nextBook = findBookById(b.id + 1);
      if (!nextBook) continue;
      const locBook = getLocalizedBookName(b.id, params.lang);
      const locNext = getLocalizedBookName(nextBook.id, params.lang);
      const question = prompts.nextBookPrompt.replace('{book}', locBook);
      if (builtQuestions.some((existing) => existing.question === question)) continue;
      const distractors = shuffleArray(
        BIBLE_BOOKS.filter((cand) => cand.id !== b.id && cand.id !== nextBook.id)
      )
        .slice(0, 3)
        .map((cand) => getLocalizedBookName(cand.id, params.lang));
      const { options, correctIndex } = buildShuffledOptions(locNext, distractors);
      builtQuestions.push({
        id: `apk-${seedBase}-${builtQuestions.length}`,
        question,
        options,
        correctIndex,
        reference: `${locBook} · ${locNext}`,
        storyTheme: b.testament === 'OT' ? 'david' : 'shepherd',
      });
    }
  }

  return builtQuestions.slice(0, targetCount);
}

export async function fetchClientBibleChapter(
  bookId: number,
  chapter: number,
  lang: LanguageCode,
  signal?: AbortSignal
): Promise<{ verses: VerseItem[]; version: string }> {
  const bookMeta = findBookById(bookId) || BIBLE_BOOKS[18];
  const safeChapter = Math.min(Math.max(1, chapter), bookMeta.chapters);
  const targetTrans = BOLLS_TRANSLATION_MAP[lang] || 'ESV';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const localizedBookName = getLocalizedBookName(bookMeta.id, lang);

  const secondaryTrans = SECONDARY_BOLLS_TRANSLATION_MAP[lang];
  let usedTrans = targetTrans;
  let rows = await fetchBollsChapterClient(targetTrans, bookMeta.id, safeChapter, signal, 5000);

  if (
    rows.length === 0 &&
    !Capacitor.isNativePlatform() &&
    typeof navigator !== 'undefined' &&
    navigator.onLine
  ) {
    try {
      const resp = await fetch(
        `/api/bible/chapter?book=${bookMeta.id}&chapter=${safeChapter}&lang=${encodeURIComponent(lang)}`,
        { signal }
      );
      if (resp.ok) {
        const data = (await resp.json()) as { verses?: VerseItem[]; version?: string };
        if (Array.isArray(data?.verses) && data.verses.length > 0) {
          const cachedRows = data.verses.map((v) => ({ verse: v.verse, text: v.text }));
          const ver = data.version || targetTrans;
          chapterMemoryCache.set(`${ver}:${bookMeta.id}:${safeChapter}`, cachedRows);
          void saveCachedChapterToIDB(ver, bookMeta.id, safeChapter, cachedRows);
          return { verses: data.verses, version: ver };
        }
      }
    } catch {
      // fall through to same-language fallbacks
    }
  }

  if (rows.length === 0 && secondaryTrans && secondaryTrans !== targetTrans) {
    rows = await fetchBollsChapterClient(secondaryTrans, bookMeta.id, safeChapter, signal, 5000);
    if (rows.length > 0) usedTrans = secondaryTrans;
  }

  if (rows.length === 0 && lang === 'en' && (typeof navigator === 'undefined' || navigator.onLine)) {
    const webRows = await fetchBibleApiComChapterFallback(bookMeta.name, safeChapter, signal);
    if (webRows.length > 0) {
      rows = webRows;
      usedTrans = 'WEB';
      chapterMemoryCache.set(`WEB:${bookMeta.id}:${safeChapter}`, webRows);
      void saveCachedChapterToIDB('WEB', bookMeta.id, safeChapter, webRows);
    }
  }

  if (rows.length === 0) {
    return { verses: [], version: usedTrans };
  }

  const verses: VerseItem[] = rows.map((row) => ({
    id: `${bookMeta.id}:${safeChapter}:${row.verse}`,
    bookId: bookMeta.id,
    bookName: localizedBookName,
    chapter: safeChapter,
    verse: row.verse,
    reference: `${localizedBookName} ${safeChapter}:${row.verse}`,
    highlightPrefix: extractHighlightPrefix(row.text),
    text: row.text,
    version: usedTrans,
    themes: [t.themes.scripture, localizedBookName],
    lang,
  }));

  return { verses, version: usedTrans };
}

export async function fetchClientBibleVerse(params: {
  bookId: number;
  chapter: number;
  lang: LanguageCode;
  verse?: number;
  random?: boolean;
  seenIds?: string[];
}): Promise<VerseItem | null> {
  const bookMeta = findBookById(params.bookId) || BIBLE_BOOKS[42];
  const chapter = Math.min(Math.max(1, params.chapter), bookMeta.chapters);
  const targetTrans = BOLLS_TRANSLATION_MAP[params.lang] || 'ESV';
  const secondaryTrans = SECONDARY_BOLLS_TRANSLATION_MAP[params.lang];
  const t = TRANSLATIONS[params.lang] || TRANSLATIONS.en;
  const localizedBookName = getLocalizedBookName(bookMeta.id, params.lang);

  let usedTrans = targetTrans;
  let rows = await fetchBollsChapterClient(targetTrans, bookMeta.id, chapter);
  if (rows.length === 0 && secondaryTrans && secondaryTrans !== targetTrans) {
    rows = await fetchBollsChapterClient(secondaryTrans, bookMeta.id, chapter);
    if (rows.length > 0) usedTrans = secondaryTrans;
  }
  if (rows.length === 0 && params.lang === 'en' && (typeof navigator === 'undefined' || navigator.onLine)) {
    const webRows = await fetchBibleApiComChapterFallback(bookMeta.name, chapter);
    if (webRows.length > 0) {
      rows = webRows;
      usedTrans = 'WEB';
    }
  }
  if (rows.length === 0) return null;

  const seenSet = new Set(params.seenIds || []);
  let chosen = rows[0];
  if (params.random) {
    const unseen = rows.filter((r) => !seenSet.has(`${bookMeta.id}:${chapter}:${r.verse}`));
    const pool = unseen.length > 0 ? unseen : rows;
    chosen = pool[Math.floor(Math.random() * pool.length)];
  } else if (params.verse) {
    chosen = rows.find((r) => r.verse === params.verse) || rows[0];
  }

  return {
    id: `${bookMeta.id}:${chapter}:${chosen.verse}`,
    bookId: bookMeta.id,
    bookName: localizedBookName,
    chapter,
    verse: chosen.verse,
    reference: `${localizedBookName} ${chapter}:${chosen.verse}`,
    highlightPrefix: extractHighlightPrefix(chosen.text),
    text: chosen.text,
    version: usedTrans,
    themes: [
      t.themes.scripture,
      bookMeta.testament === 'OT' ? t.themes.oldTestament : t.themes.newTestament,
    ],
    lang: params.lang,
  };
}

export async function searchClientBibleVerses(
  rawQuery: string,
  lang: LanguageCode,
  signal?: AbortSignal
): Promise<VerseItem[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];
  const targetTrans = BOLLS_TRANSLATION_MAP[lang] || 'ESV';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const refMatch = q.match(/^(.+?)(?:\s+|(?<=[\p{Script=Han}]))(\d+)(?:[:.,](\d+))?$/u);
  if (refMatch) {
    const book = findBookByQuery(refMatch[1]);
    if (book) {
      const chapter = Math.min(Math.max(1, parseInt(refMatch[2], 10)), book.chapters);
      const verseNum = refMatch[3] ? parseInt(refMatch[3], 10) : undefined;
      const { verses } = await fetchClientBibleChapter(book.id, chapter, lang, signal);
      const filtered = verseNum ? verses.filter((r) => r.verse === verseNum) : verses;
      if (filtered.length > 0) {
        return filtered;
      }
    }
  }

  const bookOnly = findBookByQuery(q);
  if (bookOnly && q.split(/\s+/).length <= 3) {
    const { verses } = await fetchClientBibleChapter(bookOnly.id, 1, lang, signal);
    if (verses.length > 0) {
      return verses;
    }
  }

  if (q.length >= 3) {
    try {
      const searchUrl = `https://bolls.life/v2/find/${encodeURIComponent(
        targetTrans
      )}?search=${encodeURIComponent(q)}&match_case=false&match_whole=false`;
      const resp = await fetch(searchUrl, { signal });
      if (resp.ok) {
        const data = await resp.json();
        const rows = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        const mapped = rows
          .filter(
            (r: unknown): r is { book: number; chapter: number; verse: number; text: string } =>
              typeof r === 'object' &&
              r !== null &&
              typeof (r as { book?: unknown }).book === 'number' &&
              typeof (r as { chapter?: unknown }).chapter === 'number' &&
              typeof (r as { verse?: unknown }).verse === 'number' &&
              typeof (r as { text?: unknown }).text === 'string'
          )
          .slice(0, 30)
          .map((m: { book: number; chapter: number; verse: number; text: string }) => {
            const localizedBookName = getLocalizedBookName(m.book, lang);
            const cleanText = stripBibleHtml(m.text);
            return {
              id: `${m.book}:${m.chapter}:${m.verse}`,
              bookId: m.book,
              bookName: localizedBookName,
              chapter: m.chapter,
              verse: m.verse,
              reference: `${localizedBookName} ${m.chapter}:${m.verse}`,
              highlightPrefix: extractHighlightPrefix(cleanText),
              text: cleanText,
              version: targetTrans,
              themes: [t.themes.search, localizedBookName],
              lang,
            };
          });
        if (mapped.length > 0) return mapped;
      }
    } catch {
      // fall through to cached chapters search below
    }
  }

  // Fallback: search locally cached full chapters in IDB for exact substring match
  try {
    const cachedChapters = await getAllCachedChaptersFromIDB();
    const allowedTrans = new Set(getTranslationCodesForLang(lang));
    const needle = q.toLowerCase();
    const localHits: VerseItem[] = [];
    for (const ch of cachedChapters) {
      if (!allowedTrans.has(ch.trans)) continue;
      const localizedBookName = getLocalizedBookName(ch.bookId, lang);
      for (const r of ch.rows) {
        if (r.text.toLowerCase().includes(needle) || localizedBookName.toLowerCase().includes(needle)) {
          localHits.push({
            id: `${ch.bookId}:${ch.chapter}:${r.verse}`,
            bookId: ch.bookId,
            bookName: localizedBookName,
            chapter: ch.chapter,
            verse: r.verse,
            reference: `${localizedBookName} ${ch.chapter}:${r.verse}`,
            highlightPrefix: extractHighlightPrefix(r.text),
            text: r.text,
            version: ch.trans,
            themes: [t.themes.search, localizedBookName],
            lang,
          });
          if (localHits.length >= 30) return localHits;
        }
      }
    }
    return localHits;
  } catch {
    return [];
  }
}
