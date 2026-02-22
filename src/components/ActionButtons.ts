/**
 * ActionButtons – on-screen action buttons for mobile.
 *
 * Layout (bottom-right, landscape):
 *
 *     [D]  [E]
 *   [C]  [A]
 *       [B]
 *
 * Each button tracks its own pointer so multi-touch works correctly.
 * Exposes `justDown(btn)` — true only on the first frame a button is pressed —
 * and `isDown(btn)` for held state (used by InputManager).
 */

import Phaser from 'phaser';

export type ButtonId = 'attack' | 'jump' | 'special' | 'ultimate' | 'assist';

interface ButtonDef {
  id: ButtonId;
  label: string;
  color: number;
  /** Offset from the anchor point (bottom-right area) */
  offX: number;
  offY: number;
}

const BTN_RADIUS  = 32;
const BTN_PADDING = 90;  // from right/bottom edge
const SPACING     = 78;  // between button centres

const BUTTON_DEFS: ButtonDef[] = [
  { id: 'attack',   label: 'A', color: 0xdd3333, offX:  0,        offY:  0 },
  { id: 'jump',     label: 'B', color: 0x3355dd, offX:  0,        offY: -SPACING },
  { id: 'special',  label: 'C', color: 0xdd8800, offX: -SPACING,  offY:  0 },
  { id: 'ultimate', label: 'D', color: 0xaa00cc, offX: -SPACING,  offY: -SPACING },
  { id: 'assist',   label: 'E', color: 0x00aa66, offX:  0,        offY: -SPACING * 2 },
];

interface ButtonState {
  down: boolean;
  justDown: boolean;
  pointerId: number | null;
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
}

export class ActionButtons {
  private readonly scene: Phaser.Scene;
  private readonly buttons = new Map<ButtonId, ButtonState>();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this._build();
  }

  private _build(): void {
    const { width, height } = this.scene.scale;
    // Anchor: bottom-right
    const ax = width  - BTN_PADDING;
    const ay = height - BTN_PADDING;

    for (const def of BUTTON_DEFS) {
      const cx = ax + def.offX;
      const cy = ay + def.offY;

      const circle = this.scene.add
        .circle(cx, cy, BTN_RADIUS, def.color, 0.55)
        .setDepth(100)
        .setScrollFactor(0)
        .setStrokeStyle(2, 0xffffff, 0.4)
        .setInteractive();

      const label = this.scene.add
        .text(cx, cy, `[${def.label}]`, {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(101)
        .setScrollFactor(0);

      const state: ButtonState = {
        down: false,
        justDown: false,
        pointerId: null,
        circle,
        label,
      };
      this.buttons.set(def.id, state);

      circle.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        if (state.pointerId !== null) return;
        state.pointerId = ptr.id;
        state.down      = true;
        state.justDown  = true;
        circle.setAlpha(0.9);
      });

      circle.on('pointerup', (ptr: Phaser.Input.Pointer) => {
        if (ptr.id !== state.pointerId) return;
        state.pointerId = null;
        state.down      = false;
        circle.setAlpha(0.55);
      });

      circle.on('pointerout', (ptr: Phaser.Input.Pointer) => {
        if (ptr.id !== state.pointerId) return;
        state.pointerId = null;
        state.down      = false;
        circle.setAlpha(0.55);
      });
    }
  }

  /**
   * Must be called at the END of each frame's input consumption
   * to clear the one-frame justDown flags.
   */
  clearJustDown(): void {
    for (const state of this.buttons.values()) {
      state.justDown = false;
    }
  }

  isDown(id: ButtonId): boolean {
    return this.buttons.get(id)?.down ?? false;
  }

  justDown(id: ButtonId): boolean {
    return this.buttons.get(id)?.justDown ?? false;
  }

  destroy(): void {
    for (const state of this.buttons.values()) {
      state.circle.destroy();
      state.label.destroy();
    }
    this.buttons.clear();
  }
}
