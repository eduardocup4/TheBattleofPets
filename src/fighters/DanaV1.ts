/**
 * DANA V1 – Brawler / Fuego
 *
 * Sheet: dana_v1_sheet.png  (frameW=190, frameH=175)
 *   Row 1 (0-4)  : idle
 *   Row 2 (5-12) : walk
 *   Row 3 (13-21): fire-breath attack
 *   Row 4 (22-27): flight special
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { GAME_WIDTH, GAME_HEIGHT, STATE_DURATIONS } from '@/config/game.config';
import { SHEETS } from '@/config/animations';
import { PetFighter } from './PetFighter';

const SHEET    = SHEETS['DANA_V1']!;
const FALLBACK = 'ph_danav1';

const STATS: FighterStats = {
  maxHp:            1200,
  maxMp:            100,
  walkSpeed:        180,
  jumpVelocity:    -850,
  gravity:          2000,
  placeholderColor: 0xc8a070,
  width:            72,
  height:           118,
  animPrefix:       'dana_v1',
};

export class DanaV1 extends PetFighter {
  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(scene, FALLBACK, STATS.placeholderColor, STATS.width, STATS.height);
    super(scene, x, y, STATS, SHEET.key, FALLBACK, SHEET.displayHeight, ctx);
  }

  get characterName(): string { return 'DANA V1'; }
  getVictoryQuote(): string   { return 'El fuego es mi especialidad'; }

  // ── Attack: frontal fire hitbox ────────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = { damage: 120, knockbackX: 320, knockbackY: -100, isFireElement: true };
    this.spawnHitbox(62, 0, 90, 80, hitData, 280);
    this._fireFx(62, 0, 80, 70);
  }

  // ── Special [C]: Flight → rise to Y≈0, I-Frames 2 s ──────────────────────
  doSpecial(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-1400);
    this.setIFrames(STATE_DURATIONS.iFrames);
    this.scene.time.delayedCall(STATE_DURATIONS.iFrames, () => {
      if (this.fighterState !== 'Dead') this.setFighterState('Jump');
    });
  }

  // ── Ultimate [D]: Full-screen AoE ─────────────────────────────────────────
  doUltimate(): void {
    const hitData: HitData = {
      damage: 280, knockbackX: 500, knockbackY: -300, isFireElement: true,
    };
    const aoe = this.spawnHitbox(0, 0, GAME_WIDTH, GAME_HEIGHT, hitData, 600);
    aoe.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    const flash = this.scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff4400, 0.45)
      .setDepth(50);
    this.scene.tweens.add({
      targets: flash, alpha: 0, duration: 600,
      onComplete: () => flash.destroy(),
    });
  }

  // ── Assist [E]: Ally dog crosses screen on X axis ─────────────────────────
  doAssist(): void {
    const hitData: HitData = { damage: 90, knockbackX: 250, isFireElement: true };
    const startX = this.facingDir === 1 ? -60 : GAME_WIDTH + 60;
    const endX   = this.facingDir === 1 ? GAME_WIDTH + 60 : -60;

    PetFighter.ensureColorTexture(this.scene, 'ally_dog', 0x8b4513, 50, 36);
    const dog = this.scene.physics.add.image(startX, this.y, 'ally_dog');
    (dog.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    dog.setData('hitData', hitData);
    dog.setData('owner', this);
    dog.setData('usedOn', new Set<PetFighter>());
    this._addToProjectileGroup(dog);

    this.scene.tweens.add({
      targets: dog, x: endX, duration: 1200, ease: 'Linear',
      onComplete: () => dog.destroy(),
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _fireFx(ox: number, oy: number, w: number, h: number): void {
    const fx = this.scene.add
      .rectangle(this.x + ox * this.facingDir, this.y + oy, w, h, 0xff6600, 0.7)
      .setDepth(30);
    this.scene.tweens.add({
      targets: fx, alpha: 0, scaleX: 1.6, scaleY: 1.6, duration: 280,
      onComplete: () => fx.destroy(),
    });
  }

  private _addToProjectileGroup(obj: Phaser.Physics.Arcade.Image): void {
    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(obj);
  }
}
