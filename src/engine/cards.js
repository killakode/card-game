/**
 * Card Database and Models
 */

export const CARD_TYPES = {
  MINION: 'MINION',
  SPELL: 'SPELL'
};

export const HERO_CLASSES = {
  NEUTRAL: 'NEUTRAL',
  MAGE: 'MAGE',
  WARRIOR: 'WARRIOR',
  HUNTER: 'HUNTER'
};

export const KEYWORDS = {
  TAUNT: 'TAUNT',               // Enemy minions must attack taunt minions first
  DIVINE_SHIELD: 'DIVINE_SHIELD',// Prevents the first instance of damage
  CHARGE: 'CHARGE',             // Can attack immediately on the turn it is played
  BATTLECRY: 'BATTLECRY',       // Triggers when played from hand
  DEATHRATTLE: 'DEATHRATTLE'    // Triggers when minion dies
};

export const HEROES = {
  MAGE: {
    id: 'hero_mage',
    name: 'Маг (Джайна)',
    heroClass: HERO_CLASSES.MAGE,
    health: 30,
    heroPower: {
      id: 'hp_mage',
      name: 'Вспышка магии',
      cost: 2,
      description: 'Наносит 1 ед. урона выбранной цели.',
      type: 'TARGETED_DAMAGE',
      value: 1
    }
  },
  WARRIOR: {
    id: 'hero_warrior',
    name: 'Воин (Гаррош)',
    heroClass: HERO_CLASSES.WARRIOR,
    health: 30,
    heroPower: {
      id: 'hp_warrior',
      name: 'Поднятие щита',
      cost: 2,
      description: 'Получает 2 ед. брони.',
      type: 'ARMOR_UP',
      value: 2
    }
  },
  HUNTER: {
    id: 'hero_hunter',
    name: 'Охотник (Рексар)',
    heroClass: HERO_CLASSES.HUNTER,
    health: 30,
    heroPower: {
      id: 'hp_hunter',
      name: 'Верный выстрел',
      cost: 2,
      description: 'Наносит 2 ед. урона герою противника.',
      type: 'HERO_DAMAGE',
      value: 2
    }
  }
};

