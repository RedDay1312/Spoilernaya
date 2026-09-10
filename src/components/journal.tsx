import { X } from "lucide-react";
import { NPCS } from "@/content/characters";
import { ITEMS, PHASE_LABEL } from "@/content/map-data";
import { useGame } from "@/store/game-store";

export function Journal() {
  const open = useGame((s) => s.journalOpen);
  const toggle = useGame((s) => s.toggleJournal);
  const flags = useGame((s) => s.flags);
  const helped = useGame((s) => s.helped);
  const hurt = useGame((s) => s.hurt);
  const items = useGame((s) => s.items);
  const phase = useGame((s) => s.phase);
  const trust = useGame((s) => s.trust);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-bg/70 p-3 sm:items-center">
      <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-wide text-muted uppercase">{PHASE_LABEL[phase]}</p>
            <h2 className="font-display text-3xl">Журнал</h2>
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => toggle(false)}
            className="grid size-11 place-items-center rounded-lg border border-line"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          Узнай, что с ними не так. Помоги — или оставь. Дверь слушает счёт.
        </p>
        <ul className="mt-5 space-y-3">
          {NPCS.map((n) => {
            const met = flags.has(`met:${n.id}`) || (n.id === "lesha" && flags.has("met:kostya"));
            const ok = helped.has(n.id);
            const bad = hurt.has(n.id);
            return (
              <li key={n.id} className="rounded-lg border border-line bg-bg px-3 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium">{met ? n.name : "???"}</p>
                  <p className="text-xs text-muted">
                    {ok ? "помогла" : bad ? "отвернулась" : met ? `доверие ${trust[n.id] ?? 0}` : "не знакомы"}
                  </p>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {met ? n.problem : "Кто-то в доме. Услышишь — запишешь."}
                </p>
              </li>
            );
          })}
        </ul>
        <h3 className="mt-6 font-display text-xl">Находки</h3>
        <ul className="mt-2 space-y-2">
          {ITEMS.map((it) => {
            const got = items.has(it.id) || flags.has(it.flag);
            return (
              <li key={it.id} className="text-sm text-muted">
                <span className="text-fg">{got ? it.name : "Пустой слот"}</span>
                {got ? ` — ${it.about}` : ""}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
