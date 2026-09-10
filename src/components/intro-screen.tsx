import { useGame } from "@/store/game-store";

export function IntroScreen() {
  const beginPlay = useGame((s) => s.beginPlay);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-6 text-center text-fg">
      <div className="max-w-lg">
        <p className="font-display text-3xl leading-snug">Ты открыла «Спойлерную» в три ночи.</p>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Стикер. Потолок. Чужой диван. За дверью — эта же гостиная. Они спорят про аниме,
          будто ты всегда здесь жила.
        </p>
        <button
          type="button"
          onClick={beginPlay}
          className="mt-10 h-12 rounded-lg bg-accent px-8 text-sm font-semibold text-accent-fg transition-transform duration-150 active:scale-[0.98]"
        >
          Проснуться
        </button>
      </div>
    </main>
  );
}
