/**
 * Central game configuration.
 * All magic numbers live here – never scatter them across scenes/fighters.
 */

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/** Frames per second for the Arcade physics simulation */
export const PHYSICS_FPS = 60;

/** Fighter defaults */
export const FIGHTER_DEFAULTS = {
  maxHp: 1000,
  maxMp: 100,
  gravity: 2000,
  jumpVelocity: -900,
  walkSpeed: 260,
} as const;

/** Guard damage multiplier */
export const GUARD_DAMAGE_MULTIPLIER = 0.1;

/** State durations (ms) */
export const STATE_DURATIONS = {
  stun: 1500,
  iFrames: 2000,
  hurt: 400,
} as const;

/** MP costs */
export const MP_COST = {
  special: 0,   // specials are free; MP is spent on Ultimate/Assist
  ultimate: 100,
  assist: 50,
} as const;
