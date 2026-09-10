const KEY = "spoilernaya.save.v1";
export const SAVE_VERSION = 1;

export type SaveBlob = {
  version: number;
  screen: string;
  phase: string;
  flags: string[];
  trust: Record<string, number>;
  helped: string[];
  hurt: string[];
  items: string[];
  notes: string[];
  playerX: number;
  playerY: number;
  ending: string | null;
};

export function loadSave(): SaveBlob | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveBlob;
    if (!parsed || parsed.version !== SAVE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSave(blob: SaveBlob) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...blob, version: SAVE_VERSION }));
  } catch {
    /* private mode */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
