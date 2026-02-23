/**
 * CharacterSelectScene – player chooses their fighter and stage.
 *
 * Step 3: cards show the real sprite sheet portrait (frame 0) when the
 * texture is loaded, or fall back to the procedural coloured placeholder.
 * P1 clicks a card → updates their selection (highlighted with gold border).
 * P2 is assigned to a different character automatically (cycles).
 */

import Phaser from 'phaser';
import { CharacterId, StageId, FightInitData } from '@/types/scene.types';
import { SHEETS } from '@/config/animations';
import { PetFighter } from '@/fighters/PetFighter';

// ─── Static data ─────────────────────────────────────────────────────────────

interface CharacterDef {
  id: CharacterId;
  label: string;
  subtitle: string;
  placeholderColor: number;
  placeholderW: number;
  placeholderH: number;
  sheetKey: string;
  /** Frame index used for the portrait (idle frame 0 works well). */
  portraitFrame: number;
  /** Width of one sheet frame – needed to crop a single frame. */
  frameW: number;
}

const CHARACTERS: CharacterDef[] = [
  {
    id: 'DANA_V1', label: 'DANA V1', subtitle: 'Brawler · Fuego',
    placeholderColor: 0xc8a070, placeholderW: 72, placeholderH: 118,
    sheetKey: SHEETS['DANA_V1']!.key, portraitFrame: 0,
    frameW: SHEETS['DANA_V1']!.frameWidth,
  },
  {
    id: 'DANA_V2', label: 'DANA V2', subtitle: 'Speed · Combo',
    placeholderColor: 0x5a3010, placeholderW: 72, placeholderH: 118,
    sheetKey: SHEETS['DANA_V2']!.key, portraitFrame: 0,
    frameW: SHEETS['DANA_V2']!.frameWidth,
  },
  {
    id: 'BETSBI', label: 'BETSBI', subtitle: 'Zoner · Nieve',
    placeholderColor: 0x90e890, placeholderW: 72, placeholderH: 118,
    sheetKey: SHEETS['BETSBI']!.key, portraitFrame: 0,
    frameW: SHEETS['BETSBI']!.frameWidth,
  },
  {
    id: 'BEBI', label: 'BEBI', subtitle: 'Trapper · Hielo',
    placeholderColor: 0x90d0ff, placeholderW: 72, placeholderH: 118,
    sheetKey: SHEETS['BEBI']!.key, portraitFrame: 0,
    frameW: SHEETS['BEBI']!.frameWidth,
  },
];

const STAGES: { id: StageId; label: string }[] = [
  { id: 'VETERINARIA',  label: 'Veterinaria' },
  { id: 'CASA_ABUELOS', label: 'Casa Abuelos' },
  { id: 'DEPTO_SOFIA',  label: 'Depto Sofía' },
  { id: 'PARQUE',       label: 'Parque' },
];

const CARD_W = 176;
const CARD_H = 210;
const PORTRAIT_H = 130; // target portrait height inside card

// ─── Scene ────────────────────────────────────────────────────────────────────

export class CharacterSelectScene extends Phaser.Scene {
  private p1Selection: CharacterId = 'DANA_V1';
  private p2Selection: CharacterId = 'BETSBI';
  private stageSelection: StageId  = 'VETERINARIA';

  /** Border rectangles so we can update their stroke style on selection. */
  private cardBorders: Map<CharacterId, Phaser.GameObjects.Rectangle> = new Map();
  private stageTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // ── Background ──────────────────────────────────────────────────────────
    this.add.rectangle(cx, height / 2, width, height, 0x080018);

    // Subtle grid overlay
    const gridG = this.add.graphics();
    gridG.lineStyle(1, 0x2a0060, 0.35);
    for (let gx = 0; gx < width; gx += 48) gridG.lineBetween(gx, 0, gx, height);
    for (let gy = 0; gy < height; gy += 48) gridG.lineBetween(0, gy, width, gy);

