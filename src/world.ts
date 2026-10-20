import Phaser from "phaser";
import { locations } from "./story";
import type { Place } from "./model";
export interface WorldHooks {
  enter: (id: Place) => void;
  travel: (seconds: number, x: number, y: number) => void;
  prompt: (text: string) => void;
}
export class Neighborhood extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private hooks: WorldHooks;
  private startX: number;
  private startY: number;
  paused = true;
  reduced = false;
  touch = { x: 0, y: 0 };
  private elapsed = 0;
  private nearest: Place | null = null;
  private marker!: Phaser.GameObjects.Arc;
  constructor(hooks: WorldHooks, x: number, y: number) {
    super("neighborhood");
    this.hooks = hooks;
    this.startX = x;
    this.startY = y;
  }
  create() {
    const g = this.add.graphics();
    g.fillStyle(0xe7d5b1);
    g.fillRect(0, 0, 1600, 1120);
    // Desert foothills and the Sandia skyline: all artwork drawn locally.
    g.fillStyle(0xc8b3ae);
    g.fillPoints(
      [
        { x: 0, y: 160 },
        { x: 100, y: 85 },
        { x: 190, y: 135 },
        { x: 310, y: 30 },
        { x: 440, y: 125 },
        { x: 580, y: 45 },
        { x: 720, y: 118 },
        { x: 850, y: 60 },
        { x: 1020, y: 135 },
        { x: 1220, y: 35 },
        { x: 1390, y: 125 },
        { x: 1600, y: 60 },
        { x: 1600, y: 230 },
        { x: 0, y: 230 },
      ],
      true,
    );
    g.fillStyle(0xb8aaa0);
    g.fillPoints(
      [
        { x: 0, y: 180 },
        { x: 270, y: 120 },
        { x: 450, y: 185 },
        { x: 670, y: 125 },
        { x: 900, y: 180 },
        { x: 1200, y: 100 },
        { x: 1600, y: 190 },
        { x: 1600, y: 250 },
        { x: 0, y: 250 },
      ],
      true,
    );
    g.fillStyle(0xd7c09c);
    g.fillRect(0, 220, 1600, 60);
    // Main road, sidewalks and crossing.
    g.fillStyle(0xc9c4b4);
    g.fillRect(0, 475, 1600, 190);
    g.fillStyle(0x687776);
    g.fillRect(0, 495, 1600, 145);
    g.fillStyle(0xeee1ac);
    for (let x = 0; x < 1600; x += 85) g.fillRect(x, 564, 44, 4);
    g.fillStyle(0xf0e6cd);
    for (let y = 505; y < 635; y += 22) g.fillRect(1015, y, 60, 11);
    g.fillStyle(0xf0e1c4);
    g.fillRect(440, 250, 105, 225);
    g.fillRect(440, 665, 105, 400);
    this.walls = this.physics.add.staticGroup();
    for (const l of locations) {
      const { x, y, w, h } = l;
      // Ground path, building shadow, adobe body, layered parapets.
      g.fillStyle(0xf1e2c6);
      g.fillRect(
        x + w / 2 - 25,
        y + h,
        50,
        Math.max(25, y < 500 ? 475 - y - h : 35),
      );
      g.fillStyle(0xbaa789, 0.42);
      g.fillRoundedRect(x + 12, y + 13, w, h, 7);
      g.fillStyle(l.color);
      g.fillRoundedRect(x, y, w, h, 5);
      g.fillStyle(0xffffff, 0.16);
      g.fillRect(x, y, w, 15);
      g.fillStyle(0x4b4b42, 0.24);
      g.fillRect(x, y + 20, w, 8);
      for (let wx = x + 22; wx < x + w - 40; wx += 64) {
        g.fillStyle(0x365c63);
        g.fillRoundedRect(wx, y + 49, 37, 43, 2);
        g.fillStyle(0xd4ded0);
        g.fillRect(wx + 17, y + 49, 3, 43);
        g.fillRect(wx, y + 68, 37, 3);
      }
      g.fillStyle(0x3c514e);
      g.fillRoundedRect(x + w / 2 - 18, y + h - 53, 36, 53, 3);
      g.fillStyle(0xf8cc77);
      g.fillCircle(x + w / 2 + 10, y + h - 25, 3);
      if (l.id === "bus") {
        g.fillStyle(0x305b61);
        g.fillRect(x - 15, y - 10, w + 30, 13);
        g.fillStyle(0x416f73);
        g.fillRect(x, y + 12, 7, h - 12);
        g.fillRect(x + w - 7, y + 12, 7, h - 12);
      }
      if (l.id === "work") {
        g.fillStyle(0xf5e3b6);
        g.fillRect(x - 8, y + 88, w + 16, 16);
        for (let ax = x; ax < x + w; ax += 30) {
          g.fillStyle(0xa55b49);
          g.fillRect(ax, y + 88, 15, 16);
        }
      }
      if (l.id === "college") {
        g.fillStyle(0x365f6e);
        g.fillRect(x + 24, y - 18, w - 48, 21);
        g.lineStyle(1, 0x87a4aa);
        for (let sx = x + 24; sx < x + w - 24; sx += 28)
          g.lineBetween(sx, y - 18, sx, y + 3);
      }
      if (l.id === "bus") {
        g.fillStyle(0x866b4b);
        g.fillRect(x + 25, y + h - 27, w - 50, 8);
        g.fillRect(x + 35, y + h - 19, 6, 17);
        g.fillRect(x + w - 41, y + h - 19, 6, 17);
      }
      const nx = x + w / 2 + 50,
        ny = y + h + 32;
      g.fillStyle(0x304a44, 0.2);
      g.fillEllipse(nx, ny + 17, 23, 8);
      g.fillStyle(l.color);
      g.fillRoundedRect(nx - 9, ny - 5, 18, 20, 4);
      g.fillStyle(0x324b4d);
      g.fillRect(nx - 7, ny + 12, 5, 10);
      g.fillRect(nx + 2, ny + 12, 5, 10);
      g.fillStyle(0xc99770);
      g.fillCircle(nx, ny - 12, 9);
      g.fillStyle(0x3d4140);
      g.fillEllipse(nx, ny - 17, 18, 9);
      const sign = this.add
        .text(x + w / 2, y + 28, l.name.toUpperCase(), {
          fontFamily: "sans-serif",
          fontSize: "13px",
          fontStyle: "bold",
          color: "#fff8e5",
          backgroundColor: "#283f43",
          padding: { x: 9, y: 6 },
        })
        .setOrigin(0.5);
      sign
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.visit(l.id));
      const zone = this.add
        .zone(x + w / 2, y + h / 2, w, h)
        .setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => this.visit(l.id));
      this.add
        .zone(nx, ny, 38, 48)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.visit(l.id));
      this.walls.add(this.add.rectangle(x + w / 2, y + h / 2, w, h, 0, 0));
      this.add
        .text(x + w / 2, y + h + 18, `◇  ${l.person}`, {
          fontFamily: "sans-serif",
          fontSize: "15px",
          color: "#304d4c",
          backgroundColor: "#f8edce",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.visit(l.id));
    }
    // Desert planting, sage, terracotta planters, and pocket parks.
    const cactus = (x: number, y: number) => {
      g.fillStyle(0x2e7265);
      g.fillRoundedRect(x - 5, y - 26, 10, 35, 4);
      g.fillRoundedRect(x - 17, y - 17, 8, 16, 3);
      g.fillRect(x - 15, y - 7, 15, 6);
      g.fillRoundedRect(x + 10, y - 24, 8, 18, 3);
      g.fillRect(x, y - 12, 17, 6);
      g.fillStyle(0xd4bd91);
      g.fillEllipse(x, y + 11, 36, 9);
    };
    for (const [x, y] of [
      [100, 360],
      [575, 340],
      [1020, 365],
      [1490, 390],
      [100, 800],
      [580, 880],
      [980, 870],
      [1490, 870],
      [320, 790],
      [80, 1020],
      [1300, 1020],
    ]) {
      cactus(x, y);
      this.walls.add(this.add.rectangle(x, y - 7, 28, 30, 0, 0));
    }
    for (let i = 0; i < 95; i++) {
      const x = (i * 173 + 47) % 1580,
        y = 690 + ((i * 97) % 400);
      if (
        locations.some(
          (l) =>
            x > l.x - 20 &&
            x < l.x + l.w + 20 &&
            y > l.y - 20 &&
            y < l.y + l.h + 60,
        ) ||
        (x > 425 && x < 560)
      )
        continue;
      g.fillStyle(i % 2 ? 0xb0ab78 : 0xc5ae87);
      g.fillEllipse(x, y, 9, 4);
    }
    g.fillStyle(0x81977c);
    g.fillRoundedRect(170, 900, 230, 100, 24);
    g.fillStyle(0x657e67);
    g.fillCircle(210, 930, 28);
    g.fillCircle(345, 945, 32);
    g.fillStyle(0xaa7953);
    g.fillRect(255, 940, 50, 12);
    g.fillRect(260, 955, 5, 16);
    g.fillRect(295, 955, 5, 16);
    this.add.text(58, 190, "SANDIA FOOTHILLS  /  ALBUQUERQUE, NM", {
      fontFamily: "sans-serif",
      fontSize: "18px",
      letterSpacing: 3,
      color: "#716b67",
    });
    this.add.text(730, 606, "C E N T R A L   A V E N U E", {
      fontFamily: "sans-serif",
      fontSize: "15px",
      color: "#e4e4cd",
    });
    this.add.text(185, 1020, "JUNIPER POCKET PARK", {
      fontFamily: "sans-serif",
      fontSize: "12px",
      color: "#52665b",
    });
    // Four directional walking frames with swinging legs and a warm coral jacket.
    for (let direction = 0; direction < 4; direction++)
      for (let frame = 0; frame < 3; frame++) {
        const p = this.make.graphics({ x: 0, y: 0 });
        const swing = frame === 1 ? 3 : frame === 2 ? -3 : 0;
        p.fillStyle(0x263e47);
        p.fillRect(12 + swing, 30, 6, 12);
        p.fillRect(23 - swing, 30, 6, 12);
        p.fillStyle(0xf2d8b8);
        p.fillRoundedRect(9, 15, 24, 17, 5);
        p.fillStyle(0xbc6754);
        p.fillRoundedRect(11, 19, 20, 16, 4);
        p.fillStyle(0x9d684e);
        p.fillCircle(21, 11, 9);
        p.fillStyle(0x293a3d);
        p.fillEllipse(21, 6, 19, 11);
        if (direction !== 0) {
          p.fillStyle(0x1d3037);
          p.fillRect(direction === 2 ? 14 : 25, 11, 2, 2);
          if (direction === 1) p.fillRect(16, 11, 2, 2);
        }
        p.generateTexture(`player-${direction}-${frame}`, 42, 46);
        p.destroy();
      }
    for (let d = 0; d < 4; d++)
      this.anims.create({
        key: `walk-${d}`,
        frames: [
          { key: `player-${d}-0` },
          { key: `player-${d}-1` },
          { key: `player-${d}-0` },
          { key: `player-${d}-2` },
        ],
        frameRate: 9,
        repeat: -1,
      });
    this.add
      .ellipse(this.startX, this.startY + 15, 27, 11, 0x233f3f, 0.23)
      .setName("shadow");
    this.player = this.physics.add
      .sprite(this.startX, this.startY, "player-1-0")
      .setDepth(10)
      .setCollideWorldBounds(true);
    this.player.body!.setSize(20, 18);
    (this.player.body as Phaser.Physics.Arcade.Body).setOffset(11, 27);
    this.player.setDrag(1300).setMaxVelocity(195);
    this.physics.world.setBounds(25, 240, 1550, 830);
    this.physics.add.collider(this.player, this.walls);
    this.cameras.main
      .setBounds(0, 0, 1600, 1120)
      .startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1);
    this.marker = this.add
      .circle(0, 0, 26, 0xf8d58b, 0.25)
      .setStrokeStyle(2, 0xf9d58c)
      .setDepth(9);
    this.keys = this.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER",
    ) as typeof this.keys;
    this.input.keyboard!.removeCapture([
      "UP",
      "DOWN",
      "LEFT",
      "RIGHT",
      "W",
      "A",
      "S",
      "D",
      "E",
      "ENTER",
    ]);
    this.game.canvas.setAttribute(
      "aria-label",
      "Walkable Albuquerque neighborhood. Use WASD or arrow keys. Use the Locations menu as a keyboard alternative.",
    );
    this.game.canvas.setAttribute("tabindex", "0");
    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      if (this.paused || !["e", "enter"].includes(event.key.toLowerCase()))
        return;
      if (
        ["BUTTON", "SELECT", "INPUT", "TEXTAREA"].includes(
          document.activeElement?.tagName || "",
        )
      )
        return;
      if (this.nearest) {
        event.preventDefault();
        this.hooks.enter(this.nearest);
      }
    });
    this.input.keyboard!.addCapture(["UP", "DOWN", "LEFT", "RIGHT"]);
    this.game.events.emit("world-ready");
  }
  visit(id: Place) {
    if (this.paused) return;
    const l = locations.find((l) => l.id === id)!;
    this.player.setVelocity(0).setAcceleration(0);
    this.player.setPosition(l.x + l.w / 2, l.y + l.h + 64);
    this.hooks.travel(15, this.player.x, this.player.y);
    this.hooks.enter(id);
  }
  resetPosition(x: number, y: number) {
    if (!this.player) {
      this.startX = x;
      this.startY = y;
      return;
    }
    this.player.setVelocity(0).setAcceleration(0).setPosition(x, y);
    this.elapsed = 0;
    this.nearest = null;
    this.touch = { x: 0, y: 0 };
    this.marker.setVisible(false);
    (
      this.children.getByName("shadow") as Phaser.GameObjects.Ellipse
    )?.setPosition(x, y + 17);
    this.hooks.prompt("Explore at your pace · Locations menu also works");
  }
  position() {
    return this.player
      ? { x: this.player.x, y: this.player.y }
      : { x: this.startX, y: this.startY };
  }
  update(_time: number, delta: number) {
    if (!this.player) return;
    const keyboardFocus = document.activeElement?.tagName;
    const blocked =
      this.paused ||
      ["BUTTON", "SELECT", "INPUT", "TEXTAREA"].includes(keyboardFocus || "");
    this.input.keyboard!.manager.preventDefault = !blocked;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (blocked) {
      body.setVelocity(0);
      body.setAcceleration(0);
      this.player.anims.stop();
      return;
    }
    const k = this.keys;
    let dx =
      Number(k.D.isDown || k.RIGHT.isDown) -
      Number(k.A.isDown || k.LEFT.isDown) +
      this.touch.x;
    let dy =
      Number(k.S.isDown || k.DOWN.isDown) -
      Number(k.W.isDown || k.UP.isDown) +
      this.touch.y;
    const length = Math.hypot(dx, dy);
    if (length) {
      dx /= length;
      dy /= length;
      body.setAcceleration(dx * 1100, dy * 1100);
      const dir =
        Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : dy < 0 ? 0 : 1;
      if (!this.reduced) this.player.play(`walk-${dir}`, true);
      else this.player.setTexture(`player-${dir}-0`);
      this.elapsed += delta;
      if (this.elapsed >= 250) {
        this.hooks.travel(this.elapsed / 1000, this.player.x, this.player.y);
        this.elapsed = 0;
      }
    } else {
      body.setAcceleration(0);
      this.player.anims.stop();
    }
    (
      this.children.getByName("shadow") as Phaser.GameObjects.Ellipse
    )?.setPosition(this.player.x, this.player.y + 17);
    const nearest = locations.find(
      (l) =>
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          l.x + l.w / 2,
          l.y + l.h + 40,
        ) < 100,
    );
    this.marker.setVisible(!!nearest);
    if (nearest)
      this.marker.setPosition(
        nearest.x + nearest.w / 2,
        nearest.y + nearest.h + 50,
      );
    if ((nearest?.id || null) !== this.nearest) {
      this.nearest = nearest?.id || null;
      this.hooks.prompt(
        nearest
          ? `E / Enter · Talk to ${nearest.person}`
          : "Explore at your pace · Locations menu also works",
      );
    }
  }
}
