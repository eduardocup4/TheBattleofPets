# The Battle of Pets – Architecture Plan & Progress Tracker

## Legend
- `[ ]` pending  |  `[x]` done  |  `[~]` in progress  |  `[!]` blocked

---

## STEP 1 – Project Scaffold  ✅

| # | Task | Status |
|---|------|--------|
| 1.1 | Create branch `claude/battle-of-pets-game-vaaBa` | `[x]` |
| 1.2 | `package.json` with Phaser 3 + Vite + TypeScript | `[x]` |
| 1.3 | `tsconfig.json` – strict mode, path aliases `@/` | `[x]` |
| 1.4 | `vite.config.ts` – dev server, chunked Phaser build | `[x]` |
| 1.5 | `index.html` – mobile meta, no-scroll CSS, touch-action:none | `[x]` |
| 1.6 | `src/config/game.config.ts` – all magic numbers centralised | `[x]` |
| 1.7 | `src/types/fighter.types.ts` – FighterState, InputState, HitData | `[x]` |
| 1.8 | `src/types/scene.types.ts` – CharacterId, StageId, FightInitData | `[x]` |
| 1.9 | `src/managers/SoundManager.ts` – BGM/SFX skeleton | `[x]` |
| 1.10 | `src/scenes/PreloadScene.ts` – loading bar, audio stubs | `[x]` |
| 1.11 | `src/scenes/MainMenuScene.ts` – title + start button | `[x]` |
| 1.12 | `src/scenes/CharacterSelectScene.ts` – 4 coloured cards | `[x]` |
| 1.13 | `src/scenes/FightScene.ts` – scaffold, receives FightInitData | `[x]` |
| 1.14 | `src/main.ts` – Phaser.Game config, scene registration | `[x]` |
| 1.15 | `npm install` + `tsc --noEmit` passes with 0 errors | `[x]` |
| 1.16 | Commit + push to feature branch | `[x]` |

---

## STEP 2 – Physics & Abstract Fighter (PetFighter)  ✅ *(current)*

| # | Task | Status |
|---|------|--------|
| 2.1 | `src/fighters/PetFighter.ts` – abstract class, Arcade body | `[x]` |
| 2.2 | FSM: Idle, Walk, Jump, Guard, Attack, Special, Ultimate, Assist, Hurt, Stun, Victory, Dead | `[x]` |
| 2.3 | HP bar + MP bar in HUDScene | `[x]` |
| 2.4 | Hurtbox (receives damage) as separate Arcade body | `[x]` |
| 2.5 | Auto-Guard logic: joystick facing away from opponent on hit → 10% damage | `[x]` |
| 2.6 | Ground detection & landing | `[x]` |
| 2.7 | `src/components/VirtualJoystick.ts` | `[x]` |
| 2.8 | `src/components/ActionButtons.ts` – A, B, C, D, E | `[x]` |
| 2.9 | Keyboard input adapter (P1 = WASD+UIOL, P2 = Arrows+NUMPAD) | `[x]` |
| 2.10 | HUD overlay scene (`HUDScene` runs on top of FightScene) | `[x]` |
| 2.11 | All 4 characters: DanaV1, DanaV2, Betsbi, Bebi | `[x]` |
| 2.12 | 4 procedural stage backgrounds | `[x]` |
| 2.13 | VictoryScene with quote, rematch & menu buttons | `[x]` |
| 2.14 | Round timer (99 s) | `[x]` |
| 2.15 | `tsc --noEmit` passes 0 errors | `[x]` |

---

## STEP 3 – Characters Implementation

### DANA V1 (Brawler / Fuego)
| # | Task | Status |
|---|------|--------|
| 3.1 | Class `DanaV1` extends `PetFighter` | `[ ]` |
| 3.2 | Attack: frontal fire hitbox | `[ ]` |
| 3.3 | Special [C]: Flight (Y=0, 2s I-Frames) | `[ ]` |
| 3.4 | Ultimate [D]: Full-screen AoE | `[ ]` |
| 3.5 | Assist [E]: Ally dog crosses screen on X axis | `[ ]` |
| 3.6 | Victory quote: "El fuego es mi especialidad" | `[ ]` |