    // ── Title ────────────────────────────────────────────────────────────────
    this.add
      .text(cx, 28, 'THE BATTLE OF PETS', {
        fontSize: '26px', color: '#ffdd00', fontStyle: 'bold',
        stroke: '#880000', strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 58, 'SELECCIONA TU PERSONAJE', {
        fontSize: '14px', color: '#aaaaff',
      })
      .setOrigin(0.5);

    // ── Player indicator labels ───────────────────────────────────────────────
    this.add
      .text(cx, 82, 'P1 ▶', { fontSize: '12px', color: '#00ff88' })
      .setOrigin(0.5);

    // ── Character cards ──────────────────────────────────────────────────────
    const spacing   = CARD_W + 20;
    const startX    = cx - ((CHARACTERS.length - 1) * spacing) / 2;
    const cardCenterY = 200;

    CHARACTERS.forEach((def, i) => {
      const x = startX + i * spacing;
      this._buildCard(def, x, cardCenterY);
    });

    // ── P1 / P2 labels below cards ────────────────────────────────────────────
    this.add
      .text(cx, cardCenterY + CARD_H / 2 + 16, 'Toca una carta para elegir tu personaje (P1)', {
        fontSize: '11px', color: '#888888',
      })
      .setOrigin(0.5);

    // ── Stage selector ────────────────────────────────────────────────────────
    this.add
      .text(cx, height - 120, 'ESCENARIO', {
        fontSize: '13px', color: '#aaaaaa', fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const stageSpacing = 180;
    const stageStartX  = cx - ((STAGES.length - 1) * stageSpacing) / 2;

    STAGES.forEach((s, idx) => {
      const t = this.add
        .text(stageStartX + idx * stageSpacing, height - 96, s.label, {
          fontSize: '13px',
          color: s.id === this.stageSelection ? '#ffdd00' : '#ffffff',
          backgroundColor: '#2a0060',
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      t.on('pointerover', () => {
        if (s.id !== this.stageSelection) t.setStyle({ color: '#ccccff' });
      });
      t.on('pointerout', () => {
        if (s.id !== this.stageSelection) t.setStyle({ color: '#ffffff' });
      });
      t.on('pointerdown', () => {
        this.stageSelection = s.id;
        this.stageTexts.forEach((l, li) => {
          l.setStyle({ color: STAGES[li]?.id === this.stageSelection ? '#ffdd00' : '#ffffff' });
        });
      });

      this.stageTexts.push(t);
    });

    // ── Fight button ─────────────────────────────────────────────────────────
    const fightBtn = this.add
      .text(cx, height - 44, '[ ¡PELEAR! ]', {
        fontSize: '26px',
        color: '#ffffff',
        backgroundColor: '#880000',
        padding: { x: 28, y: 10 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    fightBtn.on('pointerover', () => fightBtn.setStyle({ color: '#ffdd00' }));
    fightBtn.on('pointerout',  () => fightBtn.setStyle({ color: '#ffffff' }));
    fightBtn.on('pointerdown', () => this._startFight());

    // Keyboard shortcut
    this.input.keyboard?.on('keydown-ENTER', () => this._startFight());

    // Apply initial selection highlights
    this._refreshBorders();
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private _buildCard(def: CharacterDef, x: number, y: number): void {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, CARD_W, CARD_H, 0x110033);
    bg.setStrokeStyle(3, 0x330066);

    // Portrait
    const portrait = this._makePortrait(def, 0, -18);

    // Name
    const nameText = this.add
      .text(0, CARD_H / 2 - 42, def.label, {
        fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Subtitle (archetype)
    const subText = this.add
      .text(0, CARD_H / 2 - 22, def.subtitle, {
        fontSize: '10px', color: '#aaaaff',
      })
      .setOrigin(0.5);

    container.add([bg, portrait, nameText, subText]);
    container.setSize(CARD_W, CARD_H);
    container.setInteractive();

    // Hover effect
    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 100 });
    });
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });

    container.on('pointerdown', () => {
      this.p1Selection = def.id;
      // Auto-assign P2 to a different character
      const others = CHARACTERS.filter(c => c.id !== def.id);
      const current = others.find(c => c.id === this.p2Selection);
      if (!current) {
        this.p2Selection = others[0]?.id ?? 'BETSBI';
      }
      this._refreshBorders();
    });

    this.cardBorders.set(def.id, bg);
  }

  /** Returns a portrait sprite or placeholder rect, centred at (ox, oy). */
  private _makePortrait(
    def: CharacterDef,
    ox: number,
    oy: number,
  ): Phaser.GameObjects.GameObject {
    const hasSheet = this.textures.exists(def.sheetKey);

    if (hasSheet) {
      const spr = this.add.sprite(ox, oy, def.sheetKey, def.portraitFrame);
      // Scale to portrait height
      const scale = PORTRAIT_H / spr.height;
      spr.setScale(scale);
      return spr;
    }

    // Fallback: procedural placeholder
    const FALLBACK = `ph_select_${def.id}`;
    PetFighter.createFighterTexture(
      this, FALLBACK, def.placeholderColor, def.placeholderW, def.placeholderH,
    );
    const img = this.add.image(ox, oy, FALLBACK);
    img.setScale(PORTRAIT_H / def.placeholderH);
    return img;
  }

  private _refreshBorders(): void {
    this.cardBorders.forEach((rect, id) => {
      if (id === this.p1Selection) {
        rect.setStrokeStyle(4, 0x00ff88);   // P1 = green
      } else if (id === this.p2Selection) {
        rect.setStrokeStyle(4, 0xff4444);   // P2 = red
      } else {
        rect.setStrokeStyle(2, 0x330066);
      }
    });
  }

  private _startFight(): void {
    const data: FightInitData = {
      player1: this.p1Selection,
      player2: this.p2Selection,
      stage:   this.stageSelection,
    };
    this.scene.start('FightScene', data);
  }
}
