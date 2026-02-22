/**
 * VictoryScene – shown when one fighter's HP reaches 0.
 *
 * Receives { winner: string; quote: string } from FightScene.
 * Displays the winner name, victory quote, and a rematch / menu button.
 */

import Phaser from 'phaser';
import { FightInitData } from '@/types/scene.types';

interface VictoryData {
  winner: string;
  quote: string;
  initData: FightInitData;
}

export class VictoryScene extends Phaser.Scene {
  private initData!: VictoryData;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: VictoryData): void {
    this.initData = data;
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width  / 2;
    const cy = height / 2;

    // Dark overlay
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.72);

    // "KO!" flash
    const ko = this.add
      .text(cx, cy - 110, 'K.O.!', {
        fontSize: '72px',
        color: '#ffdd00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: ko,
      alpha: 1,
      scaleX: { from: 2.5, to: 1 },
      scaleY: { from: 2.5, to: 1 },
      duration: 400,
      ease: 'Back.easeOut',
    });

    // Winner name
    this.add
      .text(cx, cy - 20, `¡${this.initData.winner} GANA!`, {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // Victory quote
    this.add
      .text(cx, cy + 36, `"${this.initData.quote}"`, {
        fontSize: '18px',
        color: '#ffe0aa',
        fontStyle: 'italic',
        stroke: '#000000',
        strokeThickness: 3,
        wordWrap: { width: width * 0.8 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Rematch button
    const rematch = this.add
      .text(cx - 110, cy + 110, '[ REVANCHA ]', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#440099',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    rematch.on('pointerover', () => rematch.setStyle({ color: '#ffdd00' }));
    rematch.on('pointerout',  () => rematch.setStyle({ color: '#ffffff' }));
    rematch.on('pointerdown', () => {
      this.scene.stop('HUDScene');
      this.scene.start('FightScene', this.initData.initData);
    });

    // Menu button
    const menu = this.add
      .text(cx + 110, cy + 110, '[ MENÚ ]', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#660000',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menu.on('pointerover', () => menu.setStyle({ color: '#ffdd00' }));
    menu.on('pointerout',  () => menu.setStyle({ color: '#ffffff' }));
    menu.on('pointerdown', () => {
      this.scene.stop('HUDScene');
      this.scene.start('MainMenuScene');
    });

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.stop('HUDScene');
      this.scene.start('FightScene', this.initData.initData);
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.stop('HUDScene');
      this.scene.start('MainMenuScene');
    });
  }
}
