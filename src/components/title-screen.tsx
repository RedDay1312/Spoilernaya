import { useEffect, useState } from "react";
import { useGame } from "@/store/game-store";

export function TitleScreen() {
  const startNew = useGame((s) => s.startNew);
  const continueSave = useGame((s) => s.continueSave);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(useGame.getState().hasSave());
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-bg px-6 py-10 text-fg sm:px-12 sm:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: "url(/assets/map/house.png)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/30" />
      <div className="relative z-10 mx-auto w-full max-w-xl">
        <p className="text-sm font-medium tracking-[0.18em] text-muted uppercase">
          Психологический хоррор
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Спойлерная
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
          Настя открыла беседу. Беседа открыла дом. Чтобы выйти, придётся услышать,
          почему они все ещё здесь.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startNew}
            className="h-12 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-fg transition-transform duration-150 hover:opacity-90 active:scale-[0.98]"
          >
            Войти в дом
          </button>
          {hasSave ? (
            <button
              type="button"
              onClick={continueSave}
              className="h-12 rounded-lg border border-line px-6 text-sm font-medium text-fg transition-colors hover:bg-surface"
            >
              Продолжить
            </button>
          ) : null}
        </div>
        <p className="mt-6 text-xs text-subtle">WASD — ходить. E — говорить. J — журнал.</p>
      </div>
    </main>
  );
}
