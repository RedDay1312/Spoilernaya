import { CHARACTER_FULL } from "@/content/characters";
import { useGame } from "@/store/game-store";

const COPY: Record<string, { title: string; body: string; later: string }> = {
  stuck: {
    title: "Закреп",
    body: "Ты осталась. На десятом месте в списке участников. Диван снова знает твою спину. Дверь по-прежнему ведёт в гостиную.",
    later: "В чате появился ник Настя. Сообщения короткие. Иногда — чужие.",
  },
  ping: {
    title: "Уведомление",
    body: "Ты вышла. Улица есть. Но телефон тёплый. «Спойлерная» пишет в три ночи, даже если ты не открываешь.",
    later: "Некоторых ты услышала. Некоторых — нет. Дом умеет пинговать.",
  },
  dawn: {
    title: "Рассвет",
    body: "Они сидят на кухне и почти не спорят. Куванов не кикает. Алдияр рисует сетку без имён. Ты открываешь дверь — за ней утро.",
    later: "Беседа жива. Просто из неё можно выйти.",
  },
  true: {
    title: "Админ выходит из сети",
    body: "Дом был криком, не клеткой. Ты назвала их по именам. Стены стали стенами. На столе — посуда. На подоконнике — не лента.",
    later:
      "Через год: Куванов постит пони и не угрожает баном. Алдияр смотрит сенен без турнира людей. Абиюков всё ещё грубый, но говорит «мне одиноко» вслух. Максим спорит для смеха. Евгений ходит к врачу. Братья играют в Minecraft без грима. Ернур молчит о яме. Илья пишет свои предложения. Настя иногда заходит в чат — и уходит, когда хочет.",
  },
};

export function EndingScreen() {
  const ending = useGame((s) => s.ending) ?? "stuck";
  const helped = useGame((s) => s.helped);
  const startNew = useGame((s) => s.startNew);
  const text = COPY[ending] ?? COPY.stuck;

  return (
    <main className="min-h-[100dvh] overflow-y-auto bg-bg px-6 py-12 text-fg">
      <div className="mx-auto max-w-lg">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Концовка</p>
        <h1 className="mt-2 font-display text-4xl">{text.title}</h1>
        <p className="mt-5 text-base leading-relaxed text-muted">{text.body}</p>
        <p className="mt-4 text-sm leading-relaxed text-fg">{text.later}</p>
        <p className="mt-8 text-sm text-muted">Услышала {helped.size} из 9.</p>
        <ul className="mt-3 space-y-1 text-sm text-subtle">
          {[...helped].map((id) => (
            <li key={id}>{CHARACTER_FULL[id] ?? id}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={startNew}
          className="mt-10 h-12 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-fg"
        >
          Другая попытка
        </button>
      </div>
    </main>
  );
}
