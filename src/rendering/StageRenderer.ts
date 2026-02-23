/**
 * StageRenderer – draws rich procedural stage backgrounds.
 *
 * Each stage is rendered in layered passes (sky → far BG → mid BG → props →
 * ground strip) using Phaser Graphics primitives so no external image assets
 * are required.
 *
 * Usage:
 *   StageRenderer.render(scene, stageId, groundY, groundH);
 */

import Phaser from 'phaser';
import { StageId } from '@/types/scene.types';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game.config';

export class StageRenderer {
  /** Draw the full background for the given stage. Call once in create(). */
  static render(
    scene: Phaser.Scene,
    stage: StageId,
    groundY: number,
    groundH: number,
  ): void {
    switch (stage) {
      case 'VETERINARIA':  StageRenderer._drawVeterinaria(scene, groundY, groundH); break;
      case 'CASA_ABUELOS': StageRenderer._drawCasaAbuelos(scene, groundY, groundH); break;
      case 'DEPTO_SOFIA':  StageRenderer._drawDeptoSofia(scene, groundY, groundH);  break;
      case 'PARQUE':       StageRenderer._drawParque(scene, groundY, groundH);       break;
    }
  }

  // ── Veterinaria ─────────────────────────────────────────────────────────────
  // Clean white clinic with mint-green accents, examination table, cabinets,
  // a big red cross on the wall, framed diplomas, and a tiled floor.
  private static _drawVeterinaria(
    scene: Phaser.Scene,
    groundY: number,
    groundH: number,
  ): void {
    const g = scene.add.graphics();

    // Sky / ambient light above the room
    g.fillGradientStyle(0xd0f0ea, 0xd0f0ea, 0xe8f9f5, 0xe8f9f5, 1);
    g.fillRect(0, 0, GAME_WIDTH, groundY);

    // ── Back wall ────────────────────────────────────────────────────────────
    g.fillStyle(0xf7fffe, 1);
    g.fillRect(0, 60, GAME_WIDTH, groundY - 60);

    // Mint dado rail stripe
    g.fillStyle(0x80cbc4, 1);
    g.fillRect(0, 100, GAME_WIDTH, 18);

    // Baseboard
    g.fillStyle(0xb2dfdb, 1);
    g.fillRect(0, groundY - 6, GAME_WIDTH, 6);

    // ── Tiled floor ──────────────────────────────────────────────────────────
    g.fillStyle(0xe0f7fa, 1);
    g.fillRect(0, groundY, GAME_WIDTH, groundH * 3);

    const tileSize = 60;
    g.lineStyle(1, 0x80cbc4, 0.5);
    for (let tx = 0; tx < GAME_WIDTH; tx += tileSize) {
      g.lineBetween(tx, groundY, tx, groundY + groundH * 3);
    }
    g.lineBetween(0, groundY + tileSize, GAME_WIDTH, groundY + tileSize);

    // ── Ceiling light bar ────────────────────────────────────────────────────
    g.fillStyle(0xffffff, 1);
    g.fillRect(GAME_WIDTH / 2 - 160, 0, 320, 18);
    g.fillStyle(0xfffde7, 0.6);
    g.fillRect(GAME_WIDTH / 2 - 155, 18, 310, 10);

    // Light glow gradient downward
    g.fillGradientStyle(0xfffde7, 0xfffde7, 0xe8f9f5, 0xe8f9f5, 0.18);
    g.fillRect(GAME_WIDTH / 2 - 180, 0, 360, 80);

    // ── Red cross sign ────────────────────────────────────────────────────────
    const crossX = GAME_WIDTH / 2;
    const crossY = 60;
    g.fillStyle(0xef5350, 1);
    g.fillRect(crossX - 14, crossY - 32, 28, 64);
    g.fillRect(crossX - 32, crossY - 14, 64, 28);
    // white inner
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(crossX - 8, crossY - 28, 16, 56);
    g.fillRect(crossX - 28, crossY - 8, 56, 16);

    // ── Diploma frames on wall ────────────────────────────────────────────────
    StageRenderer._frame(g, 120, 68, 80, 55, 0xfff8e1, 0xbcaaa4);
    StageRenderer._frame(g, 220, 68, 80, 55, 0xfff8e1, 0xbcaaa4);

    // ── Steel cabinet (left) ─────────────────────────────────────────────────
    g.fillStyle(0xb0bec5, 1);
    g.fillRect(18, groundY - 120, 90, 120);
    g.lineStyle(1, 0x78909c, 1);
    g.strokeRect(18, groundY - 120, 90, 120);
    // Shelves
    g.lineStyle(1, 0x90a4ae, 0.8);
    for (let sy = groundY - 90; sy < groundY - 10; sy += 30) {
      g.lineBetween(19, sy, 107, sy);
    }
    // Handles
    g.fillStyle(0x546e7a, 1);
    g.fillRect(95, groundY - 80, 8, 14);
    g.fillRect(95, groundY - 50, 8, 14);

    // ── Examination table (right) ────────────────────────────────────────────
    // Table legs
    g.fillStyle(0x90a4ae, 1);
    g.fillRect(650, groundY - 55, 8, 55);
    g.fillRect(830, groundY - 55, 8, 55);
    // Table surface
    g.fillStyle(0xbbdefb, 1);
    g.fillRect(640, groundY - 65, 210, 18);
    g.lineStyle(2, 0x64b5f6, 1);
    g.strokeRect(640, groundY - 65, 210, 18);
    // Pad on table
    g.fillStyle(0xe3f2fd, 1);
    g.fillRect(660, groundY - 80, 170, 15);

    // ── Medicine chest on wall (right) ───────────────────────────────────────
    g.fillStyle(0xffffff, 1);
    g.fillRect(810, 80, 60, 70);
    g.lineStyle(2, 0xef5350, 1);
    g.strokeRect(810, 80, 60, 70);
    // Small cross on medicine chest
    g.fillStyle(0xef5350, 1);
    g.fillRect(836, 94, 8, 22);
    g.fillRect(829, 100, 22, 8);

    // ── Window (far right) ───────────────────────────────────────────────────
    StageRenderer._window(g, 880, 105, 60, 60, 0x87ceeb);

    g.destroy();
  }

