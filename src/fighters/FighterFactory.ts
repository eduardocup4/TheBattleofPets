/**
 * FighterFactory – creates the correct PetFighter subclass from a CharacterId.
 */

import Phaser from 'phaser';
import { CharacterId } from '@/types/scene.types';
import { FighterContext } from '@/types/fighter.types';
import { PetFighter } from './PetFighter';
import { DanaV1 }  from './DanaV1';
import { DanaV2 }  from './DanaV2';
import { Betsbi }  from './Betsbi';
import { Bebi }    from './Bebi';

export function createFighter(
  scene: Phaser.Scene,
  id: CharacterId,
  x: number,
  y: number,
  ctx: FighterContext,
): PetFighter {
  switch (id) {
    case 'DANA_V1': return new DanaV1(scene, x, y, ctx);
    case 'DANA_V2': return new DanaV2(scene, x, y, ctx);
    case 'BETSBI':  return new Betsbi(scene, x, y, ctx);
    case 'BEBI':    return new Bebi(scene, x, y, ctx);
  }
}
