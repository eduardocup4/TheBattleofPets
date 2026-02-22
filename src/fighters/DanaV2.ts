/**
 * DANA V2 – Speed / Combo
 *
 * Profile : Fast movement, low damage per hit.
 * Attack  : Fast close-range hitbox.
 * Special : Anti-air Shoryuken (fire, travels on Y axis).
 * Ultimate: Auto 4-hit combo ending with an explosive stomp.
 * Assist  : Fast horizontal fire projectile.
 * Victory : "Ahora vamos al mundo perruno a dormir"
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { PetFighter } from './PetFighter';

const TEXTURE_KEY = 'fighter_danav2';

const STATS: FighterStats = {
  maxHp:       900,
  maxMp:       100,
  walkSpeed:   340,   // Fast
  jumpVelocity: -1000,
  gravity:     2200,  // Falls faster
  placeholderColor: 0x5a3010, // dark brown
  width:  70,
  height: 110,
};

export class DanaV2 extends PetFighter {
  private _comboStep = 0;
  private _comboTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(
      scene, TEXTURE_KEY,
      STATS.placeholderColor, STATS.width, STATS.height,
      true, // bandana
    );
    super(scene, x, y, STATS, TEXTURE_KEY, ctx);
  }

  get characterName(): string { return 'DANA V2'; }
  getVictoryQuote(): string   { return 'Ahora vamos al mundo perruno a dormir'; }

  // ── Attack: fast close-range hit ──────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = {
      damage:     55,
      knockbackX: 180,
      isFireElement: true,
    };
    this.spawnHitbox(50, 0, 60, 60, hitData, 160);
    this._flashFire(50, 0, 55, 55);
  }

  // ── Special [C]: Anti-air Shoryuken (travels up) ──────────────────────────
  doSpecial(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-1100);
    body.setVelocityX(200 * this.facingDir);

    // Hit during ascent
    const hitData: HitData = {
      damage:     140,
      knockbackX: 200,
      knockbackY: -500,
      isFireElement: true,
    };
    this.spawnHitbox(40, -30, 55, 100, hitData, 450);
    this._flashFire(40, -30, 50, 90);
  }

  // ── Ultimate [D]: 4-hit combo → stomp ────────────────────────────────────
  doUltimate(): void {
    this._comboStep = 0;
    this._runNextComboHit();
  }

  private _runNextComboHit(): void {
    if (this._comboStep >= 4) {
      // Final stomp
      this._stomp();
      return;
    }

    const hitData: HitData = {
      damage:     60,
      knockbackX: 80,
      isFireElement: true,
    };
    this.spawnHitbox(50, 0, 55, 55, hitData, 160);
    this._flashFire(50, 0, 50, 50);

    this._comboStep++;
    this._comboTimer = this.scene.time.delayedCall(240, () => {
      if (this.fighterState !== 'Dead') this._runNextComboHit();
    });
  }

  private _stomp(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-600); // mini jump up
    this.scene.time.delayedCall(300, () => {
      body.setVelocityY(1600); // slam down
      const hitData: HitData = {
        damage:     180,
        knockbackX: 400,
        knockbackY: -350,
        isFireElement: true,
      };
      this.spawnHitbox(0, 50, 90, 80, hitData, 300);

      // Explosion visual
      const ex = this.scene.add.rectangle(this.x, this.y + 50, 100, 80, 0xff4400, 0.8);
      this.scene.tweens.add({
        targets: ex,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: 350,
        onComplete: () => ex.destroy(),
      });
    });
  }

  // ── Assist [E]: Fast fire projectile ─────────────────────────────────────
  doAssist(): void {
    const hitData: HitData = {
      damage:     75,
      knockbackX: 220,
      isFireElement: true,
    };
    this.spawnProjectile(680, 0, 30, 20, 0xff6600, hitData);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _flashFire(ox: number, oy: number, w: number, h: number): void {
    const fx = this.scene.add.rectangle(
      this.x + ox * this.facingDir, this.y + oy,
      w, h, 0xff6600, 0.75,
    );
    this.scene.tweens.add({
      targets: fx,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 200,
      onComplete: () => fx.destroy(),
    });
  }

  override destroy(fromScene?: boolean): void {
    this._comboTimer?.destroy();
    super.destroy(fromScene);
  }
}