  // ── Casa de los Abuelos ─────────────────────────────────────────────────────
  // Warm living room with patterned wallpaper, a sofa, wooden furniture,
  // family photos, a cuckoo clock, houseplants, and a patterned rug.
  private static _drawCasaAbuelos(
    scene: Phaser.Scene,
    groundY: number,
    groundH: number,
  ): void {
    const g = scene.add.graphics();

    // Sky/exterior light
    g.fillStyle(0xfff8e1, 1);
    g.fillRect(0, 0, GAME_WIDTH, groundY);

    // ── Wallpaper (warm cream with vertical stripe pattern) ──────────────────
    g.fillStyle(0xffe0b2, 1);
    g.fillRect(0, 60, GAME_WIDTH, groundY - 60);

    // Vertical wallpaper stripes
    g.lineStyle(14, 0xffcc80, 0.4);
    for (let wx = 0; wx < GAME_WIDTH; wx += 40) {
      g.lineBetween(wx, 60, wx, groundY - 6);
    }

    // Decorative border stripe at dado height
    g.fillStyle(0xffa726, 1);
    g.fillRect(0, 118, GAME_WIDTH, 10);
    g.fillStyle(0xffe082, 1);
    g.fillRect(0, 116, GAME_WIDTH, 4);

    // Baseboard
    g.fillStyle(0xd7ccc8, 1);
    g.fillRect(0, groundY - 8, GAME_WIDTH, 8);

    // ── Parquet floor ────────────────────────────────────────────────────────
    g.fillStyle(0xa1887f, 1);
    g.fillRect(0, groundY, GAME_WIDTH, groundH * 3);

    const pw = 80, ph = 20;
    g.lineStyle(1, 0x8d6e63, 0.5);
    for (let pr = 0; pr < 3; pr++) {
      for (let pc = 0; pc < GAME_WIDTH / pw; pc++) {
        const odd = (pr + pc) % 2;
        g.strokeRect(pc * pw + (odd ? pw / 2 : 0), groundY + pr * ph, pw, ph);
      }
    }

    // ── Ceiling ──────────────────────────────────────────────────────────────
    g.fillStyle(0xfff3e0, 1);
    g.fillRect(0, 0, GAME_WIDTH, 60);
    // Crown moulding
    g.fillStyle(0xffe0b2, 1);
    g.fillRect(0, 55, GAME_WIDTH, 10);

    // ── Sofa (left) ──────────────────────────────────────────────────────────
    // Back cushion
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(30, groundY - 90, 230, 35);
    // Seat
    g.fillStyle(0xa1887f, 1);
    g.fillRect(30, groundY - 55, 230, 55);
    // Arm rests
    g.fillStyle(0x795548, 1);
    g.fillRect(30,  groundY - 85, 22, 85);
    g.fillRect(238, groundY - 85, 22, 85);
    // Cushion dividers
    g.lineStyle(2, 0x795548, 0.6);
    g.lineBetween(107, groundY - 55, 107, groundY);
    g.lineBetween(183, groundY - 55, 183, groundY);
    // Sofa legs
    g.fillStyle(0x5d4037, 1);
    g.fillRect(45, groundY, 12, 10);
    g.fillRect(210, groundY, 12, 10);

    // ── Cushion pillow on sofa ────────────────────────────────────────────────
    g.fillStyle(0xef9a9a, 1);
    g.fillRect(55, groundY - 85, 40, 36);
    g.fillStyle(0xef9a9a, 0.4);
    g.lineBetween(75, groundY - 85, 55, groundY - 49);
    g.lineBetween(75, groundY - 85, 95, groundY - 49);

    // ── Side table (right of sofa) ────────────────────────────────────────────
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(276, groundY - 44, 50, 44);
    g.lineStyle(1, 0x5d4037, 1);
    g.strokeRect(276, groundY - 44, 50, 44);
    // Drawer
    g.fillStyle(0x5d4037, 1);
    g.fillRect(286, groundY - 30, 30, 16);
    g.fillStyle(0xd7ccc8, 1);
    g.fillRect(298, groundY - 24, 6, 6);

    // ── Family photo wall ────────────────────────────────────────────────────
    StageRenderer._frame(g, 340, 68, 90, 65, 0xffe082, 0x8d6e63);
    StageRenderer._frame(g, 450, 68, 70, 50, 0xfff9c4, 0xa1887f);
    StageRenderer._frame(g, 535, 68, 90, 65, 0xffe082, 0x8d6e63);

    // ── Cuckoo clock (far left wall) ─────────────────────────────────────────
    g.fillStyle(0x5d4037, 1);
    g.fillRect(24, 134, 50, 68);
    g.lineStyle(1, 0x4e342e, 1);
    g.strokeRect(24, 134, 50, 68);
    // Clock face
    g.fillStyle(0xfff9c4, 1);
    g.fillCircle(49, 165, 18);
    g.lineStyle(2, 0x5d4037, 1);
    g.strokeCircle(49, 165, 18);
    // Clock hands
    g.lineStyle(2, 0x212121, 1);
    g.lineBetween(49, 165, 49, 152);
    g.lineBetween(49, 165, 59, 165);
    // Pendulum chain
    g.lineStyle(1, 0xa1887f, 1);
    g.lineBetween(49, 202, 49, 215);
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(49, 220, 8);

    // ── Houseplant (right side) ───────────────────────────────────────────────
    // Pot
    g.fillStyle(0xef6c00, 1);
    g.fillRect(828, groundY - 38, 34, 38);
    g.fillStyle(0xe64a19, 1);
    g.fillRect(824, groundY - 42, 42, 8);
    // Dirt
    g.fillStyle(0x5d4037, 1);
    g.fillRect(830, groundY - 34, 22, 8);
    // Plant leaves
    g.fillStyle(0x388e3c, 1);
    g.fillEllipse(845, groundY - 55, 28, 34);
    g.fillEllipse(831, groundY - 65, 22, 28);
    g.fillEllipse(859, groundY - 62, 22, 28);
    g.fillStyle(0x2e7d32, 1);
    g.fillEllipse(845, groundY - 72, 20, 28);

    // ── Bookshelf (far right) ────────────────────────────────────────────────
    g.fillStyle(0x795548, 1);
    g.fillRect(880, groundY - 130, 70, 130);
    g.lineStyle(1, 0x6d4c41, 1);
    // Shelves
    g.lineBetween(880, groundY - 90, 950, groundY - 90);
    g.lineBetween(880, groundY - 46, 950, groundY - 46);
    // Books
    const bookColors = [0xef5350, 0x42a5f5, 0x66bb6a, 0xffa726, 0xab47bc, 0x26c6da];
    for (let bi = 0; bi < 6; bi++) {
      g.fillStyle(bookColors[bi] ?? 0xffffff, 1);
      g.fillRect(883 + bi * 10, groundY - 88, 8, 36);
    }

    // ── Rug ──────────────────────────────────────────────────────────────────
    g.fillStyle(0xce93d8, 0.7);
    g.fillRect(GAME_WIDTH / 2 - 200, groundY, 400, 12);
    g.lineStyle(3, 0xba68c8, 0.9);
    g.strokeRect(GAME_WIDTH / 2 - 200, groundY, 400, 12);
    // Rug inner pattern
    g.lineStyle(1, 0xf3e5f5, 0.6);
    g.lineBetween(GAME_WIDTH / 2, groundY, GAME_WIDTH / 2, groundY + 12);

    g.destroy();
  }

