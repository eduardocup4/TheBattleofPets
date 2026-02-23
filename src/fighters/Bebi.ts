/**
 * BEBI – Trapper / Hielo
 *
 * Sheet: bebi_sheet.png  (frameW=230, frameH=215)
 *   Row 1 (0-3)  : idle
 *   Row 2 (4-8)  : attack / ice shot
 *   Row 3 (9-13) : CC freeze special + prop effects
 *   Row 4 (14-18): iceberg ultimate + burst
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { GAME_HEIGHT, STATE_DURATIONS } from '@/config/game.config';
import { SHEETS } from '@/config/animations';
import { PetFighter } from './PetFighter';

const SHEET    = SHEETS['BEBI']!;
const FALLBACK = 'ph_bebi';

const STATS: FighterStats = {
  maxHp:            1000,
  maxMp:            100,
  walkSpeed:        250,
  jumpVelocity:    -900,
  gravity:          2000,
  placeholderColor: 0x90d0ff,
  width:            70,
  height:           115,
  animPrefix:       'bebi',
};

export class Bebi extends PetFighter {
  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(scene, FALLBACK, STATS.placeholderColor, STATS.width, STATS.height);
    super(scene, x, y, STATS, SHEET.key, FALLBACK, SHEET.displayHeight, ctx);
  }

  get characterName(): string { return 'BEBI'; }
  getVictoryQuote(): string   { return 'Ya se me congelan las patas'; }

  // ── Attack: ice projectile ────────────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = { damage: 65, knockbackX: 190, isIceElement: true };
    this.spawnProjectile(580, 0, 22, 22, 0x99ccff, hitData);
    this._iceFx(50, 0, 22, 22);
  }

  // ── Special [C]: CC projectile → Stun 1.5 s ─────────────────────────────
  doSpecial(): void {
    const hitData: HitData = {
      damage: 50, knockbackX: 100, stunDuration: STATE_DURATIONS.stun, isIceElement: true,
    };
    this.spawnProjectile(400, 0, 35, 35, 0x55aaff, hitData);
    this._iceFx(55, 0, 35, 35);
  }

  // ── Ultimate [D]: Iceberg falls at opponent's X ───────────────────────────
  doUltimate(): void {
    const rawX  = this.scene.data.get('opponentOf_BEBI') as number | undefined;
    const dropX = typeof rawX === 'number' ? rawX : this.x + 200 * this.facingDir;
    this._dropIceberg(dropX);
  }

  // ── Assist [E]: Ice wall that pushes ─────────────────────────────────────
  doAssist(): void {
    const wallX = this.x + 60 * this.facingDir;
    PetFighter.ensureColorTexture(this.scene, 'ice_wall', 0x99ddff, 30, 130);
    const wall = this.scene.physics.add.image(wallX, this.y, 'ice_wall');
    wall.setDisplaySize(30, 130);
    const wb = wall.body as Phaser.Physics.Arcade.Body;
    wb.setAllowGravity(false);
    wb.setVelocityX(350 * this.facingDir);
    wall.setData('hitData', { damage: 40, knockbackX: 450, isIceElement: true } as HitData);
    wall.setData('owner', this);
    wall.setData('usedOn', new Set<PetFighter>());
    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(wall);
    this.scene.time.delayedCall(1000, () => {
      if (wall.active) {
        this.scene.tweens.add({
          targets: wall, alpha: 0, duration: 300,
          onComplete: () => wall.destroy(),
        });
      }
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _dropIceberg(targetX: number): void {
    const iceH = 200;
    PetFighter.ensureColorTexture(this.scene, 'iceberg', 0x55aaff, 80, iceH);
    const iceberg = this.scene.physics.add.image(targetX, -iceH / 2, 'iceberg');
    iceberg.setDisplaySize(80, iceH);
    const ib = iceberg.body as Phaser.Physics.Arcade.Body;
    ib.setAllowGravity(false);
    ib.setVelocityY(900);
    iceberg.setData('hitData', {
      damage: 250, knockbackX: 300, knockbackY: -400, stunDuration: 800, isIceElement: true,
    } as HitData);
    iceberg.setData('owner', this);
    iceberg.setData('usedOn', new Set<PetFighter>());
    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(iceberg);

    const shadow = this.scene.add
      .rectangle(targetX, GAME_HEIGHT - 90, 80, 10, 0x0055aa, 0.5)
      .setDepth(4);

    const check = this.scene.time.addEvent({
      delay: 50, repeat: 60,
      callback: () => {
        if (!iceberg.active) { shadow.destroy(); check.destroy(); return; }
        if (iceberg.y > GAME_HEIGHT - 80) {
          this._shatterIce(iceberg.x, iceberg.y);
          iceberg.destroy(); shadow.destroy(); check.destroy();
        }
      },
    });
    this.scene.time.delayedCall(3000, () => {
      if (iceberg.active) iceberg.destroy();
      if (shadow.active) shadow.destroy();
    });
  }

  private _shatterIce(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const shard = this.scene.add.rectangle(
        x + Phaser.Math.Between(-40, 40), y + Phaser.Math.Between(-20, 0),
        Phaser.Math.Between(10, 25), Phaser.Math.Between(10, 25), 0x99ccff, 0.9,
      ).setDepth(30);
      this.scene.tweens.add({
        targets: shard,
        y: shard.y - Phaser.Math.Between(20, 60),
        x: shard.x + Phaser.Math.Between(-40, 40),
        alpha: 0, angle: Phaser.Math.Between(-180, 180), duration: 500,
        onComplete: () => shard.destroy(),
      });
    }
  }

  private _iceFx(ox: number, oy: number, w: number, h: number): void {
    const fx = this.scene.add
      .rectangle(this.x + ox * this.facingDir, this.y + oy, w, h, 0x99ccff, 0.8)
      .setDepth(30);
    this.scene.tweens.add({
      targets: fx, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 220,
      onComplete: () => fx.destroy(),
    });
  }
}
