/**
 * PetFighter – abstract base class for all fighters.
 *
 * Naming note: Phaser.GameObjects.Sprite already owns `state` (string|number)
 * and `setState(value)`. To avoid the collision our FSM uses:
 *   • fighterState  (getter)  → FighterState enum value
 *   • setFighterState(s)      → FSM transition
 *
 * Sprite system:
 *   When the character's sprite sheet is loaded, PetFighter plays Phaser
 *   animations keyed as `{stats.animPrefix}_{FighterState}` (e.g. 'dana_v1_Idle').
 *   If no sheet is found the fallback placeholder coloured rectangle is used.
 */

import Phaser from 'phaser';
import {
  FighterState,
  InputState,
  HitData,
  FighterStats,
  FighterContext,
} from '@/types/fighter.types';
import { GUARD_DAMAGE_MULTIPLIER, MP_COST, STATE_DURATIONS } from '@/config/game.config';

function arcadeBody(
  obj: { body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null },
): Phaser.Physics.Arcade.Body {
  return obj.body as Phaser.Physics.Arcade.Body;
}

export abstract class PetFighter extends Phaser.Physics.Arcade.Sprite {
  // ─── Stats & live values ──────────────────────────────────────────────────
  readonly stats: FighterStats;
  hp: number;
  mp: number;

  // ─── FSM ──────────────────────────────────────────────────────────────────
  private _fighterState: FighterState = 'Idle';
  private _stateTimer: Phaser.Time.TimerEvent | null = null;

  // ─── Combat ───────────────────────────────────────────────────────────────
  readonly hurtbox: Phaser.Physics.Arcade.Image;
  private _iFrames = false;

  // ─── Physics groups ───────────────────────────────────────────────────────
  private readonly _hitboxGroup: Phaser.Physics.Arcade.Group;
  private readonly _projectileGroup: Phaser.Physics.Arcade.Group;

  // ─── Opponent ─────────────────────────────────────────────────────────────
  private _opponent: PetFighter | null = null;

  // ─── Facing: 1 = right, −1 = left ────────────────────────────────────────
  facingDir: 1 | -1 = 1;

  // ─── Sprite sheet available flag ──────────────────────────────────────────
  private readonly _hasSheet: boolean;

  // ─── Last input (for auto-guard check) ───────────────────────────────────
  protected lastInput: InputState = {
    axisX: 0, axisY: 0,
    attack: false, jump: false, special: false, ultimate: false, assist: false,
  };

