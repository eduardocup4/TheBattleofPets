/**
 * DANA V1 – Brawler / Fuego
 *
 * Profile : Slow movement, powerful damage.
 * Attack  : Large frontal fire hitbox.
 * Special : Flight (rises to Y=0, gains I-Frames for 2s).
 * Ultimate: Massive AoE covering the entire screen.
 * Assist  : A dog ally crosses the screen on the X axis.
 * Victory : "El fuego es mi especialidad"
 */

import Phaser from 'phaser';
import { FighterStats, FighterContext, HitData } from '@/types/fighter.types';
import { GAME_WIDTH, GAME_HEIGHT, STATE_DURATIONS } from '@/config/game.config';
import { PetFighter } from './PetFighter';

const TEXTURE_KEY = 'fighter_danav1';

const STATS: FighterStats = {
  maxHp:       1200,
  maxMp:       100,
  walkSpeed:   180,   // Slow
  jumpVelocity: -850,
  gravity:     2000,
  placeholderColor: 0xc8a070, // light brown
  width:  80,
  height: 120,
};

export class DanaV1 extends PetFighter {
  constructor(scene: Phaser.Scene, x: number, y: number, ctx: FighterContext) {
    PetFighter.createFighterTexture(scene, TEXTURE_KEY, STATS.placeholderColor, STATS.width, STATS.height);
    super(scene, x, y, STATS, TEXTURE_KEY, ctx);
  }

  get characterName(): string { return 'DANA V1'; }
  getVictoryQuote(): string   { return 'El fuego es mi especialidad'; }

  // ── Attack: frontal fire hitbox ────────────────────────────────────────────
  doAttack(): void {
    const hitData: HitData = {
      damage:     120,
      knockbackX: 320,
      knockbackY: -100,
      isFireElement: true,
    };
    this.spawnHitbox(60, 0, 90, 80, hitData, 280);
    this._emitFireParticle();
  }

  // ── Special [C]: Flight — rise to near Y=0, I-Frames for 2 s ──────────────
  doSpecial(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Launch upward
    body.setVelocityY(-1400);
    this.setIFrames(STATE_DURATIONS.iFrames);

    // After I-Frames, gentle fall back
    this.scene.time.delayedCall(STATE_DURATIONS.iFrames, () => {
      if (this.fighterState !== 'Dead') this.setFighterState('Jump');
    });
  }

  // ── Ultimate [D]: Full-screen AoE fire ────────────────────────────────────
  doUltimate(): void {
    const hitData: HitData = {
      damage:     280,
      knockbackX: 500,
      knockbackY: -300,
      isFireElement: true,
    };
    // One massive hitbox covering the whole screen
    const aoe = this.spawnHitbox(0, 0, GAME_WIDTH, GAME_HEIGHT, hitData, 600);
    // Re-centre the AoE on the stage, not on the fighter
    aoe.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Visual flash
    const flash = this.scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0xff4400, 0.45,
    );
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      onComplete: () => flash.destroy(),
    });
  }

  // ── Assist [E]: Ally dog crosses screen on X axis ─────────────────────────
  doAssist(): void {
    const hitData: HitData = {
      damage:     90,
      knockbackX: 250,
      isFireElement: true,
    };
    const startX = this.facingDir === 1 ? -60 : GAME_WIDTH + 60;
    const targetX = this.facingDir === 1 ? GAME_WIDTH + 60 : -60;
    const y = this.y;

    // Placeholder dog ally as a brown rectangle
    PetFighter.ensureColorTexture(this.scene, 'ally_dog', 0x8b4513, 50, 36);
    const dog = this.scene.physics.add.image(startX, y, 'ally_dog');
    (dog.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    dog.setData('hitData', hitData);
    dog.setData('owner', this);
    dog.setData('usedOn', new Set<PetFighter>());

    // Register in the projectile group (FightScene stores it via scene.data)
    this._addToProjectileGroup(dog);

    // Move the dog across via tween
    this.scene.tweens.add({
      targets: dog,
      x: targetX,
      duration: 1200,
      ease: 'Linear',
      onComplete: () => dog.destroy(),
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _emitFireParticle(): void {
    // Simple orange rectangle flash in front of fighter
    const fx = this.scene.add.rectangle(
      this.x + 60 * this.facingDir, this.y,
      80, 70, 0xff6600, 0.7,
    );
    this.scene.tweens.add({
      targets: fx,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.6,
      duration: 280,
      onComplete: () => fx.destroy(),
    });
  }

  private _addToProjectileGroup(obj: Phaser.Physics.Arcade.Image): void {
    // Access via scene data key set by FightScene
    const pg = this.scene.data.get('projectileGroup') as Phaser.Physics.Arcade.Group | undefined;
    if (pg) pg.add(obj);
  }
}
