import type { LanguageCode, StoryTheme } from '../types';

export const STORY_THEME_META: Record<StoryTheme, { alt: string }> = {
  noah: {
    alt: 'Noah’s wooden ark floating on blue waves beneath a rainbow and dove',
  },
  david: {
    alt: 'Young shepherd David with sling, staff, and sheep in a sunlit green meadow',
  },
  whale: {
    alt: 'Friendly giant blue whale swimming in turquoise ocean waves beside a sailboat',
  },
  shepherd: {
    alt: 'Peaceful sunlit hills of Galilee with lambs, olive tree, and wildflowers',
  },
  bible: {
    alt: 'Open Bible resting on soft clouds beneath golden light and a glowing cross',
  },
};

const STORY_THEME_ALT_BY_LANG: Record<LanguageCode, Record<StoryTheme, string>> = {
  en: {
    noah: STORY_THEME_META.noah.alt,
    david: STORY_THEME_META.david.alt,
    whale: STORY_THEME_META.whale.alt,
    shepherd: STORY_THEME_META.shepherd.alt,
    bible: STORY_THEME_META.bible.alt,
  },
  fr: {
    noah: 'L’arche en bois de Noé flottant sur les vagues bleues sous un arc-en-ciel et une colombe',
    david: 'Le jeune berger David avec sa fronde, son bâton et ses brebis dans une prairie ensoleillée',
    whale: 'Une grande baleine bleue nageant dans les vagues turquoise à côté d’un voilier',
    shepherd: 'Collines paisibles et ensoleillées de Galilée avec des agneaux, un olivier et des fleurs',
    bible: 'Bible ouverte posée sur de doux nuages sous une lumière dorée et une croix lumineuse',
  },
  pt: {
    noah: 'A arca de madeira de Noé flutuando sobre ondas azuis sob um arco-íris e uma pomba',
    david: 'O jovem pastor Davi com funda, cajado e ovelhas em um prado verde ensolarado',
    whale: 'Grande baleia azul nadando em ondas turquesas ao lado de um barco a vela',
    shepherd: 'Colinas tranquilas e ensolaradas da Galileia com cordeiros, oliveira e flores silvestres',
    bible: 'Bíblia aberta sobre nuvens suaves sob luz dourada e uma cruz brilhante',
  },
  ar: {
    noah: 'فلك نوح الخشبي يطفو على الأمواج الزرقاء تحت قوس قزح وحمامة',
    david: 'الراعي الشاب داود بالمقلاع والعصا والخراف في مرج أخضر مشمس',
    whale: 'حوت أزرق كبير يسبح في أمواج فيروزية بجانب مركب شراعي',
    shepherd: 'تلال الجليل الهادئة المشمسة مع الحملان وشجرة زيتون وأزهار برية',
    bible: 'كتاب مقدس مفتوح فوق سحب ناعمة تحت نور ذهبي وصليب مضيء',
  },
  hi: {
    noah: 'इंद्रधनुष और कबूतर के नीचे नीली लहरों पर तैरता नूह का लकड़ी का जहाज़',
    david: 'धूप से भरे हरे चरागाह में गोफन, लाठी और भेड़ों के साथ युवा चरवाहा दाऊद',
    whale: 'नाव के पास फ़िरोज़ी समुद्री लहरों में तैरती विशाल नीली व्हेल',
    shepherd: 'मेमनों, जैतून के पेड़ और जंगली फूलों से सजी गलील की शांत सुनहरी पहाड़ियाँ',
    bible: 'सुनहरी रोशनी और चमकते क्रूस के नीचे कोमल बादलों पर खुली बाइबिल',
  },
  it: {
    noah: 'L’arca di legno di Noè che galleggia sulle onde blu sotto un arcobaleno e una colomba',
    david: 'Il giovane pastore Davide con fionda, bastone e pecore in un prato verde soleggiato',
    whale: 'Grande balena blu che nuota tra onde turchesi accanto a una barca a vela',
    shepherd: 'Colline soleggiate e serene della Galilea con agnelli, ulivo e fiori di campo',
    bible: 'Bibbia aperta su soffici nuvole sotto una luce dorata e una croce luminosa',
  },
  sw: {
    noah: 'Safina ya mbao ya Nuhu ikielea juu ya mawimbi ya buluu chini ya upinde wa mvua na njiwa',
    david: 'Mchungaji kijana Daudi akiwa na kombeo, fimbo na kondoo katika malisho yenye jua',
    whale: 'Nyangumi mkubwa wa buluu akiogelea katika mawimbi ya bahari kando ya jahazi',
    shepherd: 'Milima tulivu yenye jua ya Galilaya na wanakondoo, mzeituni na maua ya porini',
    bible: 'Biblia iliyo wazi juu ya mawingu laini chini ya nuru ya dhahabu na msalaba unaong’aa',
  },
  es: {
    noah: 'El arca de madera de Noé flotando sobre olas azules bajo un arcoíris y una paloma',
    david: 'El joven pastor David con honda, cayado y ovejas en una pradera verde soleada',
    whale: 'Gran ballena azul nadando en olas turquesas junto a un velero',
    shepherd: 'Colinas soleadas y serenas de Galilea con corderos, olivo y flores silvestres',
    bible: 'Biblia abierta sobre nubes suaves bajo una luz dorada y una cruz brillante',
  },
  de: {
    noah: 'Noahs Holzarke auf blauen Wellen unter einem Regenbogen und einer Taube',
    david: 'Der junge Hirte David mit Schleuder, Stab und Schafen auf einer sonnigen grünen Wiese',
    whale: 'Ein großer blauer Wal in türkisfarbenen Meereswellen neben einem Segelboot',
    shepherd: 'Friedliche sonnige Hügel Galiläas mit Lämmern, Olivenbaum und Wildblumen',
    bible: 'Aufgeschlagene Bibel auf weichen Wolken unter goldenem Licht und einem leuchtenden Kreuz',
  },
  zh: {
    noah: '彩虹与鸽子下方蓝色波浪上漂浮的挪亚木制方舟',
    david: '阳光明媚的草地上带着机弦、牧杖和羊群的少年牧童大卫',
    whale: '帆船旁碧蓝海浪中游动的友善巨大蓝鲸',
    shepherd: '加利利宁静温暖的山丘，有着羊羔、橄榄树与野花',
    bible: '柔和云朵上敞开的圣经，上方照耀着金色光芒与发光十字架',
  },
};

export function getLocalizedStoryThemeAlt(theme: StoryTheme, lang: LanguageCode): string {
  return STORY_THEME_ALT_BY_LANG[lang]?.[theme] || STORY_THEME_META[theme].alt;
}
