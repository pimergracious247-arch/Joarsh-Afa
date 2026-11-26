import type { LanguageCode, QuizCategory } from '../types';

interface CategoryTranslationText {
  title: string;
  subtitle: string;
  badgeLabel: string;
}

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: 'genesis-creation',
    title: 'Genesis & Creation',
    subtitle: 'Beginnings, Noah’s Ark, Abraham, Jacob & Joseph',
    unlockCost: 0,
    bookIds: [1],
    storyTheme: 'noah',
    badgeLabel: 'Free Starter',
  },
  {
    id: 'life-of-jesus',
    title: 'Life & Teachings of Jesus',
    subtitle: 'The four Gospels, Beatitudes & Good Shepherd',
    unlockCost: 0,
    bookIds: [40, 41, 42, 43],
    storyTheme: 'shepherd',
    badgeLabel: 'Free Starter',
  },
  {
    id: 'heroes-of-faith',
    title: 'Heroes of Faith',
    subtitle: 'Joshua, Ruth, David, Daniel, Esther & Hebrews 11',
    unlockCost: 0,
    bookIds: [6, 8, 9, 17, 27, 58],
    storyTheme: 'david',
    badgeLabel: 'Free Starter',
  },
  {
    id: 'miracles-parables',
    title: 'Miracles & Parables',
    subtitle: 'Signs, wonders, storms calmed & Gospel stories',
    unlockCost: 150,
    bookIds: [40, 41, 42, 43, 11, 12],
    storyTheme: 'whale',
    badgeLabel: 'Gospels & Kings',
  },
  {
    id: 'women-of-bible',
    title: 'Women of the Bible',
    subtitle: 'Ruth, Esther, Deborah, Hannah, Mary & Priscilla',
    unlockCost: 200,
    bookIds: [7, 8, 9, 17, 42, 43, 44],
    storyTheme: 'shepherd',
    badgeLabel: 'Faithful Voices',
  },
  {
    id: 'kings-judges',
    title: 'Kings & Judges of Israel',
    subtitle: 'Gideon, Samson, Saul, David, Solomon & Josiah',
    unlockCost: 200,
    bookIds: [7, 9, 10, 11, 12, 13, 14],
    storyTheme: 'david',
    badgeLabel: 'Royal History',
  },
  {
    id: 'major-minor-prophets',
    title: 'Major & Minor Prophets',
    subtitle: 'Isaiah, Jeremiah, Ezekiel, Jonah & Malachi',
    unlockCost: 250,
    bookIds: [23, 24, 26, 27, 28, 32, 33, 38, 39],
    storyTheme: 'whale',
    badgeLabel: 'Prophetic Books',
  },
  {
    id: 'acts-early-church',
    title: 'Acts & The Early Church',
    subtitle: 'Pentecost, Paul’s journeys & New Testament letters',
    unlockCost: 250,
    bookIds: [44, 45, 46, 48, 49, 50],
    storyTheme: 'bible',
    badgeLabel: 'Apostolic Era',
  },
  {
    id: 'psalms-proverbs',
    title: 'Psalms & Proverbs Wisdom',
    subtitle: 'Songs of praise, wisdom sayings & Ecclesiastes',
    unlockCost: 300,
    bookIds: [19, 20, 21],
    storyTheme: 'shepherd',
    badgeLabel: 'Wisdom Poetry',
  },
  {
    id: 'revelation-hard',
    title: 'Revelation & Prophecy Hard Mode',
    subtitle: 'Seven churches, scrolls, seals & end-times visions',
    unlockCost: 350,
    bookIds: [66, 27, 26],
    storyTheme: 'bible',
    badgeLabel: 'Hard Mode',
    hardMode: true,
  },
];

