/**
 * PreloadScene – loads all assets before any game logic runs.
 *
 * Step 3: loads the 4 character sprite sheets (when present in /public/assets/characters/)
 * and registers all Phaser animations from ANIM_DEFS.
 * If a sheet file is missing the loader silently continues; fighters fall
 * back to their procedural placeholder textures.
 */

import Phaser from 'phaser';
import { SHEETS, ANIM_DEFS } from '@/config/animations';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this._createLoadingBar();
    this._loadSheets();

    // ── Audio stubs (wired in the audio step) ────────────────────────────────
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
    this._registerAnims();
    this.scene.start('MainMenuScene');
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private _loadSheets(): void {
    // Suppress Phaser loader errors for missing files – fighters degrade gracefully.
    this.load.on('loaderror', (_file: Phaser.Loader.File) => {
      console.warn('[PreloadScene] Asset not found (graceful fallback):', _file.src);
    });

    for (const cfg of Object.values(SHEETS)) {
      this.load.spritesheet(cfg.key, cfg.path, {
        frameWidth:  cfg.frameWidth,
        frameHeight: cfg.frameHeight,
      });
    }
  }

  private _registerAnims(): void {
    for (const def of ANIM_DEFS) {
      // Skip if the sheet wasn't loaded (texture won't exist)
      if (!this.textures.exists(def.sheetKey)) continue;
      // Skip if the animation key was already registered (hot-reload guard)
      if (this.anims.exists(def.key)) continue;

      this.anims.create({
        key:       def.key,
        frames:    this.anims.generateFrameNumbers(def.sheetKey, {
          start: def.startFrame,
          end:   def.endFrame,
        }),
        frameRate: def.frameRate,
        repeat:    def.repeat,
      });
    }

    const registeredCount = ANIM_DEFS.filter(d => this.anims.exists(d.key)).length;
    console.info(`[PreloadScene] Registered ${registeredCount} animations.`);
  }

  private _createLoadingBar(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    const barWidth  = width * 0.6;
    const barHeight = 24;

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
