import type { LanguageCode, TreasuryCard } from '../types';

interface TreasuryTranslationText {
  reference: string;
  title: string;
  verseText: string;
  reflection: string;
}

export const TREASURY_CARDS: TreasuryCard[] = [
  {
    id: 'psalm-23-1',
    reference: 'Psalm 23:1',
    title: 'The Good Shepherd',
    verseText: 'The LORD is my shepherd; I shall not want.',
    reflection:
      'Rest in knowing God guides and provides for every step ahead.',
    unlockCost: 100,
    storyTheme: 'shepherd',
    accentGradient: 'from-[#FFE885] via-[#FFF6CC] to-[#DFF0FF]',
  },
  {
    id: 'proverbs-3-5',
    reference: 'Proverbs 3:5',
    title: 'Trust With All Your Heart',
    verseText:
      'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
    reflection:
      'True wisdom begins when we place our confidence in God’s plan.',
    unlockCost: 100,
    storyTheme: 'bible',
    accentGradient: 'from-[#E2F1FF] via-[#FFF7D6] to-[#DCFCE7]',
  },
  {
    id: 'philippians-4-13',
    reference: 'Philippians 4:13',
    title: 'Strength Through Christ',
    verseText: 'I can do all things through Christ which strengtheneth me.',
    reflection:
      'Even the tallest mountain is climbable with God’s strength inside you.',
    unlockCost: 100,
    storyTheme: 'david',
    accentGradient: 'from-[#FDE68A] via-[#FFFBEB] to-[#DBEAFE]',
  },
  {
    id: 'isaiah-40-31',
    reference: 'Isaiah 40:31',
    title: 'Soaring Like Eagles',
    verseText:
      'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.',
    reflection: 'Patience in prayer brings fresh wings for tomorrow’s journey.',
    unlockCost: 100,
    storyTheme: 'noah',
    accentGradient: 'from-[#BAE6FD] via-[#EFF6FF] to-[#FEF3C7]',
  },
  {
    id: 'joshua-1-9',
    reference: 'Joshua 1:9',
    title: 'Strong & Courageous',
    verseText:
      'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
    reflection: 'Courage grows when you remember you never walk alone.',
    unlockCost: 100,
    storyTheme: 'david',
    accentGradient: 'from-[#FED7AA] via-[#FFF7ED] to-[#DBEAFE]',
  },
  {
    id: 'jeremiah-29-11',
    reference: 'Jeremiah 29:11',
    title: 'Plans of Hope',
    verseText:
      'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
    reflection: 'God writes your story with hope, purpose, and peace.',
    unlockCost: 100,
    storyTheme: 'noah',
    accentGradient: 'from-[#DDD6FE] via-[#F5F3FF] to-[#FEF9C3]',
  },
  {
    id: 'romans-8-28',
    reference: 'Romans 8:28',
    title: 'All Things For Good',
    verseText:
      'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    reflection:
      'Every season has meaning in the hands of a faithful Creator.',
    unlockCost: 100,
    storyTheme: 'whale',
    accentGradient: 'from-[#A5F3FC] via-[#ECFEFF] to-[#FEF3C7]',
  },
  {
    id: 'matthew-11-28',
    reference: 'Matthew 11:28',
    title: 'Peace & Rest',
    verseText:
      'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
    reflection: 'Lay down your worries and receive gentle peace today.',
    unlockCost: 100,
    storyTheme: 'shepherd',
    accentGradient: 'from-[#BBF7D0] via-[#F0FDF4] to-[#E0F2FE]',
  },
  {
    id: 'john-3-16',
    reference: 'John 3:16',
    title: 'Everlasting Love',
    verseText:
      'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    reflection:
      'The heart of Scripture shines brightest in God’s unconditional love.',
    unlockCost: 100,
    storyTheme: 'bible',
    accentGradient: 'from-[#FDE047]/50 via-[#FFFDF0] to-[#DBEAFE]',
  },
];

