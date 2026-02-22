/**
 * BEBI – Trapper / Hielo
 *
 * Profile : Medium speed, crowd-control focus.
 * Attack  : Ice projectile.
 * Special : CC projectile — on hit, inflicts Stun (frozen) for 1.5 s.
 * Ultimate: Giant iceberg falls from Y:0 at the opponent's current X.
 * Assist  : Ice wall that pushes opponent away.
 * Victory : "Ya se me congelan las patas"
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { GAME_HEIGHT, STATE_DURATIONS } from '@/config/game.config';
import { PetFighter } from './PetFighter';

const TEXTURE_KEY = 'fighter_bebi';

const STATS: FighterStats = {
  maxHp:       1000,
  maxMp:       100,
  walkSpeed:   250,
  jumpVelocity: -900,
  gravity:     2000,
  placeholderColor: 0x90d0ff, // white-light blue
  width:  75,
  height: 115,
};

export class Bebi extends PetFighter {
  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(scene, TEXTURE_KEY, STATS.placeholderColor, STATS.width, STATS.height);
    super(scene, x, y, STATS, TEXTURE_KEY, ctx);
  }

  get characterName(): string { return 'BEBI'; }
  getVictoryQuote(): string   { return 'Ya se me congelan las patas'; }

  // ── Attack: ice projectile ────────────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = {
      damage:     65,
      knockbackX: 190,
      isIceElement: true,
    };
    this.spawnProjectile(580, 0, 22, 22, 0x99ccff, hitData);
    this._flashIce(50, 0, 22, 22);
  }

  // ── Special [C]: CC projectile → Stun 1.5 s on hit ────────────────────────
  doSpecial(): void {
    const hitData: HitData = {
      damage:       50,
      knockbackX:   100,
      stunDuration: STATE_DURATIONS.stun, // 1500 ms
      isIceElement: true,
    };
    this.spawnProjectile(400, 0, 35, 35, 0x55aaff, hitData);
    this._flashIce(55, 0, 35, 35);
  }

  // ── Ultimate [D]: Iceberg falls at opponent's X position ──────────────────
  doUltimate(): void {
    // Aim at opponent's current X; fallback to in front of self
    const targetX =
      this.scene.data.get('opponentOf_' + this.characterName) ??
      this.x + 200 * this.facingDir;

    this._dropIceberg(typeof targetX === 'number' ? targetX : this.x + 200 * this.facingDir);
  }

  /** Called by FightScene to pass the real opponent X each frame. */
  setOpponentX(opponentX: number): void {
    this.scene.data.set('opponentOf_' + this.characterName, opponentX);
  }

  // ── Assist [E]: Ice wall that pushes ─────────────────────────────────────
  doAssist(): void {
    const wallX = this.x + 60 * this.facingDir;

    PetFighter.ensureColorTexture(this.scene, 'ice_wall', 0x99ddff, 30, 130);
    const wall = this.scene.physics.add.image(wallX, this.y, 'ice_wall');
    wall.setDisplaySize(30, 130);
    const wb = wall.body as Phaser.Physics.Arcade.Body;
    wb.setAllowGravity(false);
    wb.setVelocityX(350 * this.facingDir); // slide forward and push

    const hitData: HitData = {
      damage:     40,
      knockbackX: 450,
      isIceElement: true,
    };
    wall.setData('hitData', hitData);
    wall.setData('owner', this);
    wall.setData('usedOn', new Set<PetFighter>());

    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(wall);

    this.scene.time.delayedCall(1000, () => {
      if (wall.active) {
        this.scene.tweens.add({
          targets: wall,
          alpha: 0,
          duration: 300,
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

    const hitData: HitData = {
      damage:       250,
      knockbackX:   300,
      knockbackY:   -400,
      stunDuration: 800,
      isIceElement: true,
    };
    iceberg.setData('hitData', hitData);
    iceberg.setData('owner', this);
    iceberg.setData('usedOn', new Set<PetFighter>());

    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(iceberg);

    // Visual warning shadow on the ground
    const shadow = this.scene.add.rectangle(targetX, GAME_HEIGHT - 90, 80, 10, 0x0055aa, 0.5);

    // Destroy when it hits the ground
    this.scene.time.delayedCall(3000, () => {
      if (iceberg.active) iceberg.destroy();
      shadow.destroy();
    });

    // Check if it has gone below screen
    const checkInterval = this.scene.time.addEvent({
      delay: 50,
      repeat: 60,
      callback: () => {
        if (!iceberg.active) {
          shadow.destroy();
          checkInterval.destroy();
          return;
        }
        if (iceberg.y > GAME_HEIGHT - 80) {
          this._shatterIce(iceberg.x, iceberg.y);
          iceberg.destroy();
          shadow.destroy();
          checkInterval.destroy();
        }
      },
    });
  }

  private _shatterIce(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const shard = this.scene.add.rectangle(
        x + Phaser.Math.Between(-40, 40),
        y + Phaser.Math.Between(-20, 0),
        Phaser.Math.Between(10, 25),
        Phaser.Math.Between(10, 25),
        0x99ccff, 0.9,
      );
      this.scene.tweens.add({
        targets: shard,
        y: shard.y - Phaser.Math.Between(20, 60),
        x: shard.x + Phaser.Math.Between(-40, 40),
        alpha: 0,
        angle: Phaser.Math.Between(-180, 180),
        duration: 500,
        onComplete: () => shard.destroy(),
      });
    }
  }

  private _flashIce(ox: number, oy: number, w: number, h: number): void {
    const fx = this.scene.add.rectangle(
      this.x + ox * this.facingDir, this.y + oy,
      w, h, 0x99ccff, 0.8,
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
}
