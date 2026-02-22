# The Battle of Pets – Lessons Learned & Patterns

This file documents every bug fixed, gotcha discovered, and pattern established
during development. Updated continuously as new issues are resolved.

---

## Patterns Established

### P-001 – TypeScript strict mode with Phaser 3
**Context:** Phaser 3's type definitions occasionally use `any` or broad unions.
**Pattern:** Wrap Phaser calls that return ambiguous types with explicit casts or
type guards rather than disabling strict checks globally.
```ts
// ✅ correct
const sound = this.scene.sound.add(key) as Phaser.Sound.WebAudioSound;

// ❌ avoid
// @ts-ignore
```

### P-002 – Mobile audio unlock
**Context:** All mobile browsers require a user gesture before the AudioContext
can start.
**Pattern:** Phaser's `SoundManager` handles this automatically when
`disableWebAudio: false`. Do NOT pre-call `audioContext.resume()` manually; let
Phaser's internal unlock flow handle it on the first `pointerdown` event.

### P-003 – Separate Hurtbox vs. Fighter body
**Context:** Using the same Arcade body for both physics (movement) and damage
reception causes I-Frame logic to fight with collision resolution.
**Pattern:** Each `PetFighter` has:
1. **Main body** – handles movement, gravity, ground collision.
2. **Hurtbox** – a second `Phaser.Physics.Arcade.Image` at the same position,
   used only for overlap checks. Toggled `active` for I-Frames.

### P-004 – `touch-action: none` on canvas
**Context:** Without this CSS, mobile browsers intercept touch events (pan,
pinch-to-zoom) before Phaser receives them, causing missed inputs.
**Pattern:** Set `touch-action: none` on both `body` and `canvas` in CSS.
Already applied in `index.html`.

### P-005 – Vite chunking Phaser
**Context:** Phaser (~1 MB minified) should not be in the same chunk as game
logic to avoid long re-builds during development.
**Pattern:** Use `manualChunks: { phaser: ['phaser'] }` in `vite.config.ts`.
This also improves browser caching between deployments.

---

## Bugs Fixed

### BUG-001 – `import.meta.env` unknown in strict tsconfig
**Symptom:** `error TS2339: Property 'env' does not exist on type 'ImportMeta'`
**Root cause:** `tsconfig.json` did not include Vite's ambient type declarations.
**Fix:** Added `"types": ["vite/client"]` to `compilerOptions` in `tsconfig.json`.
Vite ships `vite/client` which declares the `ImportMeta` augmentation for `import.meta.env`, `import.meta.hot`, etc.
**Lesson:** Every Vite + strict TypeScript project needs `"types": ["vite/client"]`. Add it at scaffold time.

### BUG-002 – `state` / `setState` clash between PetFighter and Phaser.Sprite
**Symptom:** TS2611 (`state` is a property in Sprite but overridden as accessor), TS2416 (`setState` return type mismatch), TS4114 (missing `override`).
**Root cause:** `Phaser.GameObjects.GameObject` defines `state: string | number` and `setState(value): this`. Our FSM used the same names with incompatible signatures.
**Fix:** Renamed FSM accessor to `fighterState` and setter to `setFighterState`. Never clash with Phaser built-in GameObject property names (`state`, `name`, `type`, `active`, `visible`).
**Lesson:** Always check `Phaser.GameObjects.GameObject` / `Sprite` property list before naming public members on a subclass.

### BUG-003 – `scene.make.graphics({ add: false })` unknown property
**Symptom:** TS2353: Object literal may only specify known properties, 'add' does not exist in type 'Options'.
**Root cause:** Phaser 3 TypeScript types no longer include `add` in `Phaser.Types.GameObjects.Graphics.Options`.
**Fix:** Use `scene.add.graphics()` followed immediately by `generateTexture()` and `destroy()`. The graphics object is removed from the display list synchronously before the next render frame.

### BUG-004 – `this.scene.data` vs `this.data`
**Symptom:** TS2339: Property 'data' does not exist on type 'ScenePlugin'.
**Root cause:** `this.scene` inside a `Phaser.Scene` subclass is the `ScenePlugin` (scene management), NOT the scene itself. The scene's data manager is accessed via `this.data`.
**Fix:** Use `this.data.set(...)` / `this.data.get(...)` inside a Scene class. Pass `this.scene` to other objects only for scene transitions.

---

## Anti-Patterns to Avoid

| Anti-pattern | Why | Correct approach |
|---|---|---|
| `// @ts-ignore` or `as any` | Hides real type errors | Use proper casts or type guards |
| Storing scene references in singletons | Phaser scenes are destroyed and re-created; stale refs cause crashes | Pass scene to managers via constructor |
| `setInterval`/`setTimeout` for game timers | Not paused when game loses focus | Use `this.time.addEvent()` (Phaser timer) |
| Direct `window.addEventListener` for game input | Not cleaned up on scene shutdown | Use Phaser's `this.input` API |
| Mutating `FighterState` from outside the FSM | Breaks state integrity | Always call `fighter.setState()` which validates the transition |
