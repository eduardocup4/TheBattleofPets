/**
 * FightScene – the main battle arena.
 *
 * Step 1: scaffold only.
 * - Receives FightInitData from CharacterSelectScene.
 * - Shows a placeholder stage backdrop and logs the chosen fighters.
 * - Full fighter instantiation, HUD, and controls come in Step 2.
 */

import Phaser from 'phaser';
import { FightInitData, StageId } from '@/types/scene.types';
import { SoundManager } from '@/managers/SoundManager';

// Placeholder stage colours – will be replaced with real backdrops
const STAGE_COLORS: Record<StageId, number> = {
  VETERINARIA:  0x44aa66,
  CASA_ABUELOS: 0xccaa44,
  DEPTO_SOFIA:  0x4466cc,
  PARQUE:       0x228844,
};

export class FightScene extends Phaser.Scene {
  private soundManager!: SoundManager;
  private initData!: FightInitData;

  constructor() {
    super({ key: 'FightScene' });
  }

  init(data: FightInitData): void {
    this.initData = data;
  }

  create(): void {
    const { width, height } = this.scale;
    const { player1, player2, stage } = this.initData;

    // ── Background ──────────────────────────────────────────────────────────
    this.add.rectangle(width / 2, height / 2, width, height, STAGE_COLORS[stage]);

    // ── Ground line (placeholder) ───────────────────────────────────────────
    const groundY = height - 80;
    this.add.rectangle(width / 2, groundY + 10, width, 20, 0x331100);

    // ── Sound Manager ───────────────────────────────────────────────────────
    this.soundManager = new SoundManager(this);
    this.soundManager.playBgm(stage);   // safe-no-op until audio files exist

    // ── Stage / fighter info (dev overlay) ──────────────────────────────────
    this.add
      .text(width / 2, 20, `${player1}  vs  ${player2}  |  Stage: ${stage}`, {
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, 'Step 1 – Scaffold completo\nFighters + HUD en Step 2', {
        fontSize: '20px',
        color: '#ffff00',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Back to menu shortcut (dev)
    this.input.keyboard?.on('keydown-ESC', () => {
      this.soundManager.stopBgm();
      this.scene.start('MainMenuScene');
    });

    console.info('[FightScene] created –', { player1, player2, stage });
  }
}