  // ── Depto de Sofía ──────────────────────────────────────────────────────────
  // Modern apartment: grey-blue walls, large window with city view, bookshelf,
  // a minimalist desk, string lights, and a colourful rug.
  private static _drawDeptoSofia(
    scene: Phaser.Scene,
    groundY: number,
    groundH: number,
  ): void {
    const g = scene.add.graphics();

    // Ambient gradient sky (seen through window)
    g.fillGradientStyle(0x7986cb, 0x7986cb, 0x9fa8da, 0x9fa8da, 1);
    g.fillRect(0, 0, GAME_WIDTH, groundY);

    // ── Back wall (modern grey-blue) ─────────────────────────────────────────
    g.fillStyle(0x9fa8da, 1);
    g.fillRect(0, 50, GAME_WIDTH, groundY - 50);

    // Feature wall – darker accent panel behind fighters
    g.fillStyle(0x7986cb, 0.3);
    g.fillRect(GAME_WIDTH / 2 - 220, 50, 440, groundY - 50);

    // Baseboard
    g.fillStyle(0xe8eaf6, 1);
    g.fillRect(0, groundY - 6, GAME_WIDTH, 6);

    // ── Herringbone wood floor ───────────────────────────────────────────────
    g.fillStyle(0xbcaaa4, 1);
    g.fillRect(0, groundY, GAME_WIDTH, groundH * 3);

    g.lineStyle(1, 0xa1887f, 0.5);
    for (let hx = 0; hx < GAME_WIDTH; hx += 24) {
      g.lineBetween(hx, groundY, hx + 24, groundY + groundH * 3);
    }

    // ── Ceiling with recessed light ──────────────────────────────────────────
    g.fillStyle(0xe8eaf6, 1);
    g.fillRect(0, 0, GAME_WIDTH, 50);
    g.fillStyle(0xc5cae9, 1);
    g.fillRect(0, 46, GAME_WIDTH, 8);

    // Recessed light
    g.fillStyle(0xffffff, 1);
    g.fillCircle(GAME_WIDTH / 2, 30, 18);
    g.fillGradientStyle(0xfff9c4, 0xfff9c4, 0x9fa8da, 0x9fa8da, 0.25);
    g.fillRect(GAME_WIDTH / 2 - 60, 48, 120, 80);

    // ── Large window left ────────────────────────────────────────────────────
    // Window frame
    g.fillStyle(0xe8eaf6, 1);
    g.fillRect(54, 68, 180, 170);
    // Glass – city sky gradient
    g.fillGradientStyle(0x5c6bc0, 0x5c6bc0, 0x81d4fa, 0x81d4fa, 1);
    g.fillRect(62, 76, 164, 154);
    // City silhouette in window
    g.fillStyle(0x1a237e, 0.7);
    g.fillRect(62,  180, 20, 50);
    g.fillRect(90,  170, 16, 60);
    g.fillRect(116, 185, 22, 45);
    g.fillRect(148, 178, 14, 52);
    g.fillRect(170, 188, 18, 42);
    g.fillRect(196, 175, 20, 55);
    g.fillRect(220, 183, 14, 47);
    // Window divider bars
    g.fillStyle(0xe8eaf6, 1);
    g.fillRect(142, 76, 6, 154);
    g.fillRect(62,  148, 164, 6);
    // Window sill
    g.fillStyle(0xf5f5f5, 1);
    g.fillRect(50, 230, 188, 10);

    // Small window plant on sill
    g.fillStyle(0x4caf50, 1);
    g.fillEllipse(110, 218, 18, 22);
    g.fillEllipse(128, 215, 16, 20);
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(112, 225, 12, 12);

    // ── Bookshelf (right) ────────────────────────────────────────────────────
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(762, groundY - 155, 100, 155);
    g.lineStyle(1, 0x5d4037, 1);
    g.strokeRect(762, groundY - 155, 100, 155);
    // Shelves
    g.lineStyle(2, 0x5d4037, 0.8);
    g.lineBetween(762, groundY - 105, 862, groundY - 105);
    g.lineBetween(762, groundY - 55,  862, groundY - 55);
    // Books - top shelf
    const bkClrs1 = [0xef5350, 0x26c6da, 0xffa726, 0x66bb6a, 0xab47bc];
    for (let bi = 0; bi < 5; bi++) {
      const bw = 16 + (bi % 2) * 4;
      g.fillStyle(bkClrs1[bi] ?? 0xffffff, 1);
      g.fillRect(765 + bi * 18, groundY - 103, bw, 46);
    }
    // Books - middle shelf
    const bkClrs2 = [0x42a5f5, 0xec407a, 0xffee58, 0x78909c, 0x26a69a];
    for (let bi = 0; bi < 5; bi++) {
      const bw = 14 + (bi % 3) * 3;
      g.fillStyle(bkClrs2[bi] ?? 0xffffff, 1);
      g.fillRect(765 + bi * 18, groundY - 53, bw, 51);
    }
    // Decorative item on top of shelf
    g.fillStyle(0x80cbc4, 1);
    g.fillRect(840, groundY - 172, 16, 18);
    g.fillStyle(0x4db6ac, 1);
    g.fillCircle(848, groundY - 178, 10);

    // ── Minimalist desk (left of center) ─────────────────────────────────────
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(300, groundY - 48, 180, 12);
    g.fillStyle(0x795548, 1);
    g.fillRect(302, groundY - 36, 8, 36);
    g.fillRect(468, groundY - 36, 8, 36);
    // Laptop on desk
    g.fillStyle(0x9e9e9e, 1);
    g.fillRect(360, groundY - 70, 70, 44);
    g.fillStyle(0x212121, 1);
    g.fillRect(364, groundY - 66, 62, 36);
    g.fillStyle(0x1a237e, 0.6);
    g.fillRect(366, groundY - 64, 58, 32);
    // Keyboard
    g.fillStyle(0xbdbdbd, 1);
    g.fillRect(340, groundY - 48, 80, 8);

    // ── String lights across top ─────────────────────────────────────────────
    g.lineStyle(1, 0xa5d6a7, 0.8);
    // Hanging wire
    for (let sx = 80; sx < GAME_WIDTH - 60; sx += 60) {
      const sag = Math.sin((sx / GAME_WIDTH) * Math.PI) * 8;
      g.lineBetween(sx, 50 + sag, sx + 60, 50 + Math.sin(((sx + 60) / GAME_WIDTH) * Math.PI) * 8);
    }
    // Light bulbs
    const bulbColors = [0xffee58, 0xf48fb1, 0x80cbc4, 0xce93d8, 0xa5d6a7, 0xff8a65];
    for (let bx = 100; bx < GAME_WIDTH - 60; bx += 95) {
      const sag = Math.sin((bx / GAME_WIDTH) * Math.PI) * 8;
      g.fillStyle(bulbColors[Math.floor(bx / 95) % bulbColors.length] ?? 0xffee58, 0.9);
      g.fillCircle(bx, 56 + sag, 5);
    }

    // ── Colourful rug ────────────────────────────────────────────────────────
    g.fillStyle(0xce93d8, 0.75);
    g.fillRect(GAME_WIDTH / 2 - 220, groundY, 440, 14);
    g.lineStyle(3, 0x9c27b0, 1);
    g.strokeRect(GAME_WIDTH / 2 - 220, groundY, 440, 14);
    // Rug inner stripe
    g.fillStyle(0xf3e5f5, 0.6);
    g.fillRect(GAME_WIDTH / 2 - 200, groundY + 4, 400, 6);

    g.destroy();
  }

