/**
 * Types shared between scenes.
 */

export type CharacterId = 'DANA_V1' | 'DANA_V2' | 'BETSBI' | 'BEBI';

export type StageId = 'VETERINARIA' | 'CASA_ABUELOS' | 'DEPTO_SOFIA' | 'PARQUE';

export interface FightInitData {
  player1: CharacterId;
  player2: CharacterId;
  stage: StageId;
}
