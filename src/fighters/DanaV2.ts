/**
 * DANA V2 – Speed / Combo
 *
 * Sheet: dana_v2_sheet.png  (frameW=220, frameH=180)
 *   Row 1 (0-2)  : idle
 *   Row 2 (3-8)  : attack + shoryuken
 *   Row 3 (9-14) : walk, fire, jump
 *   Row 4 (15-18): landing
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { SHEETS } from '@/config/animations';
import { PetFighter } from './PetFighter';

const SHEET    = SHEETS['DANA_V2']!;
const FALLBACK = 'ph_danav2';

const STATS: FighterStats = {
  maxHp:            900,
  maxMp:            100,
  walkSpeed:        340,
  jumpVelocity:    -1000,
  gravity:          2200,
  placeholderColor: 0x5a3010,
  width:            66,
  height:           110,
  animPrefix:       'dana_v2',
};

export class DanaV2 extends PetFighter {
  private _comboStep = 0;
  private _comboTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(
      scene, FALLBACK, STATS.placeholderColor, STATS.width, STATS.height, true,
    );
    super(scene, x, y, STATS, SHEET.key, FALLBACK, SHEET.displayHeight, ctx);
  }

  get characterName(): string { return 'DANA V2'; }
  getVictoryQuote(): string   { return 'Ahora vamos al mundo perruno a dormir'; }

  // ── Attack ────────────────────────────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = { damage: 55, knockbackX: 180, isFireElement: true };
    this.spawnHitbox(50, 0, 60, 60, hitData, 160);
    this._fireFx(50, 0, 55, 55);
  }

  // ── Special [C]: Anti-air Shoryuken ───────────────────────────────────────
  doSpecial(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-1100);
    body.setVelocityX(200 * this.facingDir);
    const hitData: HitData = {
      damage: 140, knockbackX: 200, knockbackY: -500, isFireElement: true,
    };
    this.spawnHitbox(40, -30, 55, 100, hitData, 450);
    this._fireFx(40, -30, 50, 90);
  }

  // ── Ultimate [D]: 4-hit combo → stomp ────────────────────────────────────
  doUltimate(): void {
    this._comboStep = 0;
    this._runNextComboHit();
  }

  private _runNextComboHit(): void {
    if (this._comboStep >= 4) { this._stomp(); return; }
    const hitData: HitData = { damage: 60, knockbackX: 80, isFireElement: true };
    this.spawnHitbox(50, 0, 55, 55, hitData, 160);
    this._fireFx(50, 0, 50, 50);
    this._comboStep++;
    this._comboTimer = this.scene.time.delayedCall(240, () => {
      if (this.fighterState !== 'Dead') this._runNextComboHit();
    });
  }

  private _stomp(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-600);
    this.scene.time.delayedCall(300, () => {
      body.setVelocityY(1600);
      const hitData: HitData = {
        damage: 180, knockbackX: 400, knockbackY: -350, isFireElement: true,
      };
      this.spawnHitbox(0, 50, 90, 80, hitData, 300);
      const ex = this.scene.add
        .rectangle(this.x, this.y + 50, 100, 80, 0xff4400, 0.8)
        .setDepth(30);
      this.scene.tweens.add({
        targets: ex, alpha: 0, scaleX: 2, scaleY: 2, duration: 350,
        onComplete: () => ex.destroy(),
      });
    });
  }

  // ── Assist [E]: Fast fire projectile ─────────────────────────────────────
  doAssist(): void {
    const hitData: HitData = { damage: 75, knockbackX: 220, isFireElement: true };
    this.spawnProjectile(680, 0, 30, 20, 0xff6600, hitData);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private _fireFx(ox: number, oy: number, w: number, h: number): void {
    const fx = this.scene.add
      .rectangle(this.x + ox * this.facingDir, this.y + oy, w, h, 0xff6600, 0.75)
      .setDepth(30);
    this.scene.tweens.add({
      targets: fx, alpha: 0, scaleX: 1.4, scaleY: 1.4, duration: 200,
      onComplete: () => fx.destroy(),
    });
  }

  override destroy(fromScene?: boolean): void {
    this._comboTimer?.destroy();
    super.destroy(fromScene);
  }
}
