import { create } from "zustand";
import type { CharacterId, Choice, DialogueNode, Effect, EndingId, Phase, Screen } from "@/content/types";
import { DIALOGUE } from "@/content/dialogue";
import { ITEMS, PHASE_ORDER, PLAYER_SPAWN } from "@/content/map-data";
import { clearSave, loadSave, writeSave, type SaveBlob } from "@/lib/save";

const HELP_IDS: CharacterId[] = [
  "kuvanov",
  "aldiyar",
  "abiyukov",
  "maxim",
  "evgeniy",
  "kostya",
  "lesha",
  "yernur",
  "ilya",
];

export type Prompt = {
  label: string;
  action: () => void;
} | null;

type GameState = {
  screen: Screen;
  phase: Phase;
  flags: Set<string>;
  trust: Record<string, number>;
  helped: Set<string>;
  hurt: Set<string>;
  items: Set<string>;
  notes: string[];
  playerX: number;
  playerY: number;
  ending: EndingId | null;
  dialogue: DialogueNode | null;
  lineIndex: number;
  prompt: Prompt;
  journalOpen: boolean;
  paused: boolean;
  touch: { x: number; y: number };
  interactDown: boolean;
  ready: boolean;
};

type GameActions = {
  startNew: () => void;
  continueSave: () => void;
  hasSave: () => boolean;
  beginPlay: () => void;
  setPrompt: (p: Prompt) => void;
  setPos: (x: number, y: number) => void;
  setTouch: (x: number, y: number) => void;
  setInteract: (v: boolean) => void;
  openDialogue: (id: string) => void;
  advanceLine: () => void;
  pick: (choice: Choice) => void;
  closeDialogue: () => void;
  toggleJournal: (v?: boolean) => void;
  setPaused: (v: boolean) => void;
  persist: () => void;
  helpedCount: () => number;
  canLeave: () => boolean;
  applySleep: () => void;
  tryEndingDoor: () => void;
};

const emptyTrust = () =>
  Object.fromEntries(HELP_IDS.map((id) => [id, 0])) as Record<string, number>;

const initial = (): GameState => ({
  screen: "title",
  phase: "arrival",
  flags: new Set(),
  trust: emptyTrust(),
  helped: new Set(),
  hurt: new Set(),
  items: new Set(),
  notes: [],
  playerX: PLAYER_SPAWN.x,
  playerY: PLAYER_SPAWN.y,
  ending: null,
  dialogue: null,
  lineIndex: 0,
  prompt: null,
  journalOpen: false,
  paused: false,
  touch: { x: 0, y: 0 },
  interactDown: false,
  ready: true,
});

function hydrate(blob: SaveBlob): GameState {
  return {
    ...initial(),
    screen: (blob.screen as Screen) || "title",
    phase: (blob.phase as Phase) || "arrival",
    flags: new Set(blob.flags),
    trust: { ...emptyTrust(), ...blob.trust },
    helped: new Set(blob.helped),
    hurt: new Set(blob.hurt),
    items: new Set(blob.items),
    notes: blob.notes ?? [],
    playerX: blob.playerX || PLAYER_SPAWN.x,
    playerY: blob.playerY || PLAYER_SPAWN.y,
    ending: (blob.ending as EndingId) || null,
  };
}

function snapshot(s: GameState): SaveBlob {
  return {
    version: 1,
    screen: s.screen,
    phase: s.phase,
    flags: [...s.flags],
    trust: s.trust,
    helped: [...s.helped],
    hurt: [...s.hurt],
    items: [...s.items],
    notes: s.notes,
    playerX: s.playerX,
    playerY: s.playerY,
    ending: s.ending,
  };
}

function applyEffects(s: GameState, effects?: Effect[]) {
  if (!effects) return;
  for (const e of effects) {
    if (e.type === "flag") {
      const next = new Set(s.flags);
      if (e.value === false) next.delete(e.key);
      else next.add(e.key);
      s.flags = next;
    } else if (e.type === "trust") {
      s.trust = { ...s.trust, [e.id]: (s.trust[e.id] ?? 0) + e.delta };
    } else if (e.type === "help") {
      const h = new Set(s.helped);
      h.add(e.id);
      s.helped = h;
      const n = new Set(s.flags);
      n.add(`helped:${e.id}`);
      s.flags = n;
    } else if (e.type === "hurt") {
      const h = new Set(s.hurt);
      h.add(e.id);
      s.hurt = h;
    } else if (e.type === "item") {
      const it = new Set(s.items);
      it.add(e.id);
      s.items = it;
      const n = new Set(s.flags);
      n.add(`item:${e.id}`);
      s.flags = n;
    } else if (e.type === "phase") {
      s.phase = e.phase;
    } else if (e.type === "ending") {
      s.ending = e.id;
      s.screen = "ending";
    } else if (e.type === "note") {
      s.notes = [...s.notes, e.text];
    }
  }
}

