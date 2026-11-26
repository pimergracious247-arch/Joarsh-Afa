import type { BibleBookMeta, LanguageCode } from '../types';

export const BIBLE_BOOKS: BibleBookMeta[] = [
  { id: 1, name: 'Genesis', testament: 'OT', chapters: 50 },
  { id: 2, name: 'Exodus', testament: 'OT', chapters: 40 },
  { id: 3, name: 'Leviticus', testament: 'OT', chapters: 27 },
  { id: 4, name: 'Numbers', testament: 'OT', chapters: 36 },
  { id: 5, name: 'Deuteronomy', testament: 'OT', chapters: 34 },
  { id: 6, name: 'Joshua', testament: 'OT', chapters: 24 },
  { id: 7, name: 'Judges', testament: 'OT', chapters: 21 },
  { id: 8, name: 'Ruth', testament: 'OT', chapters: 4 },
  { id: 9, name: '1 Samuel', testament: 'OT', chapters: 31 },
  { id: 10, name: '2 Samuel', testament: 'OT', chapters: 24 },
  { id: 11, name: '1 Kings', testament: 'OT', chapters: 22 },
  { id: 12, name: '2 Kings', testament: 'OT', chapters: 25 },
  { id: 13, name: '1 Chronicles', testament: 'OT', chapters: 29 },
  { id: 14, name: '2 Chronicles', testament: 'OT', chapters: 36 },
  { id: 15, name: 'Ezra', testament: 'OT', chapters: 10 },
  { id: 16, name: 'Nehemiah', testament: 'OT', chapters: 13 },
  { id: 17, name: 'Esther', testament: 'OT', chapters: 10 },
  { id: 18, name: 'Job', testament: 'OT', chapters: 42 },
  { id: 19, name: 'Psalms', testament: 'OT', chapters: 150 },
  { id: 20, name: 'Proverbs', testament: 'OT', chapters: 31 },
  { id: 21, name: 'Ecclesiastes', testament: 'OT', chapters: 12 },
  { id: 22, name: 'Song of Solomon', testament: 'OT', chapters: 8 },
  { id: 23, name: 'Isaiah', testament: 'OT', chapters: 66 },
  { id: 24, name: 'Jeremiah', testament: 'OT', chapters: 52 },
  { id: 25, name: 'Lamentations', testament: 'OT', chapters: 5 },
  { id: 26, name: 'Ezekiel', testament: 'OT', chapters: 48 },
  { id: 27, name: 'Daniel', testament: 'OT', chapters: 12 },
  { id: 28, name: 'Hosea', testament: 'OT', chapters: 14 },
  { id: 29, name: 'Joel', testament: 'OT', chapters: 3 },
  { id: 30, name: 'Amos', testament: 'OT', chapters: 9 },
  { id: 31, name: 'Obadiah', testament: 'OT', chapters: 1 },
  { id: 32, name: 'Jonah', testament: 'OT', chapters: 4 },
  { id: 33, name: 'Micah', testament: 'OT', chapters: 7 },
  { id: 34, name: 'Nahum', testament: 'OT', chapters: 3 },
  { id: 35, name: 'Habakkuk', testament: 'OT', chapters: 3 },
  { id: 36, name: 'Zephaniah', testament: 'OT', chapters: 3 },
  { id: 37, name: 'Haggai', testament: 'OT', chapters: 2 },
  { id: 38, name: 'Zechariah', testament: 'OT', chapters: 14 },
  { id: 39, name: 'Malachi', testament: 'OT', chapters: 4 },
  { id: 40, name: 'Matthew', testament: 'NT', chapters: 28 },
  { id: 41, name: 'Mark', testament: 'NT', chapters: 16 },
  { id: 42, name: 'Luke', testament: 'NT', chapters: 24 },
  { id: 43, name: 'John', testament: 'NT', chapters: 21 },
  { id: 44, name: 'Acts', testament: 'NT', chapters: 28 },
  { id: 45, name: 'Romans', testament: 'NT', chapters: 16 },
  { id: 46, name: '1 Corinthians', testament: 'NT', chapters: 16 },
  { id: 47, name: '2 Corinthians', testament: 'NT', chapters: 13 },
  { id: 48, name: 'Galatians', testament: 'NT', chapters: 6 },
  { id: 49, name: 'Ephesians', testament: 'NT', chapters: 6 },
  { id: 50, name: 'Philippians', testament: 'NT', chapters: 4 },
  { id: 51, name: 'Colossians', testament: 'NT', chapters: 4 },
  { id: 52, name: '1 Thessalonians', testament: 'NT', chapters: 5 },
  { id: 53, name: '2 Thessalonians', testament: 'NT', chapters: 3 },
  { id: 54, name: '1 Timothy', testament: 'NT', chapters: 6 },
  { id: 55, name: '2 Timothy', testament: 'NT', chapters: 4 },
  { id: 56, name: 'Titus', testament: 'NT', chapters: 3 },
  { id: 57, name: 'Philemon', testament: 'NT', chapters: 1 },
  { id: 58, name: 'Hebrews', testament: 'NT', chapters: 13 },
  { id: 59, name: 'James', testament: 'NT', chapters: 5 },
  { id: 60, name: '1 Peter', testament: 'NT', chapters: 5 },
  { id: 61, name: '2 Peter', testament: 'NT', chapters: 3 },
  { id: 62, name: '1 John', testament: 'NT', chapters: 5 },
  { id: 63, name: '2 John', testament: 'NT', chapters: 1 },
  { id: 64, name: '3 John', testament: 'NT', chapters: 1 },
  { id: 65, name: 'Jude', testament: 'NT', chapters: 1 },
  { id: 66, name: 'Revelation', testament: 'NT', chapters: 22 },
];

