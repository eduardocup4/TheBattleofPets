/**
 * FightScene – the main battle arena.
 *
 * Responsibilities:
 *   • Render the stage (procedural background + physics ground).
 *   • Instantiate both fighters via FighterFactory.
 *   • Manage physics groups (ground, hurtboxes, hitboxes, projectiles).
 *   • Wire Arcade overlap callbacks for hit detection.
 *   • Drive InputManagers and call fighter.update() each frame.
 *   • Push HUD data to the Phaser registry and launch HUDScene in parallel.
 *   • Track a 99-second round timer; call VictoryScene on KO or time-out.
 */

import Phaser from 'phaser';
import { FightInitData } from '@/types/scene.types';
import { FighterContext, HitData } from '@/types/fighter.types';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/game.config';
import { SoundManager }    from '@/managers/SoundManager';
import { InputManager }    from '@/managers/InputManager';
import { PetFighter }      from '@/fighters/PetFighter';
import { createFighter }   from '@/fighters/FighterFactory';
import { StageRenderer }   from '@/rendering/StageRenderer';

const GROUND_H  = 24;
const GROUND_Y  = GAME_HEIGHT - 70;   // top of the ground platform
const FIGHTER_Y = GROUND_Y - 1;       // spawn Y (body bottom touches ground)

// ─── Scene ────────────────────────────────────────────────────────────────────

export class FightScene extends Phaser.Scene {
  private fightData!: FightInitData;
  private soundManager!: SoundManager;

  // Physics groups
  private groundGroup!:    Phaser.Physics.Arcade.StaticGroup;
  private hurtboxGroup!:   Phaser.Physics.Arcade.Group;
  private hitboxGroup!:    Phaser.Physics.Arcade.Group;
  private projectileGroup!: Phaser.Physics.Arcade.Group;

  // Fighters
  private fighter1!: PetFighter;
  private fighter2!: PetFighter;

  // Input
  private input1!: InputManager;
  private input2!: InputManager;

  // Round timer (seconds)
  private timeLeft = 99;
  private roundTimer!: Phaser.Time.TimerEvent;

  // Prevent double-victory
  private _roundOver = false;

  constructor() {
    super({ key: 'FightScene' });
  }

  init(data: FightInitData): void {
    this.fightData  = data;
    this._roundOver = false;
    this.timeLeft   = 99;
  }

  create(): void {
    const { player1, player2, stage } = this.fightData;

    // ── 1. Render stage ───────────────────────────────────────────────────────
    this._renderStage(stage);

    // ── 2. Physics groups ─────────────────────────────────────────────────────
    this.groundGroup     = this.physics.add.staticGroup();
    this.hurtboxGroup    = this.physics.add.group();
    this.hitboxGroup     = this.physics.add.group();
    this.projectileGroup = this.physics.add.group();

    // Ground platform physics body
    const groundImg = this.add.rectangle(
      GAME_WIDTH / 2, GROUND_Y + GROUND_H / 2,
      GAME_WIDTH, GROUND_H,
      0x00000000, 0,       // invisible – visual already drawn in _renderStage
    );
    this.physics.add.existing(groundImg, true);
    this.groundGroup.add(groundImg);

    // Expose projectileGroup via scene.data so fighters' Assist methods can reach it
    this.data.set('projectileGroup', this.projectileGroup);

    // ── 3. Fighters ───────────────────────────────────────────────────────────
    const ctx: FighterContext = {
      hitboxGroup:    this.hitboxGroup,
      hurtboxGroup:   this.hurtboxGroup,
      projectileGroup: this.projectileGroup,
    };

    this.fighter1 = createFighter(this, player1, 200,  FIGHTER_Y, ctx);
    this.fighter2 = createFighter(this, player2, 760,  FIGHTER_Y, ctx);

    // Flip P2 to face left initially
    this.fighter2.facingDir = -1;

    // Link opponents
    this.fighter1.setOpponent(this.fighter2);
    this.fighter2.setOpponent(this.fighter1);

    // Ground collision
    this.physics.add.collider(this.fighter1, this.groundGroup);
    this.physics.add.collider(this.fighter2, this.groundGroup);

    // Fighters push each other
    this.physics.add.collider(this.fighter1, this.fighter2);

    // ── 4. Hit detection overlaps ─────────────────────────────────────────────
    this.physics.add.overlap(
      this.hitboxGroup,
      this.hurtboxGroup,
      this._onHitboxOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    this.physics.add.overlap(
      this.projectileGroup,
      this.hurtboxGroup,
      this._onProjectileOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // ── 5. Input Managers ─────────────────────────────────────────────────────
    const isMobile = !this.sys.game.device.os.desktop;
    this.input1 = new InputManager(this, 1, isMobile); // virtual controls on mobile
    this.input2 = new InputManager(this, 2, false);     // P2 always keyboard

    // ── 6. Round timer ────────────────────────────────────────────────────────
    this.roundTimer = this.time.addEvent({
      delay: 1000,
      repeat: 98,
      callback: () => {
        this.timeLeft = Math.max(0, this.timeLeft - 1);
        if (this.timeLeft <= 0 && !this._roundOver) {
          this._endRound();
        }
      },
    });

    // ── 7. Launch HUD in parallel ─────────────────────────────────────────────
    this.scene.launch('HUDScene');
    this._pushRegistry();

    // ── 8. Sound ──────────────────────────────────────────────────────────────
    this.soundManager = new SoundManager(this);
    this.soundManager.playBgm(stage);

    // ESC → menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this._cleanup();
      this.scene.start('MainMenuScene');
    });

    console.info('[FightScene] ready –', { player1, player2, stage });
  }

