/**
 * InputManager – unified input source for one player.
 *
 * Supports two modes (auto-detected / configurable):
 *   • VIRTUAL  – VirtualJoystick + ActionButtons  (mobile / P1 by default)
 *   • KEYBOARD – Phaser keyboard keys              (desktop dev, always available)
 *
 * Returns an InputState each frame where button fields are EDGE-TRIGGERED
 * (true only on the first frame a button is pressed).
 *
 * Keyboard layouts:
 *   P1 : WASD move | U attack | I jump | O special | P ultimate | L assist
 *   P2 : Arrows    | NUM1 atk | NUM2 jmp | NUM3 spc | NUM4 ult | NUM5 asst
 */

import Phaser from 'phaser';
import { InputState } from '@/types/fighter.types';
import { VirtualJoystick } from '@/components/VirtualJoystick';
import { ActionButtons }  from '@/components/ActionButtons';

// ─── Keyboard config per player ───────────────────────────────────────────────

interface KeyMap {
  left:    string;
  right:   string;
  up:      string;
  down:    string;
  attack:  string;
  jump:    string;
  special: string;
  ultimate: string;
  assist:  string;
}

const KEY_MAP_P1: KeyMap = {
  left: 'A', right: 'D', up: 'W', down: 'S',
  attack: 'U', jump: 'I', special: 'O', ultimate: 'P', assist: 'L',
};

const KEY_MAP_P2: KeyMap = {
  left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN',
  attack: 'NUMPAD_ONE', jump: 'NUMPAD_TWO', special: 'NUMPAD_THREE',
  ultimate: 'NUMPAD_FOUR', assist: 'NUMPAD_FIVE',
};

export type PlayerIndex = 1 | 2;

// ─── InputManager class ───────────────────────────────────────────────────────

export class InputManager {
  private readonly scene: Phaser.Scene;
  private readonly playerIndex: PlayerIndex;

  // Virtual (mobile) controls – only created for P1
  private readonly joystick: VirtualJoystick | null;
  private readonly buttons: ActionButtons | null;

  // Keyboard keys
  private readonly keys: Record<keyof KeyMap, Phaser.Input.Keyboard.Key>;

  // Previous keyboard button state for edge-detection
  private _prevKeys = {
    attack: false, jump: false, special: false, ultimate: false, assist: false,
  };

  constructor(scene: Phaser.Scene, playerIndex: PlayerIndex, withVirtualControls = false) {
    this.scene       = scene;
    this.playerIndex = playerIndex;

    // Virtual controls (mobile, P1 only)
    if (withVirtualControls) {
      this.joystick = new VirtualJoystick(scene);
      this.buttons  = new ActionButtons(scene);
    } else {
      this.joystick = null;
      this.buttons  = null;
    }

    // Keyboard
    const kb  = scene.input.keyboard!;
    const map = playerIndex === 1 ? KEY_MAP_P1 : KEY_MAP_P2;

    this.keys = {
      left:     kb.addKey(map.left),
      right:    kb.addKey(map.right),
      up:       kb.addKey(map.up),
      down:     kb.addKey(map.down),
      attack:   kb.addKey(map.attack),
      jump:     kb.addKey(map.jump),
      special:  kb.addKey(map.special),
      ultimate: kb.addKey(map.ultimate),
      assist:   kb.addKey(map.assist),
    };
  }

  /**
   * Poll all input sources and return the merged InputState for this frame.
   * Must be called once per frame (in FightScene.update).
   */
  poll(): InputState {
    // ── Axis (joystick wins if active, else keyboard) ──────────────────────
    let axisX = 0;
    let axisY = 0;

    if (this.joystick && (Math.abs(this.joystick.axisX) > 0.05 || Math.abs(this.joystick.axisY) > 0.05)) {
      axisX = this.joystick.axisX;
      axisY = this.joystick.axisY;
    } else {
      if (this.keys.left.isDown)  axisX -= 1;
      if (this.keys.right.isDown) axisX += 1;
      if (this.keys.up.isDown)    axisY -= 1;
      if (this.keys.down.isDown)  axisY += 1;
    }

    // ── Buttons (edge-triggered) ───────────────────────────────────────────
    const kAttack   = this.keys.attack.isDown;
    const kJump     = this.keys.jump.isDown;
    const kSpecial  = this.keys.special.isDown;
    const kUltimate = this.keys.ultimate.isDown;
    const kAssist   = this.keys.assist.isDown;

    const attack   = (kAttack   && !this._prevKeys.attack)   || (this.buttons?.justDown('attack')   ?? false);
    const jump     = (kJump     && !this._prevKeys.jump)      || (this.buttons?.justDown('jump')     ?? false);
    const special  = (kSpecial  && !this._prevKeys.special)   || (this.buttons?.justDown('special')  ?? false);
    const ultimate = (kUltimate && !this._prevKeys.ultimate)  || (this.buttons?.justDown('ultimate') ?? false);
    const assist   = (kAssist   && !this._prevKeys.assist)    || (this.buttons?.justDown('assist')   ?? false);

    // Update previous state
    this._prevKeys = {
      attack:   kAttack,
      jump:     kJump,
      special:  kSpecial,
      ultimate: kUltimate,
      assist:   kAssist,
    };

    // Clear virtual button justDown flags after reading
    this.buttons?.clearJustDown();

    return { axisX, axisY, attack, jump, special, ultimate, assist };
  }

  destroy(): void {
    this.joystick?.destroy();
    this.buttons?.destroy();
    // Keys are tied to the scene keyboard plugin; scene shutdown cleans them up.
  }
}
