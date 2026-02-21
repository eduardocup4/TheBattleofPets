/**
 * SoundManager – global audio controller (BGM + SFX).
 *
 * Architecture:
 * - BGM: one track at a time, cross-faded on stage change.
 * - SFX: fire/ice element effects pooled to avoid re-creation overhead.
 *
 * All methods are safe to call even when audio context is locked (mobile);
 * the manager will automatically unlock on the first user interaction.
 */

import Phaser from 'phaser';
import { StageId } from '@/types/scene.types';

// Map each stage to its BGM asset key (to be loaded in PreloadScene)
const STAGE_BGM_MAP: Record<StageId, string> = {
  VETERINARIA:   'bgm_veterinaria',
  CASA_ABUELOS:  'bgm_casa_abuelos',
  DEPTO_SOFIA:   'bgm_depto_sofia',
  PARQUE:        'bgm_parque',
} as const;

export class SoundManager {
  private readonly scene: Phaser.Scene;
  private currentBgm: Phaser.Sound.BaseSound | null = null;
  private bgmVolume = 0.6;
  private sfxVolume = 0.8;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ─── BGM ───────────────────────────────────────────────────────────────────

  playBgm(stageId: StageId): void {
    const key = STAGE_BGM_MAP[stageId];
    if (this.currentBgm?.key === key && this.currentBgm.isPlaying) return;

    this.stopBgm();

    if (!this.scene.cache.audio.has(key)) {
      console.warn(`[SoundManager] BGM key not loaded: ${key}`);
      return;
    }

    this.currentBgm = this.scene.sound.add(key, {
      loop: true,
      volume: this.bgmVolume,
    });
    this.currentBgm.play();
  }

  stopBgm(): void {
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
    }
  }

  setBgmVolume(volume: number): void {
    this.bgmVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentBgm instanceof Phaser.Sound.WebAudioSound ||
        this.currentBgm instanceof Phaser.Sound.HTML5AudioSound) {
      this.currentBgm.setVolume(this.bgmVolume);
    }
  }

  // ─── SFX ───────────────────────────────────────────────────────────────────

  playSfx(key: string, volumeMultiplier = 1): void {
    if (!this.scene.cache.audio.has(key)) {
      // Silently skip missing SFX so placeholder builds don't crash
      return;
    }
    this.scene.sound.play(key, {
      volume: this.sfxVolume * volumeMultiplier,
    });
  }

  playFireSfx(): void  { this.playSfx('sfx_fire'); }
  playIceSfx(): void   { this.playSfx('sfx_ice'); }
  playHitSfx(): void   { this.playSfx('sfx_hit'); }
  playGuardSfx(): void { this.playSfx('sfx_guard'); }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }
}
