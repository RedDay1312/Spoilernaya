import { useRef } from "react";
import { useGame } from "@/store/game-store";

export function TouchControls() {
  const setTouch = useGame((s) => s.setTouch);
  const setInteract = useGame((s) => s.setInteract);
  const dialogue = useGame((s) => s.dialogue);
  const pad = useRef<HTMLDivElement>(null);

  if (dialogue) return null;

  const onPtr = (e: React.PointerEvent) => {
    const el = pad.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 2 - 1;
    const y = (e.clientY - r.top) / r.height * 2 - 1;
    const len = Math.hypot(x, y) || 1;
    const nx = Math.max(-1, Math.min(1, x / Math.max(len, 0.35)));
    const ny = Math.max(-1, Math.min(1, y / Math.max(len, 0.35)));
    if (len < 0.2) setTouch(0, 0);
    else setTouch(nx, ny);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 sm:hidden">
      <div
        ref={pad}
        className="pointer-events-auto size-32 rounded-full border border-line bg-surface/50"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          onPtr(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons) onPtr(e);
        }}
        onPointerUp={() => setTouch(0, 0)}
        onPointerCancel={() => setTouch(0, 0)}
      />
      <button
        type="button"
        className="pointer-events-auto size-16 rounded-full border border-line-strong bg-surface/80 text-sm font-semibold"
        onPointerDown={() => setInteract(true)}
      >
        E
      </button>
    </div>
  );
}