export const CARDS_DATABASE = [
  // --- NEUTRAL MINIONS ---
  {
    id: 'n_elven_archer',
    name: 'Эльфийка-лучница',
    cost: 1,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 1,
    health: 1,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Наносит 1 ед. урона.',
    effect: { type: 'DEAL_DAMAGE', value: 1, target: 'ANY' },
    icon: '🏹'
  },
  {
    id: 'n_goldshire_footman',
    name: 'Пехотинец Златоземья',
    cost: 1,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 1,
    health: 2,
    keywords: [KEYWORDS.TAUNT],
    description: 'Провокация.',
    icon: '🛡️'
  },
  {
    id: 'n_stonetusk_boar',
    name: 'Вепрь-одноклык',
    cost: 1,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 1,
    health: 1,
    keywords: [KEYWORDS.CHARGE],
    description: 'Рывок.',
    icon: '🐗'
  },
  {
    id: 'n_shieldbearer',
    name: 'Щитоносец',
    cost: 1,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 0,
    health: 4,
    keywords: [KEYWORDS.TAUNT],
    description: 'Провокация.',
    icon: '🛡️'
  },
  {
    id: 'n_acidic_swamp_ooze',
    name: 'Кислотный слизнюк',
    cost: 2,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 3,
    health: 2,
    keywords: [],
    description: 'Обычное существо с хорошими характеристиками.',
    icon: '🧪'
  },
  {
    id: 'n_bloodfen_raptor',
    name: 'Речной ящур',
    cost: 2,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 3,
    health: 2,
    keywords: [],
    description: 'Быстрый и свирепый ящур.',
    icon: '🦖'
  },
  {
    id: 'n_frostwolf_grunt',
    name: 'Рубака Северного Волка',
    cost: 2,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 2,
    health: 2,
    keywords: [KEYWORDS.TAUNT],
    description: 'Провокация.',
    icon: '🪓'
  },
  {
    id: 'n_novice_engineer',
    name: 'Инженер-новичок',
    cost: 2,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 1,
    health: 1,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Вы берете карту.',
    effect: { type: 'DRAW_CARD', value: 1 },
    icon: '⚙️'
  },
  {
    id: 'n_argent_squire',
    name: 'Оруженосец Аргентума',
    cost: 1,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 1,
    health: 1,
    keywords: [KEYWORDS.DIVINE_SHIELD],
    description: 'Божественный щит.',
    icon: '✨'
  },
  {
    id: 'n_ironforge_rifleman',
    name: 'Стрелок Стальгорна',
    cost: 3,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 2,
    health: 2,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Наносит 1 ед. урона.',
    effect: { type: 'DEAL_DAMAGE', value: 1, target: 'ANY' },
    icon: '🔫'
  },
  {
    id: 'n_shattered_sun_cleric',
    name: 'Служительница Солнца',
    cost: 3,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 3,
    health: 2,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Дает +1/+1 выбранному дружественному существу.',
    effect: { type: 'BUFF_FRIENDLY_MINION', attack: 1, health: 1 },
    icon: '☀️'
  },
  {
    id: 'n_wolfrider',
    name: 'Всадник на волке',
    cost: 3,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 3,
    health: 1,
    keywords: [KEYWORDS.CHARGE],
    description: 'Рывок.',
    icon: '🐺'
  },
  {
    id: 'n_senjin_shieldmasta',
    name: 'Щитоносец Сен\'джин',
    cost: 4,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 3,
    health: 5,
    keywords: [KEYWORDS.TAUNT],
    description: 'Провокация.',
    icon: '🛡️'
  },
  {
    id: 'n_chillwind_yeti',
    name: 'Морозный йети',
    cost: 4,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 4,
    health: 5,
    keywords: [],
    description: 'Мощный и выносливый йети.',
    icon: '❄️'
  },
  {
    id: 'n_gnomish_inventor',
    name: 'Гном-изобретатель',
    cost: 4,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 2,
    health: 4,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Вы берете карту.',
    effect: { type: 'DRAW_CARD', value: 1 },
    icon: '🔧'
  },
  {
    id: 'n_darkscale_healer',
    name: 'Целительница Темной Чешуи',
    cost: 5,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 4,
    health: 5,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Восстанавливает 2 ед. здоровья всем персонажам игрока.',
    effect: { type: 'HEAL_ALL_FRIENDLIES', value: 2 },
    icon: '💚'
  },
  {
    id: 'n_booty_bay_bodyguard',
    name: 'Охранник Пиратской Бухты',
    cost: 5,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 5,
    health: 4,
    keywords: [KEYWORDS.TAUNT],
    description: 'Провокация.',
    icon: '🏴‍☠️'
  },
  {
    id: 'n_boulderfist_ogre',
    name: 'Огр Камнелап',
    cost: 6,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 6,
    health: 7,
    keywords: [],
    description: 'Невероятно сильный огр.',
    icon: '👹'
  },
  {
    id: 'n_sunwalker',
    name: 'Служитель Солнца',
    cost: 6,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 4,
    health: 5,
    keywords: [KEYWORDS.TAUNT, KEYWORDS.DIVINE_SHIELD],
    description: 'Провокация. Божественный щит.',
    icon: '🌟'
  },
  {
    id: 'n_stormwind_champion',
    name: 'Чемпион Штормграда',
    cost: 7,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 6,
    health: 6,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Дает +1/+1 всем другим вашим существам.',
    effect: { type: 'BUFF_ALL_OTHER_MINIONS', attack: 1, health: 1 },
    icon: '👑'
  },
  {
    id: 'n_loot_hoarder',
    name: 'Добытчик сокровищ',
    cost: 2,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.NEUTRAL,
    attack: 2,
    health: 1,
    keywords: [KEYWORDS.DEATHRATTLE],
    description: 'Предсмертный хрип: Вы берете карту.',
    effect: { type: 'DRAW_CARD', value: 1 },
    icon: '💎'
  },

  // --- MAGE CLASS CARDS ---
  {
    id: 'm_arcane_missiles',
    name: 'Чародейские стрелы',
    cost: 1,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.MAGE,
    description: 'Наносит 3 ед. урона, случайно распределяемого между врагами.',
    effect: { type: 'RANDOM_DAMAGE', value: 3, targets: 'ENEMIES' },
    icon: '✨'
  },
  {
    id: 'm_frostbolt',
    name: 'Ледяная стрела',
    cost: 2,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.MAGE,
    description: 'Наносит 3 ед. урона выбранной цели.',
    effect: { type: 'DEAL_DAMAGE', value: 3, target: 'ANY' },
    icon: '❄️'
  },
  {
    id: 'm_arcane_intellect',
    name: 'Чародейский интеллект',
    cost: 3,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.MAGE,
    description: 'Вы берете 2 карты.',
    effect: { type: 'DRAW_CARD', value: 2 },
    icon: '📖'
  },
  {
    id: 'm_fireball',
    name: 'Огненный шар',
    cost: 4,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.MAGE,
    description: 'Наносит 6 ед. урона выбранной цели.',
    effect: { type: 'DEAL_DAMAGE', value: 6, target: 'ANY' },
    icon: '🔥'
  },
  {
    id: 'm_flamestrike',
    name: 'Огненный столб',
    cost: 7,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.MAGE,
    description: 'Наносит 4 ед. урона всем существам противника.',
    effect: { type: 'AOE_DAMAGE_ENEMY_MINIONS', value: 4 },
    icon: '💥'
  },
  {
    id: 'm_water_elemental',
    name: 'Водяной элементаль',
    cost: 4,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.MAGE,
    attack: 3,
    health: 6,
    keywords: [],
    description: 'Прочное существо Мага.',
    icon: '💧'
  },

  // --- WARRIOR CLASS CARDS ---
  {
    id: 'w_whirlwind',
    name: 'Вихрь',
    cost: 1,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.WARRIOR,
    description: 'Наносит 1 ед. урона ВСЕМ существам.',
    effect: { type: 'AOE_DAMAGE_ALL_MINIONS', value: 1 },
    icon: '🌪️'
  },
  {
    id: 'w_execute',
    name: 'Казнь',
    cost: 2,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.WARRIOR,
    description: 'Уничтожает поврежденное существо противника.',
    effect: { type: 'DESTROY_DAMAGED_MINION' },
    icon: '⚔️'
  },
  {
    id: 'w_shield_block',
    name: 'Блок щитом',
    cost: 3,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.WARRIOR,
    description: 'Получает 5 ед. брони. Вы берете карту.',
    effect: { type: 'ARMOR_AND_DRAW', armor: 5, draw: 1 },
    icon: '🛡️'
  },
  {
    id: 'w_korfron_elite',
    name: 'Кор\'кронский элитный воин',
    cost: 4,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.WARRIOR,
    attack: 4,
    health: 3,
    keywords: [KEYWORDS.CHARGE],
    description: 'Рывок.',
    icon: '🪓'
  },
  {
    id: 'w_brawl',
    name: 'Потасовка',
    cost: 5,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.WARRIOR,
    description: 'Уничтожает всех существ, кроме одного (выбирается случайно).',
    effect: { type: 'BRAWL' },
    icon: '👊'
  },

  // --- HUNTER CLASS CARDS ---
  {
    id: 'h_arcane_shot',
    name: 'Чародейский выстрел',
    cost: 1,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.HUNTER,
    description: 'Наносит 2 ед. урона выбранной цели.',
    effect: { type: 'DEAL_DAMAGE', value: 2, target: 'ANY' },
    icon: '🏹'
  },
  {
    id: 'h_animal_companion',
    name: 'Питомец',
    cost: 3,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.HUNTER,
    description: 'Призывает случайного зверя (4/2 с Рывком или 4/4 с Провокацией).',
    effect: { type: 'SUMMON_ANIMAL_COMPANION' },
    icon: '🐾'
  },
  {
    id: 'h_kill_command',
    name: 'Команда «Взять!»',
    cost: 3,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.HUNTER,
    description: 'Наносит 3 ед. урона (или 5, если на столе есть зверь).',
    effect: { type: 'DEAL_DAMAGE', value: 4, target: 'ANY' },
    icon: '🎯'
  },
  {
    id: 'h_houndmaster',
    name: 'Псарь',
    cost: 4,
    type: CARD_TYPES.MINION,
    heroClass: HERO_CLASSES.HUNTER,
    attack: 4,
    health: 3,
    keywords: [KEYWORDS.BATTLECRY],
    description: 'Боевой клич: Дает +2/+2 и Провокацию дружественному существу.',
    effect: { type: 'BUFF_AND_TAUNT', attack: 2, health: 2 },
    icon: '🐕'
  },
  {
    id: 'h_multi_shot',
    name: 'Залп',
    cost: 4,
    type: CARD_TYPES.SPELL,
    heroClass: HERO_CLASSES.HUNTER,
    description: 'Наносит 3 ед. урона двум случайным существам противника.',
    effect: { type: 'MULTI_SHOT', value: 3, count: 2 },
    icon: '🏹'
  }
];

export function getCardById(id) {
  const card = CARDS_DATABASE.find(c => c.id === id);
  return card ? JSON.parse(JSON.stringify(card)) : null;
}

export function getCardsByClass(heroClass) {
  return CARDS_DATABASE.filter(c => c.heroClass === heroClass || c.heroClass === HERO_CLASSES.NEUTRAL);
}

export function createStarterDeck(heroClass) {
  const classCards = CARDS_DATABASE.filter(c => c.heroClass === heroClass);
  const neutralCards = CARDS_DATABASE.filter(c => c.heroClass === HERO_CLASSES.NEUTRAL);

  let deck = [];
  // Add 2 copies of each class card
  classCards.forEach(card => {
    deck.push(card.id);
    deck.push(card.id);
  });

  // Fill up to 20 cards with neutral cards (2 copies each)
  let neutralIndex = 0;
  while (deck.length < 20 && neutralIndex < neutralCards.length) {
    deck.push(neutralCards[neutralIndex].id);
    if (deck.length < 20) {
      deck.push(neutralCards[neutralIndex].id);
    }
    neutralIndex++;
  }

  return deck.slice(0, 20);
}
