import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { BIBLE_BOOKS, findBookById, findBookByQuery } from './src/data/bibleBooks.ts';
import { getQuizCategoryById } from './src/data/categories.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_LANGS = new Set([
  'en',
  'it',
  'sw',
  'fr',
  'es',
  'pt',
  'de',
  'ar',
  'hi',
  'zh',
]);

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  it: 'Italian',
  sw: 'Swahili',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  ar: 'Arabic',
  hi: 'Hindi',
  zh: 'Chinese (Simplified)',
};

const BOLLS_TRANSLATION_MAP: Record<string, string> = {
  en: 'ESV',
  it: 'NR06',
  sw: 'SUV',
  fr: 'LSG',
  es: 'RV1960',
  pt: 'ARC',
  de: 'LUT',
  ar: 'SVD',
  hi: 'IRVH',
  zh: 'CUNP',
};

function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}


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
  if (commaIdx > 8 && commaIdx < 65) {
    return text.slice(0, commaIdx + 1);
  }
  const words = text.split(' ');
  return words.slice(0, Math.min(6, words.length)).join(' ');
}

async function fetchBollsChapter(
  translation: string,
  bookId: number,
  chapter: number
): Promise<Array<{ verse: number; text: string }>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const url = `https://bolls.life/get-text/${encodeURIComponent(
      translation
    )}/${bookId}/${chapter}/`;
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) return [];
    const data = (await resp.json()) as Array<{ verse?: number; text?: string }>;
    if (!Array.isArray(data)) return [];
    return data
      .filter((row) => typeof row.verse === 'number' && typeof row.text === 'string')
      .map((row) => ({
        verse: row.verse as number,
        text: stripBibleHtml(row.text as string),
      }))
      .filter((row) => row.text.length > 0);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function generateOrTranslateVerseWithGemini(params: {
  bookName: string;
  bookId: number;
  chapter: number;
  verse?: number;
  englishText?: string;
  lang: string;
}): Promise<{
  verse: number;
  reference: string;
  highlightPrefix: string;
  text: string;
  version: string;
  themes: [string, string];
}> {
  const ai = getGeminiClient();
  const langName = LANG_NAMES[params.lang] || 'English';
  const prompt = params.englishText
    ? `Translate this exact Bible verse (${params.bookName} ${params.chapter}:${params.verse}) into natural, reverent ${langName}. Keep the verse number ${params.verse}. Source text: "${params.englishText}". Also provide a short 4-6 word opening highlightPrefix (matching the exact start of the translated text) and 2 brief theme words in ${langName}.`
    : `Provide the accurate Bible verse text for ${params.bookName} chapter ${params.chapter}${
        params.verse ? ` verse ${params.verse}` : ' (pick a notable verse in that chapter)'
      } in ${langName}. Provide the exact localized reference, an opening highlightPrefix (exact first 4-7 words of the verse text), version abbreviation, and 2 short theme words in ${langName}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verse: { type: Type.INTEGER },
          reference: { type: Type.STRING },
          highlightPrefix: { type: Type.STRING },
          text: { type: Type.STRING },
          version: { type: Type.STRING },
          themes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['verse', 'reference', 'highlightPrefix', 'text', 'version', 'themes'],
      },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as {
    verse?: number;
    reference?: string;
    highlightPrefix?: string;
    text?: string;
    version?: string;
    themes?: string[];
  };

  const text = (parsed.text || '').trim();
  const verseNum = parsed.verse || params.verse || 1;
  return {
    verse: verseNum,
    reference: parsed.reference || `${params.bookName} ${params.chapter}:${verseNum}`,
    highlightPrefix: parsed.highlightPrefix || extractHighlightPrefix(text),
    text,
    version: parsed.version || BOLLS_TRANSLATION_MAP[params.lang] || 'ESV',
    themes: [
      parsed.themes?.[0] || 'Faith',
      parsed.themes?.[1] || 'Hope',
    ],
  };
}

function parseReferenceQuery(
  rawQuery: string
): { bookId: number; bookName: string; chapter: number; verse?: number } | null {
  const match = rawQuery
    .trim()
    .match(/^([1-3]?\s*[a-zA-Z\s]+?)\s+(\d+)(?::(\d+))?$/);
  if (!match) return null;
  const book = findBookByQuery(match[1]);
  if (!book) return null;
  const chapter = Math.min(Math.max(1, parseInt(match[2], 10)), book.chapters);
  const verse = match[3] ? Math.max(1, parseInt(match[3], 10)) : undefined;
  return { bookId: book.id, bookName: book.name, chapter, verse };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Live Bible Verse endpoint (supports random unseen pick + exact book/chapter/verse + 10 languages)
  app.get('/api/bible/verse', async (req: Request, res: Response) => {
    try {
      const lang = ALLOWED_LANGS.has(String(req.query.lang || 'en'))
        ? String(req.query.lang || 'en')
        : 'en';
      const bookIdRaw = Number(req.query.book || 43);
      const bookMeta = findBookById(
        Number.isInteger(bookIdRaw) && bookIdRaw >= 1 && bookIdRaw <= 66
          ? bookIdRaw
          : 43
      )!;
      const chapterRaw = Number(req.query.chapter || 3);
      const chapter = Math.min(
        Math.max(1, Number.isInteger(chapterRaw) ? chapterRaw : 1),
        bookMeta.chapters
      );
      const requestedVerse = req.query.verse ? Number(req.query.verse) : undefined;
      const isRandomMode = req.query.random === '1';
      const seenParam = String(req.query.seen || '');
      const seenSet = new Set(
        seenParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );

      // 1. Fetch English ESV chapter from bolls.life (reliable 66-book baseline)
      const esvChapter = await fetchBollsChapter('ESV', bookMeta.id, chapter);

      // Pick verse number
      let chosenVerseNum = requestedVerse || 16;
      if (isRandomMode && esvChapter.length > 0) {
        const unseenRows = esvChapter.filter(
          (v) => !seenSet.has(`${bookMeta.id}:${chapter}:${v.verse}`)
        );
        const pool = unseenRows.length > 0 ? unseenRows : esvChapter;
        chosenVerseNum = pool[Math.floor(Math.random() * pool.length)].verse;
      } else if (esvChapter.length > 0 && requestedVerse) {
        const exact = esvChapter.find((v) => v.verse === requestedVerse);
        chosenVerseNum = exact
          ? exact.verse
          : esvChapter[Math.min(requestedVerse - 1, esvChapter.length - 1)].verse;
      }

      const esvRow = esvChapter.find((v) => v.verse === chosenVerseNum);

      // 2. If non-English & available on bolls.life, fetch localized translation
      if (BOLLS_TRANSLATION_MAP[lang]) {
        const transCode = BOLLS_TRANSLATION_MAP[lang];
        const localizedChapter =
          transCode === 'ESV'
            ? esvChapter
            : await fetchBollsChapter(transCode, bookMeta.id, chapter);
        const localizedRow = localizedChapter.find(
          (v) => v.verse === chosenVerseNum
        );
        if (localizedRow) {
          return res.json({
            id: `${bookMeta.id}:${chapter}:${chosenVerseNum}`,
            bookId: bookMeta.id,
            bookName: bookMeta.name,
            chapter,
            verse: chosenVerseNum,
            reference: `${bookMeta.name} ${chapter}:${chosenVerseNum}`,
            highlightPrefix: extractHighlightPrefix(localizedRow.text),
            text: localizedRow.text,
            version: transCode,
            themes: ['Scripture', bookMeta.testament === 'OT' ? 'Old Testament' : 'New Testament'],
            lang,
            source: 'bolls.life',
          });
        }
      }

      // 3. Gemini intelligent translation / fallback when configured, else clean ESV fallback
      if (hasGeminiKey()) {
        try {
          const geminiResult = await generateOrTranslateVerseWithGemini({
            bookName: bookMeta.name,
            bookId: bookMeta.id,
            chapter,
            verse: chosenVerseNum,
            englishText: esvRow?.text,
            lang,
          });

          return res.json({
            id: `${bookMeta.id}:${chapter}:${geminiResult.verse}`,
            bookId: bookMeta.id,
            bookName: bookMeta.name,
            chapter,
            verse: geminiResult.verse,
            reference: geminiResult.reference,
            highlightPrefix: geminiResult.highlightPrefix,
            text: geminiResult.text,
            version: geminiResult.version,
            themes: geminiResult.themes,
            lang,
            source: esvRow ? 'bolls.life+gemini' : 'gemini',
          });
        } catch {
          // Fall through to ESV row below
        }
      }

      if (esvRow) {
        return res.json({
          id: `${bookMeta.id}:${chapter}:${chosenVerseNum}`,
          bookId: bookMeta.id,
          bookName: bookMeta.name,
          chapter,
          verse: chosenVerseNum,
          reference: `${bookMeta.name} ${chapter}:${chosenVerseNum}`,
          highlightPrefix: extractHighlightPrefix(esvRow.text),
          text: esvRow.text,
          version: 'ESV',
          themes: [
            'Scripture',
            bookMeta.testament === 'OT' ? 'Old Testament' : 'New Testament',
          ],
          lang,
          source: 'bolls.life',
        });
      }

      return res.status(404).json({ error: 'Verse temporarily unavailable.' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to fetch Bible verse.';
      return res.status(500).json({ error: message });
    }
  });

  // Full 66-book Search endpoint (Reference lookup + bolls.life full-text + Gemini fallback)
  app.get('/api/bible/search', async (req: Request, res: Response) => {
    try {
      const q = String(req.query.q || '').trim();
      const lang = ALLOWED_LANGS.has(String(req.query.lang || 'en'))
        ? String(req.query.lang || 'en')
        : 'en';

      if (!q || q.length < 2) {
        return res.json({ results: [] });
      }

      // Check if query is an exact Bible reference like "John 3:16" or "Psalm 23"
      const parsedRef = parseReferenceQuery(q);
      if (parsedRef) {
        const esvChapter = await fetchBollsChapter(
          'ESV',
          parsedRef.bookId,
          parsedRef.chapter
        );

        const targetTranslation = BOLLS_TRANSLATION_MAP[lang] || 'ESV';
        const transChapter =
          targetTranslation === 'ESV'
            ? esvChapter
            : await fetchBollsChapter(
                targetTranslation,
                parsedRef.bookId,
                parsedRef.chapter
              );

        const sourceChapter = transChapter.length > 0 ? transChapter : esvChapter;

        if (sourceChapter.length > 0) {
          const rows = parsedRef.verse
            ? sourceChapter.filter((v) => v.verse === parsedRef.verse)
            : sourceChapter.slice(0, 12);

          if (rows.length > 0) {
            return res.json({
              results: rows.map((row) => ({
                id: `${parsedRef.bookId}:${parsedRef.chapter}:${row.verse}`,
                bookId: parsedRef.bookId,
                bookName: parsedRef.bookName,
                chapter: parsedRef.chapter,
                verse: row.verse,
                reference: `${parsedRef.bookName} ${parsedRef.chapter}:${row.verse}`,
                highlightPrefix: extractHighlightPrefix(row.text),
                text: row.text,
                version: transChapter.length > 0 ? targetTranslation : 'ESV',
                themes: ['Scripture', parsedRef.bookName],
                lang,
              })),
            });
          }
        }
      }

      // Keyword search across all 66 books via bolls.life
      const bollsTranslation = BOLLS_TRANSLATION_MAP[lang] || 'ESV';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      let bollsMatches: Array<{
        book: number;
        chapter: number;
        verse: number;
        text: string;
      }> = [];

      try {
        const searchUrl = `https://bolls.life/v2/find/${encodeURIComponent(
          bollsTranslation
        )}?search=${encodeURIComponent(q)}&match_case=false&match_whole=false`;
        const resp = await fetch(searchUrl, { signal: controller.signal });
        if (resp.ok) {
          const data = (await resp.json()) as {
            results?: Array<{
              book?: number;
              chapter?: number;
              verse?: number;
              text?: string;
            }>;
          };
          if (Array.isArray(data.results)) {
            bollsMatches = data.results
              .filter(
                (r) =>
                  typeof r.book === 'number' &&
                  typeof r.chapter === 'number' &&
                  typeof r.verse === 'number' &&
                  typeof r.text === 'string'
              )
              .slice(0, 15)
              .map((r) => ({
                book: r.book as number,
                chapter: r.chapter as number,
                verse: r.verse as number,
                text: stripBibleHtml(r.text as string),
              }));
          }
        }
      } catch {
        // Fall through to Gemini search fallback
      } finally {
        clearTimeout(timeout);
      }

      if (bollsMatches.length > 0) {
        return res.json({
          results: bollsMatches.map((m) => {
            const bookMeta = findBookById(m.book);
            const bookName = bookMeta?.name || `Book ${m.book}`;
            return {
              id: `${m.book}:${m.chapter}:${m.verse}`,
              bookId: m.book,
              bookName,
              chapter: m.chapter,
              verse: m.verse,
              reference: `${bookName} ${m.chapter}:${m.verse}`,
              highlightPrefix: extractHighlightPrefix(m.text),
              text: m.text,
              version: bollsTranslation,
              themes: ['Search', bookName],
              lang,
            };
          }),
        });
      }

      if (!hasGeminiKey()) {
        return res.json({ results: [] });
      }

      // Intelligent Gemini search / translation fallback
      const ai = getGeminiClient();
      const langName = LANG_NAMES[lang] || 'English';
      const seedHint =
        bollsMatches.length > 0
          ? `Translate these matching verses into ${langName}: ${JSON.stringify(
              bollsMatches.slice(0, 6).map((m) => ({
                bookId: m.book,
                bookName: findBookById(m.book)?.name || 'Bible',
                chapter: m.chapter,
                verse: m.verse,
                text: m.text,
              }))
            )}`
          : `Find up to 6 real, accurate Bible verses across the 66 books matching the query "${q}" and return them in ${langName}.`;

      const geminiSearchResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: seedHint,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                bookId: { type: Type.INTEGER },
                bookName: { type: Type.STRING },
                chapter: { type: Type.INTEGER },
                verse: { type: Type.INTEGER },
                reference: { type: Type.STRING },
                highlightPrefix: { type: Type.STRING },
                text: { type: Type.STRING },
                version: { type: Type.STRING },
              },
              required: [
                'bookId',
                'bookName',
                'chapter',
                'verse',
                'reference',
                'highlightPrefix',
                'text',
                'version',
              ],
            },
          },
        },
      });

      const parsedList = JSON.parse(
        (geminiSearchResp.text ?? '[]').trim()
      ) as Array<{
        bookId: number;
        bookName: string;
        chapter: number;
        verse: number;
        reference: string;
        highlightPrefix: string;
        text: string;
        version: string;
      }>;

      return res.json({
        results: parsedList.slice(0, 12).map((item) => ({
          id: `${item.bookId}:${item.chapter}:${item.verse}`,
          bookId: item.bookId,
          bookName: item.bookName,
          chapter: item.chapter,
          verse: item.verse,
          reference: item.reference,
          highlightPrefix:
            item.highlightPrefix || extractHighlightPrefix(item.text),
          text: item.text,
          version: item.version || BOLLS_TRANSLATION_MAP[lang] || 'ESV',
          themes: ['Search', item.bookName],
          lang,
        })),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Bible search failed.';
      return res.status(500).json({ error: message });
    }
  });

  // Localized templates & stop-words for the live 66-book Bible API quiz engine
  const QUIZ_PROMPTS_BY_LANG: Record<
    string,
    {
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
  > = {
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

  const LOCALIZED_BOOK_ALIASES: Record<number, string[]> = {
    1: ['genesi', 'mwanzo', 'genèse', 'génesis', 'gênesis', '1. mose', 'التكوين', 'उत्पत्ति', '创世记'],
    2: ['esodo', 'kutoka', 'exode', 'éxodo', 'êxodo', '2. mose', 'الخروج', 'निर्गमन', '出埃及记'],
    19: ['salmi', 'zaburi', 'psaumes', 'salmos', 'psalmen', 'المزامير', 'भजन संहिता', '诗篇'],
    40: ['matteo', 'mathayo', 'matthieu', 'mateo', 'mateus', 'matthäus', 'متى', 'मत्ती', '马太福音'],
    43: ['giovanni', 'yohana', 'jean', 'juan', 'joão', 'johannes', 'يوحنا', 'यूहन्ना', '约翰福音'],
    66: ['apocalisse', 'ufunuo', 'apocalypse', 'apocalipsis', 'apocalipse', 'offenbarung', 'الرؤيا', 'प्रकाशितवाक्य', '启示录'],
  };

  const COMMON_STOP_WORDS = new Set([
    'that', 'this', 'with', 'from', 'they', 'were', 'have', 'been', 'will', 'shall',
    'your', 'their', 'them', 'when', 'then', 'there', 'which', 'what', 'into', 'upon',
    'unto', 'before', 'after', 'about', 'because', 'said', 'saying', 'also', 'more',
    'than', 'these', 'those', 'some', 'such', 'only', 'even', 'very', 'over', 'under',
    'through', 'where', 'while', 'would', 'could', 'should', 'every', 'each',
    'other', 'much', 'many', 'well', 'thus', 'therefore', 'neither', 'either', 'both',
    'anyone', 'someone', 'everyone', 'noone', 'nothing', 'anything', 'something',
    'everything', 'another', 'certain', 'whether', 'between', 'without', 'within',
    'among', 'until', 'unless', 'enough', 'behold', 'indeed', 'already', 'always',
    'never', 'against', 'himself', 'herself', 'themselves', 'ourselves', 'yourselves',
    'myself', 'yourself', 'whose', 'whom', 'since', 'hence', 'still', 'again', 'forth',
    'pour', 'dans', 'avec', 'mais', 'nous', 'vous', 'elle', 'elles', 'leur', 'leurs',
    'cette', 'sont', 'être', 'fait', 'tout', 'tous', 'plus', 'comme', 'quand', 'aussi',
    'chacun', 'quelque', 'encore', 'alors', 'ainsi', 'après', 'avant', 'contre',
    'para', 'como', 'pero', 'más', 'este', 'esta', 'estos', 'estas', 'sobre', 'entre',
    'todo', 'todos', 'porque', 'cuando', 'dijo', 'ellos', 'ellas', 'nuestro', 'vuestro',
    'alguien', 'nadie', 'ninguno', 'contra', 'hasta', 'desde', 'hacia', 'también',
    'dass', 'nicht', 'auch', 'noch', 'aber', 'oder', 'sind', 'wird', 'sein', 'seine',
    'einer', 'eine', 'einen', 'dem', 'den', 'der', 'die', 'das', 'und', 'mit', 'von',
    'jemand', 'niemand', 'gegen', 'durch', 'unter', 'über', 'zwischen', 'damit',
    'che', 'non', 'per', 'con', 'una', 'sono', 'alla', 'dalla', 'della', 'nella',
    'alcuno', 'nessuno', 'contro', 'prima', 'dopo', 'sempre', 'ancora', 'molto',
    'katika', 'kwa', 'hii', 'wale', 'yake', 'wao', 'lakini', 'kwamba', 'kama', 'basi',
  ]);

  type WordCategory =
    | 'proper'
    | 'number'
    | 'past_ed'
    | 'ing'
    | 'ly'
    | 'noun_abstract'
    | 'plural_s'
    | 'general';

  const NUMBER_WORDS = new Set([
    'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
    'hundred', 'thousand', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth',
    'seventh', 'eighth', 'ninth', 'tenth', 'twelfth',
  ]);

  function classifyWordCategory(
    cleanWord: string,
    isProperOrMidCap: boolean
  ): WordCategory {
    const lower = cleanWord.toLowerCase();
    if (/^\d[\d,]*$/.test(cleanWord) || NUMBER_WORDS.has(lower)) {
      return 'number';
    }
    if (isProperOrMidCap) {
      return 'proper';
    }
    if (/(?:tion|sion|ment|ness|ship|dom|ance|ence|ity)$/i.test(cleanWord)) {
      return 'noun_abstract';
    }
    if (/ed$/i.test(cleanWord) && cleanWord.length >= 5) {
      return 'past_ed';
    }
    if (/ing$/i.test(cleanWord) && cleanWord.length >= 6) {
      return 'ing';
    }
    if (/ly$/i.test(cleanWord) && cleanWord.length >= 5) {
      return 'ly';
    }
    if (
      /s$/i.test(cleanWord) &&
      !/(?:ss|us|is|as|os)$/i.test(cleanWord) &&
      cleanWord.length >= 5
    ) {
      return 'plural_s';
    }
    return 'general';
  }

  interface NormalizedQuizQuestion {
    id: string;
    question: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    reference: string;
    storyTheme: string;
  }

  function shuffleArray<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function classifyStoryTheme(bookName: string, verseText: string): string {
    const combined = `${bookName} ${verseText}`.toLowerCase();
    if (/(noah|ark|flood|rainbow|dove|creation|genesis)/i.test(combined)) return 'noah';
    if (/(whale|jonah|sea|ocean|waves|ship|fish|boat|storm|waters)/i.test(combined)) return 'whale';
    if (/(david|goliath|sling|king|throne|sword|battle|psalm|crown|kingdom)/i.test(combined)) return 'david';
    if (/(jesus|christ|shepherd|lamb|sheep|flock|hill|parable|grace|mercy|gospel)/i.test(combined)) return 'shepherd';
    return 'bible';
  }

  function isReferenceForBook(
    reference: string,
    bookMeta: { id: number; name: string }
  ): boolean {
    const trimmed = reference.trim();
    if (!trimmed) return false;

    const bookPart = trimmed
      .replace(/[,:;]?\s*\d+(?:\s*[:.,-]\s*\d+)*\s*$/, '')
      .trim()
      .toLowerCase();

    if (!bookPart) return false;
    const expectedName = bookMeta.name.toLowerCase();
    if (bookPart === expectedName || bookPart.startsWith(expectedName)) {
      return true;
    }

    const localizedAliases = LOCALIZED_BOOK_ALIASES[bookMeta.id] || [];
    if (localizedAliases.some((alias) => bookPart === alias || bookPart.includes(alias))) {
      return true;
    }

    const resolved = findBookByQuery(bookPart);
    if (resolved) {
      return resolved.id === bookMeta.id;
    }

    return false;
  }

  function stripTokenPunctuation(token: string): string {
    return token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  }

  function buildShuffledOptions(
    correctOption: string,
    distractors: string[]
  ): { options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 } {
    const unique: string[] = [correctOption];
    const seenLower = new Set([correctOption.toLowerCase()]);

    for (const d of distractors) {
      const cleaned = d.trim();
      if (!cleaned) continue;
      if (seenLower.has(cleaned.toLowerCase())) continue;
      seenLower.add(cleaned.toLowerCase());
      unique.push(cleaned);
      if (unique.length === 4) break;
    }

    const entries = unique.map((label, idx) => ({
      label,
      isCorrect: idx === 0,
    }));
    const shuffled = shuffleArray(entries);
    const correctIdx = shuffled.findIndex((e) => e.isCorrect);
    return {
      options: shuffled.map((e) => e.label) as [string, string, string, string],
      correctIndex: (correctIdx >= 0 ? correctIdx : 0) as 0 | 1 | 2 | 3,
    };
  }

  function makeConciseSnippet(text: string, maxWords = 11): string {
    const cleaned = text.replace(/^[“”"'«»„]+|[“”"'«»„]+$/g, '').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    const slice = words.length <= maxWords ? words : words.slice(0, maxWords);
    const joined = slice
      .join(' ')
      .replace(/^[“”"'«»„]+/, '')
      .replace(/[,:;—\-“”"'«»„]+$/, '')
      .trim();
    return words.length <= maxWords ? joined : `${joined}...`;
  }

  const WEAK_TRAILING_CLUE_WORDS = new Set([
    'the', 'a', 'an', 'of', 'and', 'to', 'in', 'for', 'with', 'by', 'on', 'at',
    'from', 'that', 'which', 'as', 'is', 'was', 'are', 'were', 'or', 'into',
    'unto', 'upon', 'his', 'her', 'their', 'your', 'our', 'my',
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
    'en', 'con', 'por', 'para', 'y', 'o', 'que', 'su', 'sus', 'se',
    'le', 'les', 'du', 'des', 'au', 'aux', 'et', 'ou', 'dans', 'par', 'pour',
    'il', 'lo', 'gli', 'di', 'da', 'per', 'che', 'e', 'ed',
    'der', 'die', 'das', 'dem', 'den', 'des', 'ein', 'eine', 'und', 'oder', 'zu', 'mit', 'von',
    'na', 'ya', 'wa', 'za', 'kwa', 'katika',
  ]);

  function extractContextClue(
    tokens: string[],
    targetIdx: number,
    targetClean: string,
    blockedWords: string[] = []
  ): string | null {
    const targetLower = targetClean.toLowerCase();
    const blockedSet = new Set(blockedWords.map((w) => w.toLowerCase()));
    const containsForbidden = (slice: string[]): boolean =>
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
      while (
        trimmed.length > 2 &&
        WEAK_TRAILING_CLUE_WORDS.has(
          stripTokenPunctuation(trimmed[trimmed.length - 1]).toLowerCase()
        )
      ) {
        trimmed.pop();
      }
      while (
        trimmed.length > 2 &&
        WEAK_TRAILING_CLUE_WORDS.has(
          stripTokenPunctuation(trimmed[0]).toLowerCase()
        )
      ) {
        trimmed.shift();
      }

      if (trimmed.length < 2) continue;
      const clue = trimmed
        .join(' ')
        .replace(/[“”"'«»„]/g, '')
        .replace(/^[,.;:!?—\-]+|[,.;:!?—\-]+$/g, '')
        .trim();
      const meaningfulCount = trimmed.filter(
        (t) => stripTokenPunctuation(t).length >= 4
      ).length;
      if (clue.length >= 9 && meaningfulCount >= 1) {
        return clue;
      }
    }

    return null;
  }

  async function generateLiveBibleApiQuizRound(params: {
    lang: string;
    ageGroup: string;
    bookMeta: { id: number; name: string; chapters: number } | null;
    categoryBooks?: Array<{ id: number; name: string; chapters: number }>;
    askedQuestions: string[];
    count?: number;
  }): Promise<NormalizedQuizQuestion[]> {
    const targetCount = params.count ?? 6;
    const primaryTrans = BOLLS_TRANSLATION_MAP[params.lang] || 'ESV';
    const prompts = QUIZ_PROMPTS_BY_LANG[params.lang] || QUIZ_PROMPTS_BY_LANG.en;

    interface FetchedVerseRow {
      bookId: number;
      bookName: string;
      chapters: number;
      chapter: number;
      verse: number;
      text: string;
      transCode: string;
    }

    const candidateTargets: Array<{
      book: { id: number; name: string; chapters: number };
      chapter: number;
    }> = [];

    const effectiveSingleBook =
      params.bookMeta ||
      (params.categoryBooks && params.categoryBooks.length === 1
        ? params.categoryBooks[0]
        : null);

    if (effectiveSingleBook) {
      const allChapters = Array.from(
        { length: effectiveSingleBook.chapters },
        (_, i) => i + 1
      );
      const pickedChapters = shuffleArray(allChapters).slice(
        0,
        Math.min(effectiveSingleBook.chapters, 8)
      );
      for (const ch of pickedChapters) {
        candidateTargets.push({ book: effectiveSingleBook, chapter: ch });
      }
    } else if (params.categoryBooks && params.categoryBooks.length > 1) {
      const pickedBooks = shuffleArray(params.categoryBooks);
      for (let i = 0; i < 8; i++) {
        const book = pickedBooks[i % pickedBooks.length];
        const ch = Math.floor(Math.random() * book.chapters) + 1;
        if (!candidateTargets.some((t) => t.book.id === book.id && t.chapter === ch)) {
          candidateTargets.push({ book, chapter: ch });
        }
      }
    } else {
      const pickedBooks = shuffleArray(BIBLE_BOOKS).slice(0, 10);
      for (const book of pickedBooks) {
        const ch = Math.floor(Math.random() * book.chapters) + 1;
        candidateTargets.push({ book, chapter: ch });
      }
    }

    const fetchedChapters = await Promise.all(
      candidateTargets.map(async ({ book, chapter }) => {
        let usedTrans = primaryTrans;
        let rows = await fetchBollsChapter(primaryTrans, book.id, chapter);
        if (rows.length === 0 && primaryTrans !== 'ESV') {
          rows = await fetchBollsChapter('ESV', book.id, chapter);
          usedTrans = 'ESV';
        }
        return rows.map((r) => ({
          bookId: book.id,
          bookName: book.name,
          chapters: book.chapters,
          chapter,
          verse: r.verse,
          text: r.text,
          transCode: usedTrans,
        }));
      })
    );

    const rawAllVerses: FetchedVerseRow[] = fetchedChapters
      .flat()
      .filter((v) => v.text.length >= 22);
    if (rawAllVerses.length === 0) {
      return [];
    }

    // Keep consistent translation language across verses and distractors
    const primaryLangVerses = rawAllVerses.filter(
      (v) => v.transCode === primaryTrans
    );
    const allVerses =
      primaryLangVerses.length >= 6 ? primaryLangVerses : rawAllVerses;

    // Build distractor word pool keyed by translation & morphological category
    interface PoolEntry {
      word: string;
      isProperOrMidCap: boolean;
      category: WordCategory;
    }
    const wordPoolsByTrans = new Map<string, PoolEntry[]>();
    const seenWordsByTrans = new Map<string, Set<string>>();

    for (const v of allVerses) {
      if (!wordPoolsByTrans.has(v.transCode)) {
        wordPoolsByTrans.set(v.transCode, []);
        seenWordsByTrans.set(v.transCode, new Set());
      }
      const pool = wordPoolsByTrans.get(v.transCode)!;
      const seen = seenWordsByTrans.get(v.transCode)!;
      const rawTokens = v.text.split(/\s+/);

      for (let ti = 0; ti < rawTokens.length; ti++) {
        const clean = stripTokenPunctuation(rawTokens[ti]);
        const isDigitToken = /^\d[\d,]*$/.test(clean);
        const isAlphaToken =
          clean.length >= 4 && clean.length <= 14 && /^[\p{L}]+$/u.test(clean);
        if (
          (isDigitToken || isAlphaToken) &&
          !COMMON_STOP_WORDS.has(clean.toLowerCase()) &&
          !seen.has(clean.toLowerCase())
        ) {
          seen.add(clean.toLowerCase());
          const startsUpper = /^[A-Z]/.test(clean);
          const prevEndedSentence =
            ti === 0 || /[.!?]["”']?$/.test(rawTokens[ti - 1] || '');
          const isProperOrMidCap = startsUpper && !prevEndedSentence;
          pool.push({
            word: clean,
            isProperOrMidCap,
            category: classifyWordCategory(clean, isProperOrMidCap),
          });
        }
      }
    }

    // Filter out duplicate refrain texts and interleave across chapters/books for rich variety
    const uniqueTextVerses: FetchedVerseRow[] = [];
    const seenVerseTexts = new Set<string>();
    for (const v of shuffleArray(allVerses)) {
      const textKey = v.text.toLowerCase();
      if (seenVerseTexts.has(textKey)) continue;
      seenVerseTexts.add(textKey);
      uniqueTextVerses.push(v);
    }

    // Interleave round-robin by (bookId, chapter) so rounds span multiple chapters/books
    const poolForSelection =
      params.ageGroup === 'kids'
        ? [
            ...uniqueTextVerses.filter(
              (v) => v.text.length >= 35 && v.text.length <= 145
            ),
            ...uniqueTextVerses.filter(
              (v) => v.text.length < 35 || v.text.length > 145
            ),
          ]
        : [
            ...uniqueTextVerses.filter((v) => v.text.length >= 50),
            ...uniqueTextVerses.filter((v) => v.text.length < 50),
          ];

    const buckets = new Map<string, FetchedVerseRow[]>();
    for (const v of poolForSelection) {
      const key = `${v.bookId}:${v.chapter}`;
      const list = buckets.get(key) || [];
      list.push(v);
      buckets.set(key, list);
    }
    const orderedVerses: FetchedVerseRow[] = [];
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
    const builtQuestions: NormalizedQuizQuestion[] = [];
    const usedVerseIds = new Set<string>();
    const seedBase = Math.floor(Math.random() * 1_000_000_000);

    const pickAdjacentChapters = (
      targetChapter: number,
      totalChapters: number
    ): number[] => {
      const offsets =
        params.ageGroup === 'kids'
          ? [-4, -3, -2, 2, 3, 4, -5, 5, -1, 1]
          : [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
      const nearby = offsets
        .map((off) => targetChapter + off)
        .filter((ch) => ch >= 1 && ch <= totalChapters && ch !== targetChapter);
      const uniqueNearby = Array.from(new Set(nearby));
      if (uniqueNearby.length >= 3) {
        return shuffleArray(uniqueNearby.slice(0, 6)).slice(0, 3);
      }
      const allOther = shuffleArray(
        Array.from({ length: totalChapters }, (_, i) => i + 1).filter(
          (ch) => ch !== targetChapter
        )
      );
      return allOther.slice(0, 3);
    };

    const pickNumberDistractors = (
      cleanAnswer: string,
      pool: PoolEntry[]
    ): string[] => {
      const isDigits = /^\d[\d,]*$/.test(cleanAnswer);
      const poolMatches = pool
        .filter(
          (e) =>
            e.category === 'number' &&
            e.word.toLowerCase() !== cleanAnswer.toLowerCase() &&
            /^\d[\d,]*$/.test(e.word) === isDigits
        )
        .map((e) => e.word);

      const fallbackDigits = [
        '3', '4', '7', '10', '12', '24', '40', '42', '70', '144', '666', '1,000', '1,260',
      ];
      const fallbackWords = [
        'three', 'four', 'five', 'six', 'seven', 'ten', 'twelve', 'twenty', 'forty', 'seventy',
      ];
      const curated = (isDigits ? fallbackDigits : fallbackWords).filter(
        (n) => n.toLowerCase() !== cleanAnswer.toLowerCase()
      );
      const combined = Array.from(
        new Set([...shuffleArray(poolMatches), ...shuffleArray(curated)])
      );
      return combined.slice(0, 3);
    };

    const tryBuildQuestionForVerse = (
      v: FetchedVerseRow,
      mechanicIdx: number,
      allowRepeat: boolean
    ): NormalizedQuizQuestion | null => {
      const verseKey = `${v.bookId}:${v.chapter}:${v.verse}`;
      if (usedVerseIds.has(verseKey)) return null;

      const ref = `${v.bookName} ${v.chapter}:${v.verse}`;
      const theme = classifyStoryTheme(v.bookName, v.text);
      const verseLower = v.text.toLowerCase();

      const buildBookLocator = (): NormalizedQuizQuestion | null => {
        if (params.bookMeta) return null;
        const snippet = makeConciseSnippet(v.text, 9);
        const question = prompts.bookPrompt.replace('{snippet}', snippet);
        if (!allowRepeat && askedSet.has(question.toLowerCase())) return null;

        const sameTestament = BIBLE_BOOKS.filter(
          (b) =>
            b.id !== v.bookId &&
            b.testament ===
              (BIBLE_BOOKS.find((m) => m.id === v.bookId)?.testament || 'OT')
        );
        const otherBooks = shuffleArray(
          sameTestament.length >= 3
            ? sameTestament
            : BIBLE_BOOKS.filter((b) => b.id !== v.bookId)
        )
          .slice(0, 3)
          .map((b) => b.name);
        const { options, correctIndex } = buildShuffledOptions(v.bookName, otherBooks);

        usedVerseIds.add(verseKey);
        return {
          id: `live-${seedBase}-${builtQuestions.length}`,
          question,
          options,
          correctIndex,
          reference: ref,
          storyTheme: theme,
        };
      };

      const buildChapterLocator = (): NormalizedQuizQuestion | null => {
        if (v.chapters < 4) return null;
        const snippet = makeConciseSnippet(v.text, 9);
        const question = prompts.chapterPrompt
          .replace('{book}', v.bookName)
          .replace('{snippet}', snippet);
        if (!allowRepeat && askedSet.has(question.toLowerCase())) return null;

        const candidateChapters = pickAdjacentChapters(v.chapter, v.chapters);
        const correctOpt = prompts.chapterOption.replace('{n}', String(v.chapter));
        const distractorOpts = candidateChapters.map((ch) =>
          prompts.chapterOption.replace('{n}', String(ch))
        );
        const { options, correctIndex } = buildShuffledOptions(
          correctOpt,
          distractorOpts
        );

        usedVerseIds.add(verseKey);
        return {
          id: `live-${seedBase}-${builtQuestions.length}`,
          question,
          options,
          correctIndex,
          reference: ref,
          storyTheme: theme,
        };
      };

      const buildNextBookQuestion = (): NormalizedQuizQuestion | null => {
        if (params.bookMeta) return null;
        const bookIdx = BIBLE_BOOKS.findIndex((b) => b.id === v.bookId);
        if (bookIdx < 0 || bookIdx >= BIBLE_BOOKS.length - 1) return null;
        const nextBook = BIBLE_BOOKS[bookIdx + 1];
        const question = prompts.nextBookPrompt.replace('{book}', v.bookName);
        if (!allowRepeat && askedSet.has(question.toLowerCase())) return null;

        const sameTestament = BIBLE_BOOKS.filter(
          (b) =>
            b.id !== v.bookId &&
            b.id !== nextBook.id &&
            b.testament === nextBook.testament
        );
        const otherBooks = shuffleArray(
          sameTestament.length >= 3
            ? sameTestament
            : BIBLE_BOOKS.filter((b) => b.id !== v.bookId && b.id !== nextBook.id)
        )
          .slice(0, 3)
          .map((b) => b.name);
        const { options, correctIndex } = buildShuffledOptions(nextBook.name, otherBooks);

        usedVerseIds.add(verseKey);
        return {
          id: `live-${seedBase}-${builtQuestions.length}`,
          question,
          options,
          correctIndex,
          reference: `${nextBook.name} 1:1`,
          storyTheme: theme,
        };
      };

      // Rotate across non-"Complete" multiple-choice styles
      if (!effectiveSingleBook) {
        if (mechanicIdx % 4 === 1) {
          const bookQ = buildBookLocator();
          if (bookQ) return bookQ;
        }
        if (mechanicIdx % 4 === 3 && (!params.categoryBooks || params.categoryBooks.length === 0)) {
          const orderQ = buildNextBookQuestion();
          if (orderQ) return orderQ;
        }
      } else if (mechanicIdx % 3 === 1) {
        const chapQ = buildChapterLocator();
        if (chapQ) return chapQ;
      }

      // Build direct Who / Number / Word comprehension questions (zero "Complete:" blanks)
      const tokens = v.text.split(/\s+/).filter(Boolean);
      const wordPool = wordPoolsByTrans.get(v.transCode) || [];

      interface CandidateTarget {
        idx: number;
        clean: string;
        category: WordCategory;
        score: number;
      }

      const candidates: CandidateTarget[] = [];
      for (let i = 0; i < tokens.length; i++) {
        const clean = stripTokenPunctuation(tokens[i]);
        const isDigitToken = /^\d[\d,]*$/.test(clean);
        const isAlphaToken =
          clean.length >= 4 && clean.length <= 14 && /^[\p{L}]+$/u.test(clean);
        if (!isDigitToken && !isAlphaToken) continue;
        if (COMMON_STOP_WORDS.has(clean.toLowerCase())) continue;
        // Skip all-caps divine titles and capitalized exclamations/adverbs
        if (/^(?:LORD|GOD|JESUS|CHRIST|Alas|Woe|Amen|Truly|Surely|Blessed|Behold|Holy|Therefore|Moreover|Nevertheless|Meanwhile|However|Indeed|Saying)$/.test(clean)) {
          continue;
        }

        const startsUpper = /^[A-Z]/.test(clean);
        const prevEndedSentence =
          i === 0 || /[.!?:;“"«—]$/.test(tokens[i - 1] || '');
        const isProperOrMidCap = startsUpper && !prevEndedSentence;
        const category = classifyWordCategory(clean, isProperOrMidCap);

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
            .map((w) =>
              isTitleCase ? w.charAt(0).toUpperCase() + w.slice(1) : w
            );
        } else {
          const notInVerse = (w: PoolEntry) =>
            w.word.toLowerCase() !== cand.clean.toLowerCase() &&
            !verseLower.includes(w.word.toLowerCase()) &&
            !/^(?:LORD|GOD)$/i.test(w.word);

          const sameCategoryClose = wordPool.filter(
            (w) =>
              notInVerse(w) &&
              w.category === cand.category &&
              Math.abs(w.word.length - cand.clean.length) <= 4
          );
          const sameCategoryAny = wordPool.filter(
            (w) => notInVerse(w) && w.category === cand.category
          );
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

          const chosenPool =
            sameCategoryClose.length >= 3
              ? sameCategoryClose
              : sameCategoryAny.length >= 3
              ? sameCategoryAny
              : [...sameCategoryAny, ...fallbackGeneral];

          formattedDistractors = shuffleArray(chosenPool)
            .slice(0, 6)
            .map((w) => {
              if (isTitleCase || w.isProperOrMidCap) {
                return w.word.charAt(0).toUpperCase() + w.word.slice(1);
              }
              return w.word.toLowerCase();
            });
        }

        if (formattedDistractors.length < 3) continue;

        const { options, correctIndex } = buildShuffledOptions(
          cand.clean,
          formattedDistractors
        );
        if (new Set(options.map((o) => o.toLowerCase())).size !== 4) continue;

        const clue = extractContextClue(tokens, cand.idx, cand.clean, options);
        let question: string;
        if (cand.category === 'proper') {
          question = clue
            ? prompts.nameWithCluePrompt
                .replace('{ref}', ref)
                .replace('{clue}', clue)
            : prompts.nameInRefPrompt.replace('{ref}', ref);
        } else if (cand.category === 'number') {
          question = clue
            ? prompts.numberWithCluePrompt
                .replace('{ref}', ref)
                .replace('{clue}', clue)
            : prompts.numberInRefPrompt.replace('{ref}', ref);
        } else {
          question = clue
            ? prompts.wordWithCluePrompt
                .replace('{ref}', ref)
                .replace('{clue}', clue)
            : prompts.wordInRefPrompt.replace('{ref}', ref);
        }

        if (!allowRepeat && askedSet.has(question.toLowerCase())) continue;

        usedVerseIds.add(verseKey);
        return {
          id: `live-${seedBase}-${builtQuestions.length}`,
          question,
          options,
          correctIndex,
          reference: ref,
          storyTheme: theme,
        };
      }

      // Secondary fallbacks (still zero "Complete:" questions)
      const fallbackBookQ = buildBookLocator();
      if (fallbackBookQ) return fallbackBookQ;

      const fallbackChapterQ = buildChapterLocator();
      if (fallbackChapterQ) return fallbackChapterQ;

      const fallbackOrderQ = buildNextBookQuestion();
      if (fallbackOrderQ) return fallbackOrderQ;

      return null;
    };

    // Pass 1: strictly unseen questions
    for (let i = 0; i < orderedVerses.length && builtQuestions.length < targetCount; i++) {
      const q = tryBuildQuestionForVerse(orderedVerses[i], builtQuestions.length, false);
      if (q) builtQuestions.push(q);
    }

    // Pass 2: if a tiny 1-chapter book exhausted unseen verses, still deliver up to targetCount from that book
    if (builtQuestions.length < targetCount) {
      for (let i = 0; i < orderedVerses.length && builtQuestions.length < targetCount; i++) {
        const q = tryBuildQuestionForVerse(orderedVerses[i], builtQuestions.length, true);
        if (q) builtQuestions.push(q);
      }
    }

    return builtQuestions.slice(0, targetCount);
  }

  // Dynamic Zero-Repeat Quiz Engine (Free-Tier Gemini 2.5 Flash / Flash-Lite + Strict Book Guard + Live 66-Book Bible API)
  app.post('/api/quiz/generate', async (req: Request, res: Response) => {
    try {
      const lang = ALLOWED_LANGS.has(String(req.body?.lang || 'en'))
        ? String(req.body.lang)
        : 'en';
      const ageGroup = ['kids', 'teens', 'adults'].includes(
        String(req.body?.ageGroup || 'adults')
      )
        ? String(req.body.ageGroup)
        : 'adults';
      const bookFilter = String(req.body?.bookFilter || 'all').trim();
      const categoryId = typeof req.body?.categoryId === 'string'
        ? req.body.categoryId.trim()
        : '';
      const categoryMeta = categoryId ? getQuizCategoryById(categoryId) : undefined;
      const categoryBooks = categoryMeta
        ? categoryMeta.bookIds
            .map((id) => findBookById(id))
            .filter((b): b is NonNullable<typeof b> => Boolean(b))
        : undefined;

      const askedQuestions = Array.isArray(req.body?.askedQuestions)
        ? (req.body.askedQuestions as unknown[])
            .filter((q): q is string => typeof q === 'string')
            .slice(-80)
        : [];

      const bookMeta =
        categoryMeta && categoryBooks && categoryBooks.length === 1
          ? categoryBooks[0]
          : !categoryMeta && bookFilter !== 'all'
          ? findBookByQuery(bookFilter) || null
          : null;
      if (!categoryMeta && bookFilter !== 'all' && !bookMeta) {
        return res.status(400).json({
          error: `Unknown Bible book selected: ${bookFilter}`,
        });
      }

      const effectiveAgeGroup = categoryMeta?.hardMode ? 'adults' : ageGroup;

      // When Gemini API key is not configured in preview, generate live book/category-filtered questions via bolls.life
      if (!hasGeminiKey()) {
        const liveQuestions = await generateLiveBibleApiQuizRound({
          lang,
          ageGroup: effectiveAgeGroup,
          bookMeta,
          categoryBooks,
          askedQuestions,
          count: 6,
        });
        if (liveQuestions.length === 0) {
          return res.status(502).json({
            error:
              'Unable to load live questions from the Bible service right now. Please check your connection and retry.',
          });
        }
        return res.json({ questions: liveQuestions, source: 'bolls.life' });
      }

      const anchorPool =
        categoryBooks && categoryBooks.length > 0 ? categoryBooks : BIBLE_BOOKS;
      const anchorBook =
        bookMeta ||
        anchorPool[Math.floor(Math.random() * anchorPool.length)];
      const randomChapter =
        Math.floor(Math.random() * anchorBook.chapters) + 1;
      const randomSeed = Math.floor(Math.random() * 1_000_000_000);

      const ageGuidance =
        effectiveAgeGroup === 'kids'
          ? 'Kids ages 5-9 (Challenging Mode): test real Bible story details, specific names, numbers, and turning points with 4 closely plausible biblical options from the same book.'
          : effectiveAgeGroup === 'teens'
          ? 'Teens ages 10-17 (Hard Mode): test nuanced Scripture events, speakers, prophetic symbols, exact numbers, and cross-chapter facts with 4 deceptive same-category biblical distractors.'
          : 'Adults 18+ (Master Scholar Mode): demand deep biblical mastery—test specific speakers, less-obvious cross-chapter details, covenants, numbers, geography, and theology, using 4 highly plausible same-category options so nothing can be guessed.';

      const askedJson = JSON.stringify(askedQuestions);
      const categoryContext = categoryMeta
        ? `Quiz Pack Theme: "${categoryMeta.title}" (${categoryMeta.subtitle}). Draw questions strictly from books in this pack (${anchorPool.map((b) => b.name).join(', ')}).`
        : '';
      const systemInstruction = bookMeta
        ? `You MUST generate 6 challenging, thought-provoking, brand-new multiple-choice trivia questions strictly and exclusively from the Bible book of ${bookMeta.name} (Chapter ${randomChapter}). ${categoryContext} Ask crisp conceptual questions testing authorship, geography, people, exact counts/durations, prophets, kings, and key events inside ${bookMeta.name}—NOT lazy verse fill-in-the-blanks. Make all 4 options grammatically identical and biblically plausible from ${bookMeta.name}. Do NOT ask general Bible questions from other books. Do NOT repeat any of these previous questions: ${askedJson}.`
        : `You MUST generate 6 challenging, thought-provoking, brand-new multiple-choice trivia questions ${categoryMeta ? `strictly for the category "${categoryMeta.title}" (${categoryMeta.subtitle})` : 'from across the Bible'}, drawing fresh inspiration from ${anchorBook.name} (Chapter ${randomChapter}) and ${categoryMeta ? `these pack books: ${anchorPool.map((b) => b.name).join(', ')}` : 'varied books across the Old and New Testaments'}. Ask crisp conceptual questions testing authorship, captivity locations, exact numbers, people, kings, prophets, and key events—NOT lazy verse fill-in-the-blanks. Make all 4 options plausible and grammatically matched so players cannot guess without knowing Scripture. Do NOT repeat any of these previous questions: ${askedJson}.`;

      const langName = LANG_NAMES[lang] || 'English';
      const contentsPrompt = `Generate 6 challenging, unique multiple-choice Bible quiz questions in ${langName} (Seed: ${randomSeed}).