  // ── Parque ──────────────────────────────────────────────────────────────────
  // Sunny outdoor park: gradient sky, layered trees, benches, a fountain,
  // bushes, flying birds, and a paved path.
  private static _drawParque(
    scene: Phaser.Scene,
    groundY: number,
    groundH: number,
  ): void {
    const g = scene.add.graphics();

    // Sky gradient (horizon light)
    g.fillGradientStyle(0x64b5f6, 0x64b5f6, 0xb3e5fc, 0xb3e5fc, 1);
    g.fillRect(0, 0, GAME_WIDTH, groundY * 0.6);

    g.fillGradientStyle(0xb3e5fc, 0xb3e5fc, 0xc8e6c9, 0xc8e6c9, 1);
    g.fillRect(0, groundY * 0.6, GAME_WIDTH, groundY * 0.4);

    // ── Far background hill ───────────────────────────────────────────────────
    g.fillStyle(0xa5d6a7, 0.6);
    g.fillEllipse(GAME_WIDTH / 2, groundY, GAME_WIDTH * 1.4, 220);

    // ── Grass ground ─────────────────────────────────────────────────────────
    g.fillStyle(0x66bb6a, 1);
    g.fillRect(0, groundY, GAME_WIDTH, groundH * 3);
    // Grass texture lines
    g.lineStyle(1, 0x4caf50, 0.4);
    for (let gx = 0; gx < GAME_WIDTH; gx += 30) {
      const h = 4 + (gx % 3) * 2;
      g.lineBetween(gx, groundY, gx + 4, groundY - h);
      g.lineBetween(gx + 8, groundY, gx + 12, groundY - h + 2);
    }

    // Paved path
    g.fillStyle(0xe0e0e0, 0.5);
    g.fillRect(GAME_WIDTH / 2 - 140, groundY, 280, groundH * 3);
    // Path stones
    g.lineStyle(1, 0xbdbdbd, 0.4);
    for (let ps = 0; ps < groundH * 3; ps += 20) {
      g.lineBetween(GAME_WIDTH / 2 - 140, groundY + ps, GAME_WIDTH / 2 + 140, groundY + ps);
    }

    // ── Clouds ───────────────────────────────────────────────────────────────
    StageRenderer._cloud(g, 200, 50,  120, 42);
    StageRenderer._cloud(g, 420, 30,   90, 32);
    StageRenderer._cloud(g, 680, 60,  100, 36);
    StageRenderer._cloud(g, 830, 35,   70, 26);

    // ── Sun ──────────────────────────────────────────────────────────────────
    g.fillStyle(0xffd54f, 0.9);
    g.fillCircle(880, 55, 36);
    g.fillStyle(0xffca28, 0.5);
    g.fillCircle(880, 55, 48);
    // Sun rays
    g.lineStyle(2, 0xffd54f, 0.6);
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      g.lineBetween(
        880 + Math.cos(rad) * 52, 55 + Math.sin(rad) * 52,
        880 + Math.cos(rad) * 68, 55 + Math.sin(rad) * 68,
      );
    }

