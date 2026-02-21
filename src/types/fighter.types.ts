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
  stunDuration?: number;  // ms; if set → triggers Stun state
  knockbackX?: number;
  knockbackY?: number;
  isFireElement?: boolean;
  isIceElement?: boolean;
}

// ─── Hitbox / Hurtbox rects (relative to fighter origin) ────────────────────

export interface BoxDef {
  x: number;
  y: number;
  width: number;
  height: number;
}