Audience: ${ageGuidance}
${categoryMeta ? `Category Pack: ${categoryMeta.title} — ${categoryMeta.subtitle}.` : ''}
${bookMeta ? `Target Book: ${bookMeta.name}, Anchor Chapter: ${randomChapter} (if ${bookMeta.name} has multiple chapters and you need variety while staying strictly inside ${bookMeta.name}, prioritize Chapter ${randomChapter} first and stay 100% inside ${bookMeta.name}).` : `Anchor Book: ${anchorBook.name}, Chapter ${randomChapter}.`}

Example question style to match:
- "Where were the Israelites held captive for 70 years?" -> ["Babylon", "Damascus", "Egypt", "Assyria"]
- "Who was the Apostle who wrote the book of 2 Timothy?" -> ["John", "Paul", "Peter", "James"]

Requirements:
- All questions, 4 options, and Scripture references must be written in ${langName}.
- Write direct, engaging conceptual questions ("Who was...", "Where were...", "How many...", "Which king/prophet/city..."). Do NOT use fill-in-the-blank quotes with underscores.
- Avoid overly easy giveaways or clue words in the question text; test genuine knowledge of Scripture details, authors, counts, locations, and prophecies.
- All 4 options MUST share the same grammatical/semantic category (e.g., 4 real biblical names, 4 real numbers, 4 real cities/nations, or 4 matching doctrinal terms).
- Keep each question concise (under 14 words) so it fits cleanly on a wooden signboard banner.
- Keep each option concise (1-4 words).
- Set correctIndex to 0, 1, 2, or 3 matching the exact correct option.
- Pick storyTheme from: "noah" (flood/ark/creation/animals), "david" (shepherds/battles/kings/OT heroes), "whale" (sea/Red Sea/Jonah/islands/ships), "shepherd" (Jesus/Gospels/miracles/parables/hills), or "bible" (Scripture/epistles/prophecy/general).`;

      const quizSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER },
            reference: { type: Type.STRING },
            storyTheme: { type: Type.STRING },
          },
          required: [
            'question',
            'options',
            'correctIndex',
            'reference',
            'storyTheme',
          ],
        },
      };

      const askedSet = new Set(
        askedQuestions.map((q) => q.trim().toLowerCase())
      );
      let validatedGemini: NormalizedQuizQuestion[] = [];

      try {
        const ai = getGeminiClient();
        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsPrompt,
            config: {
              systemInstruction,
              temperature: 1.0,
              seed: randomSeed,
              responseMimeType: 'application/json',
              responseSchema: quizSchema,
            },
          });
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: contentsPrompt,
            config: {
              systemInstruction,
              temperature: 1.0,
              seed: randomSeed,
              responseMimeType: 'application/json',
              responseSchema: quizSchema,
            },
          });
        }

        const rawText = (response.text ?? '[]')
          .trim()
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        const rawList = JSON.parse(rawText) as Array<{
          question?: string;
          options?: string[];
          correctIndex?: number;
          reference?: string;
          storyTheme?: string;
        }>;

        if (Array.isArray(rawList)) {
          const normalized = rawList.slice(0, 8).map((item, idx) => {
            const opts = Array.isArray(item.options)
              ? item.options.slice(0, 4).map((o) => String(o).trim())
              : [];
            while (opts.length < 4) {
              opts.push(`Option ${opts.length + 1}`);
            }
            const safeCorrect =
              typeof item.correctIndex === 'number' &&
              item.correctIndex >= 0 &&
              item.correctIndex <= 3
                ? (item.correctIndex as 0 | 1 | 2 | 3)
                : 0;
            const theme = [
              'noah',
              'david',
              'whale',
              'shepherd',
              'bible',
            ].includes(String(item.storyTheme))
              ? String(item.storyTheme)
              : 'bible';

            return {
              id: `gem-${randomSeed}-${idx}`,
              question: String(item.question || '').trim(),
              options: opts as [string, string, string, string],
              correctIndex: safeCorrect,
              reference: String(
                item.reference || `${anchorBook.name} ${randomChapter}:1`
              ).trim(),
              storyTheme: theme,
            };
          });

          // Enforce strict selected-book, anti-repeat, and zero-complete-style validation
          const isDisallowedCompleteStyle = (q: string): boolean => {
            const trimmed = q.trim();
            if (/_{2,}|\[\s*blank\s*\]/i.test(trimmed)) return true;
            if (
              /^(?:complete|completa|compl[eé]tez|kamilisha|erg[aä]nze|أكمل|पूरा करें|补全)\s*[:：]/i.test(
                trimmed
              )
            ) {
              return true;
            }
            return false;
          };

          validatedGemini = normalized.filter((item) => {
            if (!item.question) return false;
            if (isDisallowedCompleteStyle(item.question)) return false;
            if (askedSet.has(item.question.toLowerCase())) return false;
            if (bookMeta && !isReferenceForBook(item.reference, bookMeta)) {
              return false;
            }
            return true;
          });
        }
      } catch {
        // Upstream Gemini failed; fall through to live Bible API quiz engine
      }

      if (validatedGemini.length >= 6) {
        return res.json({
          questions: validatedGemini.slice(0, 6),
          source: 'gemini',
        });
      }

      // Top up or generate full round live via bolls.life strictly scoped to bookMeta / categoryBooks (zero static fallbacks)
      const needed = 6 - validatedGemini.length;
      const liveExtras = await generateLiveBibleApiQuizRound({
        lang,
        ageGroup: effectiveAgeGroup,
        bookMeta,
        categoryBooks,
        askedQuestions: [
          ...askedQuestions,
          ...validatedGemini.map((q) => q.question),
        ],
        count: needed,
      });

      const combined = [...validatedGemini, ...liveExtras].slice(0, 6);
      if (combined.length === 0) {
        return res.status(502).json({
          error:
            'Unable to generate live Bible quiz questions right now. Please retry.',
        });
      }

      return res.json({
        questions: combined,
        source: validatedGemini.length > 0 ? 'gemini+bolls.life' : 'bolls.life',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate quiz questions.';
      return res.status(500).json({ error: message });
    }
  });

  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Bible Quest: Daily Verse & Quiz server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
