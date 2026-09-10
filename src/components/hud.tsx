import { BookOpen, Pause } from "lucide-react";
import { PHASE_LABEL } from "@/content/map-data";
import { useGame } from "@/store/game-store";

export function Hud() {
  const phase = useGame((s) => s.phase);
  const prompt = useGame((s) => s.prompt);
  const helped = useGame((s) => s.helped);
  const dialogue = useGame((s) => s.dialogue);
  const toggleJournal = useGame((s) => s.toggleJournal);
  const setPaused = useGame((s) => s.setPaused);

  if (dialogue) return null;

  return (
    <>
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 flex items-start justify-between p-3 sm:p-4">
        <div className="pointer-events-auto rounded-lg border border-line bg-surface/90 px-3 py-2">
          <p className="text-[11px] tracking-wide text-muted uppercase">{PHASE_LABEL[phase]}</p>
          <p className="font-display text-lg leading-none tabular-nums">
            {helped.size}
            <span className="text-muted"> / 9</span>
          </p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            aria-label="Журнал"
            onClick={() => toggleJournal(true)}
            className="grid size-11 place-items-center rounded-lg border border-line bg-surface/90 text-fg"
          >
            <BookOpen className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Пауза"
            onClick={() => setPaused(true)}
            className="grid size-11 place-items-center rounded-lg border border-line bg-surface/90 text-fg"
          >
            <Pause className="size-4" />
          </button>
        </div>
      </div>
      {prompt ? (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-20 w-[min(90%,20rem)] -translate-x-1/2 sm:bottom-8">
          <button
            type="button"
            className="pointer-events-auto w-full rounded-lg border border-line-strong bg-surface/95 px-4 py-3 text-sm font-medium"
            onClick={prompt.action}
          >
            {prompt.label}
          </button>
        </div>
      ) : null}
    </>
  );
}
