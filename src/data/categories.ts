import type { QuizCategory, QuizCategoryId } from '../types.ts';

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

export const FREE_CATEGORY_IDS: QuizCategoryId[] = QUIZ_CATEGORIES.filter(
  (c) => c.unlockCost === 0
).map((c) => c.id);

export function getQuizCategoryById(id: string | undefined): QuizCategory | undefined {
  return QUIZ_CATEGORIES.find((c) => c.id === id);
}
