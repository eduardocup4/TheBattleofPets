/**
 * animations.ts – sprite sheet configs and animation frame ranges.
 *
 * HOW TO CALIBRATE:
 *  1. Open your sheet in any image editor that shows pixel coordinates.
 *  2. Measure the width/height of one frame cell.
 *  3. Update frameWidth / frameHeight below.
 *  4. Count frames per animation row → adjust startFrame / endFrame.
 *
 * Frame numbering: Phaser reads left→right, top→bottom, 0-indexed.
 *   frameIndex = row * (imageWidth / frameWidth) + column
 */

// ─── Sheet configs ─────────────────────────────────────────────────────────

export interface SheetConfig {
  /** Phaser texture key (used in load.spritesheet + anims.create) */
  key: string;
  /** Path relative to /public */
  path: string;
  /** Width of one frame cell in pixels – CALIBRATE THIS */
  frameWidth: number;
  /** Height of one frame cell in pixels – CALIBRATE THIS */
  frameHeight: number;
  /** Desired on-screen height in pixels (fighter scales to this) */
  displayHeight: number;
}

export const SHEETS: Record<string, SheetConfig> = {
  DANA_V1: {
    key: 'dana_v1_sheet',
    path: 'assets/characters/dana_v1_sheet.png',
    frameWidth:    190,   // ← CALIBRATE
    frameHeight:   175,   // ← CALIBRATE
    displayHeight: 148,
  },
  DANA_V2: {
    key: 'dana_v2_sheet',
    path: 'assets/characters/dana_v2_sheet.png',
    frameWidth:    220,   // ← CALIBRATE
    frameHeight:   180,   // ← CALIBRATE
    displayHeight: 138,
  },
  BETSBI: {
    key: 'betsbi_sheet',
    path: 'assets/characters/betsbi_sheet.png',
    frameWidth:    220,   // ← CALIBRATE
    frameHeight:   210,   // ← CALIBRATE
    displayHeight: 148,
  },
  BEBI: {
    key: 'bebi_sheet',
    path: 'assets/characters/bebi_sheet.png',
    frameWidth:    230,   // ← CALIBRATE
    frameHeight:   215,   // ← CALIBRATE
    displayHeight: 152,
  },
} as const;

// ─── Animation definitions ─────────────────────────────────────────────────

export interface AnimDef {
  key: string;
  sheetKey: string;
  /** Inclusive start frame index */
  startFrame: number;
  /** Inclusive end frame index */
  endFrame: number;
  frameRate: number;
  /** -1 = loop forever, 0 = play once */
  repeat: number;
}

