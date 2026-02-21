/**
 * main.ts – Phaser 3 game bootstrap.
 *
 * Responsibilities:
 * - Configure the Phaser.Game instance (renderer, physics, scale).
 * - Register all scenes in the correct order.
 * - Prevent context menu on right-click / long-press (mobile).
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS_FPS } from '@/config/game.config';
import { PreloadScene }         from '@/scenes/PreloadScene';
import { MainMenuScene }        from '@/scenes/MainMenuScene';
import { CharacterSelectScene } from '@/scenes/CharacterSelectScene';
import { FightScene }           from '@/scenes/FightScene';

// ─── Prevent native context menu (long-press on mobile) ─────────────────────
window.addEventListener('contextmenu', (e) => e.preventDefault());

// ─── Phaser Game Config ──────────────────────────────────────────────────────
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,          // WebGL with Canvas fallback
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000000',

  scale: {
    mode: Phaser.Scale.FIT,           // Letterbox/pillarbox to fit any screen
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },       // Per-fighter gravity set on bodies
      fps: PHYSICS_FPS,
      debug: import.meta.env.DEV,     // Show hitboxes in development
    },
  },

  input: {
    activePointers: 4,                // Support multi-touch (joystick + buttons)
  },

  audio: {
    disableWebAudio: false,
  },

  scene: [
    PreloadScene,
    MainMenuScene,
    CharacterSelectScene,
    FightScene,
  ],
};

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const game = new Phaser.Game(config);

// Expose globally for debugging in browser console during development
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>)['__BATTLE_OF_PETS__'] = game;
}