    // ── Far background trees ──────────────────────────────────────────────────
    StageRenderer._tree(g, 150,  groundY, 30, 70,  0x2e7d32, 0x388e3c, true);
    StageRenderer._tree(g, 820,  groundY, 30, 70,  0x2e7d32, 0x33691e, true);
    StageRenderer._tree(g, 490,  groundY, 22, 50,  0x388e3c, 0x43a047, true);

    // ── Foreground trees ─────────────────────────────────────────────────────
    StageRenderer._tree(g, 60,   groundY, 36, 110, 0x1b5e20, 0x2e7d32, false);
    StageRenderer._tree(g, 900,  groundY, 36, 110, 0x1b5e20, 0x2e7d32, false);

    // ── Bench (left) ─────────────────────────────────────────────────────────
    // Legs
    g.fillStyle(0x5d4037, 1);
    g.fillRect(170, groundY - 22, 6, 22);
    g.fillRect(220, groundY - 22, 6, 22);
    // Seat slats
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(162, groundY - 30, 72, 6);
    g.fillRect(162, groundY - 24, 72, 6);
    // Backrest
    g.fillRect(162, groundY - 48, 6, 22);
    g.fillRect(224, groundY - 48, 6, 22);
    g.fillRect(162, groundY - 50, 72, 6);
    g.fillRect(162, groundY - 44, 72, 6);

