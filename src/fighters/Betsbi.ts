/**
 * BETSBI – Zoner / Nieve
 *
 * Profile : Medium speed, keeps opponent at range with projectiles.
 * Attack  : Fast snowball projectile on X.
 * Special : Large slow Avalanche projectile.
 * Ultimate: 3 consecutive avalanches.
 * Assist  : Static snowman that absorbs 1 frontal hit.
 * Victory : "Vamos a enfriar el lugar"
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { PetFighter } from './PetFighter';

const TEXTURE_KEY = 'fighter_betsbi';

const STATS: FighterStats = {
  maxHp:       1000,
  maxMp:       100,
  walkSpeed:   250,
  jumpVelocity: -900,
  gravity:     2000,
  placeholderColor: 0x90e890, // white-green
  width:  75,
  height: 115,
};

export class Betsbi extends PetFighter {
  /** Reference to the active snowman assist so we can track it */
  private _snowman: Phaser.Physics.Arcade.Image | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(scene, TEXTURE_KEY, STATS.placeholderColor, STATS.width, STATS.height);
    super(scene, x, y, STATS, TEXTURE_KEY, ctx);
  }

  get characterName(): string { return 'BETSBI'; }
  getVictoryQuote(): string   { return 'Vamos a enfriar el lugar'; }

  // ── Attack: fast snowball ─────────────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = {
      damage:     70,
      knockbackX: 200,
      isIceElement: true,
    };
    this.spawnProjectile(620, 0, 24, 24, 0xddeeff, hitData);
    this._flashIce(50, 0, 24, 24);
  }

  // ── Special [C]: Large slow Avalanche projectile ───────────────────────────
  doSpecial(): void {
    const hitData: HitData = {
      damage:     130,
      knockbackX: 350,
      knockbackY: -200,
      isIceElement: true,
    };
    this.spawnProjectile(260, 0, 60, 55, 0xaaddff, hitData);
    this._flashIce(60, 0, 60, 55);
  }

  // ── Ultimate [D]: 3 consecutive avalanches ────────────────────────────────
  doUltimate(): void {
    const fire = (delay: number): void => {
      this.scene.time.delayedCall(delay, () => {
        if (this.fighterState === 'Dead') return;
        const hitData: HitData = {
          damage:     130,
          knockbackX: 350,
          knockbackY: -200,
          isIceElement: true,
        };
        this.spawnProjectile(260, 0, 60, 55, 0xaaddff, hitData);
        this._flashIce(60, 0, 60, 55);
      });
    };
    fire(0);
    fire(380);
    fire(760);
  }

  // ── Assist [E]: Static snowman absorbs 1 frontal hit ─────────────────────
  doAssist(): void {
    // Only one snowman at a time
    if (this._snowman && this._snowman.active) return;

    PetFighter.ensureColorTexture(this.scene, 'snowman', 0xffffff, 40, 70);

    // Place snowman in front of the fighter
    const sx = this.x + 80 * this.facingDir;
    const snowman = this.scene.physics.add.image(sx, this.y, 'snowman');
    (snowman.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    snowman.setDisplaySize(40, 70);
    snowman.setTint(0xccddff);
    this._snowman = snowman;

    // Add a black hat decoration
    const hat = this.scene.add.rectangle(sx, snowman.y - 38, 36, 18, 0x111111);
    hat.setData('snowmanRef', snowman);

    // The snowman absorbs exactly 1 hit then explodes
    snowman.setData('hitsLeft', 1);
    snowman.setData('hat', hat);
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

    // Auto-expire after 8s
    this.scene.time.delayedCall(8000, () => {
      if (snowman.active) {
        hat.destroy();
        snowman.destroy();
        this._snowman = null;
      }
    });

    // Register as a special assist object (FightScene will check overlap)
    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(snowman);
    // We mark it differently so FightScene can treat it as a shield
    snowman.setData('isSnowman', true);
    snowman.setData('owner', this);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _flashIce(ox: number, oy: number, w: number, h: number): void {
    const fx = this.scene.add.rectangle(
      this.x + ox * this.facingDir, this.y + oy,
      w, h, 0xaaddff, 0.8,
    );
    this.scene.tweens.add({
      targets: fx,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 220,
      onComplete: () => fx.destroy(),
    });
  }

  private _burstSnow(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const flake = this.scene.add.rectangle(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-20, 20),
        8, 8, 0xddeeff, 0.9,
      );
      this.scene.tweens.add({
        targets: flake,
        y: flake.y - Phaser.Math.Between(30, 60),
        alpha: 0,
        duration: 400,
        onComplete: () => flake.destroy(),
      });
    }
  }
}
