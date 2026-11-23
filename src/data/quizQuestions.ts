import { AgeGroup, BibleBookFilter, QuizQuestion } from '../types';

export const QUIZ_ILLUSTRATIONS = {
  noah: '/src/assets/images/quiz_noah_ark_1795414565549.jpg',
  david: '/src/assets/images/quiz_david_goliath_1795414565069.jpg',
  whale: '/src/assets/images/quiz_jonah_whale_1795414564740.jpg',
  hills: '/src/assets/images/quiz_jesus_shepherd_1795414564454.jpg',
  bible: '/src/assets/images/bible_hero_clouds_1795414564806.jpg',
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-noah-ark',
    book: 'Genesis',
    ageGroup: 'kids',
    illustration: QUIZ_ILLUSTRATIONS.noah,
    illustrationAlt: 'Noah beside the wooden ark with pairs of animals under a rainbow',
    correctIndex: 0,
    translations: {
      en: { question: 'Who built the ark?', options: ['Noah', 'Moses', 'David', 'Abraham'], reference: 'Genesis 6:14' },
      lg: { question: 'Ani eyazimba eryato?', options: ['Nuuwa', 'Musa', 'Dawudi', 'Ibulayimu'], reference: 'Olubereberye 6:14' },
      sw: { question: 'Nani aliyejenga safina?', options: ['Nuhu', 'Musa', 'Daudi', 'Ibrahimu'], reference: 'Mwanzo 6:14' },
      fr: { question: 'Qui a construit l’arche ?', options: ['Noé', 'Moïse', 'David', 'Abraham'], reference: 'Genèse 6:14' },
      es: { question: '¿Quién construyó el arca?', options: ['Noé', 'Moisés', 'David', 'Abraham'], reference: 'Génesis 6:14' },
      pt: { question: 'Quem construiu a arca?', options: ['Noé', 'Moisés', 'Davi', 'Abraão'], reference: 'Gênesis 6:14' },
      de: { question: 'Wer baute die Arche?', options: ['Noah', 'Mose', 'David', 'Abraham'], reference: '1. Mose 6,14' },
      ar: { question: 'من الذي بنى الفلك؟', options: ['نوح', 'موسى', 'داود', 'إبراهيم'], reference: 'التكوين 6:14' },
      hi: { question: 'नौका किसने बनाई थी?', options: ['नूह', 'मूसा', 'दाऊद', 'अब्राहम'], reference: 'उत्पत्ति 6:14' },
      zh: { question: '谁建造了方舟？', options: ['挪亚', '摩西', '大卫', '亚伯拉罕'], reference: '创世记 6:14' },
    },
  },
  {
    id: 'q-david-goliath',
    book: '1 Samuel',
    ageGroup: 'kids',
    illustration: QUIZ_ILLUSTRATIONS.david,
    illustrationAlt: 'Young shepherd David with a staff and sling on a green meadow',
    correctIndex: 2,
    translations: {
      en: { question: 'Who defeated Goliath with a sling?', options: ['Saul', 'Solomon', 'David', 'Joseph'], reference: '1 Samuel 17:49' },
      lg: { question: 'Ani eyawangula Goliyasi n’envuumuulo?', options: ['Sawulo', 'Sulemaani', 'Dawudi', 'Yusufu'], reference: '1 Samwiri 17:49' },
      sw: { question: 'Nani aliyemshinda Goliathi kwa kombeo?', options: ['Sauli', 'Sulemani', 'Daudi', 'Yusufu'], reference: '1 Samweli 17:49' },
      fr: { question: 'Qui a vaincu Goliath avec une fronde ?', options: ['Saül', 'Salomon', 'David', 'Joseph'], reference: '1 Samuel 17:49' },
      es: { question: '¿Quién venció a Goliat con una honda?', options: ['Saúl', 'Salomón', 'David', 'José'], reference: '1 Samuel 17:49' },
      pt: { question: 'Quem derrotou Golias com uma funda?', options: ['Saul', 'Salomão', 'Davi', 'José'], reference: '1 Samuel 17:49' },
      de: { question: 'Wer besiegte Goliat mit einer Schleuder?', options: ['Saul', 'Salomo', 'David', 'Josef'], reference: '1. Samuel 17,49' },
      ar: { question: 'من هزم جليات بالمقلاع؟', options: ['شاول', 'سليمان', 'داود', 'يوسف'], reference: '1 صموئيل 17:49' },
      hi: { question: 'गोफन से गोलियत को किसने हराया?', options: ['शाऊल', 'सुलैमान', 'दाऊद', 'यूसुफ'], reference: '1 शमूएल 17:49' },
      zh: { question: '谁用机弦甩石打败了歌利亚？', options: ['扫罗', '所罗门', '大卫', '约瑟'], reference: '撒母耳记上 17:49' },
    },
  },
  {
    id: 'q-jonah-fish',
    book: 'Jonah',
    ageGroup: 'kids',
    illustration: QUIZ_ILLUSTRATIONS.whale,
    illustrationAlt: 'Friendly giant blue whale swimming in turquoise ocean waves',
    correctIndex: 1,
    translations: {
      en: { question: 'Who was swallowed by a great fish?', options: ['Peter', 'Jonah', 'Paul', 'Daniel'], reference: 'Jonah 1:17' },
      lg: { question: 'Ani eyamiribwa ekyennyanja ekinene?', options: ['Peetero', 'Yona', 'Pawulo', 'Danyeri'], reference: 'Yona 1:17' },
      sw: { question: 'Nani aliyemezwa na samaki mkubwa?', options: ['Petro', 'Yona', 'Paulo', 'Danieli'], reference: 'Yona 1:17' },
      fr: { question: 'Qui fut avalé par un grand poisson ?', options: ['Pierre', 'Jonas', 'Paul', 'Daniel'], reference: 'Jonas 1:17' },
      es: { question: '¿Quién fue tragado por un gran pez?', options: ['Pedro', 'Jonás', 'Pablo', 'Daniel'], reference: 'Jonás 1:17' },
      pt: { question: 'Quem foi engolido por um grande peixe?', options: ['Pedro', 'Jonas', 'Paulo', 'Daniel'], reference: 'Jonas 1:17' },
      de: { question: 'Wer wurde von einem großen Fisch verschluckt?', options: ['Petrus', 'Jona', 'Paulus', 'Daniel'], reference: 'Jona 2,1' },
      ar: { question: 'من الذي ابتلعه حوت عظيم؟', options: ['بطرس', 'يونان', 'بولس', 'دانيال'], reference: 'يونان 1:17' },
      hi: { question: 'किसको एक बड़ी मछली ने निगल लिया था?', options: ['पतरस', 'योना', 'पौलुस', 'दानिय्येल'], reference: 'योना 1:17' },
      zh: { question: '谁被一条大鱼吞进了肚腹中？', options: ['彼得', '约拿', '保罗', '但以理'], reference: '约拿书 1:17' },
    },
  },
  {
    id: 'q-exodus-redsea',
    book: 'Exodus',
    ageGroup: 'kids',
    illustration: QUIZ_ILLUSTRATIONS.whale,
    illustrationAlt: 'Sparkling turquoise sea waves under sunny pastel sky',
    correctIndex: 1,
    translations: {
      en: { question: 'Who parted the Red Sea?', options: ['Joshua', 'Moses', 'Aaron', 'Elijah'], reference: 'Exodus 14:21' },
      lg: { question: 'Ani eyayawulamu Ennyanja Emmyufu?', options: ['Yoswa', 'Musa', 'Alooni', 'Eriya'], reference: 'Okuva 14:21' },
      sw: { question: 'Nani aliyegawanya Bahari ya Shamu?', options: ['Yoshua', 'Musa', 'Haruni', 'Eliya'], reference: 'Kutoka 14:21' },
      fr: { question: 'Qui a ouvert la mer Rouge ?', options: ['Josué', 'Moïse', 'Aaron', 'Élie'], reference: 'Exode 14:21' },
      es: { question: '¿Quién dividió el Mar Rojo?', options: ['Josué', 'Moisés', 'Aarón', 'Elías'], reference: 'Éxodo 14:21' },
      pt: { question: 'Quem abriu o Mar Vermelho?', options: ['Josué', 'Moisés', 'Arão', 'Elias'], reference: 'Êxodo 14:21' },
      de: { question: 'Wer teilte das Schilfmeer?', options: ['Josua', 'Mose', 'Aaron', 'Elia'], reference: '2. Mose 14,21' },
      ar: { question: 'من شقّ البحر الأحمر؟', options: ['يشوع', 'موسى', 'هارون', 'إيليا'], reference: 'الخروج 14:21' },
      hi: { question: 'लाल समुद्र को किसने दो भागों में बाँटा?', options: ['यहोशू', 'मूसा', 'हारून', 'एलिय्याह'], reference: 'निर्गमन 14:21' },
      zh: { question: '谁举杖分开了红海？', options: ['约书亚', '摩西', '亚伦', '以利亚'], reference: '出埃及记 14:21' },
    },
  },
  {
    id: 'q-psalms-shepherd',
    book: 'Psalms',
    ageGroup: 'kids',
    illustration: QUIZ_ILLUSTRATIONS.hills,
    illustrationAlt: 'Fluffy white lambs on a sunlit green hillside',
    correctIndex: 3,
    translations: {
      en: { question: 'Which Psalm says "The Lord is my shepherd"?', options: ['Psalm 1', 'Psalm 100', 'Psalm 150', 'Psalm 23'], reference: 'Psalm 23:1' },
      lg: { question: 'Zabbuli ki egamba nti "Mukama ye musumba wange"?', options: ['Zabbuli 1', 'Zabbuli 100', 'Zabbuli 150', 'Zabbuli 23'], reference: 'Zabbuli 23:1' },
      sw: { question: 'Zaburi ipi husema "Bwana ndiye mchungaji wangu"?', options: ['Zaburi 1', 'Zaburi 100', 'Zaburi 150', 'Zaburi 23'], reference: 'Zaburi 23:1' },
      fr: { question: 'Quel psaume dit « L’Éternel est mon berger » ?', options: ['Psaume 1', 'Psaume 100', 'Psaume 150', 'Psaume 23'], reference: 'Psaume 23:1' },
      es: { question: '¿Qué Salmo dice "Jehová es mi pastor"?', options: ['Salmo 1', 'Salmo 100', 'Salmo 150', 'Salmo 23'], reference: 'Salmos 23:1' },
      pt: { question: 'Qual Salmo diz "O Senhor é o meu pastor"?', options: ['Salmo 1', 'Salmo 100', 'Salmo 150', 'Salmo 23'], reference: 'Salmos 23:1' },
      de: { question: 'Welcher Psalm sagt „Der Herr ist mein Hirte“?', options: ['Psalm 1', 'Psalm 100', 'Psalm 150', 'Psalm 23'], reference: 'Psalm 23,1' },
      ar: { question: 'أي مزمور يقول "الرب راعيّ"؟', options: ['مزمور 1', 'مزمور 100', 'مزمور 150', 'مزمور 23'], reference: 'مزمور 23:1' },
      hi: { question: 'कौन-सा भजन कहता है "यहोवा मेरा चरवाहा है"?', options: ['भजन 1', 'भजन 100', 'भजन 150', 'भजन 23'], reference: 'भजन 23:1' },
      zh: { question: '哪一篇诗篇说“耶和华是我的牧者”？', options: ['诗篇 1', '诗篇 100', '诗篇 150', '诗篇 23'], reference: '诗篇 23:1' },
    },
  },
  {
    id: 'q-matthew-birth',
    book: 'Matthew',
    ageGroup: 'kids',
    illustration: QUIZ_ILLUSTRATIONS.hills,
    illustrationAlt: 'Peaceful sunlit hills with olive trees and gentle lambs',
    correctIndex: 0,
    translations: {
      en: { question: 'In which town was Jesus born?', options: ['Bethlehem', 'Nazareth', 'Jericho', 'Galilee'], reference: 'Matthew 2:1' },
      lg: { question: 'Yesu yazaalibwa mu kibuga ki?', options: ['Besirehemu', 'Nazaaleesi', 'Yeriko', 'Ggaliraaya'], reference: 'Matayo 2:1' },
      sw: { question: 'Yesu alizaliwa katika mji gani?', options: ['Bethlehemu', 'Nazareti', 'Yeriko', 'Galilaya'], reference: 'Mathayo 2:1' },
      fr: { question: 'Dans quelle ville Jésus est-il né ?', options: ['Bethléem', 'Nazareth', 'Jéricho', 'Galilée'], reference: 'Matthieu 2:1' },
      es: { question: '¿En qué ciudad nació Jesús?', options: ['Belén', 'Nazaret', 'Jericó', 'Galilea'], reference: 'Mateo 2:1' },
      pt: { question: 'Em que cidade Jesus nasceu?', options: ['Belém', 'Nazaré', 'Jericó', 'Galileia'], reference: 'Mateus 2:1' },
      de: { question: 'In welcher Stadt wurde Jesus geboren?', options: ['Bethlehem', 'Nazareth', 'Jericho', 'Galiläa'], reference: 'Matthäus 2,1' },
      ar: { question: 'في أي مدينة وُلِد يسوع؟', options: ['بيت لحم', 'الناصرة', 'أريحا', 'الجليل'], reference: 'متى 2:1' },
      hi: { question: 'यीशु का जन्म किस नगर में हुआ था?', options: ['बैतलहम', 'नासरत', 'यरीहो', 'गलील'], reference: 'मत्ती 2:1' },
      zh: { question: '耶稣降生在哪个城镇？', options: ['伯利恒', '拿撒勒', '耶利哥', '加利利'], reference: '马太福音 2:1' },
    },
  },
  {
    id: 'q-genesis-rainbow',
    book: 'Genesis',
    ageGroup: 'teens',
    illustration: QUIZ_ILLUSTRATIONS.noah,
    illustrationAlt: 'Rainbow over Noah and the wooden ark',
    correctIndex: 2,
    translations: {
      en: { question: 'What sign did God put in the sky after the flood?', options: ['A star', 'A dove', 'A rainbow', 'A cloud pillar'], reference: 'Genesis 9:13' },
      lg: { question: 'Kabonero ki Katonda ke yassa mu ggulu oluvannyuma lw’amataba?', options: ['Emmunyeenye', 'Enjiba', 'Musoke', 'Ekire'], reference: 'Olubereberye 9:13' },
      sw: { question: 'Mungu aliweka ishara gani angani baada ya gharika?', options: ['Nyota', 'Njiwa', 'Upinde wa mvua', 'Wingu'], reference: 'Mwanzo 9:13' },
      fr: { question: 'Quel signe Dieu mit-il dans le ciel après le déluge ?', options: ['Une étoile', 'Une colombe', 'Un arc-en-ciel', 'Une nuée'], reference: 'Genèse 9:13' },
      es: { question: '¿Qué señal puso Dios en el cielo tras el diluvio?', options: ['Una estrella', 'Una paloma', 'Un arcoíris', 'Una nube'], reference: 'Génesis 9:13' },
      pt: { question: 'Que sinal Deus colocou no céu após o dilúvio?', options: ['Uma estrela', 'Uma pomba', 'Um arco-íris', 'Uma nuvem'], reference: 'Gênesis 9:13' },
      de: { question: 'Welches Zeichen setzte Gott nach der Flut an den Himmel?', options: ['Einen Stern', 'Eine Taube', 'Einen Regenbogen', 'Eine Wolke'], reference: '1. Mose 9,13' },
      ar: { question: 'ما العلامة التي وضعها الله في السماء بعد الطوفان؟', options: ['نجمة', 'حمامة', 'قوس قزح', 'سحابة'], reference: 'التكوين 9:13' },
      hi: { question: 'जलप्रलय के बाद परमेश्वर ने आकाश में क्या चिह्न रखा?', options: ['एक तारा', 'एक कबूतर', 'इन्द्रधनुष', 'एक बादल'], reference: 'उत्पत्ति 9:13' },
      zh: { question: '洪水过后，神在天上立了什么记号？', options: ['一颗星', '一只鸽子', '彩虹', '云柱'], reference: '创世记 9:13' },
    },
  },
  {
    id: 'q-john-water-wine',
    book: 'John',
    ageGroup: 'teens',
    illustration: QUIZ_ILLUSTRATIONS.hills,
    illustrationAlt: 'Galilee stone village and olive trees in warm morning light',
    correctIndex: 1,
    translations: {
      en: { question: 'Where did Jesus perform His first miracle?', options: ['Capernaum', 'Cana', 'Bethany', 'Jerusalem'], reference: 'John 2:11' },
      lg: { question: 'Yesu yakolera wa ekyamagero kye ekyasooka?', options: ['Kaperunawumu', 'Kaana', 'Besaniya', 'Yerusaalemi'], reference: 'Yokaana 2:11' },
      sw: { question: 'Yesu alifanya muujiza wake wa kwanza wapi?', options: ['Kapernaumu', 'Kana', 'Bethania', 'Yerusalemu'], reference: 'Yohana 2:11' },
      fr: { question: 'Où Jésus a-t-il accompli son premier miracle ?', options: ['Capernaüm', 'Cana', 'Béthanie', 'Jérusalem'], reference: 'Jean 2:11' },
      es: { question: '¿Dónde hizo Jesús su primer milagro?', options: ['Capernaúm', 'Caná', 'Betania', 'Jerusalén'], reference: 'Juan 2:11' },
      pt: { question: 'Onde Jesus realizou seu primeiro milagre?', options: ['Cafarnaum', 'Caná', 'Betânia', 'Jerusalém'], reference: 'João 2:11' },
      de: { question: 'Wo tat Jesus sein erstes Wunder?', options: ['Kapernaum', 'Kana', 'Betanien', 'Jerusalem'], reference: 'Johannes 2,11' },
      ar: { question: 'أين صنع يسوع أول معجزة له؟', options: ['كفرناحوم', 'قانا', 'بيت عنيا', 'أورشليم'], reference: 'يوحنا 2:11' },
      hi: { question: 'यीशु ने अपना पहला चमत्कार कहाँ किया?', options: ['कफरनहूम', 'काना', 'बैतनिय्याह', 'यरूशलेम'], reference: 'यूहन्ना 2:11' },
      zh: { question: '耶稣在哪里行了他的第一件神迹？', options: ['迦百农', '迦拿', '伯大尼', '耶路撒冷'], reference: '约翰福音 2:11' },
    },
  },
  {
    id: 'q-exodus-commandments',
    book: 'Exodus',
    ageGroup: 'teens',
    illustration: QUIZ_ILLUSTRATIONS.bible,
    illustrationAlt: 'Open Bible resting on clouds under golden light',
    correctIndex: 0,
    translations: {
      en: { question: 'On which mountain did Moses receive the Ten Commandments?', options: ['Mount Sinai', 'Mount Carmel', 'Mount Olive', 'Mount Hermon'], reference: 'Exodus 19:20' },
      lg: { question: 'Musa yafunira ku lusozi ki Amateeka Ekkumi?', options: ['Olusozi Sinaayi', 'Olusozi Kalumeeri', 'Olusozi olw’Emizeyituuni', 'Olusozi Kerumooni'], reference: 'Okuva 19:20' },
      sw: { question: 'Musa alipokea Amri Kumi katika mlima gani?', options: ['Mlima Sinai', 'Mlima Karmeli', 'Mlima wa Mizeituni', 'Mlima Hermoni'], reference: 'Kutoka 19:20' },
      fr: { question: 'Sur quelle montagne Moïse reçut-il les Dix Commandements ?', options: ['Mont Sinaï', 'Mont Carmel', 'Mont des Oliviers', 'Mont Hermon'], reference: 'Exode 19:20' },
      es: { question: '¿En qué monte recibió Moisés los Diez Mandamientos?', options: ['Monte Sinaí', 'Monte Carmelo', 'Monte de los Olivos', 'Monte Hermón'], reference: 'Éxodo 19:20' },
      pt: { question: 'Em que monte Moisés recebeu os Dez Mandamentos?', options: ['Monte Sinai', 'Monte Carmelo', 'Monte das Oliveiras', 'Monte Hermom'], reference: 'Êxodo 19:20' },
      de: { question: 'Auf welchem Berg empfing Mose die Zehn Gebote?', options: ['Berg Sinai', 'Berg Karmel', 'Ölberg', 'Berg Hermon'], reference: '2. Mose 19,20' },
      ar: { question: 'على أي جبل استلم موسى الوصايا العشر؟', options: ['جبل سيناء', 'جبل الكرمل', 'جبل الزيتون', 'جبل حرمون'], reference: 'الخروج 19:20' },
      hi: { question: 'मूसा को दस आज्ञाएँ किस पर्वत पर मिलीं?', options: ['सीनै पर्वत', 'कर्मेल पर्वत', 'जैतून पर्वत', 'हेर्मोन पर्वत'], reference: 'निर्गमन 19:20' },
      zh: { question: '摩西在哪座山上领受了十诫？', options: ['西奈山', '迦密山', '橄榄山', '黑门山'], reference: '出埃及记 19:20' },
    },
  },
  {
    id: 'q-matthew-beatitudes',
    book: 'Matthew',
    ageGroup: 'teens',
    illustration: QUIZ_ILLUSTRATIONS.hills,
    illustrationAlt: 'Sunlit green hillside with wildflowers and stone path',
    correctIndex: 2,
    translations: {
      en: { question: 'In the Beatitudes, who are called children of God?', options: ['The wealthy', 'The swift', 'The peacemakers', 'The builders'], reference: 'Matthew 5:9' },
      lg: { question: 'Mu Mukisa gwa Yesu, baani abayitibwa abaana ba Katonda?', options: ['Abagagga', 'Abamanyi', 'Abaleeta emirembe', 'Abazimbi'], reference: 'Matayo 5:9' },
      sw: { question: 'Katika Heri za Mlimani, nani huitwa wana wa Mungu?', options: ['Matajiri', 'Wenye mbio', 'Wapatanishi', 'Wajenzi'], reference: 'Mathayo 5:9' },
      fr: { question: 'Dans les Béatitudes, qui est appelé fils de Dieu ?', options: ['Les riches', 'Les rapides', 'Les artisans de paix', 'Les bâtisseurs'], reference: 'Matthieu 5:9' },
      es: { question: 'En las Bienaventuranzas, ¿quiénes serán llamados hijos de Dios?', options: ['Los ricos', 'Los veloces', 'Los pacificadores', 'Los constructores'], reference: 'Mateo 5:9' },
      pt: { question: 'Nas Bem-aventuranças, quem será chamado filho de Deus?', options: ['Os ricos', 'Os velozes', 'Os pacificadores', 'Os construtores'], reference: 'Mateus 5:9' },
      de: { question: 'Wer heißt in den Seligpreisungen Kinder Gottes?', options: ['Die Reichen', 'Die Schnellen', 'Die Friedfertigen', 'Die Baumeister'], reference: 'Matthäus 5,9' },
      ar: { question: 'في التطويبات، من يُدعَون أبناء الله؟', options: ['الأغنياء', 'السريعون', 'صانعو السلام', 'البناؤون'], reference: 'متى 5:9' },
      hi: { question: 'धन्य वचनों में परमेश्वर के पुत्र कौन कहलाते हैं?', options: ['धनी लोग', 'तेज़ दौड़ने वाले', 'मेल कराने वाले', 'निर्माण करने वाले'], reference: 'मत्ती 5:9' },
      zh: { question: '在八福中，哪一种人必称为神的儿子？', options: ['富足的人', '跑得快的人', '使人和睦的人', '建造的人'], reference: '马太福音 5:9' },
    },
  },
  {
    id: 'q-revelation-alpha',
    book: 'Revelation',
    ageGroup: 'teens',
    illustration: QUIZ_ILLUSTRATIONS.bible,
    illustrationAlt: 'Open Bible illuminated by a golden cross and sunbeams',
    correctIndex: 3,
    translations: {
      en: { question: 'In Revelation, who is called the Alpha and the Omega?', options: ['John', 'Gabriel', 'Michael', 'The Lord God'], reference: 'Revelation 1:8' },
      lg: { question: 'Mu Okubikkulirwa, ani ayitibwa Alufa ne Omega?', options: ['Yokaana', 'Gabulyeri', 'Mikayiri', 'Mukama Katonda'], reference: 'Okubikkulirwa 1:8' },
      sw: { question: 'Katika Ufunuo, nani huitwa Alfa na Omega?', options: ['Yohana', 'Gabrieli', 'Mikaeli', 'Bwana Mungu'], reference: 'Ufunuo 1:8' },
      fr: { question: 'Dans l’Apocalypse, qui est l’Alpha et l’Oméga ?', options: ['Jean', 'Gabriel', 'Michel', 'Le Seigneur Dieu'], reference: 'Apocalypse 1:8' },
      es: { question: 'En Apocalipsis, ¿quién es el Alfa y la Omega?', options: ['Juan', 'Gabriel', 'Miguel', 'El Señor Dios'], reference: 'Apocalipsis 1:8' },
      pt: { question: 'Em Apocalipse, quem é o Alfa e o Ômega?', options: ['João', 'Gabriel', 'Miguel', 'O Senhor Deus'], reference: 'Apocalipse 1:8' },
      de: { question: 'Wer ist in der Offenbarung das Alpha und das Omega?', options: ['Johannes', 'Gabriel', 'Michael', 'Gott der Herr'], reference: 'Offenbarung 1,8' },
      ar: { question: 'في سفر الرؤيا، من هو الألف والياء؟', options: ['يوحنا', 'جبرائيل', 'ميخائيل', 'الرب الإله'], reference: 'الرؤيا 1:8' },
      hi: { question: 'प्रकाशितवाक्य में अल्फ़ा और ओमेगा कौन कहलाता है?', options: ['यूहन्ना', 'जिब्राईल', 'मीकाईल', 'प्रभु परमेश्वर'], reference: 'प्रकाशितवाक्य 1:8' },
      zh: { question: '在启示录中，谁被称为阿拉法、俄梅戛？', options: ['约翰', '加百列', '米迦勒', '主神'], reference: '启示录 1:8' },
    },
  },
  {
    id: 'q-psalms-lamp',
    book: 'Psalms',
    ageGroup: 'adults',
    illustration: QUIZ_ILLUSTRATIONS.bible,
    illustrationAlt: 'Open Bible resting on heavenly clouds with warm light',
    correctIndex: 1,
    translations: {
      en: { question: 'Which Psalm is the longest chapter in the Bible?', options: ['Psalm 23', 'Psalm 119', 'Psalm 91', 'Psalm 139'], reference: 'Psalm 119:105' },
      lg: { question: 'Zabbuli ki esinga obuwanvu mu Baibuli yonna?', options: ['Zabbuli 23', 'Zabbuli 119', 'Zabbuli 91', 'Zabbuli 139'], reference: 'Zabbuli 119:105' },
      sw: { question: 'Zaburi ipi ni sura ndefu zaidi katika Biblia?', options: ['Zaburi 23', 'Zaburi 119', 'Zaburi 91', 'Zaburi 139'], reference: 'Zaburi 119:105' },
      fr: { question: 'Quel psaume est le plus long chapitre de la Bible ?', options: ['Psaume 23', 'Psaume 119', 'Psaume 91', 'Psaume 139'], reference: 'Psaume 119:105' },
      es: { question: '¿Qué Salmo es el capítulo más largo de la Biblia?', options: ['Salmo 23', 'Salmo 119', 'Salmo 91', 'Salmo 139'], reference: 'Salmos 119:105' },
      pt: { question: 'Qual Salmo é o capítulo mais longo da Bíblia?', options: ['Salmo 23', 'Salmo 119', 'Salmo 91', 'Salmo 139'], reference: 'Salmos 119:105' },
      de: { question: 'Welcher Psalm ist das längste Kapitel der Bibel?', options: ['Psalm 23', 'Psalm 119', 'Psalm 91', 'Psalm 139'], reference: 'Psalm 119,105' },
      ar: { question: 'أي مزمور هو أطول إصحاح في الكتاب المقدس؟', options: ['مزمور 23', 'مزمور 119', 'مزمور 91', 'مزمور 139'], reference: 'مزمور 119:105' },
      hi: { question: 'बाइबिल का सबसे लंबा अध्याय कौन-सा भजन है?', options: ['भजन 23', 'भजन 119', 'भजन 91', 'भजन 139'], reference: 'भजन 119:105' },
      zh: { question: '圣经中最长的一章是哪一篇诗篇？', options: ['诗篇 23', '诗篇 119', '诗篇 91', '诗篇 139'], reference: '诗篇 119:105' },
    },
  },
  {
    id: 'q-john-iam',
    book: 'John',
    ageGroup: 'adults',
    illustration: QUIZ_ILLUSTRATIONS.hills,
    illustrationAlt: 'Shepherd meadow and sunlit stone path in Galilee',
    correctIndex: 0,
    translations: {
      en: { question: 'In John 10, how does Jesus describe Himself?', options: ['The Good Shepherd', 'The Wise Builder', 'The Morning Star', 'The Judge'], reference: 'John 10:11' },
      lg: { question: 'Mu Yokaana 10, Yesu yeyogerako atya?', options: ['Omusumba Omulungi', 'Omuzimbi Omugezi', 'Emmunyeenye ey’Enkya', 'Omulamuzi'], reference: 'Yokaana 10:11' },
      sw: { question: 'Katika Yohana 10, Yesu anajieleza kama nani?', options: ['Mchungaji Mwema', 'Mjenzi Mwenye Hekima', 'Nyota ya Asubuhi', 'Hakimu'], reference: 'Yohana 10:11' },
      fr: { question: 'Dans Jean 10, comment Jésus se décrit-il ?', options: ['Le Bon Berger', 'Le Sage Bâtisseur', 'L’Étoile du Matin', 'Le Juge'], reference: 'Jean 10:11' },
      es: { question: 'En Juan 10, ¿cómo se describe Jesús a sí mismo?', options: ['El Buen Pastor', 'El Constructor Sabio', 'La Estrella Matutina', 'El Juez'], reference: 'Juan 10:11' },
      pt: { question: 'Em João 10, como Jesus se descreve?', options: ['O Bom Pastor', 'O Construtor Sábio', 'A Estrela da Manhã', 'O Juiz'], reference: 'João 10:11' },
      de: { question: 'Wie beschreibt sich Jesus in Johannes 10?', options: ['Der gute Hirte', 'Der kluge Baumeister', 'Der Morgenstern', 'Der Richter'], reference: 'Johannes 10,11' },
      ar: { question: 'في يوحنا 10، كيف يصف يسوع نفسه؟', options: ['الراعي الصالح', 'البنّاء الحكيم', 'كوكب الصبح', 'القاضي'], reference: 'يوحنا 10:11' },
      hi: { question: 'यूहन्ना 10 में यीशु स्वयं को क्या बताते हैं?', options: ['अच्छा चरवाहा', 'बुद्धिमान राजमिस्त्री', 'भोर का तारा', 'न्यायाधीश'], reference: 'यूहन्ना 10:11' },
      zh: { question: '在约翰福音第10章中，耶稣如何形容自己？', options: ['好牧人', '聪明的工头', '明亮的晨星', '审判者'], reference: '约翰福音 10:11' },
    },
  },
  {
    id: 'q-revelation-patmos',
    book: 'Revelation',
    ageGroup: 'adults',
    illustration: QUIZ_ILLUSTRATIONS.whale,
    illustrationAlt: 'Sparkling turquoise sea around a rocky island',
    correctIndex: 2,
    translations: {
      en: { question: 'On which island did John write Revelation?', options: ['Cyprus', 'Crete', 'Patmos', 'Malta'], reference: 'Revelation 1:9' },
      lg: { question: 'Yokaana yawandiikira ku kizinga ki Okubikkulirwa?', options: ['Kupulo', 'Kuleete', 'Patumo', 'Malita'], reference: 'Okubikkulirwa 1:9' },
      sw: { question: 'Yohana aliandika Ufunuo akiwa kwenye kisiwa gani?', options: ['Kipro', 'Krete', 'Patmo', 'Malta'], reference: 'Ufunuo 1:9' },
      fr: { question: 'Sur quelle île Jean a-t-il écrit l’Apocalypse ?', options: ['Chypre', 'Crète', 'Patmos', 'Malte'], reference: 'Apocalypse 1:9' },
      es: { question: '¿En qué isla escribió Juan el Apocalipsis?', options: ['Chipre', 'Creta', 'Patmos', 'Malta'], reference: 'Apocalipsis 1:9' },
      pt: { question: 'Em que ilha João escreveu o Apocalipse?', options: ['Chipre', 'Creta', 'Patmos', 'Malta'], reference: 'Apocalipse 1:9' },
      de: { question: 'Auf welcher Insel schrieb Johannes die Offenbarung?', options: ['Zypern', 'Kreta', 'Patmos', 'Malta'], reference: 'Offenbarung 1,9' },
      ar: { question: 'في أي جزيرة كتب يوحنا سفر الرؤيا؟', options: ['قبرص', 'كريت', 'بطمس', 'مالطة'], reference: 'الرؤيا 1:9' },
      hi: { question: 'यूहन्ना ने प्रकाशितवाक्य किस द्वीप पर लिखा था?', options: ['साइप्रस', 'क्रेते', 'पतमोस', 'माल्टा'], reference: 'प्रकाशितवाक्य 1:9' },
      zh: { question: '约翰是在哪座岛上写下启示录的？', options: ['塞浦路斯', '克里特', '拔摩海岛', '马耳他'], reference: '启示录 1:9' },
    },
  },
  {
    id: 'q-genesis-melchizedek',
    book: 'Genesis',
    ageGroup: 'adults',
    illustration: QUIZ_ILLUSTRATIONS.david,
    illustrationAlt: 'Sunlit rolling hills and shepherd valley',
    correctIndex: 1,
    translations: {
      en: { question: 'Who blessed Abram as king of Salem and priest?', options: ['Lot', 'Melchizedek', 'Isaac', 'Esau'], reference: 'Genesis 14:18' },
      lg: { question: 'Ani eyasabira Ibulayimu omukisa nga ye kabaka wa Salemu?', options: ['Looti', 'Merukizedeki', 'Isaaka', 'Esawu'], reference: 'Olubereberye 14:18' },
      sw: { question: 'Nani aliyembariki Abramu kama mfalme wa Salemu?', options: ['Lutu', 'Melkizedeki', 'Isaka', 'Esau'], reference: 'Mwanzo 14:18' },
      fr: { question: 'Qui bénit Abram en tant que roi de Salem ?', options: ['Lot', 'Melchisédek', 'Isaac', 'Ésaü'], reference: 'Genèse 14:18' },
      es: { question: '¿Quién bendijo a Abram como rey de Salem?', options: ['Lot', 'Melquisedec', 'Isaac', 'Esaú'], reference: 'Génesis 14:18' },
      pt: { question: 'Quem abençoou Abrão como rei de Salém?', options: ['Ló', 'Melquisedeque', 'Isaque', 'Esaú'], reference: 'Gênesis 14:18' },
      de: { question: 'Wer segnete Abram als König von Salem?', options: ['Lot', 'Melchisedek', 'Isaak', 'Esau'], reference: '1. Mose 14,18' },
      ar: { question: 'من بارك أبرام كملك ساليم وكاهن؟', options: ['لوط', 'ملكي صادق', 'إسحاق', 'عيسو'], reference: 'التكوين 14:18' },
      hi: { question: 'शालेम के राजा और याजक के रूप में अब्राम को किसने आशीर्वाद दिया?', options: ['लूत', 'मलकीसेदेक', 'इसहाक', 'एसाव'], reference: 'उत्पत्ति 14:18' },
      zh: { question: '哪位撒冷王兼祭司为亚伯兰祝福？', options: ['罗得', '麦基洗德', '以撒', '以扫'], reference: '创世记 14:18' },
    },
  },
  {
    id: 'q-exodus-bush',
    book: 'Exodus',
    ageGroup: 'adults',
    illustration: QUIZ_ILLUSTRATIONS.hills,
    illustrationAlt: 'Golden sunbeams shining over hillside',
    correctIndex: 3,
    translations: {
      en: { question: 'Near which mountain did Moses see the burning bush?', options: ['Mount Tabor', 'Mount Nebo', 'Mount Zion', 'Mount Horeb'], reference: 'Exodus 3:1' },
      lg: { question: 'Musa yalabira wa ekisaka ekyali kyaka omuliro?', options: ['Olusozi Taboli', 'Olusozi Nebo', 'Olusozi Sayuuni', 'Olusozi Kolebu'], reference: 'Okuva 3:1' },
      sw: { question: 'Musa aliona kichaka kinachowaka karibu na mlima gani?', options: ['Mlima Tabori', 'Mlima Nebo', 'Mlima Sayuni', 'Mlima Horebu'], reference: 'Kutoka 3:1' },
      fr: { question: 'Près de quelle montagne Moïse vit-il le buisson ardent ?', options: ['Mont Thabor', 'Mont Nébo', 'Mont Sion', 'Mont Horeb'], reference: 'Exode 3:1' },
      es: { question: '¿Cerca de qué monte vio Moisés la zarza ardiente?', options: ['Monte Tabor', 'Monte Nebo', 'Monte Sion', 'Monte Horeb'], reference: 'Éxodo 3:1' },
      pt: { question: 'Perto de que monte Moisés viu a sarça ardente?', options: ['Monte Tabor', 'Monte Nebo', 'Monte Sião', 'Monte Horebe'], reference: 'Êxodo 3:1' },
      de: { question: 'Bei welchem Berg sah Mose den brennenden Dornbusch?', options: ['Berg Tabor', 'Berg Nebo', 'Berg Zion', 'Berg Horeb'], reference: '2. Mose 3,1' },
      ar: { question: 'قرب أي جبل رأى موسى العليقة المشتعلة؟', options: ['جبل تابور', 'جبل نبو', 'جبل صهيون', 'جبل حوريب'], reference: 'الخروج 3:1' },
      hi: { question: 'मूसा ने जलती हुई झाड़ी किस पर्वत के पास देखी?', options: ['ताबोर पर्वत', 'नबो पर्वत', 'सिय्योन पर्वत', 'होरेब पर्वत'], reference: 'निर्गमन 3:1' },
      zh: { question: '摩西在哪座山附近看见了烧着的荆棘？', options: ['他泊山', '尼波山', '锡安山', '何烈山'], reference: '出埃及记 3:1' },
    },
  },
  {
    id: 'q-matthew-wisemen',
    book: 'Matthew',
    ageGroup: 'kids',
    illustration: QUIZ_ILLUSTRATIONS.bible,
    illustrationAlt: 'Glowing light in the sky over peaceful clouds',
    correctIndex: 1,
    translations: {
      en: { question: 'What guided the wise men to Jesus?', options: ['A rainbow', 'A bright star', 'A white dove', 'A trumpet'], reference: 'Matthew 2:9' },
      lg: { question: 'Kiki ekyalagirira abasajja abagezi okutuuka ewa Yesu?', options: ['Musoke', 'Emmunyeenye eyaka', 'Enjiba enjeru', 'Ekkondeere'], reference: 'Matayo 2:9' },
      sw: { question: 'Kitu gani kiliwaongoza mamajusi hadi kwa Yesu?', options: ['Upinde wa mvua', 'Nyota angavu', 'Njiwa mweupe', 'Tarumbeta'], reference: 'Mathayo 2:9' },
      fr: { question: 'Qu’est-ce qui a guidé les mages vers Jésus ?', options: ['Un arc-en-ciel', 'Une étoile brillante', 'Une colombe blanche', 'Une trompette'], reference: 'Matthieu 2:9' },
      es: { question: '¿Qué guió a los sabios hasta Jesús?', options: ['Un arcoíris', 'Una estrella brillante', 'Una paloma blanca', 'Una trompeta'], reference: 'Mateo 2:9' },
      pt: { question: 'O que guiou os magos até Jesus?', options: ['Um arco-íris', 'Uma estrela brilhante', 'Uma pomba branca', 'Uma trombeta'], reference: 'Mateus 2:9' },
      de: { question: 'Was führte die Weisen zu Jesus?', options: ['Ein Regenbogen', 'Ein heller Stern', 'Eine weiße Taube', 'Eine Posaune'], reference: 'Matthäus 2,9' },
      ar: { question: 'ما الذي هدى المجوس إلى يسوع؟', options: ['قوس قزح', 'نجم ساطع', 'حمامة بيضاء', 'بوق'], reference: 'متى 2:9' },
      hi: { question: 'ज्योतिषियों को यीशु तक किसने मार्ग दिखाया?', options: ['इन्द्रधनुष', 'एक चमकता तारा', 'एक सफ़ेद कबूतर', 'एक तुरही'], reference: 'मत्ती 2:9' },
      zh: { question: '是什么引导博士们找到耶稣的？', options: ['彩虹', '明亮的星', '白鸽', '号角'], reference: '马太福音 2:9' },
    },
  },
  {
    id: 'q-psalms-creation',
    book: 'Psalms',
    ageGroup: 'teens',
    illustration: QUIZ_ILLUSTRATIONS.hills,
    illustrationAlt: 'Sunlit hills, olive trees, and wildflowers under a bright sky',
    correctIndex: 0,
    translations: {
      en: { question: 'According to Psalm 19, what declares the glory of God?', options: ['The heavens', 'The kings', 'The cities', 'The armies'], reference: 'Psalm 19:1' },
      lg: { question: 'Okusinziira ku Zabbuli 19, kiki ekirangirira ekitiibwa kya Katonda?', options: ['Eggulu', 'Bakabaka', 'Ebibuga', 'Eggye'], reference: 'Zabbuli 19:1' },
      sw: { question: 'Kulingana na Zaburi 19, nini hutangaza utukufu wa Mungu?', options: ['Mbingu', 'Wafalme', 'Miji', 'Majeshi'], reference: 'Zaburi 19:1' },
      fr: { question: 'Selon le Psaume 19, qu’est-ce qui raconte la gloire de Dieu ?', options: ['Les cieux', 'Les rois', 'Les villes', 'Les armées'], reference: 'Psaume 19:1' },
      es: { question: 'Según el Salmo 19, ¿qué cuenta la gloria de Dios?', options: ['Los cielos', 'Los reyes', 'Las ciudades', 'Los ejércitos'], reference: 'Salmos 19:1' },
      pt: { question: 'Segundo o Salmo 19, o que declara a glória de Deus?', options: ['Os céus', 'Os reis', 'As cidades', 'Os exércitos'], reference: 'Salmos 19:1' },
      de: { question: 'Was erzählt nach Psalm 19 die Ehre Gottes?', options: ['Die Himmel', 'Die Könige', 'Die Städte', 'Die Heere'], reference: 'Psalm 19,2' },
      ar: { question: 'بحسب مزمور 19، ما الذي يحدّث بمجد الله؟', options: ['السماوات', 'الملوك', 'المدن', 'الجيوش'], reference: 'مزمور 19:1' },
      hi: { question: 'भजन 19 के अनुसार परमेश्वर की महिमा का वर्णन कौन करता है?', options: ['आकाश', 'राजा', 'नगर', 'सेनाएँ'], reference: 'भजन 19:1' },
      zh: { question: '根据诗篇19篇，什么述说神的荣耀？', options: ['诸天', '君王', '城邑', '军队'], reference: '诗篇 19:1' },
    },
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function selectQuizQuestions(
  ageGroup: AgeGroup,
  bookFilter: BibleBookFilter,
  count = 6,
  excludeIds: string[] = []
): { questions: QuizQuestion[]; resetUsed: boolean } {
  const excluded = new Set(excludeIds);

  let bookPool = QUIZ_QUESTIONS;
  if (bookFilter !== 'all') {
    const byBook = QUIZ_QUESTIONS.filter((q) => q.book === bookFilter);
    if (byBook.length > 0) {
      bookPool = byBook;
    }
  }

  // Prefer unseen questions first (matching book + age, then matching book, then unseen globally)
  const unseenBookAge = shuffleArray(
    bookPool.filter((q) => q.ageGroup === ageGroup && !excluded.has(q.id))
  );
  const unseenBookOtherAge = shuffleArray(
    bookPool.filter((q) => q.ageGroup !== ageGroup && !excluded.has(q.id))
  );
  const unseenGlobalAge = shuffleArray(
    QUIZ_QUESTIONS.filter(
      (q) =>
        q.ageGroup === ageGroup &&
        !excluded.has(q.id) &&
        !bookPool.some((b) => b.id === q.id)
    )
  );
  const unseenGlobalOther = shuffleArray(
    QUIZ_QUESTIONS.filter(
      (q) =>
        q.ageGroup !== ageGroup &&
        !excluded.has(q.id) &&
        !bookPool.some((b) => b.id === q.id)
    )
  );

  const picked: QuizQuestion[] = [];
  const addUnique = (candidates: QuizQuestion[]) => {
    for (const q of candidates) {
      if (picked.length >= count) break;
      if (!picked.some((p) => p.id === q.id)) {
        picked.push(q);
      }
    }
  };

  addUnique(unseenBookAge);
  addUnique(unseenBookOtherAge);
  addUnique(unseenGlobalAge);
  addUnique(unseenGlobalOther);

  let resetUsed = false;
  if (picked.length < count) {
    // All unseen questions in the entire bank have been played; start a fresh cycle
    resetUsed = true;
    const seenFallback = shuffleArray(
      QUIZ_QUESTIONS.filter((q) => !picked.some((p) => p.id === q.id))
    );
    addUnique(seenFallback);
  }

  return { questions: picked, resetUsed };
}