### DANA V2 (Speed / Combo)
| # | Task | Status |
|---|------|--------|
| 3.7 | Class `DanaV2` extends `PetFighter` | `[ ]` |
| 3.8 | Attack: fast hitbox | `[ ]` |
| 3.9 | Special [C]: Anti-air Shoryuken (fire, Y axis) | `[ ]` |
| 3.10 | Ultimate [D]: 4-hit auto combo → explosive stomp | `[ ]` |
| 3.11 | Assist [E]: Fast fire projectile | `[ ]` |
| 3.12 | Victory quote: "Ahora vamos al mundo perruno a dormir" | `[ ]` |

### BETSBI (Zoner / Nieve)
| # | Task | Status |
|---|------|--------|
| 3.13 | Class `Betsbi` extends `PetFighter` | `[ ]` |
| 3.14 | Attack: fast X snowball projectile | `[ ]` |
| 3.15 | Special [C]: Large slow Avalanche projectile | `[ ]` |
| 3.16 | Ultimate [D]: 3 consecutive avalanches | `[ ]` |
| 3.17 | Assist [E]: Static snowman absorbs 1 frontal hit | `[ ]` |
| 3.18 | Victory quote: "Vamos a enfriar el lugar" | `[ ]` |

### BEBI (Trapper / Hielo)
| # | Task | Status |
|---|------|--------|
| 3.19 | Class `Bebi` extends `PetFighter` | `[ ]` |
| 3.20 | Attack: ice projectile | `[ ]` |
| 3.21 | Special [C]: CC projectile → Stun 1.5s on hit | `[ ]` |
| 3.22 | Ultimate [D]: Iceberg falls from Y:0 at opponent's X | `[ ]` |
| 3.23 | Assist [E]: Ice wall that pushes | `[ ]` |
| 3.24 | Victory quote: "Ya se me congelan las patas" | `[ ]` |

---

## STEP 4 – Stages

| # | Task | Status |
|---|------|--------|
| 4.1 | Stage: Veterinaria | `[ ]` |
| 4.2 | Stage: Casa de los Abuelos | `[ ]` |
| 4.3 | Stage: Depto de Sofía | `[ ]` |
| 4.4 | Stage: Parque con árboles | `[ ]` |
| 4.5 | Parallax scrolling layers (optional) | `[ ]` |

---

## STEP 5 – Audio

| # | Task | Status |
|---|------|--------|
| 5.1 | Source/create 4 BGM tracks (one per stage) | `[ ]` |
| 5.2 | Source/create SFX: fire, ice, hit, guard, jump, victory | `[ ]` |
| 5.3 | Hook `SoundManager.playBgm()` in `FightScene.create()` | `[ ]` |
| 5.4 | Hook SFX in `PetFighter` attack/hurt callbacks | `[ ]` |

---

## STEP 6 – Polish & QA

| # | Task | Status |
|---|------|--------|
| 6.1 | Victory screen with quote | `[ ]` |
| 6.2 | Round timer (99s countdown) | `[ ]` |
| 6.3 | Best-of-3 round logic | `[ ]` |
| 6.4 | Mobile hit-testing on real device | `[ ]` |
| 6.5 | Performance profiling (target 60fps on mid-range phone) | `[ ]` |
| 6.6 | Final build + deploy check (`vite build` passes) | `[ ]` |

---

## Architecture Decisions

### Scene Graph
```
PreloadScene
  └─► MainMenuScene
        └─► CharacterSelectScene
              └─► FightScene  (parallel: HUDScene)
                    └─► VictoryScene
```

### Fighter FSM Transitions
```
Idle ──► Walk ──► Jump
 │         │       │
 ▼         ▼       ▼
Guard    Attack  Attack (aerial)
 │         │
 ▼         ▼
Hurt     (on hit connects)
 │
 ▼
Stun (if ice/CC)
 │
 ▼
Idle (recovery)
```

### Hitbox Strategy
- Each `PetFighter` owns **one hurtbox** (permanent, matches body bounds).
- Each attack/projectile spawns a **temporary hitbox** Arcade body.
- Overlap callback → `applyHit(data: HitData)` on target.
- I-Frames: set `hurtbox.active = false` for the duration.

### Input Architecture
- `InputManager` singleton per player polls `VirtualJoystick` + `ActionButtons`.
- Returns a normalized `InputState` each frame.
- `PetFighter.update(input: InputState)` consumes it; fighter is input-agnostic.