export const ANIM_DEFS: AnimDef[] = [

  // ── DANA V1 (chihuahua / Brawler) ──────────────────────────────────────
  // Row 1 (0-4)  : idle
  // Row 2 (5-12) : walk
  // Row 3 (13-21): fire-breath attack
  // Row 4 (22-27): flight special
  { key: 'dana_v1_Idle',    sheetKey: 'dana_v1_sheet', startFrame: 0,  endFrame: 4,  frameRate: 6,  repeat: -1 },
  { key: 'dana_v1_Walk',    sheetKey: 'dana_v1_sheet', startFrame: 5,  endFrame: 12, frameRate: 10, repeat: -1 },
  { key: 'dana_v1_Attack',  sheetKey: 'dana_v1_sheet', startFrame: 13, endFrame: 21, frameRate: 14, repeat: 0  },
  { key: 'dana_v1_Special', sheetKey: 'dana_v1_sheet', startFrame: 22, endFrame: 27, frameRate: 10, repeat: -1 },
  { key: 'dana_v1_Jump',    sheetKey: 'dana_v1_sheet', startFrame: 22, endFrame: 22, frameRate: 1,  repeat: 0  },
  { key: 'dana_v1_Hurt',    sheetKey: 'dana_v1_sheet', startFrame: 4,  endFrame: 4,  frameRate: 1,  repeat: 0  },
  { key: 'dana_v1_Stun',    sheetKey: 'dana_v1_sheet', startFrame: 4,  endFrame: 4,  frameRate: 1,  repeat: 0  },
  { key: 'dana_v1_Victory', sheetKey: 'dana_v1_sheet', startFrame: 22, endFrame: 27, frameRate: 6,  repeat: -1 },
  { key: 'dana_v1_Dead',    sheetKey: 'dana_v1_sheet', startFrame: 4,  endFrame: 4,  frameRate: 1,  repeat: 0  },

  // ── DANA V2 (dark dog / Speed-Combo) ───────────────────────────────────
  // Row 1 (0-2)  : idle
  // Row 2 (3-8)  : attack + shoryuken
  // Row 3 (9-14) : walk, fire effect, jump
  // Row 4 (15-18): landing
  { key: 'dana_v2_Idle',    sheetKey: 'dana_v2_sheet', startFrame: 0,  endFrame: 2,  frameRate: 6,  repeat: -1 },
  { key: 'dana_v2_Walk',    sheetKey: 'dana_v2_sheet', startFrame: 9,  endFrame: 11, frameRate: 10, repeat: -1 },
  { key: 'dana_v2_Attack',  sheetKey: 'dana_v2_sheet', startFrame: 3,  endFrame: 6,  frameRate: 16, repeat: 0  },
  { key: 'dana_v2_Special', sheetKey: 'dana_v2_sheet', startFrame: 7,  endFrame: 8,  frameRate: 12, repeat: 0  },
  { key: 'dana_v2_Jump',    sheetKey: 'dana_v2_sheet', startFrame: 14, endFrame: 14, frameRate: 1,  repeat: 0  },
  { key: 'dana_v2_Hurt',    sheetKey: 'dana_v2_sheet', startFrame: 15, endFrame: 15, frameRate: 1,  repeat: 0  },
  { key: 'dana_v2_Stun',    sheetKey: 'dana_v2_sheet', startFrame: 15, endFrame: 15, frameRate: 1,  repeat: 0  },
  { key: 'dana_v2_Victory', sheetKey: 'dana_v2_sheet', startFrame: 0,  endFrame: 2,  frameRate: 5,  repeat: -1 },
  { key: 'dana_v2_Dead',    sheetKey: 'dana_v2_sheet', startFrame: 15, endFrame: 15, frameRate: 1,  repeat: 0  },

  // ── BETSBI (white husky / Zoner-Snow) ──────────────────────────────────
  // Row 1 (0-4)  : idle
  // Row 2 (5-9)  : snowball throw / attack
  // Row 3 (10-12): special animation  |  13-14: prop sprites (snowman, wave)
  // Row 4 (15-16): victory
  { key: 'betsbi_Idle',    sheetKey: 'betsbi_sheet', startFrame: 0,  endFrame: 4,  frameRate: 6,  repeat: -1 },
  { key: 'betsbi_Walk',    sheetKey: 'betsbi_sheet', startFrame: 0,  endFrame: 4,  frameRate: 10, repeat: -1 },
  { key: 'betsbi_Attack',  sheetKey: 'betsbi_sheet', startFrame: 5,  endFrame: 9,  frameRate: 14, repeat: 0  },
  { key: 'betsbi_Special', sheetKey: 'betsbi_sheet', startFrame: 10, endFrame: 12, frameRate: 10, repeat: 0  },
  { key: 'betsbi_Jump',    sheetKey: 'betsbi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },
  { key: 'betsbi_Hurt',    sheetKey: 'betsbi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },
  { key: 'betsbi_Stun',    sheetKey: 'betsbi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },
  { key: 'betsbi_Victory', sheetKey: 'betsbi_sheet', startFrame: 15, endFrame: 16, frameRate: 5,  repeat: -1 },
  { key: 'betsbi_Dead',    sheetKey: 'betsbi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },

  // ── BEBI (white lab / Trapper-Ice) ─────────────────────────────────────
  // Row 1 (0-3)  : idle
  // Row 2 (4-8)  : attack / ice shot
  // Row 3 (9-13) : CC freeze special + effect props
  // Row 4 (14-18): iceberg ultimate + burst
  { key: 'bebi_Idle',     sheetKey: 'bebi_sheet', startFrame: 0,  endFrame: 3,  frameRate: 6,  repeat: -1 },
  { key: 'bebi_Walk',     sheetKey: 'bebi_sheet', startFrame: 0,  endFrame: 3,  frameRate: 10, repeat: -1 },
  { key: 'bebi_Attack',   sheetKey: 'bebi_sheet', startFrame: 4,  endFrame: 8,  frameRate: 14, repeat: 0  },
  { key: 'bebi_Special',  sheetKey: 'bebi_sheet', startFrame: 9,  endFrame: 10, frameRate: 10, repeat: 0  },
  { key: 'bebi_Ultimate', sheetKey: 'bebi_sheet', startFrame: 14, endFrame: 18, frameRate: 12, repeat: 0  },
  { key: 'bebi_Jump',     sheetKey: 'bebi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },
  { key: 'bebi_Hurt',     sheetKey: 'bebi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },
  { key: 'bebi_Stun',     sheetKey: 'bebi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },
  { key: 'bebi_Victory',  sheetKey: 'bebi_sheet', startFrame: 0,  endFrame: 3,  frameRate: 5,  repeat: -1 },
  { key: 'bebi_Dead',     sheetKey: 'bebi_sheet', startFrame: 0,  endFrame: 0,  frameRate: 1,  repeat: 0  },
];