export const OLD_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(
  (b) => b.testament === 'OT'
);
export const NEW_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(
  (b) => b.testament === 'NT'
);

export const BOLLS_TRANSLATION_MAP: Record<LanguageCode, string> = {
  en: 'ESV',
  it: 'NR06',
  sw: 'SUV',
  fr: 'FRLSG',
  es: 'RV1960',
  pt: 'ARC09',
  de: 'LUT',
  ar: 'SVD',
  hi: 'HIOV',
  zh: 'CUNPS',
};

export const SECONDARY_BOLLS_TRANSLATION_MAP: Partial<Record<LanguageCode, string>> = {
  en: 'WEB',
  it: 'VULG',
  fr: 'NBS',
  es: 'NVI',
  pt: 'ARA',
  de: 'SCH',
  ar: 'NAV',
  zh: 'CUNP',
};

export function getTranslationCodesForLang(lang: LanguageCode): string[] {
  const primary = BOLLS_TRANSLATION_MAP[lang] || 'ESV';
  const secondary = SECONDARY_BOLLS_TRANSLATION_MAP[lang];
  return secondary && secondary !== primary ? [primary, secondary] : [primary];
}

type LocalizedNonEnglishLang = Exclude<LanguageCode, 'en'>;

export const LOCALIZED_BOOK_NAMES: Record<number, Record<LocalizedNonEnglishLang, string>> = {
  1: { fr: 'Genèse', pt: 'Gênesis', ar: 'التكوين', hi: 'उत्पत्ति', it: 'Genesi', sw: 'Mwanzo', es: 'Génesis', de: '1. Mose', zh: '创世记' },
  2: { fr: 'Exode', pt: 'Êxodo', ar: 'الخروج', hi: 'निर्गमन', it: 'Esodo', sw: 'Kutoka', es: 'Éxodo', de: '2. Mose', zh: '出埃及记' },
  3: { fr: 'Lévitique', pt: 'Levítico', ar: 'اللاويين', hi: 'लैव्यव्यवस्था', it: 'Levitico', sw: 'Mambo ya Walawi', es: 'Levítico', de: '3. Mose', zh: '利未记' },
  4: { fr: 'Nombres', pt: 'Números', ar: 'العدد', hi: 'गिनती', it: 'Numeri', sw: 'Hesabu', es: 'Números', de: '4. Mose', zh: '民数记' },
  5: { fr: 'Deutéronome', pt: 'Deuteronômio', ar: 'التثنية', hi: 'व्यवस्थाविवरण', it: 'Deuteronomio', sw: 'Kumbukumbu la Torati', es: 'Deuteronomio', de: '5. Mose', zh: '申命记' },
  6: { fr: 'Josué', pt: 'Josué', ar: 'يشوع', hi: 'यहोशू', it: 'Giosuè', sw: 'Yoshua', es: 'Josué', de: 'Josua', zh: '约书亚记' },
  7: { fr: 'Juges', pt: 'Juízes', ar: 'القضاة', hi: 'न्यायियों', it: 'Giudici', sw: 'Waamuzi', es: 'Jueces', de: 'Richter', zh: '士师记' },
  8: { fr: 'Ruth', pt: 'Rute', ar: 'راعوث', hi: 'रूत', it: 'Rut', sw: 'Ruthu', es: 'Rut', de: 'Rut', zh: '路得记' },
  9: { fr: '1 Samuel', pt: '1 Samuel', ar: '١ صموئيل', hi: '1 शमूएल', it: '1 Samuele', sw: '1 Samweli', es: '1 Samuel', de: '1. Samuel', zh: '撒母耳记上' },
  10: { fr: '2 Samuel', pt: '2 Samuel', ar: '٢ صموئيل', hi: '2 शमूएल', it: '2 Samuele', sw: '2 Samweli', es: '2 Samuel', de: '2. Samuel', zh: '撒母耳记下' },
  11: { fr: '1 Rois', pt: '1 Reis', ar: '١ ملوك', hi: '1 राजा', it: '1 Re', sw: '1 Wafalme', es: '1 Reyes', de: '1. Könige', zh: '列王纪上' },
  12: { fr: '2 Rois', pt: '2 Reis', ar: '٢ ملوك', hi: '2 राजा', it: '2 Re', sw: '2 Wafalme', es: '2 Reyes', de: '2. Könige', zh: '列王纪下' },
  13: { fr: '1 Chroniques', pt: '1 Crônicas', ar: '١ أخبار الأيام', hi: '1 इतिहास', it: '1 Cronache', sw: '1 Mambo ya Nyakati', es: '1 Crónicas', de: '1. Chronik', zh: '历代志上' },
  14: { fr: '2 Chroniques', pt: '2 Crônicas', ar: '٢ أخبار الأيام', hi: '2 इतिहास', it: '2 Cronache', sw: '2 Mambo ya Nyakati', es: '2 Crónicas', de: '2. Chronik', zh: '历代志下' },
  15: { fr: 'Esdras', pt: 'Esdras', ar: 'عزرا', hi: 'एज्रा', it: 'Esdra', sw: 'Ezra', es: 'Esdras', de: 'Esra', zh: '以斯拉记' },
  16: { fr: 'Néhémie', pt: 'Neemias', ar: 'نحميا', hi: 'नहेमायाह', it: 'Neemia', sw: 'Nehemia', es: 'Nehemías', de: 'Nehemia', zh: '尼希米记' },
  17: { fr: 'Esther', pt: 'Ester', ar: 'أستير', hi: 'एस्तेर', it: 'Ester', sw: 'Esta', es: 'Ester', de: 'Ester', zh: '以斯帖记' },
  18: { fr: 'Job', pt: 'Jó', ar: 'أيوب', hi: 'अय्यूब', it: 'Giobbe', sw: 'Ayubu', es: 'Job', de: 'Hiob', zh: '约伯记' },
  19: { fr: 'Psaumes', pt: 'Salmos', ar: 'المزامير', hi: 'भजन संहिता', it: 'Salmi', sw: 'Zaburi', es: 'Salmos', de: 'Psalmen', zh: '诗篇' },
  20: { fr: 'Proverbes', pt: 'Provérbios', ar: 'الأمثال', hi: 'नीतिवचन', it: 'Proverbi', sw: 'Mithali', es: 'Proverbios', de: 'Sprüche', zh: '箴言' },
  21: { fr: 'Ecclésiaste', pt: 'Eclesiastes', ar: 'الجامعة', hi: 'सभोपदेशक', it: 'Ecclesiaste', sw: 'Mhubiri', es: 'Eclesiastés', de: 'Prediger', zh: '传道书' },
  22: { fr: 'Cantique des Cantiques', pt: 'Cantares', ar: 'نشيد الأنشاد', hi: 'श्रेष्ठगीत', it: 'Cantico dei Cantici', sw: 'Wimbo Ulio Bora', es: 'Cantares', de: 'Hoheslied', zh: '雅歌' },
  23: { fr: 'Ésaïe', pt: 'Isaías', ar: 'إشعياء', hi: 'यशायाह', it: 'Isaia', sw: 'Isaya', es: 'Isaías', de: 'Jesaja', zh: '以赛亚书' },
  24: { fr: 'Jérémie', pt: 'Jeremias', ar: 'إرميا', hi: 'यिर्मयाह', it: 'Geremia', sw: 'Yeremia', es: 'Jeremías', de: 'Jeremia', zh: '耶利米书' },
  25: { fr: 'Lamentations', pt: 'Lamentações', ar: 'مراثي إرميا', hi: 'विलापगीत', it: 'Lamentazioni', sw: 'Maombolezo', es: 'Lamentaciones', de: 'Klagelieder', zh: '耶利米哀歌' },
  26: { fr: 'Ézéchiel', pt: 'Ezequiel', ar: 'حزقيال', hi: 'यहेजकेल', it: 'Ezechiele', sw: 'Ezekieli', es: 'Ezequiel', de: 'Hesekiel', zh: '以西结书' },
  27: { fr: 'Daniel', pt: 'Daniel', ar: 'دانيال', hi: 'दानिय्येल', it: 'Daniele', sw: 'Danieli', es: 'Daniel', de: 'Daniel', zh: '但以理书' },
  28: { fr: 'Osée', pt: 'Oséias', ar: 'هوشع', hi: 'होशे', it: 'Osea', sw: 'Hosea', es: 'Oseas', de: 'Hosea', zh: '何西阿书' },
  29: { fr: 'Joël', pt: 'Joel', ar: 'يوئيل', hi: 'योएल', it: 'Gioele', sw: 'Yoeli', es: 'Joel', de: 'Joel', zh: '约珥书' },
  30: { fr: 'Amos', pt: 'Amós', ar: 'عاموس', hi: 'आमोस', it: 'Amos', sw: 'Amosi', es: 'Amós', de: 'Amos', zh: '阿摩司书' },
  31: { fr: 'Abdias', pt: 'Obadias', ar: 'عوبديا', hi: 'ओबद्याह', it: 'Abdia', sw: 'Obadia', es: 'Abdías', de: 'Obadja', zh: '俄巴底亚书' },
  32: { fr: 'Jonas', pt: 'Jonas', ar: 'يونان', hi: 'योना', it: 'Giona', sw: 'Yona', es: 'Jonás', de: 'Jona', zh: '约拿书' },
  33: { fr: 'Michée', pt: 'Miquéias', ar: 'ميخا', hi: 'मीका', it: 'Michea', sw: 'Mika', es: 'Miqueas', de: 'Micha', zh: '弥迦书' },
  34: { fr: 'Nahum', pt: 'Naum', ar: 'ناحوم', hi: 'नहूम', it: 'Naum', sw: 'Nahumu', es: 'Nahúm', de: 'Nahum', zh: '那鸿书' },
  35: { fr: 'Habacuc', pt: 'Habacuque', ar: 'حبقوق', hi: 'हबक्कूक', it: 'Abacuc', sw: 'Habakuki', es: 'Habacuc', de: 'Habakuk', zh: '哈巴谷书' },
  36: { fr: 'Sophonie', pt: 'Sofonias', ar: 'صفنيا', hi: 'सपन्याह', it: 'Sofonia', sw: 'Sefania', es: 'Sofonías', de: 'Zefanja', zh: '西番雅书' },
  37: { fr: 'Aggée', pt: 'Ageu', ar: 'حجي', hi: 'हाग्गै', it: 'Aggeo', sw: 'Hagai', es: 'Hageo', de: 'Haggai', zh: '哈该书' },
  38: { fr: 'Zacharie', pt: 'Zacarias', ar: 'زكريا', hi: 'जकर्याह', it: 'Zaccaria', sw: 'Zekaria', es: 'Zacarías', de: 'Sacharja', zh: '撒迦利亚书' },
  39: { fr: 'Malachie', pt: 'Malaquias', ar: 'ملاخي', hi: 'मलाकी', it: 'Malachia', sw: 'Malaki', es: 'Malaquías', de: 'Maleachi', zh: '玛拉基书' },
  40: { fr: 'Matthieu', pt: 'Mateus', ar: 'متى', hi: 'मत्ती', it: 'Matteo', sw: 'Mathayo', es: 'Mateo', de: 'Matthäus', zh: '马太福音' },
  41: { fr: 'Marc', pt: 'Marcos', ar: 'مرقس', hi: 'मरकुस', it: 'Marco', sw: 'Marko', es: 'Marcos', de: 'Markus', zh: '马可福音' },
  42: { fr: 'Luc', pt: 'Lucas', ar: 'لوقا', hi: 'लूका', it: 'Luca', sw: 'Luka', es: 'Lucas', de: 'Lukas', zh: '路加福音' },
  43: { fr: 'Jean', pt: 'João', ar: 'يوحنا', hi: 'यूहन्ना', it: 'Giovanni', sw: 'Yohana', es: 'Juan', de: 'Johannes', zh: '约翰福音' },
  44: { fr: 'Actes', pt: 'Atos', ar: 'أعمال الرسل', hi: 'प्रेरितों के काम', it: 'Atti', sw: 'Matendo ya Mitume', es: 'Hechos', de: 'Apostelgeschichte', zh: '使徒行传' },
  45: { fr: 'Romains', pt: 'Romanos', ar: 'رومية', hi: 'रोमियों', it: 'Romani', sw: 'Warumi', es: 'Romanos', de: 'Römer', zh: '罗马书' },
  46: { fr: '1 Corinthiens', pt: '1 Coríntios', ar: '١ كورنثوس', hi: '1 कुरिन्थियों', it: '1 Corinzi', sw: '1 Wakorintho', es: '1 Corintios', de: '1. Korinther', zh: '哥林多前书' },
  47: { fr: '2 Corinthiens', pt: '2 Coríntios', ar: '٢ كورنثوس', hi: '2 कुरिन्थियों', it: '2 Corinzi', sw: '2 Wakorintho', es: '2 Corintios', de: '2. Korinther', zh: '哥林多后书' },
  48: { fr: 'Galates', pt: 'Gálatas', ar: 'غلاطية', hi: 'गलातियों', it: 'Galati', sw: 'Wagalatia', es: 'Gálatas', de: 'Galater', zh: '加拉太书' },
  49: { fr: 'Éphésiens', pt: 'Efésios', ar: 'أفسس', hi: 'इफिसियों', it: 'Efesini', sw: 'Waefeso', es: 'Efesios', de: 'Epheser', zh: '以弗所书' },
  50: { fr: 'Philippiens', pt: 'Filipenses', ar: 'فيلبي', hi: 'फिलिप्पियों', it: 'Filippesi', sw: 'Wafilipi', es: 'Filipenses', de: 'Philipper', zh: '腓立比书' },
  51: { fr: 'Colossiens', pt: 'Colossenses', ar: 'كولوسي', hi: 'कुलुस्सियों', it: 'Colossesi', sw: 'Wakolosai', es: 'Colosenses', de: 'Kolosser', zh: '歌罗西书' },
  52: { fr: '1 Thessaloniciens', pt: '1 Tessalonicenses', ar: '١ تسالونيكي', hi: '1 थिस्सलुनीकियों', it: '1 Tessalonicesi', sw: '1 Wathesalonike', es: '1 Tesalonicenses', de: '1. Thessalonicher', zh: '帖撒罗尼迦前书' },
  53: { fr: '2 Thessaloniciens', pt: '2 Tessalonicenses', ar: '٢ تسالونيكي', hi: '2 थिस्सलुनीकियों', it: '2 Tessalonicesi', sw: '2 Wathesalonike', es: '2 Tesalonicenses', de: '2. Thessalonicher', zh: '帖撒罗尼迦后书' },
  54: { fr: '1 Timothée', pt: '1 Timóteo', ar: '١ تيموثاوس', hi: '1 तीमुथियुस', it: '1 Timoteo', sw: '1 Timotheo', es: '1 Timoteo', de: '1. Timotheus', zh: '提摩太前书' },
  55: { fr: '2 Timothée', pt: '2 Timóteo', ar: '٢ تيموثاوس', hi: '2 तीमुथियुस', it: '2 Timoteo', sw: '2 Timotheo', es: '2 Timoteo', de: '2. Timotheus', zh: '提摩太后书' },
  56: { fr: 'Tite', pt: 'Tito', ar: 'تيطس', hi: 'तीतुस', it: 'Tito', sw: 'Tito', es: 'Tito', de: 'Titus', zh: '提多书' },
  57: { fr: 'Philémon', pt: 'Filemom', ar: 'فليمون', hi: 'फिलेमोन', it: 'Filemone', sw: 'Filemoni', es: 'Filemón', de: 'Philemon', zh: '腓利门书' },
  58: { fr: 'Hébreux', pt: 'Hebreus', ar: 'العبرانيين', hi: 'इब्रानियों', it: 'Ebrei', sw: 'Waebrania', es: 'Hebreos', de: 'Hebräer', zh: '希伯来书' },
  59: { fr: 'Jacques', pt: 'Tiago', ar: 'يعقوب', hi: 'याकूब', it: 'Giacomo', sw: 'Yakobo', es: 'Santiago', de: 'Jakobus', zh: '雅各书' },
  60: { fr: '1 Pierre', pt: '1 Pedro', ar: '١ بطرس', hi: '1 पतरस', it: '1 Pietro', sw: '1 Petro', es: '1 Pedro', de: '1. Petrus', zh: '彼得前书' },
  61: { fr: '2 Pierre', pt: '2 Pedro', ar: '٢ بطرس', hi: '2 पतरस', it: '2 Pietro', sw: '2 Petro', es: '2 Pedro', de: '2. Petrus', zh: '彼得后书' },
  62: { fr: '1 Jean', pt: '1 João', ar: '١ يوحنا', hi: '1 यूहन्ना', it: '1 Giovanni', sw: '1 Yohana', es: '1 Juan', de: '1. Johannes', zh: '约翰一书' },
  63: { fr: '2 Jean', pt: '2 João', ar: '٢ يوحنا', hi: '2 यूहन्ना', it: '2 Giovanni', sw: '2 Yohana', es: '2 Juan', de: '2. Johannes', zh: '约翰二书' },
  64: { fr: '3 Jean', pt: '3 João', ar: '٣ يوحنا', hi: '3 यूहन्ना', it: '3 Giovanni', sw: '3 Yohana', es: '3 Juan', de: '3. Johannes', zh: '约翰三书' },
  65: { fr: 'Jude', pt: 'Judas', ar: 'يهوذا', hi: 'यहूदा', it: 'Giuda', sw: 'Yuda', es: 'Judas', de: 'Judas', zh: '犹大书' },
  66: { fr: 'Apocalypse', pt: 'Apocalipse', ar: 'الرؤيا', hi: 'प्रकाशितवाक्य', it: 'Apocalisse', sw: 'Ufunuo', es: 'Apocalipsis', de: 'Offenbarung', zh: '启示录' },
};

