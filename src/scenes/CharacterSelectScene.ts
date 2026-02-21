/**
 * CharacterSelectScene – player chooses their fighter and stage.
 *
 * Step 1 placeholder: coloured cards for each character.
 * Full art + animations added in later steps.
 */

import Phaser from 'phaser';
import { CharacterId, StageId, FightInitData } from '@/types/scene.types';

interface CharacterDef {
  id: CharacterId;
  label: string;
  color: number;
  subtitle: string;
}

const CHARACTERS: CharacterDef[] = [
  { id: 'DANA_V1', label: 'DANA V1',  color: 0xc8a070, subtitle: 'Brawler / Fuego' },
  { id: 'DANA_V2', label: 'DANA V2',  color: 0x5a3010, subtitle: 'Speed / Combo'   },
  { id: 'BETSBI',  label: 'BETSBI',   color: 0x90e890, subtitle: 'Zoner / Nieve'   },
  { id: 'BEBI',    label: 'BEBI',     color: 0x90d0ff, subtitle: 'Trapper / Hielo' },
];

const STAGES: StageId[] = [
  'VETERINARIA',
  'CASA_ABUELOS',
  'DEPTO_SOFIA',
  'PARQUE',
];

export class CharacterSelectScene extends Phaser.Scene {
  private p1Selection: CharacterId = 'DANA_V1';
  private p2Selection: CharacterId = 'BETSBI';
  private stageSelection: StageId = 'VETERINARIA';

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    this.add.rectangle(cx, height / 2, width, height, 0x0a0020);

    this.add
      .text(cx, 30, 'SELECCIONA TU PERSONAJE', {
        fontSize: '22px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // ── Character cards ──────────────────────────────────────────────────────
    const cardW = 180;
    const cardH = 200;
    const cardSpacing = 200;
    const startX = cx - ((CHARACTERS.length - 1) * cardSpacing) / 2;

    CHARACTERS.forEach((def, i) => {
      const x = startX + i * cardSpacing;
      const y = height / 2 - 30;

      const card = this.add.container(x, y);

      const bg = this.add
        .rectangle(0, 0, cardW, cardH, def.color)
        .setStrokeStyle(3, 0x000000);

      const label = this.add
        .text(0, -60, def.label, { fontSize: '16px', color: '#000000', fontStyle: 'bold' })
        .setOrigin(0.5);

      const sub = this.add
        .text(0, 60, def.subtitle, { fontSize: '11px', color: '#333333' })
        .setOrigin(0.5);

      card.add([bg, label, sub]);
      card.setSize(cardW, cardH);
      card.setInteractive();

      card.on('pointerover', () => bg.setStrokeStyle(4, 0xffdd00));
      card.on('pointerout',  () => bg.setStrokeStyle(3, 0x000000));
      card.on('pointerdown', () => {
        this.p1Selection = def.id;
        this.updateSelectionLabels();
      });
    });

    // ── Stage selector (simple text list) ───────────────────────────────────
    this.add
      .text(cx, height - 110, 'ESCENARIO:', {
        fontSize: '14px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    const stageLabels = STAGES.map((s, i) => {
      const t = this.add
        .text(cx - 300 + i * 160, height - 85, s.replace('_', ' '), {
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: '#330055',
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      t.on('pointerdown', () => {
        this.stageSelection = s;
        stageLabels.forEach((l) => l.setStyle({ color: '#ffffff' }));
        t.setStyle({ color: '#ffdd00' });
      });

      return t;
    });

    // ── Fight button ─────────────────────────────────────────────────────────
    const fightBtn = this.add
      .text(cx, height - 40, '[ PELEAR ]', {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: '#880000',
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    fightBtn.on('pointerover', () => fightBtn.setStyle({ color: '#ffdd00' }));
    fightBtn.on('pointerout',  () => fightBtn.setStyle({ color: '#ffffff' }));
    fightBtn.on('pointerdown', () => this.startFight());

    // Dev shortcut
    this.input.keyboard?.on('keydown-ENTER', () => this.startFight());
  }

  private updateSelectionLabels(): void {
    // Will be enriched with visual feedback in Step 2
  }

  private startFight(): void {
    const data: FightInitData = {
      player1: this.p1Selection,
      player2: this.p2Selection,
      stage:   this.stageSelection,
    };
    this.scene.start('FightScene', data);
  }
}
