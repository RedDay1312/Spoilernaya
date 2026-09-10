import { useEffect } from "react";
import { PORTRAITS, CHARACTER_NAMES } from "@/content/characters";
import { useGame, visibleChoices } from "@/store/game-store";

export function DialogueOverlay() {
  const dialogue = useGame((s) => s.dialogue);
  const lineIndex = useGame((s) => s.lineIndex);
  const advanceLine = useGame((s) => s.advanceLine);
  const pick = useGame((s) => s.pick);
  const closeDialogue = useGame((s) => s.closeDialogue);
  const flags = useGame((s) => s.flags);
  const trust = useGame((s) => s.trust);
  const helped = useGame((s) => s.helped);
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dialogue) closeDialogue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogue, closeDialogue]);

  if (!dialogue) return null;

  const line = dialogue.lines[Math.min(lineIndex, dialogue.lines.length - 1)];
  const last = lineIndex >= dialogue.lines.length - 1;
  const choices = last ? visibleChoices(dialogue, flags, trust, helped.size, phase) : [];
  const portrait = line ? PORTRAITS[line.speaker] : "";
  const name = line ? CHARACTER_NAMES[line.speaker] : "";

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 p-3 sm:p-5">
      <button type="button" onClick={closeDialogue} className="absolute right-5 top-5 rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg">
        Закрыть
      </button>
      <button
        type="button"
        className="absolute inset-0 -z-10 h-[100dvh] w-full"
        aria-label="Дальше"
        onClick={() => {
          if (choices.length) return;
          advanceLine();
        }}
      />
      <div className="mx-auto flex w-full max-w-3xl items-end gap-3">
        {portrait ? <div className="hidden h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-surface sm:block"><img src={portrait} alt="" className="h-full w-full object-contain object-bottom" /></div> : null}
        <div className="min-w-0 flex-1 rounded-xl border border-line bg-surface/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
          {name ? <p className="text-xs font-semibold tracking-wide text-muted uppercase">{name}</p> : null}
          <p className="mt-1 font-display text-xl leading-snug text-fg sm:text-2xl">{line?.text}</p>
          {choices.length > 0 ? <div className="mt-4 flex flex-col gap-2">{choices.map((c) => <button key={c.text + c.next} type="button" onClick={() => pick(c)} className="rounded-md border border-line bg-surface-2 px-3 py-2.5 text-left text-sm leading-snug text-fg transition-colors hover:bg-bg">{c.text}</button>)}</div> : <p className="mt-3 text-xs text-subtle">Нажми, чтобы продолжить</p>}
        </div>
      </div>
    </div>
  );
}