export const TREASURY_TRANSLATIONS: Record<string, Record<LanguageCode, TreasuryTranslationText>> = {
  'psalm-23-1': {
    en: {
      reference: 'Psalm 23:1',
      title: 'The Good Shepherd',
      verseText: 'The LORD is my shepherd; I shall not want.',
      reflection: 'Rest in knowing God guides and provides for every step ahead.',
    },
    fr: {
      reference: 'Psaumes 23:1',
      title: 'Le Bon Berger',
      verseText: 'L’Éternel est mon berger : je ne manquerai de rien.',
      reflection: 'Reposez-vous en sachant que Dieu guide et pourvoit à chaque pas.',
    },
    pt: {
      reference: 'Salmos 23:1',
      title: 'O Bom Pastor',
      verseText: 'O Senhor é o meu pastor; nada me faltará.',
      reflection: 'Descanse sabendo que Deus guia e cuida de cada passo seu.',
    },
    ar: {
      reference: 'المزامير 23:1',
      title: 'الراعي الصالح',
      verseText: 'الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ.',
      reflection: 'اطمئن لأن الله يرشدك ويدبّر كل خطوة في طريقك.',
    },
    hi: {
      reference: 'भजन संहिता 23:1',
      title: 'अच्छा चरवाहा',
      verseText: 'यहोवा मेरा चरवाहा है, मुझे कुछ घटी न होगी।',
      reflection: 'इस भरोसे में विश्राम करें कि परमेश्वर आपके हर कदम का मार्गदर्शन करता है।',
    },
    it: {
      reference: 'Salmi 23:1',
      title: 'Il Buon Pastore',
      verseText: 'Il Signore è il mio pastore: nulla mi manca.',
      reflection: 'Riposa sapendo che Dio guida e provvede a ogni tuo passo.',
    },
    sw: {
      reference: 'Zaburi 23:1',
      title: 'Mchungaji Mwema',
      verseText: 'Bwana ndiye mchungaji wangu, sitapungukiwa na kitu.',
      reflection: 'Pumzika ukijua Mungu anakuongoza na kukidhi kila hatua.',
    },
    es: {
      reference: 'Salmos 23:1',
      title: 'El Buen Pastor',
      verseText: 'Jehová es mi pastor; nada me faltará.',
      reflection: 'Descansa sabiendo que Dios guía y provee cada paso por delante.',
    },
    de: {
      reference: 'Psalmen 23:1',
      title: 'Der Gute Hirte',
      verseText: 'Der HERR ist mein Hirte, mir wird nichts mangeln.',
      reflection: 'Ruhe in der Gewissheit, dass Gott jeden deiner Schritte führt.',
    },
    zh: {
      reference: '诗篇 23:1',
      title: '好牧人',
      verseText: '耶和华是我的牧者，我必不至缺乏。',
      reflection: '安息在神的带领中，他必供应你前方的每一步。',
    },
  },
  'proverbs-3-5': {
    en: {
      reference: 'Proverbs 3:5',
      title: 'Trust With All Your Heart',
      verseText: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
      reflection: 'True wisdom begins when we place our confidence in God’s plan.',
    },
    fr: {
      reference: 'Proverbes 3:5',
      title: 'Confiance de Tout Cœur',
      verseText: 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse.',
      reflection: 'La vraie sagesse commence lorsque nous plaçons notre foi dans le plan de Dieu.',
    },
    pt: {
      reference: 'Provérbios 3:5',
      title: 'Confie de Todo Coração',
      verseText: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.',
      reflection: 'A verdadeira sabedoria começa quando confiamos nos planos de Deus.',
    },
    ar: {
      reference: 'الأمثال 3:5',
      title: 'اتكل بكل قلبك',
      verseText: 'تَوَكَّلْ عَلَى الرَّبِّ بِكُلِّ قَلْبِكَ، وَعَلَى فَهْمِكَ لاَ تَعْتَمِدْ.',
      reflection: 'تبدأ الحكمة الحقيقية عندما نضع ثقتنا الكاملة في خطة الله.',
    },
    hi: {
      reference: 'नीतिवचन 3:5',
      title: 'पूरे मन से भरोसा',
      verseText: 'तू अपनी समझ का सहारा न लेना, वरन सम्पूर्ण मन से यहोवा पर भरोसा रखना।',
      reflection: 'सच्ची बुद्धि तब शुरू होती है जब हम परमेश्वर की योजना पर भरोसा करते हैं।',
    },
    it: {
      reference: 'Proverbi 3:5',
      title: 'Fidati con Tutto il Cuore',
      verseText: 'Confida nel Signore con tutto il cuore e non appoggiarti sulla tua intelligenza.',
      reflection: 'La vera saggezza inizia quando riponiamo la nostra fiducia nel piano di Dio.',
    },
    sw: {
      reference: 'Mithali 3:5',
      title: 'Mtumaini kwa Moyo Wote',
      verseText: 'Mtumaini Bwana kwa moyo wako wote, wala usizitegemee akili zako mwenyewe.',
      reflection: 'Hekima ya kweli huanza tunapoweka tumaini letu katika mpango wa Mungu.',
    },
    es: {
      reference: 'Proverbios 3:5',
      title: 'Confía de Todo Corazón',
      verseText: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.',
      reflection: 'La verdadera sabiduría comienza cuando confiamos plenamente en el plan de Dios.',
    },
    de: {
      reference: 'Sprüche 3:5',
      title: 'Vertraue von Ganzem Herzen',
      verseText: 'Verlass dich auf den HERRN von ganzem Herzen, und verlass dich nicht auf deinen Verstand.',
      reflection: 'Wahre Weisheit beginnt, wenn wir Gottes Plan voll vertrauen.',
    },
    zh: {
      reference: '箴言 3:5',
      title: '专心仰赖耶和华',
      verseText: '你要专心仰赖耶和华，不可倚靠自己的聪明。',
      reflection: '真正的智慧始于全心信靠神的美好计划。',
    },
  },
  'philippians-4-13': {
    en: {
      reference: 'Philippians 4:13',
      title: 'Strength Through Christ',
      verseText: 'I can do all things through Christ which strengtheneth me.',
      reflection: 'Even the tallest mountain is climbable with God’s strength inside you.',
    },
    fr: {
      reference: 'Philippiens 4:13',
      title: 'La Force en Christ',
      verseText: 'Je puis tout par celui qui me fortifie.',
      reflection: 'Même la plus haute montagne peut être gravie avec la force de Dieu en vous.',
    },
    pt: {
      reference: 'Filipenses 4:13',
      title: 'Força em Cristo',
      verseText: 'Posso todas as coisas naquele que me fortalece.',
      reflection: 'Até a maior montanha pode ser vencida com a força de Deus em você.',
    },
    ar: {
      reference: 'فيلبي 4:13',
      title: 'القوة بالمسيح',
      verseText: 'أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي.',
      reflection: 'بقوة الله في داخلك يمكنك تسلّق أعلى الجبال وتجاوز كل صعوبة.',
    },
    hi: {
      reference: 'फिलिप्पियों 4:13',
      title: 'मसीह में सामर्थ्य',
      verseText: 'जो मुझे सामर्थ्य देता है उसमें मैं सब कुछ कर सकता हूँ।',
      reflection: 'परमेश्वर की शक्ति के साथ सबसे ऊँचा पहाड़ भी पार किया जा सकता है।',
    },
    it: {
      reference: 'Filippesi 4:13',
      title: 'Forza in Cristo',
      verseText: 'Io posso ogni cosa in colui che mi fortifica.',
      reflection: 'Anche la montagna più alta si può scalare con la forza di Dio dentro di te.',
    },
    sw: {
      reference: 'Wafilipi 4:13',
      title: 'Nguvu Kupitia Kristo',
      verseText: 'Nayaweza mambo yote katika yeye anitiaye nguvu.',
      reflection: 'Hata mlima mrefu zaidi unaweza kupandwa kwa nguvu za Mungu ndani yako.',
    },
    es: {
      reference: 'Filipenses 4:13',
      title: 'Fuerza en Cristo',
      verseText: 'Todo lo puedo en Cristo que me fortalece.',
      reflection: 'Incluso la montaña más alta se puede subir con la fuerza de Dios en ti.',
    },
    de: {
      reference: 'Philipper 4:13',
      title: 'Kraft durch Christus',
      verseText: 'Ich vermag alles durch den, der mich mächtig macht.',
      reflection: 'Mit Gottes Kraft in dir ist selbst der höchste Berg bezwingbar.',
    },
    zh: {
      reference: '腓立比书 4:13',
      title: '靠主加添力量',
      verseText: '我靠着那加给我力量的，凡事都能做。',
      reflection: '有神的力量在里面，再高的山峰也能攀登。',
    },
  },
  'isaiah-40-31': {
    en: {
      reference: 'Isaiah 40:31',
      title: 'Soaring Like Eagles',
      verseText: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.',
      reflection: 'Patience in prayer brings fresh wings for tomorrow’s journey.',
    },
    fr: {
      reference: 'Ésaïe 40:31',
      title: 'Prendre des Ailes d’Aigle',
      verseText: 'Mais ceux qui se confient en l’Éternel renouvellent leur force. Ils prennent le vol comme les aigles.',
      reflection: 'La patience dans la prière renouvelle vos forces pour le chemin de demain.',
    },
    pt: {
      reference: 'Isaías 40:31',
      title: 'Voando Como Águias',
      verseText: 'Mas os que esperam no Senhor renovarão as suas forças e subirão com asas como águias.',
      reflection: 'A paciência em oração traz asas renovadas para a caminhada de amanhã.',
    },
    ar: {
      reference: 'إشعياء 40:31',
      title: 'التحليق كالنسور',
      verseText: 'وَأَمَّا مُنْتَظِرُو الرَّبِّ فَيُجَدِّدُونَ قُوَّةً. يَرْفَعُونَ أَجْنِحَةً كَالنُّسُورِ.',
      reflection: 'الصبر في الصلاة يمنحك أجنحة متجددة لرحلة الغد.',
    },
    hi: {
      reference: 'यशायाह 40:31',
      title: 'उकाब की तरह उड़ान',
      verseText: 'परन्तु जो यहोवा की बाट जोहते हैं, वे नया बल प्राप्त करते जाएँगे; वे उकाबों की नाईं उड़ेंगे।',
      reflection: 'प्रार्थना में धैर्य रखने से कल की यात्रा के लिए नया बल मिलता है।',
    },
    it: {
      reference: 'Isaia 40:31',
      title: 'Spiegare le Ali come Aquile',
      verseText: 'Ma quanti sperano nel Signore riacquistano forza, mettono ali come aquile.',
      reflection: 'La pazienza nella preghiera dona ali nuove per il cammino di domani.',
    },
    sw: {
      reference: 'Isaya 40:31',
      title: 'Kupaa Kama Tai',
      verseText: 'Bali wao wamngojeao Bwana watapata nguvu mpya; watapanda juu kwa mbawa kama tai.',
      reflection: 'Uvumilivu katika maombi huleta mbawa mpya kwa safari ya kesho.',
    },
    es: {
      reference: 'Isaías 40:31',
      title: 'Volar Como las Águilas',
      verseText: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.',
      reflection: 'La paciencia en oración trae alas nuevas para el camino de mañana.',
    },
    de: {
      reference: 'Jesaja 40:31',
      title: 'Auffahren mit Flügeln wie Adler',
      verseText: 'Aber die auf den HERRN harren, kriegen neue Kraft, dass sie auffahren mit Flügeln wie Adler.',
      reflection: 'Geduld im Gebet schenkt frische Flügel für deinen Weg morgen.',
    },
    zh: {
      reference: '以赛亚书 40:31',
      title: '如鹰展翅上腾',
      verseText: '但那等候耶和华的，必从新得力。他们必如鹰展翅上腾。',
      reflection: '在祷告中静候神，必为明天的路程带来全新的力量。',
    },
  },
  'joshua-1-9': {
    en: {
      reference: 'Joshua 1:9',
      title: 'Strong & Courageous',
      verseText: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
      reflection: 'Courage grows when you remember you never walk alone.',
    },
    fr: {
      reference: 'Josué 1:9',
      title: 'Fort et Courageux',
      verseText: 'Fortifie-toi et prends courage ! Ne t’effraie point et ne t’épouvante point, car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.',
      reflection: 'Le courage grandit quand vous savez que vous ne marchez jamais seul.',
    },
    pt: {
      reference: 'Josué 1:9',
      title: 'Forte e Corajoso',
      verseText: 'Esforça-te e tem bom ânimo; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.',
      reflection: 'A coragem cresce quando você lembra que nunca caminha sozinho.',
    },
    ar: {
      reference: 'يشوع 1:9',
      title: 'تشدد وتشجع',
      verseText: 'تَشَدَّدْ وَتَشَجَّعْ! لاَ تَرْهَبْ وَلاَ تَرْتَعِبْ لأَنَّ الرَّبَّ إِلهَكَ مَعَكَ حَيْثُمَا تَذْهَبُ.',
      reflection: 'تنمو الشجاعة عندما تتذكر أنك لا تسير وحدك أبداً.',
    },
    hi: {
      reference: 'यहोशू 1:9',
      title: 'हियाव बाँध और दृढ़ हो',
      verseText: 'हियाव बाँधकर दृढ़ हो जा; भय न खा, और तेरा मन कच्चा न हो; क्योंकि जहाँ-जहाँ तू जाएगा वहाँ-वहाँ तेरा परमेश्वर यहोवा तेरे संग रहेगा।',
      reflection: 'जब आप याद रखते हैं कि आप कभी अकेले नहीं चलते, तो साहस बढ़ता है।',
    },
    it: {
      reference: 'Giosuè 1:9',
      title: 'Forte e Coraggioso',
      verseText: 'Sii forte e coraggioso; non aver paura e non sgomentarti, perché il Signore, il tuo Dio, è con te dovunque tu vada.',
      reflection: 'Il coraggio cresce quando ricordi che non cammini mai solo.',
    },
    sw: {
      reference: 'Yoshua 1:9',
      title: 'Uwe Hodari na Moyo wa Ushujaa',
      verseText: 'Uwe hodari na moyo wa ushujaa; usiogope wala usifadhaike; kwa kuwa Bwana, Mungu wako, yu pamoja nawe kila uendako.',
      reflection: 'Ujasiri hukua unapokumbuka hutembei peke yako kamwe.',
    },
    es: {
      reference: 'Josué 1:9',
      title: 'Esfuérzate y Sé Valiente',
      verseText: 'Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
      reflection: 'La valentía crece cuando recuerdas que nunca caminas solo.',
    },
    de: {
      reference: 'Josua 1:9',
      title: 'Sei Stark und Mutig',
      verseText: 'Sei getrost und unverzagt! Lass dir nicht grauen und entsetze dich nicht; denn der HERR, dein Gott, ist mit dir in allem, was du tun wirst.',
      reflection: 'Mut wächst, wenn du weißt, dass du niemals allein gehst.',
    },
    zh: {
      reference: '约书亚记 1:9',
      title: '刚强壮胆',
      verseText: '你当刚强壮胆！不要惧怕，也不要惊惶，因为你无论往哪里去，耶和华你的神必与你同在。',
      reflection: '当你牢记自己从不孤单同行，勇气就会生发出来。',
    },
  },
  'jeremiah-29-11': {
    en: {
      reference: 'Jeremiah 29:11',
      title: 'Plans of Hope',
      verseText: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
      reflection: 'God writes your story with hope, purpose, and peace.',
    },
    fr: {
      reference: 'Jérémie 29:11',
      title: 'Projets d’Espérance',
      verseText: 'Car je connais les projets que j’ai formés sur vous, dit l’Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l’espérance.',
      reflection: 'Dieu écrit votre histoire avec espérance, sens et paix.',
    },
    pt: {
      reference: 'Jeremias 29:11',
      title: 'Planos de Esperança',
      verseText: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.',
      reflection: 'Deus escreve a sua história com esperança, propósito e paz.',
    },
    ar: {
      reference: 'إرميا 29:11',
      title: 'أفكار سلام ورجاء',
      verseText: 'لأَنِّي عَرَفْتُ الأَفْكَارَ الَّتِي أَنَا مُفْتَكِرٌ بِهَا عَنْكُمْ، يَقُولُ الرَّبُّ، أَفْكَارَ سَلاَمٍ لاَ شَرٍّ، لأُعْطِيَكُمْ آخِرَةً وَرَجَاءً.',
      reflection: 'الله يكتب قصتك بالرجاء والغاية والسلام.',
    },
    hi: {
      reference: 'यिर्मयाह 29:11',
      title: 'आशा की योजनाएँ',
      verseText: 'क्योंकि यहोवा की यह वाणी है, कि जो कल्पनाएँ मैं तुम्हारे विषय करता हूँ उन्हें मैं जानता हूँ, वे हानि की नहीं, वरन कुशल ही की हैं, और अन्त में तुम्हारी आशा पूरी करूँगा।',
      reflection: 'परमेश्वर आपके जीवन की कहानी आशा, उद्देश्य और शांति से लिखता है।',
    },
    it: {
      reference: 'Geremia 29:11',
      title: 'Progetti di Speranza',
      verseText: 'Io so i progetti che ho fatto a vostro riguardo, dice il Signore, progetti di pace e non di sventura, per darvi un avvenire e una speranza.',
      reflection: 'Dio scrive la tua storia con speranza, scopo e pace.',
    },
    sw: {
      reference: 'Yeremia 29:11',
      title: 'Mipango ya Tumaini',
      verseText: 'Maana nayajua mawazo ninayowawazia ninyi, asema Bwana, ni mawazo ya amani wala si ya mabaya, kuwapa ninyi tumaini siku zenu za mwisho.',
      reflection: 'Mungu anaandika hadithi yako kwa tumaini, kusudi na amani.',
    },
    es: {
      reference: 'Jeremías 29:11',
      title: 'Planes de Esperanza',
      verseText: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
      reflection: 'Dios escribe tu historia con esperanza, propósito y paz.',
    },
    de: {
      reference: 'Jeremia 29:11',
      title: 'Pläne der Hoffnung',
      verseText: 'Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, dass ich euch gebe das Ende, des ihr wartet.',
      reflection: 'Gott schreibt deine Geschichte mit Hoffnung, Sinn und Frieden.',
    },
    zh: {
      reference: '耶利米书 29:11',
      title: '赐平安与盼望的意念',
      verseText: '耶和华说：我知道我向你们所怀的意念是赐平安的意念，不是降灾祸的意念，要叫你们末后有指望。',
      reflection: '神用盼望、使命与平安书写你的人生故事。',
    },
  },
  'romans-8-28': {
    en: {
      reference: 'Romans 8:28',
      title: 'All Things For Good',
      verseText: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
      reflection: 'Every season has meaning in the hands of a faithful Creator.',
    },
    fr: {
      reference: 'Romains 8:28',
      title: 'Tout Concourt au Bien',
      verseText: 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.',
      reflection: 'Chaque saison prend tout son sens entre les mains d’un Créateur fidèle.',
    },
    pt: {
      reference: 'Romanos 8:28',
      title: 'Tudo Coopera Para o Bem',
      verseText: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.',
      reflection: 'Cada estação tem propósito nas mãos de um Criador fiel.',
    },
    ar: {
      reference: 'رومية 8:28',
      title: 'كل الأشياء تعمل للخير',
      verseText: 'وَنَحْنُ نَعْلَمُ أَنَّ كُلَّ الأَشْيَاءِ تَعْمَلُ مَعًا لِلْخَيْرِ لِلَّذِينَ يُحِبُّونَ اللهَ، الَّذِينَ هُمْ مَدْعُوُّونَ حَسَبَ قَصْدِهِ.',
      reflection: 'لكل موسم معنى جميل في يدي الخالق الأمين.',
    },
    hi: {
      reference: 'रोमियों 8:28',
      title: 'सब बातें भलाई के लिए',
      verseText: 'हम जानते हैं कि जो लोग परमेश्वर से प्रेम रखते हैं, उनके लिये सब बातें मिलकर भलाई ही को उत्पन्न करती हैं।',
      reflection: 'विश्वासयोग्य सृष्टिकर्ता के हाथों में जीवन के हर मौसम का एक सुंदर अर्थ है।',
    },
    it: {
      reference: 'Romani 8:28',
      title: 'Tutto Coopera al Bene',
      verseText: 'Or sappiamo che tutte le cose cooperano al bene di quelli che amano Dio, i quali sono chiamati secondo il suo disegno.',
      reflection: 'Ogni stagione ha senso nelle mani di un Creatore fedele.',
    },
    sw: {
      reference: 'Warumi 8:28',
      title: 'Mambo Yote Hufanya Kazi kwa Wema',
      verseText: 'Nasi twajua ya kuwa katika mambo yote Mungu hufanya kazi pamoja na wale wampendao katika kuwapatia mema.',
      reflection: 'Kila majira yana maana mikononi mwa Muumba mwaminifu.',
    },
    es: {
      reference: 'Romanos 8:28',
      title: 'Todo Obra para Bien',
      verseText: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
      reflection: 'Cada etapa tiene sentido en las manos de un Creador fiel.',
    },
    de: {
      reference: 'Römer 8:28',
      title: 'Alles dient zum Besten',
      verseText: 'Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Besten dienen, denen, die nach seinem Ratschluss berufen sind.',
      reflection: 'Jede Lebenszeit hat Sinn in den Händen eines treuen Schöpfers.',
    },
    zh: {
      reference: '罗马书 8:28',
      title: '万事互相效力',
      verseText: '我们晓得万事都互相效力，叫爱神的人得益处，就是按他旨意被召的人。',
      reflection: '在信实的造物主手中，生命的每个季节都有美意。',
    },
  },
  'matthew-11-28': {
    en: {
      reference: 'Matthew 11:28',
      title: 'Peace & Rest',
      verseText: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
      reflection: 'Lay down your worries and receive gentle peace today.',
    },
    fr: {
      reference: 'Matthieu 11:28',
      title: 'Paix et Repos',
      verseText: 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.',
      reflection: 'Déposez vos inquiétudes et recevez aujourd’hui une douce paix.',
    },
    pt: {
      reference: 'Mateus 11:28',
      title: 'Paz e Descanso',
      verseText: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.',
      reflection: 'Entregue suas preocupações e receba paz serena hoje.',
    },
    ar: {
      reference: 'متى 11:28',
      title: 'سلام وراحة',
      verseText: 'تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَالثَّقِيلِي الأَحْمَالِ، وَأَنَا أُرِيحُكُمْ.',
      reflection: 'ضع همومك جانباً ونَلْ راحةً وسلاماً هادئاً اليوم.',
    },
    hi: {
      reference: 'मत्ती 11:28',
      title: 'शांति और विश्राम',
      verseText: 'हे सब परिश्रम करनेवालों और बोझ से दबे लोगों, मेरे पास आओ; मैं तुम्हें विश्राम दूँगा।',
      reflection: 'अपनी चिंताओं को छोड़ दें और आज कोमल शांति प्राप्त करें।',
    },
    it: {
      reference: 'Matteo 11:28',
      title: 'Pace e Riposo',
      verseText: 'Venite a me, voi tutti che siete affaticati e oppressi, e io vi darò riposo.',
      reflection: 'Deponi le tue preoccupazioni e ricevi una dolce pace oggi.',
    },
    sw: {
      reference: 'Mathayo 11:28',
      title: 'Amani na Pumziko',
      verseText: 'Njoni kwangu, ninyi nyote msumbukao na wenye kulemewa na mizigo, nami nitawapumzisha.',
      reflection: 'Weka chini wasiwasi wako na upokee amani ya upole leo.',
    },
    es: {
      reference: 'Mateo 11:28',
      title: 'Paz y Descanso',
      verseText: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
      reflection: 'Entrega tus preocupaciones y recibe dulce paz hoy.',
    },
    de: {
      reference: 'Matthäus 11:28',
      title: 'Frieden & Ruhe',
      verseText: 'Kommt her zu mir, alle, die ihr mühselig und beladen seid; ich will euch erquicken.',
      reflection: 'Lege deine Sorgen ab und empfange heute sanften Frieden.',
    },
    zh: {
      reference: '马太福音 11:28',
      title: '得享安息与平安',
      verseText: '凡劳苦担重担的人可以到我这里来，我就使你们得安息。',
      reflection: '放下你的忧虑，今日就领受主温柔的平安。',
    },
  },
  'john-3-16': {
    en: {
      reference: 'John 3:16',
      title: 'Everlasting Love',
      verseText: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      reflection: 'The heart of Scripture shines brightest in God’s unconditional love.',
    },
    fr: {
      reference: 'Jean 3:16',
      title: 'Amour Éternel',
      verseText: 'Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle.',
      reflection: 'Le cœur des Écritures rayonne de l’amour inconditionnel de Dieu.',
    },
    pt: {
      reference: 'João 3:16',
      title: 'Amor Eterno',
      verseText: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      reflection: 'O coração das Escrituras brilha no amor incondicional de Deus.',
    },
    ar: {
      reference: 'يوحنا 3:16',
      title: 'محبة أبدية',
      verseText: 'لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.',
      reflection: 'قلب الكتاب المقدس يتألق بمحبة الله الأبدية غير المشروطة.',
    },
    hi: {
      reference: 'यूहन्ना 3:16',
      title: 'अनन्त प्रेम',
      verseText: 'क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे, वह नाश न हो, परन्तु अनन्त जीवन पाए।',
      reflection: 'पवित्र शास्त्र का हृदय परमेश्वर के निश्छल और अनन्त प्रेम में चमकता है।',
    },
    it: {
      reference: 'Giovanni 3:16',
      title: 'Amore Eterno',
      verseText: 'Perché Dio ha tanto amato il mondo, che ha dato il suo unigenito Figlio, affinché chiunque crede in lui non perisca, ma abbia vita eterna.',
      reflection: 'Il cuore della Scrittura risplende nell’amore incondizionato di Dio.',
    },
    sw: {
      reference: 'Yohana 3:16',
      title: 'Upendo wa Milele',
      verseText: 'Kwa maana jinsi hii Mungu aliupenda ulimwengu, hata akamtoa Mwanawe pekee, ili kila mtu amwaminiye asipotee, bali awe na uzima wa milele.',
      reflection: 'Kiini cha Maandiko hung’aa zaidi katika upendo wa Mungu usio na masharti.',
    },
    es: {
      reference: 'Juan 3:16',
      title: 'Amor Eterno',
      verseText: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      reflection: 'El corazón de las Escrituras brilla en el amor incondicional de Dios.',
    },
    de: {
      reference: 'Johannes 3:16',
      title: 'Ewige Liebe',
      verseText: 'Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, damit alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.',
      reflection: 'Das Herz der Heiligen Schrift erstrahlt in Gottes bedingungsloser Liebe.',
    },
    zh: {
      reference: '约翰福音 3:16',
      title: '永恒的爱',
      verseText: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不致灭亡，反得永生。',
      reflection: '圣经的核心在神无条件且永恒的爱中闪耀。',
    },
  },
};

export function getLocalizedTreasuryCard(card: TreasuryCard, lang: LanguageCode): TreasuryCard {
  const loc = TREASURY_TRANSLATIONS[card.id]?.[lang] || TREASURY_TRANSLATIONS[card.id]?.en;
  if (!loc) return card;
  return {
    ...card,
    reference: loc.reference,
    title: loc.title,
    verseText: loc.verseText,
    reflection: loc.reflection,
  };
}
