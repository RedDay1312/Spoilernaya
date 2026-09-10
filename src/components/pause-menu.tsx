import { useGame } from "@/store/game-store";

export function PauseMenu() {
  const paused = useGame((s) => s.paused);
  const setPaused = useGame((s) => s.setPaused);
  const persist = useGame((s) => s.persist);
  const startNew = useGame((s) => s.startNew);

  if (!paused) return null;

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-bg/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-3xl">Пауза</h2>
        <p className="mt-2 text-sm text-muted">Дом подождёт. Сохранение пишется само.</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            className="h-11 rounded-lg bg-accent text-sm font-semibold text-accent-fg"
            onClick={() => {
              persist();
              setPaused(false);
            }}
          >
            Вернуться
          </button>
          <button
            type="button"
            className="h-11 rounded-lg border border-line text-sm"
            onClick={() => {
              persist();
              startNew();
            }}
          >
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}