export function getLocalizedBookName(bookIdOrName: number | string, lang: LanguageCode): string {
  const book =
    typeof bookIdOrName === 'number'
      ? findBookById(bookIdOrName)
      : findBookByQuery(bookIdOrName);
  if (!book) return typeof bookIdOrName === 'string' ? bookIdOrName : `Book ${bookIdOrName}`;
  if (lang !== 'en') {
    return LOCALIZED_BOOK_NAMES[book.id]?.[lang] || book.name;
  }
  return book.name;
}

export function formatLocalizedReference(
  bookId: number,
  chapter: number,
  verse: number | undefined,
  lang: LanguageCode
): string {
  const name = getLocalizedBookName(bookId, lang);
  return verse !== undefined ? `${name} ${chapter}:${verse}` : `${name} ${chapter}`;
}

export function findBookById(id: number): BibleBookMeta | undefined {
  return BIBLE_BOOKS.find((b) => b.id === id);
}

function stripDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function findBookByQuery(query: string): BibleBookMeta | undefined {
  const raw = query.trim();
  const normalized = stripDiacritics(raw);
  if (!normalized) return undefined;

  const aliases: Record<string, string> = {
    psalm: 'Psalms',
    psaumes: 'Psalms',
    psaume: 'Psalms',
    salmo: 'Psalms',
    salmos: 'Psalms',
    salmi: 'Psalms',
    zaburi: 'Psalms',
    psalmen: 'Psalms',
    'song of songs': 'Song of Solomon',
    canticles: 'Song of Solomon',
    revelations: 'Revelation',
    apocalypse: 'Revelation',
    apocalipse: 'Revelation',
    apocalisse: 'Revelation',
    apocalipsis: 'Revelation',
    offenbarung: 'Revelation',
    ufunuo: 'Revelation',
    genesis: 'Genesis',
    genesi: 'Genesis',
    mwanzo: 'Genesis',
    '1 mose': 'Genesis',
    '2 mose': 'Exodus',
    '3 mose': 'Leviticus',
    '4 mose': 'Numbers',
    '5 mose': 'Deuteronomy',
    '1 konige': '1 Kings',
    '2 konige': '2 Kings',
    '1 koenige': '1 Kings',
    '2 koenige': '2 Kings',
    '1 korinther': '1 Corinthians',
    '2 korinther': '2 Corinthians',
  };
  const target = aliases[normalized] || normalized;
  const targetNormalized = stripDiacritics(target);

  const exactEn = BIBLE_BOOKS.find((b) => stripDiacritics(b.name) === targetNormalized);
  if (exactEn) return exactEn;

  const nonEngLangs: LocalizedNonEnglishLang[] = ['it', 'sw', 'fr', 'es', 'pt', 'de', 'ar', 'hi', 'zh'];
  for (const book of BIBLE_BOOKS) {
    const loc = LOCALIZED_BOOK_NAMES[book.id];
    if (!loc) continue;
    for (const l of nonEngLangs) {
      const val = loc[l];
      if (val === raw || stripDiacritics(val) === normalized) {
        return book;
      }
    }
  }

  const prefixEn = BIBLE_BOOKS.find((b) => stripDiacritics(b.name).startsWith(targetNormalized));
  if (prefixEn) return prefixEn;

  for (const book of BIBLE_BOOKS) {
    const loc = LOCALIZED_BOOK_NAMES[book.id];
    if (!loc) continue;
    for (const l of nonEngLangs) {
      const val = loc[l];
      if (val.startsWith(raw) || stripDiacritics(val).startsWith(normalized)) {
        return book;
      }
    }
  }

  return undefined;
}
