/**
 * BETSBI – Zoner / Nieve
 *
 * Sheet: betsbi_sheet.png  (frameW=220, frameH=210)
 *   Row 1 (0-4)  : idle
 *   Row 2 (5-9)  : snowball throw / attack
 *   Row 3 (10-12): special animation  (13-14 = prop sprites: snowman, wave)
 *   Row 4 (15-16): victory
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { SHEETS } from '@/config/animations';
import { PetFighter } from './PetFighter';

const SHEET    = SHEETS['BETSBI']!;
const FALLBACK = 'ph_betsbi';

const STATS: FighterStats = {
  maxHp:            1000,
  maxMp:            100,
  walkSpeed:        250,
  jumpVelocity:    -900,
  gravity:          2000,
  placeholderColor: 0x90e890,
  width:            70,
  height:           115,
  animPrefix:       'betsbi',
};

export class Betsbi extends PetFighter {
  private _snowman: Phaser.Physics.Arcade.Image | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(scene, FALLBACK, STATS.placeholderColor, STATS.width, STATS.height);
    super(scene, x, y, STATS, SHEET.key, FALLBACK, SHEET.displayHeight, ctx);
  }

  get characterName(): string { return 'BETSBI'; }
  getVictoryQuote(): string   { return 'Vamos a enfriar el lugar'; }

  // ── Attack: fast snowball ─────────────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = { damage: 70, knockbackX: 200, isIceElement: true };
    this.spawnProjectile(620, 0, 24, 24, 0xddeeff, hitData);
    this._iceFx(50, 0, 24, 24);
  }

  // ── Special [C]: Large slow Avalanche ─────────────────────────────────────
  doSpecial(): void {
    const hitData: HitData = {
      damage: 130, knockbackX: 350, knockbackY: -200, isIceElement: true,
    };
    this.spawnProjectile(260, 0, 60, 55, 0xaaddff, hitData);
    this._iceFx(60, 0, 60, 55);
  }

  // ── Ultimate [D]: 3 consecutive avalanches ────────────────────────────────
  doUltimate(): void {
    const fire = (delay: number): void => {
      this.scene.time.delayedCall(delay, () => {
        if (this.fighterState === 'Dead') return;
        const hitData: HitData = {
          damage: 130, knockbackX: 350, knockbackY: -200, isIceElement: true,
        };
        this.spawnProjectile(260, 0, 60, 55, 0xaaddff, hitData);
        this._iceFx(60, 0, 60, 55);
      });
    };
    fire(0); fire(380); fire(760);
  }

  // ── Assist [E]: Snowman absorbs 1 hit ────────────────────────────────────
  doAssist(): void {
    if (this._snowman?.active) return;

    PetFighter.ensureColorTexture(this.scene, 'snowman', 0xffffff, 40, 70);
    const sx = this.x + 80 * this.facingDir;
    const snowman = this.scene.physics.add.image(sx, this.y, 'snowman');
    snowman.setDisplaySize(40, 70).setTint(0xccddff);
    (snowman.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this._snowman = snowman;

    const hat = this.scene.add.rectangle(sx, snowman.y - 38, 36, 18, 0x111111).setDepth(5);

    snowman.setData('hitsLeft', 1);
    snowman.setData('isSnowman', true);
    snowman.setData('owner', this);
    snowman.setData('onHit', () => {
      const hits = (snowman.getData('hitsLeft') as number) - 1;
      snowman.setData('hitsLeft', hits);
      if (hits <= 0) {
        hat.destroy();
        this._burstSnow(snowman.x, snowman.y);
        snowman.destroy();
        this._snowman = null;
      }
    });

    this.scene.time.delayedCall(8000, () => {
      if (snowman.active) { hat.destroy(); snowman.destroy(); this._snowman = null; }
    });

    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(snowman);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private _iceFx(ox: number, oy: number, w: number, h: number): void {
    const fx = this.scene.add
      .rectangle(this.x + ox * this.facingDir, this.y + oy, w, h, 0xaaddff, 0.8)
      .setDepth(30);
    this.scene.tweens.add({
      targets: fx, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 220,
      onComplete: () => fx.destroy(),
    });
  }

  private _burstSnow(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const flake = this.scene.add.rectangle(
        x + Phaser.Math.Between(-20, 20), y + Phaser.Math.Between(-20, 20),
        8, 8, 0xddeeff, 0.9,
      ).setDepth(30);
      this.scene.tweens.add({
        targets: flake, y: flake.y - Phaser.Math.Between(30, 60), alpha: 0, duration: 400,
        onComplete: () => flake.destroy(),
      });
    }
  }
}
