import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { BIBLE_BOOKS, findBookById, findBookByQuery } from './src/data/bibleBooks';
import { getQuizCategoryById } from './src/data/categories';
import type { AgeGroup, LanguageCode, StoryTheme, VerseItem } from './src/types';

const PORT = Number(process.env.PORT) || 3000;

const BOLLS_TRANSLATION_MAP: Record<LanguageCode, string> = {
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

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
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

const VALID_LANGS = new Set<LanguageCode>([
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

function normalizeLang(input: unknown): LanguageCode {
  if (typeof input === 'string' && VALID_LANGS.has(input as LanguageCode)) {
    return input as LanguageCode;
  }
  return 'en';
}

function cleanScriptureText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHighlightPrefix(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 5) return text;
  return words.slice(0, 5).join(' ');
}

interface BollsChapterVerse {
  pk?: number;
  verse: number;
  text: string;
}

interface BollsSearchRow {
  pk?: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  translation?: string;
}

const serverChapterCache = new Map<
  string,
  { rows: BollsChapterVerse[]; usedVersion: string; cachedAt: number }
>();

async function fetchBollsChapter(
  translation: string,
  bookId: number,
  chapter: number
): Promise<{ rows: BollsChapterVerse[]; usedVersion: string }> {
  const cacheKey = `${translation}:${bookId}:${chapter}`;
  const cached = serverChapterCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < 1000 * 60 * 60) {
    return { rows: cached.rows, usedVersion: cached.usedVersion };
  }

  const tryFetch = async (ver: string): Promise<BollsChapterVerse[]> => {
    const resp = await fetch(
      `https://bolls.life/get-text/${encodeURIComponent(ver)}/${bookId}/${chapter}/`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!resp.ok) {
      throw new Error(`Bolls API responded ${resp.status}`);
    }
    const data = (await resp.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is BollsChapterVerse =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as BollsChapterVerse).verse === 'number' &&
        typeof (row as BollsChapterVerse).text === 'string'
    );
  };

  try {
    const rows = await tryFetch(translation);
    if (rows.length > 0) {
      serverChapterCache.set(cacheKey, {
        rows,
        usedVersion: translation,
        cachedAt: Date.now(),
      });
      return { rows, usedVersion: translation };
    }
  } catch {
    // fallback to ESV below if primary translation failed
  }

  if (translation !== 'ESV') {
    const rows = await tryFetch('ESV');
    if (rows.length > 0) {
      serverChapterCache.set(cacheKey, {
        rows,
        usedVersion: 'ESV',
        cachedAt: Date.now(),
      });
      return { rows, usedVersion: 'ESV' };
    }
  }

  return { rows: [], usedVersion: translation };
}

function toVerseItem(
  bookId: number,
  chapter: number,
  verse: number,
  rawText: string,
  version: string,
  lang: LanguageCode
): VerseItem {
  const bookName = findBookById(bookId)?.name ?? `Book ${bookId}`;
  const text = cleanScriptureText(rawText);
  return {
    id: `${bookId}:${chapter}:${verse}`,
    bookId,
    bookName,
    chapter,
    verse,
    reference: `${bookName} ${chapter}:${verse}`,
    highlightPrefix: extractHighlightPrefix(text),
    text,
    version,
    themes: ['Faith', 'Scripture'],
    lang,
  };
}

interface GeneratedQuestionItem {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  reference: string;
  storyTheme: StoryTheme;
}

