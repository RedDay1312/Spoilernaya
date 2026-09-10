import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { useGame } from "@/store/game-store";
import { TitleScreen } from "./title-screen";
import { IntroScreen } from "./intro-screen";
import { DialogueOverlay } from "./dialogue-overlay";
import { Hud } from "./hud";
import { Journal } from "./journal";
import { EndingScreen } from "./ending-screen";
import { TouchControls } from "./touch-controls";
import { PauseMenu } from "./pause-menu";

export function GameApp() {
  const screen = useGame((s) => s.screen);
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (screen !== "play") return;
    const el = parentRef.current;
    if (!el) return;
    let cancelled = false;
    import("@/game/create-game").then(({ createGame }) => {
      if (cancelled || !parentRef.current) return;
      gameRef.current = createGame(parentRef.current);
      setBooted(true);
    });
    const onHide = () => {
      if (document.visibilityState === "hidden") useGame.getState().persist();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      gameRef.current?.destroy(true);
      gameRef.current = null;
      setBooted(false);
    };
  }, [screen]);

  if (screen === "title") return <TitleScreen />;
  if (screen === "intro") return <IntroScreen />;
  if (screen === "ending") return <EndingScreen />;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-bg text-fg">
      <div
        ref={parentRef}
        className="absolute inset-0 touch-none"
        style={{ touchAction: "none" }}
      />
      {!booted ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-bg">
          <p className="font-display text-2xl text-muted">Дом открывается…</p>
        </div>
      ) : null}
      <Hud />
      <DialogueOverlay />
      <Journal />
      <PauseMenu />
      <TouchControls />
    </div>
  );
}
