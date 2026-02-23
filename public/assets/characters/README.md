# Character Sprite Sheets

Place the following files in this directory before running the game.
The game gracefully falls back to coloured placeholder rectangles if any file is missing.

| File | Character | Frame W×H | Rows (anim → frames) |
|---|---|---|---|
| `dana_v1_sheet.png` | DANA V1 (chihuahua) | 190 × 175 | Idle 0-4 · Walk 5-12 · Attack 13-21 · Flight 22-27 |
| `dana_v2_sheet.png` | DANA V2 (dark dog) | 220 × 180 | Idle 0-2 · Attack 3-8 · Walk+Jump 9-14 · Land 15-18 |
| `betsbi_sheet.png`  | BETSBI (husky)     | 220 × 210 | Idle 0-4 · Attack 5-9 · Special 10-12 · Victory 15-16 |
| `bebi_sheet.png`    | BEBI (labrador)    | 230 × 215 | Idle 0-3 · Attack 4-8 · Special 9-13 · Ultimate 14-18 |

## Frame index formula
Phaser reads frames left → right, top → bottom, 0-indexed.
`frameIndex = row * (imageWidth / frameWidth) + column`

## Adjusting frame sizes
Edit `src/config/animations.ts` — every field is annotated.
The game hot-reloads via Vite so you'll see changes instantly.
