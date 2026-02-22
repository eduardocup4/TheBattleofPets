/**
 * HUDScene – overlay that renders HP bars, MP bars, names, and the round timer.
 *
 * Launched in parallel with FightScene via scene.launch().
 * Reads live data from the Phaser registry (set by FightScene each frame):
 *
 *   registry key 'p1' / 'p2' → { hp, maxHp, mp, maxMp, name, state }
 *   registry key 'timer'     → number (seconds remaining)
 */

import Phaser from 'phaser';

// ─── Registry payload shape ────────────────────────────────────────────────────

interface FighterHudData {
  hp:    number;
  maxHp: number;
  mp:    number;
  maxMp: number;
  name:  string;
  state: string;
}

// ─── Bar dimensions ────────────────────────────────────────────────────────────

const BAR_W   = 340;
const BAR_H   = 22;
const MP_H    = 10;
const PAD     = 14;
const BAR_Y   = 18;
const MP_Y    = BAR_Y + BAR_H + 4;

export class HUDScene extends Phaser.Scene {
  // ── P1 elements ──────────────────────────────────────────────────────────
  private p1HpFill!: Phaser.GameObjects.Rectangle;
  private p1MpFill!: Phaser.GameObjects.Rectangle;
  private p1NameText!: Phaser.GameObjects.Text;

  // ── P2 elements ──────────────────────────────────────────────────────────
  private p2HpFill!: Phaser.GameObjects.Rectangle;
  private p2MpFill!: Phaser.GameObjects.Rectangle;
  private p2NameText!: Phaser.GameObjects.Text;

  // ── Timer ─────────────────────────────────────────────────────────────────
  private timerText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    const { width } = this.scale;

    // ── P1 (left side) ───────────────────────────────────────────────────────
    this._buildBar(PAD, BAR_Y, BAR_W, BAR_H, 0x333333, (fill) => { this.p1HpFill = fill; }, 0x44dd44, 'left');
    this._buildBar(PAD, MP_Y,  BAR_W, MP_H,  0x222222, (fill) => { this.p1MpFill = fill; }, 0x4488ff, 'left');

    this.p1NameText = this.add
      .text(PAD, BAR_Y + BAR_H + MP_H + 8, 'P1', {
        fontSize: '13px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setDepth(10)
      .setScrollFactor(0);

    // ── P2 (right side, bars right-aligned and fill from right) ──────────────
    const p2X = width - PAD - BAR_W;
    this._buildBar(p2X, BAR_Y, BAR_W, BAR_H, 0x333333, (fill) => { this.p2HpFill = fill; }, 0xdd4444, 'right');
    this._buildBar(p2X, MP_Y,  BAR_W, MP_H,  0x222222, (fill) => { this.p2MpFill = fill; }, 0x4488ff, 'right');

    this.p2NameText = this.add
      .text(width - PAD, BAR_Y + BAR_H + MP_H + 8, 'P2', {
        fontSize: '13px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setDepth(10)
      .setScrollFactor(0);

    // ── Timer ────────────────────────────────────────────────────────────────
    this.timerText = this.add
      .text(width / 2, BAR_Y + BAR_H / 2, '99', {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setScrollFactor(0);
  }

  override update(): void {
    const p1 = this.registry.get('p1') as FighterHudData | undefined;
    const p2 = this.registry.get('p2') as FighterHudData | undefined;
    const timer = this.registry.get('timer') as number | undefined;

    if (p1) {
      this._setBarFill(this.p1HpFill, BAR_W, p1.hp / p1.maxHp, 'left');
      this._setBarFill(this.p1MpFill, BAR_W, p1.mp / p1.maxMp, 'left');
      this.p1NameText.setText(p1.name);
    }

    if (p2) {
      this._setBarFill(this.p2HpFill, BAR_W, p2.hp / p2.maxHp, 'right');
      this._setBarFill(this.p2MpFill, BAR_W, p2.mp / p2.maxMp, 'right');
      this.p2NameText.setText(p2.name);
    }

    if (timer !== undefined) {
      const secs = Math.ceil(timer);
      this.timerText.setText(String(secs));
      this.timerText.setStyle({
        color: secs <= 10 ? '#ff4444' : '#ffffff',
      });
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _buildBar(
    x: number,
    y: number,
    w: number,
    h: number,
    bgColor: number,
    onFill: (fill: Phaser.GameObjects.Rectangle) => void,
    fillColor: number,
    side: 'left' | 'right',
  ): void {
    // Background track
    this.add
      .rectangle(x + w / 2, y + h / 2, w, h, bgColor)
      .setDepth(8)
      .setScrollFactor(0);

    // Fill (starts at full width)
    const fillX = side === 'left' ? x : x + w;
    const fill = this.add
      .rectangle(fillX, y + h / 2, w, h, fillColor)
      .setOrigin(side === 'left' ? 0 : 1, 0.5)
      .setDepth(9)
      .setScrollFactor(0);

    onFill(fill);

    // Border
    this.add
      .rectangle(x + w / 2, y + h / 2, w, h)
      .setStrokeStyle(1, 0xffffff, 0.4)
      .setFillStyle()
      .setDepth(10)
      .setScrollFactor(0);
  }

  private _setBarFill(
    bar: Phaser.GameObjects.Rectangle,
    maxWidth: number,
    pct: number,
    _side: 'left' | 'right',
  ): void {
    bar.width = Math.max(0, maxWidth * Phaser.Math.Clamp(pct, 0, 1));
  }
}