function maybeAdvancePhase(s: GameState) {
  const met = HELP_IDS.filter((id) => s.flags.has(`met:${id}`)).length;
  const secrets = ["kuvanov", "aldiyar", "abiyukov", "maxim", "evgeniy", "clowns", "yernur", "ilya"].filter((k) =>
    s.flags.has(`secret:${k}`),
  ).length;
  const helped = s.helped.size;
  const idx = PHASE_ORDER.indexOf(s.phase);

  if (idx < 1 && (met >= 4 || s.flags.has("slept"))) s.phase = "evening";
  if (PHASE_ORDER.indexOf(s.phase) < 2 && secrets >= 3) s.phase = "night";
  if (PHASE_ORDER.indexOf(s.phase) < 3 && helped >= 2 && secrets >= 5) s.phase = "crisis";
  if (PHASE_ORDER.indexOf(s.phase) < 4 && helped >= 6) s.phase = "dawn";
}

export const useGame = create<GameState & GameActions>((set, get) => ({
  ...initial(),

  hasSave: () => !!loadSave(),

  startNew: () => {
    clearSave();
    set({ ...initial(), screen: "intro" });
  },

  continueSave: () => {
    const blob = loadSave();
    if (!blob) {
      get().startNew();
      return;
    }
    const s = hydrate(blob);
    s.screen = s.ending ? "ending" : "play";
    s.dialogue = null;
    set(s);
  },

  beginPlay: () => {
    set({ screen: "play" });
    get().openDialogue("intro-1");
  },

  setPrompt: (p) => set({ prompt: p }),
  setPos: (x, y) => set({ playerX: x, playerY: y }),
  setTouch: (x, y) => set({ touch: { x, y } }),
  setInteract: (v) => set({ interactDown: v }),
  toggleJournal: (v) => set((s) => ({ journalOpen: v ?? !s.journalOpen })),
  setPaused: (v) => set({ paused: v }),

  openDialogue: (id) => {
    const node = DIALOGUE[id];
    if (!node) return;
    const s = get();
    const next = { ...s, dialogue: node, lineIndex: 0, prompt: null, journalOpen: false };
    applyEffects(next, node.effects);
    maybeAdvancePhase(next);
    set(next);
    if (id === "sofa-advance") get().applySleep();
    get().persist();
  },

  advanceLine: () => {
    const s = get();
    const d = s.dialogue;
    if (!d) return;
    if (s.lineIndex < d.lines.length - 1) {
      set({ lineIndex: s.lineIndex + 1 });
      return;
    }
    if (d.choices && d.choices.length > 0) return;
    if (d.next) {
      get().openDialogue(d.next);
      return;
    }
    get().closeDialogue();
  },

  pick: (choice) => {
    const s = get();
    const next = { ...s };
    applyEffects(next, choice.effects);
    maybeAdvancePhase(next);
    const node = DIALOGUE[choice.next];
    if (!node) {
      next.dialogue = null;
      next.lineIndex = 0;
      set(next);
      get().persist();
      return;
    }
    applyEffects(next, node.effects);
    maybeAdvancePhase(next);
    next.dialogue = node;
    next.lineIndex = 0;
    set(next);
    get().persist();
  },

  closeDialogue: () => {
    const s = get();
    if (s.ending) {
      set({ dialogue: null, screen: "ending" });
      get().persist();
      return;
    }
    const flags = new Set(s.flags);
    set({ dialogue: null, lineIndex: 0, flags });
    get().persist();
    if (s.phase === "crisis" && !flags.has("crisis-seen")) {
      flags.add("crisis-seen");
      set({ flags });
      get().openDialogue("crisis-start");
    }
  },

  persist: () => writeSave(snapshot(get())),

  helpedCount: () => get().helped.size,

  canLeave: () => get().helped.size >= 5 || get().phase === "dawn",

  applySleep: () => {
    const s = get();
    const idx = Math.min(PHASE_ORDER.length - 1, PHASE_ORDER.indexOf(s.phase) + 1);
    const flags = new Set(s.flags);
    flags.add("slept");
    set({ phase: PHASE_ORDER[idx], flags });
    get().persist();
  },

  tryEndingDoor: () => {
    const s = get();
    const n = s.helped.size;
    let ending: EndingId = "stuck";
    if (n >= 9 && ITEMS.every((it) => s.flags.has(it.flag) || s.items.has(it.id))) ending = "true";
    else if (n >= 6) ending = "dawn";
    else if (n >= 3) ending = "ping";
    set({ ending, screen: "ending", dialogue: null });
    get().persist();
  },
}));

export function visibleChoices(
  node: DialogueNode | null,
  flags: Set<string>,
  trust: Record<string, number>,
  helped: number,
  phase: Phase,
) {
  if (!node?.choices) return [];
  return node.choices.filter((c) => {
    if (c.hideIf?.some((h) => flags.has(h) || `phase:${phase}` === h)) return false;
    if (!c.require) return true;
    return c.require.every((r) => {
      if (r.startsWith("trust:")) return (trust[r.slice(6)] ?? 0) >= 2;
      if (r === "can-leave") return helped >= 5 || phase === "dawn";
      if (r === "true-ready") return helped >= 9;
      if (r.startsWith("phase:")) return phase !== r.slice(6);
      return flags.has(r);
    });
  });
}

export { HELP_IDS };
