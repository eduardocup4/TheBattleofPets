/**
 * PreloadScene – loads all assets before any game logic runs.
 *
 * Step 1: only a loading bar is shown (no real assets yet).
 * Assets are loaded by key; the rest of the engine references those keys.
 */

import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingBar();

    // ── Audio stubs (will be replaced with real files in later steps) ─────────
    // Uncomment and add real paths when audio assets are available:
    // this.load.audio('bgm_veterinaria',  'assets/audio/bgm/veterinaria.ogg');
    // this.load.audio('bgm_casa_abuelos', 'assets/audio/bgm/casa_abuelos.ogg');
    // this.load.audio('bgm_depto_sofia',  'assets/audio/bgm/depto_sofia.ogg');
    // this.load.audio('bgm_parque',       'assets/audio/bgm/parque.ogg');
    // this.load.audio('sfx_fire',         'assets/audio/sfx/fire.ogg');
    // this.load.audio('sfx_ice',          'assets/audio/sfx/ice.ogg');
    // this.load.audio('sfx_hit',          'assets/audio/sfx/hit.ogg');
    // this.load.audio('sfx_guard',        'assets/audio/sfx/guard.ogg');
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private createLoadingBar(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    const barWidth  = width * 0.6;
    const barHeight = 24;

    // Title
    this.add
      .text(cx, cy - 60, 'THE BATTLE OF PETS', {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Track
    this.add
      .rectangle(cx, cy, barWidth, barHeight)
      .setStrokeStyle(2, 0xffffff)
      .setFillStyle(0x222222);

    // Fill
    const fill = this.add
      .rectangle(cx - barWidth / 2, cy, 0, barHeight - 4, 0xff6600)
      .setOrigin(0, 0.5);

    // Progress text
    const progressText = this.add
      .text(cx, cy + 30, '0%', { fontSize: '16px', color: '#cccccc' })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      fill.width = (barWidth - 4) * value;
      progressText.setText(`${Math.round(value * 100)}%`);
    });
  }
}
