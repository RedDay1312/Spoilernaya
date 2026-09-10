import Phaser from "phaser";
import { HouseScene } from "./house-scene";

export function createGame(parent: HTMLElement) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#0b0a09",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: parent.clientWidth || 960,
      height: parent.clientHeight || 640,
    },
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    render: { antialias: true, roundPixels: true },
    scene: [HouseScene],
    input: { keyboard: true },
    audio: { noAudio: true },
  });
  return game;
}