export const CATEGORY_TRANSLATIONS: Record<string, Record<LanguageCode, CategoryTranslationText>> = {
  'genesis-creation': {
    en: {
      title: 'Genesis & Creation',
      subtitle: 'Beginnings, Noah’s Ark, Abraham, Jacob & Joseph',
      badgeLabel: 'Free Starter',
    },
    fr: {
      title: 'Genèse et Création',
      subtitle: 'Les origines, l’arche de Noé, Abraham, Jacob et Joseph',
      badgeLabel: 'Pack Gratuit',
    },
    pt: {
      title: 'Gênesis e Criação',
      subtitle: 'Origens, Arca de Noé, Abraão, Jacó e José',
      badgeLabel: 'Inicial Grátis',
    },
    ar: {
      title: 'سفر التكوين والخلق',
      subtitle: 'البدايات وفلك نوح وإبراهيم ويعقوب ويوسف',
      badgeLabel: 'باقة مجانية',
    },
    hi: {
      title: 'उत्पत्ति और सृष्टि',
      subtitle: 'आरंभ, नूह का जहाज़, अब्राहम, याकूब और यूसुफ',
      badgeLabel: 'निःशुल्क शुरुआत',
    },
    it: {
      title: 'Genesi e Creazione',
      subtitle: 'Le origini, l’Arca di Noè, Abramo, Giacobbe e Giuseppe',
      badgeLabel: 'Pack Gratuito',
    },
    sw: {
      title: 'Mwanzo na Uumbaji',
      subtitle: 'Mwanzo, Safina ya Nuhu, Ibrahimu, Yakobo na Yusufu',
      badgeLabel: 'Kifurushi cha Bure',
    },
    es: {
      title: 'Génesis y Creación',
      subtitle: 'Los orígenes, el Arca de Noé, Abraham, Jacob y José',
      badgeLabel: 'Inicio Gratis',
    },
    de: {
      title: 'Schöpfung & 1. Mose',
      subtitle: 'Anfänge, Arche Noah, Abraham, Jakob und Josef',
      badgeLabel: 'Gratis-Paket',
    },
    zh: {
      title: '创世记与创造',
      subtitle: '万物起源、挪亚方舟、亚伯拉罕、雅各与约瑟',
      badgeLabel: '免费入门',
    },
  },
  'life-of-jesus': {
    en: {
      title: 'Life & Teachings of Jesus',
      subtitle: 'The four Gospels, Beatitudes & Good Shepherd',
      badgeLabel: 'Free Starter',
    },
    fr: {
      title: 'Vie et Enseignements de Jésus',
      subtitle: 'Les quatre Évangiles, les Béatitudes et le Bon Berger',
      badgeLabel: 'Pack Gratuit',
    },
    pt: {
      title: 'Vida e Ensinos de Jesus',
      subtitle: 'Os quatro Evangelhos, Bem-Aventuranças e o Bom Pastor',
      badgeLabel: 'Inicial Grátis',
    },
    ar: {
      title: 'حياة وتعاليم يسوع',
      subtitle: 'الأناجيل الأربعة والتطويبات والراعي الصالح',
      badgeLabel: 'باقة مجانية',
    },
    hi: {
      title: 'यीशु का जीवन और शिक्षाएँ',
      subtitle: 'चारों सुसमाचार, धन्यवचन और अच्छा चरवाहा',
      badgeLabel: 'निःशुल्क शुरुआत',
    },
    it: {
      title: 'Vita e Insegnamenti di Gesù',
      subtitle: 'I quattro Vangeli, le Beatitudini e il Buon Pastore',
      badgeLabel: 'Pack Gratuito',
    },
    sw: {
      title: 'Maisha na Mafundisho ya Yesu',
      subtitle: 'Injili nne, Heri na Mchungaji Mwema',
      badgeLabel: 'Kifurushi cha Bure',
    },
    es: {
      title: 'Vida y Enseñanzas de Jesús',
      subtitle: 'Los cuatro Evangelios, Bienaventuranzas y el Buen Pastor',
      badgeLabel: 'Inicio Gratis',
    },
    de: {
      title: 'Leben & Lehren Jesu',
      subtitle: 'Die vier Evangelien, Seligpreisungen & der Gute Hirte',
      badgeLabel: 'Gratis-Paket',
    },
    zh: {
      title: '耶稣的生平与教导',
      subtitle: '四福音书、八福与好牧人',
      badgeLabel: '免费入门',
    },
  },
  'heroes-of-faith': {
    en: {
      title: 'Heroes of Faith',
      subtitle: 'Joshua, Ruth, David, Daniel, Esther & Hebrews 11',
      badgeLabel: 'Free Starter',
    },
    fr: {
      title: 'Héros de la Foi',
      subtitle: 'Josué, Ruth, David, Daniel, Esther et Hébreux 11',
      badgeLabel: 'Pack Gratuit',
    },
    pt: {
      title: 'Heróis da Fé',
      subtitle: 'Josué, Rute, Davi, Daniel, Ester e Hebreus 11',
      badgeLabel: 'Inicial Grátis',
    },
    ar: {
      title: 'أبطال الإيمان',
      subtitle: 'يشوع وراعوث وداود ودانيال وأستير والعبرانيين ١١',
      badgeLabel: 'باقة مجانية',
    },
    hi: {
      title: 'विश्वास के वीर',
      subtitle: 'यहोशू, रूत, दाऊद, दानिय्येल, एस्तेर और इब्रानियों 11',
      badgeLabel: 'निःशुल्क शुरुआत',
    },
    it: {
      title: 'Eroi della Fede',
      subtitle: 'Giosuè, Rut, Davide, Daniele, Ester ed Ebrei 11',
      badgeLabel: 'Pack Gratuito',
    },
    sw: {
      title: 'Mashujaa wa Imani',
      subtitle: 'Yoshua, Ruthu, Daudi, Danieli, Esta na Waebrania 11',
      badgeLabel: 'Kifurushi cha Bure',
    },
    es: {
      title: 'Héroes de la Fe',
      subtitle: 'Josué, Rut, David, Daniel, Ester y Hebreos 11',
      badgeLabel: 'Inicio Gratis',
    },
    de: {
      title: 'Helden des Glaubens',
      subtitle: 'Josua, Rut, David, Daniel, Ester und Hebräer 11',
      badgeLabel: 'Gratis-Paket',
    },
    zh: {
      title: '信心伟人',
      subtitle: '约书亚、路得、大卫、但以理、以斯帖与希伯来书11章',
      badgeLabel: '免费入门',
    },
  },
  'miracles-parables': {
    en: {
      title: 'Miracles & Parables',
      subtitle: 'Signs, wonders, storms calmed & Gospel stories',
      badgeLabel: 'Gospels & Kings',
    },
    fr: {
      title: 'Miracles et Paraboles',
      subtitle: 'Signes, prodiges, tempêtes apaisées et récits des Évangiles',
      badgeLabel: 'Évangiles et Rois',
    },
    pt: {
      title: 'Milagres e Parábolas',
      subtitle: 'Sinais, maravilhas, tempestades acalmadas e parábolas',
      badgeLabel: 'Evangelhos e Reis',
    },
    ar: {
      title: 'المعجزات والأمثال',
      subtitle: 'الآيات والعجائب وتهدئة العاصفة وقصص الإنجيل',
      badgeLabel: 'الأناجيل والملوك',
    },
    hi: {
      title: 'चमत्कार और दृष्टान्त',
      subtitle: 'अद्भुत चिन्ह, शांत तूफ़ान और सुसमाचार की कहानियाँ',
      badgeLabel: 'सुसमाचार व राजा',
    },
    it: {
      title: 'Miracoli e Parabole',
      subtitle: 'Segni, prodigi, tempeste placate e racconti dei Vangeli',
      badgeLabel: 'Vangeli e Re',
    },
    sw: {
      title: 'Miujiza na Mifano',
      subtitle: 'Ishara, maajabu, dhoruba zilizotulizwa na hadithi za Injili',
      badgeLabel: 'Injili na Wafalme',
    },
    es: {
      title: 'Milagros y Parábolas',
      subtitle: 'Señales, prodigios, tormentas calmadas y relatos del Evangelio',
      badgeLabel: 'Evangelios y Reyes',
    },
    de: {
      title: 'Wunder & Gleichnisse',
      subtitle: 'Zeichen, Wunder, gestillte Stürme und Evangeliumsgeschichten',
      badgeLabel: 'Evangelien & Könige',
    },
    zh: {
      title: '神迹与比喻',
      subtitle: '神迹奇事、平静风浪与福音书比喻',
      badgeLabel: '福音与列王',
    },
  },
  'women-of-bible': {
    en: {
      title: 'Women of the Bible',
      subtitle: 'Ruth, Esther, Deborah, Hannah, Mary & Priscilla',
      badgeLabel: 'Faithful Voices',
    },
    fr: {
      title: 'Femmes de la Bible',
      subtitle: 'Ruth, Esther, Débora, Anne, Marie et Priscille',
      badgeLabel: 'Voix Fidèles',
    },
    pt: {
      title: 'Mulheres da Bíblia',
      subtitle: 'Rute, Ester, Débora, Ana, Maria e Priscila',
      badgeLabel: 'Vozes Fiéis',
    },
    ar: {
      title: 'نساء في الكتاب المقدس',
      subtitle: 'راعوث وأستير ودبورة وحنة ومريم وبريسكلا',
      badgeLabel: 'أصوات أمينة',
    },
    hi: {
      title: 'बाइबिल की महिलाएँ',
      subtitle: 'रूत, एस्तेर, दबोरा, हन्ना, मरियम और प्रिस्किल्ला',
      badgeLabel: 'विश्वासी स्वर',
    },
    it: {
      title: 'Donne della Bibbia',
      subtitle: 'Rut, Ester, Debora, Anna, Maria e Priscilla',
      badgeLabel: 'Voci Fedeli',
    },
    sw: {
      title: 'Wanawake wa Biblia',
      subtitle: 'Ruthu, Esta, Debora, Hana, Mariamu na Prisila',
      badgeLabel: 'Sauti za Imani',
    },
    es: {
      title: 'Mujeres de la Biblia',
      subtitle: 'Rut, Ester, Débora, Ana, María y Priscila',
      badgeLabel: 'Voces Fieles',
    },
    de: {
      title: 'Frauen der Bibel',
      subtitle: 'Rut, Ester, Debora, Hanna, Maria und Priszilla',
      badgeLabel: 'Treue Stimmen',
    },
    zh: {
      title: '圣经中的女性',
      subtitle: '路得、以斯帖、底波拉、哈拿、马利亚与百基拉',
      badgeLabel: '忠信之声',
    },
  },
  'kings-judges': {
    en: {
      title: 'Kings & Judges of Israel',
      subtitle: 'Gideon, Samson, Saul, David, Solomon & Josiah',
      badgeLabel: 'Royal History',
    },
    fr: {
      title: 'Rois et Juges d’Israël',
      subtitle: 'Gédéon, Samson, Saül, David, Salomon et Josias',
      badgeLabel: 'Histoire Royale',
    },
    pt: {
      title: 'Reis e Juízes de Israel',
      subtitle: 'Gideão, Sansão, Saul, Davi, Salomão e Josias',
      badgeLabel: 'História Real',
    },
    ar: {
      title: 'ملوك وقضاة إسرائيل',
      subtitle: 'جدعون وشمشون وشاول وداود وسليمان ويوشيا',
      badgeLabel: 'التاريخ الملكي',
    },
    hi: {
      title: 'इस्राएल के राजा और न्यायी',
      subtitle: 'गिदोन, शिमशोन, शाऊल, दाऊद, सुलैमान और योशिय्याह',
      badgeLabel: 'शाही इतिहास',
    },
    it: {
      title: 'Re e Giudici d’Israele',
      subtitle: 'Gedeone, Sansone, Saul, Davide, Salomone e Giosia',
      badgeLabel: 'Storia Reale',
    },
    sw: {
      title: 'Wafalme na Waamuzi wa Israeli',
      subtitle: 'Gideoni, Samsoni, Sauli, Daudi, Sulemani na Yosia',
      badgeLabel: 'Historia ya Kifalme',
    },
    es: {
      title: 'Reyes y Jueces de Israel',
      subtitle: 'Gedeón, Sansón, Saúl, David, Salomón y Josías',
      badgeLabel: 'Historia Real',
    },
    de: {
      title: 'Könige & Richter Israels',
      subtitle: 'Gideon, Simson, Saul, David, Salomo und Josia',
      badgeLabel: 'Königsgeschichte',
    },
    zh: {
      title: '以色列的士师与列王',
      subtitle: '基甸、参孙、扫罗、大卫、所罗门与约西亚',
      badgeLabel: '王国历史',
    },
  },
  'major-minor-prophets': {
    en: {
      title: 'Major & Minor Prophets',
      subtitle: 'Isaiah, Jeremiah, Ezekiel, Jonah & Malachi',
      badgeLabel: 'Prophetic Books',
    },
    fr: {
      title: 'Grands et Petits Prophètes',
      subtitle: 'Ésaïe, Jérémie, Ézéchiel, Jonas et Malachie',
      badgeLabel: 'Livres Prophétiques',
    },
    pt: {
      title: 'Profetas Maiores e Menores',
      subtitle: 'Isaías, Jeremias, Ezequiel, Jonas e Malaquias',
      badgeLabel: 'Livros Proféticos',
    },
    ar: {
      title: 'الأنبياء الكبار والصغار',
      subtitle: 'إشعياء وإرميا وحزقيال ويونان وملاخي',
      badgeLabel: 'الأسفار النبوية',
    },
    hi: {
      title: 'बड़े और छोटे भविष्यवक्ता',
      subtitle: 'यशायाह, यिर्मयाह, यहेजकेल, योना और मलाकी',
      badgeLabel: 'भविष्यवाणी की पुस्तकें',
    },
    it: {
      title: 'Profeti Maggiori e Minori',
      subtitle: 'Isaia, Geremia, Ezechiele, Giona e Malachia',
      badgeLabel: 'Libri Profetici',
    },
    sw: {
      title: 'Manabii Wakuu na Wadogo',
      subtitle: 'Isaya, Yeremia, Ezekieli, Yona na Malaki',
      badgeLabel: 'Vitabu vya Unabii',
    },
    es: {
      title: 'Profetas Mayores y Menores',
      subtitle: 'Isaías, Jeremías, Ezequiel, Jonás y Malaquías',
      badgeLabel: 'Libros Proféticos',
    },
    de: {
      title: 'Große & Kleine Propheten',
      subtitle: 'Jesaja, Jeremia, Hesekiel, Jona und Maleachi',
      badgeLabel: 'Prophetenbücher',
    },
    zh: {
      title: '大先知书与小先知书',
      subtitle: '以赛亚、耶利米、以西结、约拿与玛拉基',
      badgeLabel: '先知书卷',
    },
  },
  'acts-early-church': {
    en: {
      title: 'Acts & The Early Church',
      subtitle: 'Pentecost, Paul’s journeys & New Testament letters',
      badgeLabel: 'Apostolic Era',
    },
    fr: {
      title: 'Actes et l’Église Primitive',
      subtitle: 'Pentecôte, voyages de Paul et épîtres du Nouveau Testament',
      badgeLabel: 'Ère Apostolique',
    },
    pt: {
      title: 'Atos e a Igreja Primitiva',
      subtitle: 'Pentecostes, viagens de Paulo e cartas apostólicas',
      badgeLabel: 'Era Apostólica',
    },
    ar: {
      title: 'أعمال الرسل والكنيسة الأولى',
      subtitle: 'يوم الخمسين ورحلات بولس ورسائل العهد الجديد',
      badgeLabel: 'العصر الرسولي',
    },
    hi: {
      title: 'प्रेरितों के काम और प्रारंभिक कलीसिया',
      subtitle: 'पिन्तेकुस्त, पौलुस की यात्राएँ और नए नियम की पत्रियाँ',
      badgeLabel: 'प्रेरितिक युग',
    },
    it: {
      title: 'Atti e la Chiesa Primitiva',
      subtitle: 'Pentecoste, i viaggi di Paolo e le lettere del Nuovo Testamento',
      badgeLabel: 'Era Apostolica',
    },
    sw: {
      title: 'Matendo na Kanisa la Kwanza',
      subtitle: 'Pentekoste, safari za Paulo na nyaraka za Agano Jipya',
      badgeLabel: 'Enzi ya Mitume',
    },
    es: {
      title: 'Hechos y la Iglesia Primitiva',
      subtitle: 'Pentecostés, viajes de Pablo y cartas del Nuevo Testamento',
      badgeLabel: 'Era Apostólica',
    },
    de: {
      title: 'Apostelgeschichte & Frühe Kirche',
      subtitle: 'Pfingsten, Reisen des Paulus und Briefe des Neuen Testaments',
      badgeLabel: 'Apostolische Zeit',
    },
    zh: {
      title: '使徒行传与早期教会',
      subtitle: '五旬节、保罗宣教之旅与新约书信',
      badgeLabel: '使徒时代',
    },
  },
  'psalms-proverbs': {
    en: {
      title: 'Psalms & Proverbs Wisdom',
      subtitle: 'Songs of praise, wisdom sayings & Ecclesiastes',
      badgeLabel: 'Wisdom Poetry',
    },
    fr: {
      title: 'Sagesse des Psaumes et Proverbes',
      subtitle: 'Chants de louange, proverbes de sagesse et Ecclésiaste',
      badgeLabel: 'Poésie et Sagesse',
    },
    pt: {
      title: 'Sabedoria de Salmos e Provérbios',
      subtitle: 'Cânticos de louvor, provérbios sábios e Eclesiastes',
      badgeLabel: 'Poesia Sábia',
    },
    ar: {
      title: 'حكمة المزامير والأمثال',
      subtitle: 'تسابيح المديح وأقوال الحكمة وسفر الجامعة',
      badgeLabel: 'الشعر والحكمة',
    },
    hi: {
      title: 'भजन संहिता और नीतिवचन ज्ञान',
      subtitle: 'स्तुति के गीत, बुद्धि के वचन और सभोपदेशक',
      badgeLabel: 'ज्ञान और काव्य',
    },
    it: {
      title: 'Sapienza di Salmi e Proverbi',
      subtitle: 'Canti di lode, proverbi di saggezza ed Ecclesiaste',
      badgeLabel: 'Poesia e Sapienza',
    },
    sw: {
      title: 'Hekima ya Zaburi na Mithali',
      subtitle: 'Nyimbo za sifa, maneno ya hekima na Mhubiri',
      badgeLabel: 'Mashairi ya Hekima',
    },
    es: {
      title: 'Sabiduría de Salmos y Proverbios',
      subtitle: 'Cantos de alabanza, proverbios sabios y Eclesiastés',
      badgeLabel: 'Poesía y Sabiduría',
    },
    de: {
      title: 'Weisheit der Psalmen & Sprüche',
      subtitle: 'Lobgesänge, Weisheitssprüche und Prediger',
      badgeLabel: 'Weisheitsdichtung',
    },
    zh: {
      title: '诗篇与箴言智慧',
      subtitle: '赞美诗篇、智慧箴言与传道书',
      badgeLabel: '智慧诗歌',
    },
  },
  'revelation-hard': {
    en: {
      title: 'Revelation & Prophecy Hard Mode',
      subtitle: 'Seven churches, scrolls, seals & end-times visions',
      badgeLabel: 'Hard Mode',
    },
    fr: {
      title: 'Apocalypse et Prophéties (Difficile)',
      subtitle: 'Les sept églises, rouleaux, sceaux et visions prophétiques',
      badgeLabel: 'Mode Difficile',
    },
    pt: {
      title: 'Apocalipse e Profecias (Difícil)',
      subtitle: 'Sete igrejas, rolos, selos e visões dos últimos tempos',
      badgeLabel: 'Modo Difícil',
    },
    ar: {
      title: 'سفر الرؤيا والنبوءات (صعب)',
      subtitle: 'الكنائس السبع والأسفار المختومة ورؤى الأيام الأخيرة',
      badgeLabel: 'الوضع الصعب',
    },
    hi: {
      title: 'प्रकाशितवाक्य और भविष्यवाणी (कठिन)',
      subtitle: 'सात कलीसियाएँ, मुहरबंद पुस्तकें और अंतिम दर्शन',
      badgeLabel: 'कठिन स्तर',
    },
    it: {
      title: 'Apocalisse e Profezie (Difficile)',
      subtitle: 'Le sette chiese, i rotoli, i sigilli e le visioni profetiche',
      badgeLabel: 'Modalità Difficile',
    },
    sw: {
      title: 'Ufunuo na Unabii (Mgumu)',
      subtitle: 'Makanisa saba, vitabu, mihuri na maono ya nyakati za mwisho',
      badgeLabel: 'Hali Ngumu',
    },
    es: {
      title: 'Apocalipsis y Profecía (Difícil)',
      subtitle: 'Las siete iglesias, rollos, sellos y visiones proféticas',
      badgeLabel: 'Modo Difícil',
    },
    de: {
      title: 'Offenbarung & Prophetie (Schwer)',
      subtitle: 'Sieben Gemeinden, Schriftrollen, Siegel und Endzeitvisionen',
      badgeLabel: 'Schwerer Modus',
    },
    zh: {
      title: '启示录与预言（困难模式）',
      subtitle: '七教会、书卷、七印与末世异象',
      badgeLabel: '困难模式',
    },
  },
};

export function getLocalizedCategory(category: QuizCategory, lang: LanguageCode): QuizCategory {
  const loc = CATEGORY_TRANSLATIONS[category.id]?.[lang] || CATEGORY_TRANSLATIONS[category.id]?.en;
  if (!loc) return category;
  return {
    ...category,
    title: loc.title,
    subtitle: loc.subtitle,
    badgeLabel: loc.badgeLabel,
  };
}

export const FREE_CATEGORY_IDS = QUIZ_CATEGORIES.filter(
  (c) => c.unlockCost === 0
).map((c) => c.id);

export function getQuizCategoryById(id: string): QuizCategory | undefined {
  return QUIZ_CATEGORIES.find((c) => c.id === id);
}