    // ── Bench (right) ────────────────────────────────────────────────────────
    g.fillStyle(0x5d4037, 1);
    g.fillRect(730, groundY - 22, 6, 22);
    g.fillRect(780, groundY - 22, 6, 22);
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(722, groundY - 30, 72, 6);
    g.fillRect(722, groundY - 24, 72, 6);
    g.fillRect(722, groundY - 48, 6, 22);
    g.fillRect(784, groundY - 48, 6, 22);
    g.fillRect(722, groundY - 50, 72, 6);
    g.fillRect(722, groundY - 44, 72, 6);

    // ── Fountain (center) ────────────────────────────────────────────────────
    g.fillStyle(0x90a4ae, 1);
    g.fillRect(GAME_WIDTH / 2 - 38, groundY - 14, 76, 14);
    g.fillStyle(0xb0bec5, 1);
    g.fillCircle(GAME_WIDTH / 2, groundY - 14, 38);
    g.fillStyle(0x80deea, 0.7);
    g.fillCircle(GAME_WIDTH / 2, groundY - 14, 30);
    // Fountain spout
    g.fillStyle(0x546e7a, 1);
    g.fillRect(GAME_WIDTH / 2 - 3, groundY - 42, 6, 28);
    // Water drops
    g.fillStyle(0x80deea, 0.8);
    g.fillEllipse(GAME_WIDTH / 2, groundY - 50, 10, 18);
    g.fillEllipse(GAME_WIDTH / 2 - 16, groundY - 36, 6, 12);
    g.fillEllipse(GAME_WIDTH / 2 + 16, groundY - 36, 6, 12);