const VALID_THEMES = new Set<StoryTheme>([
  'noah',
  'david',
  'whale',
  'shepherd',
  'bible',
]);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      status: 'ok',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get('/api/bible/verse', async (req: Request, res: Response) => {
    try {
      const lang = normalizeLang(req.query.lang);
      const translation = BOLLS_TRANSLATION_MAP[lang] || 'ESV';

      const requestedBookId = Number(req.query.book) || 43;
      const bookMeta = findBookById(requestedBookId) || BIBLE_BOOKS[42];
      const requestedChapter = Number(req.query.chapter) || 3;
      const chapter = Math.min(Math.max(1, requestedChapter), bookMeta.chapters);
      const requestedVerse = req.query.verse ? Number(req.query.verse) : null;
      const isRandom = req.query.random === '1' || req.query.random === 'true';

      const seenRaw = typeof req.query.seen === 'string' ? req.query.seen : '';
      const seenSet = new Set(
        seenRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );

      const { rows, usedVersion } = await fetchBollsChapter(
        translation,
        bookMeta.id,
        chapter
      );
      if (rows.length === 0) {
        res.status(404).json({ error: 'Verse chapter could not be loaded.' });
        return;
      }

      let picked = rows[0];
      if (requestedVerse) {
        picked = rows.find((r) => r.verse === requestedVerse) || rows[0];
      } else if (isRandom) {
        const unseen = rows.filter(
          (r) => !seenSet.has(`${bookMeta.id}:${chapter}:${r.verse}`)
        );
        const pool = unseen.length > 0 ? unseen : rows;
        picked = pool[Math.floor(Math.random() * pool.length)];
      }

      res.json(
        toVerseItem(
          bookMeta.id,
          chapter,
          picked.verse,
          picked.text,
          usedVersion,
          lang
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load verse.';
      res.status(502).json({ error: message });
    }
  });

  app.get('/api/bible/search', async (req: Request, res: Response) => {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (query.length < 2) {
        res.json({ results: [] });
        return;
      }

      const lang = normalizeLang(req.query.lang);
      const translation = BOLLS_TRANSLATION_MAP[lang] || 'ESV';

      const refMatch = query.match(/^(.+?)\s+(\d+)(?:[:.](\d+))?$/);
      if (refMatch) {
        const matchedBook = findBookByQuery(refMatch[1]);
        if (matchedBook) {
          const chapter = Math.min(
            Math.max(1, parseInt(refMatch[2], 10)),
            matchedBook.chapters
          );
          const specificVerse = refMatch[3] ? parseInt(refMatch[3], 10) : null;
          const { rows, usedVersion } = await fetchBollsChapter(
            translation,
            matchedBook.id,
            chapter
          );
          const filtered = specificVerse
            ? rows.filter((r) => r.verse === specificVerse)
            : rows.slice(0, 12);

          if (filtered.length > 0) {
            res.json({
              results: filtered.map((r) =>
                toVerseItem(
                  matchedBook.id,
                  chapter,
                  r.verse,
                  r.text,
                  usedVersion,
                  lang
                )
              ),
            });
            return;
          }
        }
      }

      const searchBookOnly = findBookByQuery(query);
      if (searchBookOnly && query.split(/\s+/).length <= 3) {
        const { rows, usedVersion } = await fetchBollsChapter(
          translation,
          searchBookOnly.id,
          1
        );
        if (rows.length > 0) {
          res.json({
            results: rows
              .slice(0, 8)
              .map((r) =>
                toVerseItem(
                  searchBookOnly.id,
                  1,
                  r.verse,
                  r.text,
                  usedVersion,
                  lang
                )
              ),
          });
          return;
        }
      }

      const searchUrl = `https://bolls.life/v2/find/${encodeURIComponent(translation)}?search=${encodeURIComponent(query)}&match_case=false&match_whole=false`;
      const resp = await fetch(searchUrl);
      if (!resp.ok) {
        res.status(502).json({ error: `Bible search failed (${resp.status}).` });
        return;
      }

      const payload = (await resp.json()) as { results?: BollsSearchRow[] } | BollsSearchRow[];
      const rawResults = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

      const results = rawResults
        .filter(
          (row): row is BollsSearchRow =>
            typeof row === 'object' &&
            row !== null &&
            typeof row.book === 'number' &&
            typeof row.chapter === 'number' &&
            typeof row.verse === 'number' &&
            typeof row.text === 'string'
        )
        .slice(0, 15)
        .map((row) =>
          toVerseItem(
            row.book,
            row.chapter,
            row.verse,
            row.text,
            row.translation || translation,
            lang
          )
        );

      res.json({ results });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to search verses.';
      res.status(502).json({ error: message });
    }
  });

  app.post('/api/quiz/generate', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not set on server.',
      });
      return;
    }

    try {
      const body = (req.body || {}) as {
        lang?: unknown;
        ageGroup?: unknown;
        bookFilter?: unknown;
        categoryId?: unknown;
        askedQuestions?: unknown;
      };

      const lang = normalizeLang(body.lang);
      const languageName = LANGUAGE_LABELS[lang];
      const ageGroup: AgeGroup =
        body.ageGroup === 'kids' ||
        body.ageGroup === 'teens' ||
        body.ageGroup === 'adults'
          ? body.ageGroup
          : 'adults';
      const bookFilter =
        typeof body.bookFilter === 'string' && body.bookFilter.trim()
          ? body.bookFilter.trim()
          : 'all';
      const categoryId =
        typeof body.categoryId === 'string' ? body.categoryId.trim() : '';
      const category = categoryId ? getQuizCategoryById(categoryId) : undefined;
      const askedQuestions = Array.isArray(body.askedQuestions)
        ? body.askedQuestions
            .filter((q): q is string => typeof q === 'string')
            .slice(-18)
        : [];

      let scopeInstruction = 'Cover diverse Old and New Testament passages.';
      if (category) {
        const bookNames = category.bookIds
          .map((id) => findBookById(id)?.name)
          .filter(Boolean)
          .join(', ');
        scopeInstruction = `Focus on "${category.title}"${
          bookNames ? ` (${bookNames})` : ''
        }.${category.hardMode ? ' Include deeper prophetic details.' : ''}`;
      } else if (bookFilter !== 'all') {
        scopeInstruction = `Focus strictly on the Bible book "${bookFilter}".`;
      }

      const difficultyNote =
        ageGroup === 'kids'
          ? 'Keep questions friendly and clear for ages 6-11.'
          : ageGroup === 'teens'
            ? 'Make questions engaging for teens.'
            : 'Make questions thoughtful for adult readers.';

      const avoidBlock =
        askedQuestions.length > 0
          ? `Avoid repeating:\n- ${askedQuestions.join('\n- ')}`
          : '';

      const prompt = [
        `Generate 6 concise multiple-choice Bible quiz questions in ${languageName}.`,
        difficultyNote,
        scopeInstruction,
        avoidBlock,
        'Each item: concise question, 4 distinct short options, correctIndex (0-3), Scripture reference, storyTheme ("noah"|"david"|"whale"|"shepherd"|"bible").',
      ]
        .filter(Boolean)
        .join('\n');

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
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
              },
            },
            required: ['questions'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({ error: 'Empty response from quiz model.' });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        questions?: GeneratedQuestionItem[];
      };
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        res.status(502).json({ error: 'Quiz model returned no questions.' });
        return;
      }

      const sanitized = parsed.questions
        .filter(
          (q) =>
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            q.options.every((opt) => typeof opt === 'string' && opt.trim().length > 0) &&
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex <= 3 &&
            typeof q.reference === 'string'
        )
        .slice(0, 6)
        .map((q, idx) => ({
          id: `gemini-${Date.now()}-${idx}`,
          question: q.question.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctIndex: Math.floor(q.correctIndex),
          reference: q.reference.trim(),
          storyTheme: VALID_THEMES.has(q.storyTheme)
            ? q.storyTheme
            : category?.storyTheme || 'bible',
        }));

      if (sanitized.length === 0) {
        res
          .status(502)
          .json({ error: 'Quiz model returned invalid question items.' });
        return;
      }

      res.json({ questions: sanitized });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Quiz generation failed.';
      const status =
        typeof (err as { status?: unknown }).status === 'number'
          ? (err as { status: number }).status
          : /429|RESOURCE_EXHAUSTED|quota/i.test(message)
            ? 429
            : 502;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bible Quest server listening on http://localhost:${PORT}`);
  });
}

void startServer();
