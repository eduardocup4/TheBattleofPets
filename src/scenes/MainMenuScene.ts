/**
 * MainMenuScene – game entry point for the player.
 *
 * Step 1 placeholder: shows title + a "START" button that navigates
 * directly to CharacterSelectScene.
 */

import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Background gradient placeholder
    this.add.rectangle(cx, cy, width, height, 0x1a0030);

    // Title
    this.add
      .text(cx, cy - 120, 'THE BATTLE OF PETS', {
        fontSize: '36px',
        color: '#ffdd00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 70, 'v0.1 – Step 1 Scaffold', {
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Start button
    const btn = this.add
      .text(cx, cy + 40, '[ INICIAR ]', {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#440099',
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setStyle({ color: '#ffdd00' }));
    btn.on('pointerout',   () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown',  () => this.scene.start('CharacterSelectScene'));

    // Keyboard shortcut (desktop dev convenience)
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('CharacterSelectScene');
    });

    // Subtle pulse on title
    this.tweens.add({
      targets: btn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
