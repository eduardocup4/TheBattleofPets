/**
 * VirtualJoystick – on-screen left-thumb stick for mobile play.
 *
 * Renders a base ring + movable knob in the bottom-left corner.
 * Returns normalised axisX / axisY (-1 to +1) each frame.
 * Handles multi-touch: only reacts to the pointer that first pressed inside the base.
 */

import Phaser from 'phaser';

const BASE_RADIUS  = 60;
const KNOB_RADIUS  = 28;
const BASE_ALPHA   = 0.35;
const KNOB_ALPHA   = 0.65;
const BASE_PADDING = 80;   // distance from left/bottom screen edge

export class VirtualJoystick {
  private readonly scene: Phaser.Scene;

  private base!: Phaser.GameObjects.Arc;
  private knob!: Phaser.GameObjects.Arc;

  private _axisX = 0;
  private _axisY = 0;

  private _pointerId: number | null = null;
  private _originX    = 0;
  private _originY    = 0;

  get axisX(): number { return this._axisX; }
  get axisY(): number { return this._axisY; }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this._build();
  }

  private _build(): void {
    const { width, height } = this.scene.scale;
    const cx = BASE_PADDING + BASE_RADIUS;
    const cy = height - BASE_PADDING - BASE_RADIUS;

    // Base ring
    this.base = this.scene.add
      .circle(cx, cy, BASE_RADIUS, 0xffffff, BASE_ALPHA)
      .setDepth(100)
      .setScrollFactor(0)
      .setStrokeStyle(3, 0xffffff, 0.6);

    // Knob
    this.knob = this.scene.add
      .circle(cx, cy, KNOB_RADIUS, 0xffffff, KNOB_ALPHA)
      .setDepth(101)
      .setScrollFactor(0);

    // Touch zone: full left half of screen
    const zone = this.scene.add
      .zone(0, 0, width / 2, height)
      .setOrigin(0, 0)
      .setDepth(99)
      .setScrollFactor(0)
      .setInteractive();

    zone.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this._pointerId !== null) return; // already tracking a pointer
      this._pointerId = ptr.id;
      this._originX = ptr.x;
      this._originY = ptr.y;
      // Re-centre base around the touch start
      this.base.setPosition(ptr.x, ptr.y);
      this.knob.setPosition(ptr.x, ptr.y);
    });

    zone.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (ptr.id !== this._pointerId) return;
      this._updateAxis(ptr.x, ptr.y);
    });

    zone.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      if (ptr.id !== this._pointerId) return;
      this._release();
    });

    zone.on('pointerout', (ptr: Phaser.Input.Pointer) => {
      if (ptr.id !== this._pointerId) return;
      this._release();
    });
  }

  private _updateAxis(px: number, py: number): void {
    const dx = px - this.base.x;
    const dy = py - this.base.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, BASE_RADIUS);
    const angle = Math.atan2(dy, dx);

    const kx = this.base.x + Math.cos(angle) * clamped;
    const ky = this.base.y + Math.sin(angle) * clamped;
    this.knob.setPosition(kx, ky);

    this._axisX = +(dx / BASE_RADIUS).toFixed(3);
    this._axisY = +(dy / BASE_RADIUS).toFixed(3);

    // Clamp to [-1, 1]
    this._axisX = Phaser.Math.Clamp(this._axisX, -1, 1);
    this._axisY = Phaser.Math.Clamp(this._axisY, -1, 1);
  }

  private _release(): void {
    this._pointerId = null;
    this._axisX = 0;
    this._axisY = 0;
    // Return knob to centre
    this.scene.tweens.add({
      targets: this.knob,
      x: this.base.x,
      y: this.base.y,
      duration: 80,
    });
  }

  destroy(): void {
    this.base.destroy();
    this.knob.destroy();
  }
}