  // ─── Constructor ──────────────────────────────────────────────────────────

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: FighterStats,
    sheetKey: string,
    fallbackKey: string,
    displayHeight: number,
    ctx: FighterContext,
  ) {
    const hasSheet = scene.textures.exists(sheetKey);
    const texKey   = hasSheet ? sheetKey : fallbackKey;
    super(scene, x, y, texKey);

    this.stats = stats;
    this.hp    = stats.maxHp;
    this.mp    = 0;
    this._hasSheet       = hasSheet;
    this._hitboxGroup    = ctx.hitboxGroup;
    this._projectileGroup = ctx.projectileGroup;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // ── Visual scale so character occupies ~displayHeight pixels on screen ───
    const frameH = this.height || displayHeight;
    this.setScale(displayHeight / frameH);

    // ── Physics body (independent of visual scale) ───────────────────────────
    const body = arcadeBody(this);
    body.setGravityY(stats.gravity);
    body.setCollideWorldBounds(true);
    body.setSize(stats.width, stats.height, true); // true = auto-centre

    // ── Hurtbox ──────────────────────────────────────────────────────────────
    this.hurtbox = scene.physics.add.image(x, y, '__DEFAULT');
    this.hurtbox.setDisplaySize(stats.width * 0.85, stats.height * 0.9);
    arcadeBody(this.hurtbox).setAllowGravity(false);
    this.hurtbox.setAlpha(0);
    this.hurtbox.setData('owner', this);
    ctx.hurtboxGroup.add(this.hurtbox);
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  setOpponent(opponent: PetFighter): void {
    this._opponent = opponent;
  }

  /** The fighter's FSM state (distinct from Phaser.Sprite.state). */
  get fighterState(): FighterState { return this._fighterState; }

  get iFrames(): boolean  { return this._iFrames; }
  get hpPercent(): number { return this.hp / this.stats.maxHp; }
  get mpPercent(): number { return this.mp / this.stats.maxMp; }
  get onGround(): boolean { return arcadeBody(this).blocked.down; }

  // ─── Main update ──────────────────────────────────────────────────────────

  override update(input: InputState, delta: number): void {
    this.lastInput = input;
    this._updateFacing();
    this._processInput(input);
    this._syncHurtbox();
    this._regenMp(delta);
  }

  // ─── FSM ──────────────────────────────────────────────────────────────────

  setFighterState(newState: FighterState): void {
    if (
      this._fighterState === 'Dead' ||
      this._fighterState === 'Victory'
    ) return;
    if (this._fighterState === newState) return;

    this._onStateExit(this._fighterState);
    this._fighterState = newState;
    this._onStateEnter(newState);
  }

  private _onStateEnter(state: FighterState): void {
    // Play animation if a sheet is present
    this._playAnim(state);

    switch (state) {
      case 'Attack':
        this.doAttack();
        this._scheduleReturn('Idle', 420);
        break;
      case 'Special':
        this.doSpecial();
        this._scheduleReturn('Idle', 650);
        break;
      case 'Ultimate':
        this.doUltimate();
        this._scheduleReturn('Idle', 1100);
        break;
      case 'Assist':
        this.doAssist();
        this._scheduleReturn('Idle', 520);
        break;
      case 'Hurt':
        this._scheduleReturn('Idle', STATE_DURATIONS.hurt);
        break;
      case 'Stun':
        this._scheduleReturn('Idle', STATE_DURATIONS.stun);
        arcadeBody(this).setVelocityX(0);
        break;
      case 'Dead':
        arcadeBody(this).setVelocityX(0);
        if (!this._hasSheet) this.setTint(0x888888);
        break;
      case 'Victory':
        arcadeBody(this).setVelocity(0, 0);
        break;
      default:
        break;
    }
  }

  private _onStateExit(_state: FighterState): void {
    if (this._stateTimer) {
      this._stateTimer.destroy();
      this._stateTimer = null;
    }
  }

  protected _scheduleReturn(to: FighterState, delay: number): void {
    this._stateTimer = this.scene.time.delayedCall(delay, () => {
      if (
        this._fighterState !== 'Dead' &&
        this._fighterState !== 'Victory'
      ) {
        this.setFighterState(to);
      }
    });
  }

  private _canAct(): boolean {
    return (
      this._fighterState === 'Idle' ||
      this._fighterState === 'Walk' ||
      this._fighterState === 'Jump'
    );
  }

  private _canMove(): boolean {
    return (
      this._fighterState === 'Idle' ||
      this._fighterState === 'Walk' ||
      this._fighterState === 'Jump'
    );
  }

  // ─── Animation ────────────────────────────────────────────────────────────

  private _playAnim(state: FighterState): void {
    if (!this._hasSheet || !this.stats.animPrefix) return;
    const key = `${this.stats.animPrefix}_${state}`;
    if (this.anims.exists(key)) {
      this.anims.play(key, true);
    }
  }

  // ─── Input processing ─────────────────────────────────────────────────────

  private _processInput(input: InputState): void {
    if (
      this._fighterState === 'Dead' ||
      this._fighterState === 'Victory'
    ) return;

    const body = arcadeBody(this);

    if (this._canAct()) {
      if (input.ultimate && this.mp >= MP_COST.ultimate) {
        this.mp = Math.max(0, this.mp - MP_COST.ultimate);
        this.setFighterState('Ultimate');
        return;
      }
      if (input.assist && this.mp >= MP_COST.assist) {
        this.mp = Math.max(0, this.mp - MP_COST.assist);
        this.setFighterState('Assist');
        return;
      }
      if (input.special) {
        this.setFighterState('Special');
        return;
      }
      if (input.attack) {
        this.setFighterState('Attack');
        return;
      }
      if (input.jump && this.onGround) {
        this.setFighterState('Jump');
        body.setVelocityY(this.stats.jumpVelocity);
        return;
      }
    }

    if (this._canMove()) {
      if (Math.abs(input.axisX) > 0.1) {
        body.setVelocityX(input.axisX * this.stats.walkSpeed);
        if (this.onGround && this._fighterState !== 'Jump') {
          this.setFighterState('Walk');
        }
      } else {
        body.setVelocityX(0);
        if (this.onGround && this._fighterState === 'Walk') {
          this.setFighterState('Idle');
        }
      }

      if (this.onGround && this._fighterState === 'Jump') {
        this.setFighterState('Idle');
      }
      if (!this.onGround && this._fighterState === 'Walk') {
        this.setFighterState('Jump');
      }
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private _updateFacing(): void {
    if (!this._opponent) return;
    this.facingDir = this.x <= this._opponent.x ? 1 : -1;
    this.setFlipX(this.facingDir === -1);
  }

  private _syncHurtbox(): void {
    this.hurtbox.setPosition(this.x, this.y);
  }

  private _regenMp(delta: number): void {
    if (this.mp < this.stats.maxMp) {
      this.mp = Math.min(this.stats.maxMp, this.mp + (delta / 1000) * 5);
    }
  }

  // ─── Damage reception ────────────────────────────────────────────────────

  applyHit(hitData: HitData, attackerX: number): void {
    if (this._iFrames || this._fighterState === 'Dead') return;

    let damage = hitData.damage;
    const guarding = this._isAutoGuarding(attackerX);
    if (guarding) {
      damage = Math.round(damage * GUARD_DAMAGE_MULTIPLIER);
    }

    this.hp = Math.max(0, this.hp - damage);
    this.mp = Math.min(this.stats.maxMp, this.mp + damage * 0.12);

    const dir = this.x < attackerX ? -1 : 1;
    const body = arcadeBody(this);
    body.setVelocityX((hitData.knockbackX ?? 280) * dir);
    if (hitData.knockbackY !== undefined) {
      body.setVelocityY(hitData.knockbackY);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.setFighterState('Dead');
      return;
    }

    if (hitData.stunDuration !== undefined && !guarding) {
      this._fighterState = 'Idle';
      this.setFighterState('Stun');
      if (this._stateTimer) this._stateTimer.destroy();
      this._stateTimer = this.scene.time.delayedCall(hitData.stunDuration, () => {
        if (this._fighterState !== 'Dead') this.setFighterState('Idle');
      });
    } else if (!guarding) {
      this._fighterState = 'Idle';
      this.setFighterState('Hurt');
    } else {
      this.setFighterState('Guard');
      this._scheduleReturn('Idle', 300);
    }
  }

  private _isAutoGuarding(attackerX: number): boolean {
    const guardAxisX = this.x < attackerX ? -1 : 1;
    return (
      Math.abs(this.lastInput.axisX) > 0.45 &&
      Math.sign(this.lastInput.axisX) === guardAxisX
    );
  }

  // ─── I-Frames ─────────────────────────────────────────────────────────────

  setIFrames(duration: number): void {
    this._iFrames = true;
    this.hurtbox.setActive(false);
    this.setAlpha(0.55);
    this.scene.time.delayedCall(duration, () => {
      this._iFrames = false;
      this.hurtbox.setActive(true);
      this.setAlpha(1);
    });
  }

  // ─── Hitbox / Projectile factories ───────────────────────────────────────

  protected spawnHitbox(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    hitData: HitData,
    duration = 200,
  ): Phaser.Physics.Arcade.Image {
    const x = this.x + offsetX * this.facingDir;
    const y = this.y + offsetY;

    const hb = this.scene.physics.add.image(x, y, '__DEFAULT');
    hb.setDisplaySize(width, height);
    arcadeBody(hb).setAllowGravity(false);
    hb.setAlpha(0);
    hb.setData('hitData', hitData);
    hb.setData('owner', this);
    hb.setData('usedOn', new Set<PetFighter>());
    this._hitboxGroup.add(hb);

    this.scene.time.delayedCall(duration, () => {
      if (hb.active) hb.destroy();
    });

    return hb;
  }

  protected spawnProjectile(
    speedX: number,
    speedY: number,
    width: number,
    height: number,
    color: number,
    hitData: HitData,
  ): Phaser.Physics.Arcade.Image {
    const texKey = `proj_${color.toString(16).padStart(6, '0')}`;
    PetFighter.ensureColorTexture(this.scene, texKey, color, width, height);

    const spawnX = this.x + ((this.stats.width / 2) + width / 2 + 4) * this.facingDir;
    const proj   = this.scene.physics.add.image(spawnX, this.y, texKey);
    proj.setDisplaySize(width, height);
    arcadeBody(proj).setAllowGravity(false);
    arcadeBody(proj).setVelocity(speedX * this.facingDir, speedY);
    proj.setData('hitData', hitData);
    proj.setData('owner', this);
    proj.setData('usedOn', new Set<PetFighter>());
    this._projectileGroup.add(proj);

    this.scene.time.delayedCall(4000, () => {
      if (proj.active) proj.destroy();
    });

    return proj;
  }

  // ─── Texture helpers ──────────────────────────────────────────────────────

  static ensureColorTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    width: number,
    height: number,
  ): void {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, width, height);
    g.generateTexture(key, width, height);
    g.destroy();
  }

  static createFighterTexture(
    scene: Phaser.Scene,
    key: string,
    color: number,
    width: number,
    height: number,
    hasBandana = false,
  ): void {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();

    g.fillStyle(color, 1);
    g.fillRoundedRect(0, 0, width, height, 8);
    g.lineStyle(2, 0x000000, 0.6);
    g.strokeRoundedRect(0, 0, width, height, 8);

    g.fillStyle(0x000000, 0.9);
    g.fillCircle(width * 0.3, height * 0.22, 4);
    g.fillCircle(width * 0.7, height * 0.22, 4);

    g.fillStyle(0x000000, 0.5);
    g.fillCircle(width * 0.5, height * 0.32, 2.5);

    if (hasBandana) {
      g.fillStyle(0x111111, 1);
      g.fillRect(0, height * 0.12, width, height * 0.08);
    }

    g.generateTexture(key, width, height);
    g.destroy();
  }

  // ─── Abstract interface ───────────────────────────────────────────────────

  abstract doAttack(): void;
  abstract doSpecial(): void;
  abstract doUltimate(): void;
  abstract doAssist(): void;
  abstract getVictoryQuote(): string;
  abstract get characterName(): string;
}