  override update(_time: number, delta: number): void {
    if (this._roundOver) return;

    // Poll input
    const in1 = this.input1.poll();
    const in2 = this.input2.poll();

    // Update fighters
    this.fighter1.update(in1, delta);
    this.fighter2.update(in2, delta);

    // Keep opponentX for Bebi ultimate targeting
    this._syncOpponentX();

    // Check win condition (a fighter just died)
    if (!this._roundOver) {
      if (this.fighter1.fighterState === 'Dead') { this._endRound(); return; }
      if (this.fighter2.fighterState === 'Dead') { this._endRound(); return; }
    }

    // Push HUD data
    this._pushRegistry();
  }

  // ─── Stage rendering ──────────────────────────────────────────────────────

  private _renderStage(stage: import('@/types/scene.types').StageId): void {
    StageRenderer.render(this, stage, GROUND_Y, GROUND_H);
  }

  // ─── Hit detection callbacks ──────────────────────────────────────────────

  private _onHitboxOverlap(
    hitboxObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    hurtboxObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    const hitbox  = hitboxObj  as Phaser.Physics.Arcade.Image;
    const hurtbox = hurtboxObj as Phaser.Physics.Arcade.Image;

    const owner  = hitbox.getData('owner')  as PetFighter | undefined;
    const target = hurtbox.getData('owner') as PetFighter | undefined;

    if (!owner || !target || owner === target) return;
    if (target.iFrames || target.fighterState === 'Dead') return;

    // Prevent the same hitbox hitting twice
    const usedOn = hitbox.getData('usedOn') as Set<PetFighter>;
    if (usedOn.has(target)) return;
    usedOn.add(target);

    const hitData = hitbox.getData('hitData') as HitData | undefined;
    if (!hitData) return;

    target.applyHit(hitData, owner.x);

    // Destroy single-use melee hitboxes immediately
    hitbox.destroy();
  }

  private _onProjectileOverlap(
    projObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    hurtboxObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    const proj    = projObj    as Phaser.Physics.Arcade.Image;
    const hurtbox = hurtboxObj as Phaser.Physics.Arcade.Image;

    const owner  = proj.getData('owner')    as PetFighter | undefined;
    const target = hurtbox.getData('owner') as PetFighter | undefined;

    if (!owner || !target || owner === target) return;
    if (target.iFrames || target.fighterState === 'Dead') return;

    // Check if it's a snowman (absorb-one-hit shield)
    if (proj.getData('isSnowman') === true) {
      const onHit = proj.getData('onHit') as (() => void) | undefined;
      onHit?.();
      return; // snowman absorbs the hit, target takes no damage
    }

    const usedOn = proj.getData('usedOn') as Set<PetFighter>;
    if (usedOn.has(target)) return;
    usedOn.add(target);

    const hitData = proj.getData('hitData') as HitData | undefined;
    if (!hitData) return;

    target.applyHit(hitData, owner.x);

    // Projectiles are destroyed on contact (unless they're walls / multi-hit)
    if (!proj.getData('multiHit')) {
      proj.destroy();
    }
  }

  // ─── Misc helpers ─────────────────────────────────────────────────────────

  private _syncOpponentX(): void {
    // Bebi's ultimate needs the live opponent X (use scene's own data manager)
    this.data.set('opponentOf_BEBI', this.fighter2.x);
  }

  private _pushRegistry(): void {
    this.registry.set('p1', {
      hp: this.fighter1.hp,
      maxHp: this.fighter1.stats.maxHp,
      mp: this.fighter1.mp,
      maxMp: this.fighter1.stats.maxMp,
      name: this.fighter1.characterName,
      state: this.fighter1.fighterState,
    });
    this.registry.set('p2', {
      hp: this.fighter2.hp,
      maxHp: this.fighter2.stats.maxHp,
      mp: this.fighter2.mp,
      maxMp: this.fighter2.stats.maxMp,
      name: this.fighter2.characterName,
      state: this.fighter2.fighterState,
    });
    this.registry.set('timer', this.timeLeft);
  }

  private _endRound(): void {
    if (this._roundOver) return;
    this._roundOver = true;
    this.roundTimer.destroy();

    // Determine winner (by HP percentage, or time-out uses same logic)
    const f1Wins = this.fighter1.hp >= this.fighter2.hp;
    const winner = f1Wins ? this.fighter1 : this.fighter2;

    winner.setFighterState('Victory');

    this.soundManager.stopBgm();

    this.time.delayedCall(1200, () => {
      this.scene.start('VictoryScene', {
        winner: winner.characterName,
        quote: winner.getVictoryQuote(),
        initData: this.fightData,
      });
    });
  }

  private _cleanup(): void {
    this.roundTimer?.destroy();
    this.soundManager?.stopBgm();
    this.scene.stop('HUDScene');
    this.input1?.destroy();
    this.input2?.destroy();
  }

  // Stop HUD + clean up when leaving this scene (called by Phaser's shutdown event)
  shutdown(): void {
    this._cleanup();
  }
}
