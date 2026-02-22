/**
 * Shared enums and interfaces used across the fighting engine.
 */

// ─── Finite State Machine ────────────────────────────────────────────────────

export type FighterState =
  | 'Idle'
  | 'Walk'
  | 'Jump'
  | 'Guard'
  | 'Attack'
  | 'Special'
  | 'Ultimate'
  | 'Assist'
  | 'Hurt'
  | 'Stun'
  | 'Victory'
  | 'Dead';

// ─── Input ───────────────────────────────────────────────────────────────────

/**
 * Represents the input state for a single frame.
 * - axisX / axisY : continuous joystick values (-1 to +1)
 * - attack / jump / special / ultimate / assist : EDGE-TRIGGERED – true only
 *   on the frame the button was FIRST pressed (not while held).
 */
export interface InputState {
  /** Normalised joystick X: -1 (left) to +1 (right), 0 = neutral */
  axisX: number;
  /** Normalised joystick Y: -1 (up) to +1 (down), 0 = neutral */
  axisY: number;
  attack: boolean;
  jump: boolean;
  special: boolean;
  ultimate: boolean;
  assist: boolean;
}

// ─── Fighter stats (data-driven per character) ───────────────────────────────

export interface FighterStats {
  maxHp: number;
  maxMp: number;
  walkSpeed: number;
  jumpVelocity: number;
  gravity: number;
  /** Colour used for the placeholder rectangle */
  placeholderColor: number;
  width: number;
  height: number;
}

// ─── Hit data carried by a projectile / hitbox ───────────────────────────────

export interface HitData {
  damage: number;
  /** If set, target transitions to Stun for this many ms */
  stunDuration?: number;
  knockbackX?: number;
  knockbackY?: number;
  isFireElement?: boolean;
  isIceElement?: boolean;
}

// ─── Context passed to every PetFighter at construction ──────────────────────

export interface FighterContext {
  hitboxGroup: Phaser.Physics.Arcade.Group;
  hurtboxGroup: Phaser.Physics.Arcade.Group;
  projectileGroup: Phaser.Physics.Arcade.Group;
}

// ─── Hitbox / Hurtbox rects (relative to fighter origin) ────────────────────

export interface BoxDef {
  x: number;
  y: number;
  width: number;
  height: number;
}