    // ── Bushes ────────────────────────────────────────────────────────────────
    g.fillStyle(0x388e3c, 1);
    g.fillEllipse(330, groundY, 55, 36);
    g.fillEllipse(350, groundY - 8, 40, 28);
    g.fillEllipse(315, groundY - 4, 36, 26);

    g.fillStyle(0x43a047, 1);
    g.fillEllipse(630, groundY, 55, 36);
    g.fillEllipse(610, groundY - 8, 40, 28);
    g.fillEllipse(648, groundY - 4, 36, 26);

    // ── Birds (simple V shapes) ───────────────────────────────────────────────
    g.lineStyle(2, 0x212121, 0.7);
    StageRenderer._bird(g, 310, 80);
    StageRenderer._bird(g, 330, 72);
    StageRenderer._bird(g, 550, 55);
    StageRenderer._bird(g, 570, 65);
    StageRenderer._bird(g, 590, 58);

    g.destroy();
  }

  // ─── Shared drawing primitives ─────────────────────────────────────────────

  /** Decorative picture / diploma frame. */
  private static _frame(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    innerColor: number,
    frameColor: number,
  ): void {
    g.fillStyle(frameColor, 1);
    g.fillRect(x - w / 2 - 4, y - 4, w + 8, h + 8);
    g.fillStyle(innerColor, 1);
    g.fillRect(x - w / 2, y, w, h);
  }

  /** Simple rectangle window with glass and cross bars. */
  private static _window(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    w: number,
    h: number,
    skyColor: number,
  ): void {
    g.fillStyle(0xffffff, 1);
    g.fillRect(cx - w / 2 - 5, cy - 5, w + 10, h + 10);
    g.fillStyle(skyColor, 1);
    g.fillRect(cx - w / 2, cy, w, h);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(cx - 2, cy, 4, h);
    g.fillRect(cx - w / 2, cy + h / 2 - 2, w, 4);
  }

  /** Leafy park tree. darkColor = trunk+inner canopy, lightColor = outer canopy. */
  private static _tree(
    g: Phaser.GameObjects.Graphics,
    x: number,
    baseY: number,
    trunkW: number,
    trunkH: number,
    darkColor: number,
    lightColor: number,
    small: boolean,
  ): void {
    const scale = small ? 0.65 : 1;
    const tw = trunkW * scale;
    const th = trunkH * scale;
    const canopyR = (tw * 2.2) * (small ? 0.9 : 1);

    // Trunk
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x - tw / 2, baseY - th, tw, th);

    // Canopy layers
    g.fillStyle(darkColor, 1);
    g.fillCircle(x, baseY - th - canopyR * 0.6, canopyR);
    g.fillStyle(lightColor, 1);
    g.fillCircle(x - canopyR * 0.45, baseY - th - canopyR * 0.5, canopyR * 0.75);
    g.fillCircle(x + canopyR * 0.45, baseY - th - canopyR * 0.5, canopyR * 0.75);
    g.fillCircle(x, baseY - th - canopyR * 1.1, canopyR * 0.7);
  }

  /** Fluffy cloud ellipses. */
  private static _cloud(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    w: number,
    h: number,
  ): void {
    g.fillStyle(0xffffff, 0.88);
    g.fillEllipse(cx, cy, w, h);
    g.fillEllipse(cx - w * 0.28, cy + h * 0.1, w * 0.65, h * 0.8);
    g.fillEllipse(cx + w * 0.28, cy + h * 0.1, w * 0.65, h * 0.8);
    g.fillEllipse(cx, cy - h * 0.18, w * 0.6, h * 0.65);
  }

  /** Simple V-shape flying bird. */
  private static _bird(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
  ): void {
    g.lineBetween(x - 8, y, x, y + 4);
    g.lineBetween(x, y + 4, x + 8, y);
  }
}
