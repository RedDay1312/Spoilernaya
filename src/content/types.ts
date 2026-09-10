export type CharacterId =
  | "nastya"
  | "aldiyar"
  | "kuvanov"
  | "abiyukov"
  | "maxim"
  | "evgeniy"
  | "kostya"
  | "lesha"
  | "yernur"
  | "ilya"
  | "narrator"
  | "house";

export type Phase = "arrival" | "evening" | "night" | "crisis" | "dawn";

export type Screen = "title" | "intro" | "play" | "ending";

export type EndingId = "stuck" | "ping" | "dawn" | "true";

export type Effect =
  | { type: "flag"; key: string; value?: boolean }
  | { type: "trust"; id: CharacterId; delta: number }
  | { type: "help"; id: CharacterId }
  | { type: "hurt"; id: CharacterId }
  | { type: "item"; id: string }
  | { type: "phase"; phase: Phase }
  | { type: "ending"; id: EndingId }
  | { type: "note"; text: string };

export type Line = {
  speaker: CharacterId;
  text: string;
};

export type Choice = {
  text: string;
  next: string;
  effects?: Effect[];
  require?: string[];
  hideIf?: string[];
};

export type DialogueNode = {
  id: string;
  lines: Line[];
  choices?: Choice[];
  next?: string;
  effects?: Effect[];
};

export type ItemDef = {
  id: string;
  name: string;
  about: string;
  x: number;
  y: number;
  requirePhase?: Phase;
  flag: string;
  dialogue: string;
};

export type NpcDef = {
  id: CharacterId;
  name: string;
  short: string;
  problem: string;
  sprite: string;
  portrait: string;
  x: number;
  y: number;
  originY?: number;
  helpItem?: string;
};
