import type { ItemDef, Phase } from "./types";

export const MAP_W = 1728;
export const MAP_H = 1152;

export const PLAYER_SPAWN = { x: 520, y: 980 };

/** Invisible furniture / wall blockers in map pixels. */
export const BLOCKERS: { x: number; y: number; w: number; h: number }[] = [
  // outer walls
  { x: 0, y: 0, w: 1728, h: 56 },
  { x: 0, y: 1098, w: 1728, h: 54 },
  { x: 0, y: 0, w: 52, h: 1152 },
  { x: 1676, y: 0, w: 52, h: 1152 },

  // inner wall: bedroom row vs hall (door gaps at ~240-340, 820-940, 1280-1400)
  { x: 52, y: 392, w: 170, h: 28 },
  { x: 360, y: 392, w: 430, h: 28 },
  { x: 960, y: 392, w: 280, h: 28 },
  { x: 1440, y: 392, w: 236, h: 28 },

  // vertical splits upper rooms
  { x: 448, y: 56, w: 22, h: 336 },
  { x: 748, y: 56, w: 22, h: 336 },
  { x: 1128, y: 56, w: 22, h: 336 },

  // living / kitchen split-ish columns
  { x: 1048, y: 560, w: 18, h: 200 },

  // living L-sofa
  { x: 96, y: 640, w: 310, h: 62 },
  { x: 96, y: 640, w: 70, h: 210 },
  // coffee table
  { x: 210, y: 760, w: 120, h: 70 },
  // TV cabinet
  { x: 60, y: 700, w: 42, h: 170 },
  // plants
  { x: 70, y: 560, w: 48, h: 48 },
  { x: 390, y: 1008, w: 46, h: 46 },

  // dining table
  { x: 780, y: 730, w: 170, h: 160 },

  // kitchen island + counters
  { x: 1200, y: 690, w: 250, h: 120 },
  { x: 1490, y: 520, w: 186, h: 430 },
  { x: 1568, y: 520, w: 90, h: 110 },

  // bedroom 1 bed
  { x: 120, y: 110, w: 250, h: 150 },
  { x: 100, y: 130, w: 36, h: 40 },
  { x: 360, y: 130, w: 36, h: 40 },

  // bathroom fixtures
  { x: 490, y: 80, w: 220, h: 78 },
  { x: 500, y: 270, w: 54, h: 68 },
  { x: 610, y: 268, w: 72, h: 42 },

  // bedroom 2 bed
  { x: 800, y: 108, w: 230, h: 148 },
  { x: 1060, y: 190, w: 52, h: 52 },

  // office desk + shelf
  { x: 1288, y: 80, w: 40, h: 210 },
  { x: 1340, y: 88, w: 290, h: 96 },
  { x: 1410, y: 188, w: 64, h: 58 },
];

export const INTERACTABLES: {
  id: string;
  x: number;
  y: number;
  r: number;
  kind: "door" | "sofa" | "tv" | "pc" | "window";
  label: string;
  dialogue: string;
}[] = [
  { id: "front-door", x: 620, y: 1048, r: 78, kind: "door", label: "Дверь", dialogue: "door" },
  { id: "sofa-sleep", x: 280, y: 900, r: 64, kind: "sofa", label: "Диван", dialogue: "sofa" },
  { id: "tv", x: 90, y: 820, r: 56, kind: "tv", label: "Телевизор", dialogue: "tv" },
  { id: "pc", x: 1480, y: 210, r: 56, kind: "pc", label: "Компьютер", dialogue: "pc" },
  { id: "window-night", x: 200, y: 80, r: 50, kind: "window", label: "Окно", dialogue: "window" },
];

export const ITEMS: ItemDef[] = [
  {
    id: "sticky-admin",
    name: "Стикер админа",
    about: "Жёлтый стикер на спинке дивана: «не кикать Настю. она ещё не поняла».",
    x: 250,
    y: 700,
    flag: "item:sticky-admin",
    dialogue: "item-sticky-admin",
  },
  {
    id: "bracket",
    name: "Турнирная сетка",
    about: "Сетка «сильнейших». Внизу приписано карандашом: Настя — ???",
    x: 900,
    y: 700,
    flag: "item:bracket",
    dialogue: "item-bracket",
  },
  {
    id: "romcom-list",
    name: "Список ромкомов",
    about: "Список тайтлов. Одно название подчёркнуто: «если бы я умел так».",
    x: 520,
    y: 1048,
    flag: "item:romcom-list",
    dialogue: "item-romcom",
  },
  {
    id: "saitama-notes",
    name: "Тетрадь пауэрскейлинга",
    about: "«Сайтама соло всех». Последняя страница пустая, заголовок: «а я».",
    x: 1180,
    y: 980,
    flag: "item:saitama-notes",
    dialogue: "item-saitama",
  },
  {
    id: "year-2027",
    name: "Стикер 2027",
    about: "«2027 всё другое будет». Под ним — талон к окулисту, просроченный.",
    x: 1540,
    y: 330,
    flag: "item:year-2027",
    dialogue: "item-2027",
  },
  {
    id: "circus-ticket",
    name: "Цирковые билеты",
    about: "Два билета. Один целый, второй надорван пополам.",
    x: 200,
    y: 220,
    flag: "item:circus-ticket",
    dialogue: "item-circus",
  },
  {
    id: "dead-phone",
    name: "Телефон",
    about: "Чат без имени. Заголовок: «не открывать». Ернур сам его так назвал.",
    x: 1000,
    y: 180,
    requirePhase: "evening",
    flag: "item:dead-phone",
    dialogue: "item-phone",
  },
  {
    id: "quote-book",
    name: "Цитатник",
    about: "Чужие фразы. Последняя страница: «моё:» и ничего дальше.",
    x: 680,
    y: 520,
    flag: "item:quote-book",
    dialogue: "item-quotes",
  },
];

export const PHASE_ORDER: Phase[] = ["arrival", "evening", "night", "crisis", "dawn"];

export const PHASE_LABEL: Record<Phase, string> = {
  arrival: "Первый вечер",
  evening: "Трещины",
  night: "Ночь дома",
  crisis: "Все говорят сразу",
  dawn: "Рассвет",
};

export function phaseIndex(p: Phase) {
  return PHASE_ORDER.indexOf(p);
}

export function phaseAtLeast(current: Phase, need: Phase) {
  return phaseIndex(current) >= phaseIndex(need);
}
