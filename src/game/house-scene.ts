import Phaser from "phaser";
import { NPCS } from "@/content/characters";
import { BLOCKERS, INTERACTABLES, ITEMS, MAP_H, MAP_W, PLAYER_SPAWN, phaseAtLeast } from "@/content/map-data";
import { getTalkRoot } from "@/content/dialogue";
import { useGame } from "@/store/game-store";
import type { Phase } from "@/content/types";
import "./controls-test";

const SPEED = 165;
const SPRITE_H = 58;

type Nearby = { label: string; run: () => void } | null;

export class HouseScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd?: Record<string, Phaser.Input.Keyboard.Key>;
  injected = new Set<string>();
  yaw = 0;
  speed = 0;
  lastDir: "down" | "left" | "right" | "up" = "down";
  night!: Phaser.GameObjects.Rectangle;
  nearby: Nearby = null;
  npcSprites: Phaser.Physics.Arcade.Sprite[] = [];
  itemMarks: Phaser.GameObjects.Arc[] = [];
  blocked = false;

  constructor() {
    super("house");
  }

  init() {
    this.injected = new Set();
    this.yaw = 0;
    this.speed = 0;
    this.lastDir = "down";
    this.nearby = null;
    this.npcSprites = [];
    this.itemMarks = [];
    this.blocked = false;
  }

  preload() {
    this.load.image("house", "/assets/map/house.png");
    this.load.spritesheet("nastya", "/assets/sprites/nastya/sheet.png", {
      frameWidth: 256,
      frameHeight: 256,
    });
    for (const n of NPCS) {
      this.load.spritesheet(n.sprite, `/assets/sprites/${n.sprite}/sheet.png`, {
        frameWidth: 256,
        frameHeight: 256,
      });
    }
  }

  create() {
    this.add.image(0, 0, "house").setOrigin(0, 0).setDisplaySize(MAP_W, MAP_H).setDepth(0);

    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.setRoundPixels(true);

    const walls = this.physics.add.staticGroup();
    for (const b of BLOCKERS) {
      const r = this.add.rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, 0x000000, 0);
      this.physics.add.existing(r, true);
      walls.add(r);
    }

    const store = useGame.getState();
    const spawn = { x: store.playerX || PLAYER_SPAWN.x, y: store.playerY || PLAYER_SPAWN.y };

    this.player = this.physics.add.sprite(spawn.x, spawn.y, "nastya", 0);
    this.player.setSize(48, 28).setOffset(104, 200);
    this.scaleSprite(this.player, SPRITE_H);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(spawn.y);

    this.physics.add.collider(this.player, walls);

    this.anims.create({
      key: "nastya-down",
      frames: this.anims.generateFrameNumbers("nastya", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "nastya-left",
      frames: this.anims.generateFrameNumbers("nastya", { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "nastya-right",
      frames: this.anims.generateFrameNumbers("nastya", { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "nastya-up",
      frames: this.anims.generateFrameNumbers("nastya", { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    for (const npc of NPCS) {
      const key = `${npc.sprite}-idle`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(npc.sprite, { start: 0, end: 3 }),
          frameRate: 4,
          repeat: -1,
        });
      }
      const spr = this.physics.add.sprite(npc.x, npc.y, npc.sprite, 0);
      spr.setData("npcId", npc.id);
      const body = spr.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      spr.setSize(44, 26).setOffset(106, 204);
      this.scaleSprite(spr, 64);
      spr.play(key);
      spr.setDepth(npc.y);
      this.physics.add.collider(this.player, spr);
      this.npcSprites.push(spr);
    }

    for (const it of ITEMS) {
      const g = this.add.circle(it.x, it.y, 9, 0xece6dc, 0.85).setDepth(it.y);
      this.tweens.add({
        targets: g,
        alpha: 0.35,
        y: it.y - 4,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      g.setData("itemId", it.id);
      this.itemMarks.push(g);
    }

    this.night = this.add
      .rectangle(MAP_W / 2, MAP_H / 2, MAP_W, MAP_H, 0x07060a, 0)
      .setDepth(8000);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);
    this.fitZoom();
    this.scale.on("resize", () => this.fitZoom());

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys("W,A,S,D,E,J") as Record<string, Phaser.Input.Keyboard.Key>;
    }

    this.input.keyboard?.on("keydown-E", () => this.tryInteract());
    this.input.keyboard?.on("keydown-J", () => useGame.getState().toggleJournal());
    this.input.keyboard?.on("keydown-ESC", () => {
      const g = useGame.getState();
      if (g.dialogue) return;
      g.setPaused(!g.paused);
    });

    window.__controlsTest = {
      getYaw: () => this.yaw,
      getSpeed: () => this.speed,
      setKeys: (codes) => {
        this.injected = new Set(codes);
      },
    };

    this.events.once("shutdown", () => {
      if (window.__controlsTest) delete window.__controlsTest;
    });
  }

  scaleSprite(spr: Phaser.GameObjects.Sprite, height: number) {
    const scale = height / 256;
    spr.setScale(scale);
  }

  fitZoom() {
    const w = this.scale.gameSize.width;
    const h = this.scale.gameSize.height;
    const zoom = Phaser.Math.Clamp(Math.min(w / 520, h / 360), 0.48, 1.15);
    this.cameras.main.setZoom(zoom);
  }

  keyDown(code: string, phaserKey?: Phaser.Input.Keyboard.Key) {
    if (this.injected.has(code)) return true;
    return !!phaserKey?.isDown;
  }

  tryInteract() {
    const g = useGame.getState();
    if (g.dialogue || g.paused || g.journalOpen) return;
    if (this.nearby) this.nearby.run();
  }

  refreshItems(phase: Phase, flags: Set<string>, items: Set<string>) {
    for (const g of this.itemMarks) {
      const id = g.getData("itemId") as string;
      const def = ITEMS.find((x) => x.id === id);
      if (!def) continue;
      const taken = items.has(def.id) || flags.has(def.flag);
      const locked = def.requirePhase ? !phaseAtLeast(phase, def.requirePhase) : false;
      g.setVisible(!taken && !locked);
    }
  }

  update(_t: number, delta: number) {
    const g = useGame.getState();
    const dt = Math.min(delta, 100) / 1000;
    this.blocked = !!(g.dialogue || g.paused || g.journalOpen || g.screen !== "play");

    const nightA =
      g.phase === "evening" ? 0.18 : g.phase === "night" ? 0.42 : g.phase === "crisis" ? 0.55 : g.phase === "dawn" ? 0.08 : 0.05;
    this.night.setFillStyle(0x07060a, nightA);

    this.refreshItems(g.phase, g.flags, g.items);

    let dx = 0;
    let dy = 0;
    if (!this.blocked) {
      if (this.keyDown("KeyW", this.wasd?.W) || this.cursors?.up?.isDown) dy -= 1;
      if (this.keyDown("KeyS", this.wasd?.S) || this.cursors?.down?.isDown) dy += 1;
      if (this.keyDown("KeyA", this.wasd?.A) || this.cursors?.left?.isDown) dx -= 1;
      if (this.keyDown("KeyD", this.wasd?.D) || this.cursors?.right?.isDown) dx += 1;
      dx += g.touch.x;
      dy += g.touch.y;
    }

    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }

    const vx = dx * SPEED;
    const vy = dy * SPEED;
    this.player.setVelocity(vx, vy);
    this.speed = Math.hypot(vx, vy);

    if (this.speed > 8) {
      this.yaw = Math.atan2(-dx, -dy);
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax > ay) this.lastDir = dx < 0 ? "left" : "right";
      else this.lastDir = dy < 0 ? "up" : "down";
      this.player.anims.play(`nastya-${this.lastDir}`, true);
    } else {
      this.player.anims.stop();
      const idle: Record<typeof this.lastDir, number> = { down: 0, left: 4, right: 8, up: 12 };
      this.player.setFrame(idle[this.lastDir]);
    }

    this.player.setDepth(this.player.y);
    for (const s of this.npcSprites) s.setDepth(s.y);

    if (g.interactDown) {
      this.tryInteract();
      useGame.getState().setInteract(false);
    }

    this.scanNearby(g);
  }

  scanNearby(g: ReturnType<typeof useGame.getState>) {
    if (this.blocked) {
      if (this.nearby) {
        this.nearby = null;
        g.setPrompt(null);
      }
      return;
    }
    const px = this.player.x;
    const py = this.player.y;
    let best: Nearby = null;
    let bestD = 58;

    for (const npc of NPCS) {
      const d = Math.hypot(npc.x - px, npc.y - py);
      if (d < bestD) {
        bestD = d;
        best = {
          label: `Говорить · ${npc.name}`,
          run: () => useGame.getState().openDialogue(getTalkRoot(npc.id)),
        };
      }
    }
    for (const it of ITEMS) {
      if (g.items.has(it.id) || g.flags.has(it.flag)) continue;
      if (it.requirePhase && !phaseAtLeast(g.phase, it.requirePhase)) continue;
      const d = Math.hypot(it.x - px, it.y - py);
      if (d < bestD) {
        bestD = d;
        best = {
          label: `Смотреть · ${it.name}`,
          run: () => useGame.getState().openDialogue(it.dialogue),
        };
      }
    }
    for (const obj of INTERACTABLES) {
      const d = Math.hypot(obj.x - px, obj.y - py);
      if (d < Math.max(bestD, obj.r)) {
        bestD = d;
        if (obj.id === "front-door") {
          best = {
            label: "Дверь",
            run: () => {
              const st = useGame.getState();
              if (st.canLeave() && (st.phase === "dawn" || st.helped.size >= 6)) st.tryEndingDoor();
              else st.openDialogue("door");
            },
          };
        } else if (obj.id === "sofa-sleep") {
          best = {
            label: "Диван",
            run: () => useGame.getState().openDialogue("sofa"),
          };
        } else {
          best = {
            label: obj.label,
            run: () => useGame.getState().openDialogue(obj.dialogue),
          };
        }
      }
    }

    const same = (a: Nearby, b: Nearby) => (!a && !b) || (a && b && a.label === b.label);
    if (!same(best, this.nearby)) {
      this.nearby = best;
      g.setPrompt(best ? { label: best.label, action: best.run } : null);
    }

    if (Math.hypot(px - g.playerX, py - g.playerY) > 8) {
      g.setPos(px, py);
    }
  }
}
