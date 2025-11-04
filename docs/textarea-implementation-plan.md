# Textarea Component (a-textarea) – Detailed Implementation Plan

This plan describes how to implement a multiline textarea form field for A‑Frame, aligned with the existing `a-input` single-line component and A‑Frame 1.7.1 best practices.

## Goals
- Multiline editing with wrapping and newlines.
- Event-driven updates (no per-frame polling) for performance and reliability.
- API parallel to `a-input` (attributes, events, methods) to enable reuse of keyboards/controllers.
- Theming and layout knobs (colors, sizes, padding, font, line height).
- Scrolling and text selection (phased).

## Non-Goals (initial MVP)
- Clipboard integration (paste/copy) via native OS.
- IME composition support.
- Complex text shaping/ligatures beyond A‑Frame text capabilities.

## UX Behavior Summary
- Click/tap focuses the textarea, shows a blinking caret.
- Typing appends characters; Enter inserts `\n` (does not blur).
- Placeholder text appears when empty, hidden otherwise.
- Text wraps within width; vertical scrolling reveals overflowed lines (phase 2+).
- Optional selection highlight for ranges (phase 2+).

## Public API

### Component: `textarea`
- Value/behavior
  - `value: string` — full content (may include `\n`).
  - `name: string`
  - `disabled: boolean`
  - `readonly: boolean`
  - `maxLength: int`
- Layout
  - `width: number`
  - `height: number` — viewport height (visible area).
  - `paddingX: number` (default 0.021)
  - `paddingY: number` (default 0.021)
  - `lineHeight: number|string` (numeric or "normal")
- Text styling
  - `color: color`
  - `font: string`
  - `letterSpacing: int`
  - `align: string` (left|center|right)
  - `side: string`
- Placeholder
  - `placeholder: string`
  - `placeholderColor: color`
- Cursor (caret)
  - `cursorWidth: number`
  - `cursorColor: color`
  - `blinkRate: number` (ms, default 500)
- Background
  - `backgroundColor: color`
  - `backgroundOpacity: number`
  - `backgroundRadius: number`
  - `backgroundHeight: number` (optional override)
- Wrapping & scrolling
  - `wrap: string` (soft|hard|off)
  - `wrapCount: int` (optional override; default derived from width)
  - `scroll: boolean` (default true)
  - `maxRows: int` (optional height constraint by rows)
- Selection
  - `selectionColor: color`
  - `selectionOpacity: number`

### Primitive: `a-textarea`
- Map attributes to `textarea.*` mirroring `a-input` style.
- Pass-through background props to `a-rounded`: width, height, radius, opacity.

## Entity Structure
- Root entity: `a-textarea`/`textarea` component.
- Children created in `init()`:
  - `a-rounded` background at `z ≈ 0.001` (width bound to `width`, height bound to `height` or computed from rows).
  - Content `a-entity` with `text` at `z ≈ 0.002`, positioned at `(paddingX, 0, 0.002)` relative to left baseline.
  - Placeholder `a-entity` mirroring content position/width.
  - Caret `a-plane` at `z ≈ 0.003` sized to `cursorWidth × lineHeight`.
  - Selection highlight pool: a set of thin `a-plane` children at `z ≈ 0.0025` (phase 2+).
  - Optional scrollbar track/thumb on the right (phase 3).

## State Model (internal)
- `isFocused: boolean`
- `selectionStart: number`, `selectionEnd: number` (collapsed when equal)
- `firstVisibleLine: number` (for scrolling)
- `charWidth: number|null` (monospaced MVP)
- Timers: `blinkInterval`, optional `blinkRaf` for animation variant

## Events (emitted)
- `focus`, `blur`
- `input` (detail: value) on every value change
- `change` (detail: value) — semantically same as `input` for parity with `a-input`
- `selectionchange` (detail: {start, end})
- `scroll` (detail: {firstVisibleLine, scrollTop})
- Optional globals on `document.body`: `didfocustextarea`, `didblurtextarea`

## Methods (exposed on element)
- `focus()`, `blur()`
- `appendString(text)`, `deleteLast()`
- `insertAtCursor(text)`
- `setSelection(start, end)`, `selectAll()`
- `setScrollTop(lineIndex)`, `ensureCaretVisible()`

## Rendering Lifecycle (A‑Frame 1.7.1)
- Event-driven recompute only:
  - `componentchanged` (name = `textarea`) — value/layout/style changes.
  - `componentchanged` (name = `text`) on content entity — font/style changes.
  - `object3dset` on content/measurement entities — mesh became available.
  - `loaded` events after setting `text` to ensure geometry is ready.
- Use a single `requestAnimationFrame` to defer measurement to the next frame when necessary (avoid `setTimeout(0)` and avoid `tick()`).
- Clear timers in `pause()` and `remove()`.

## Layout & Measurement Strategy

### MVP (Monospaced, robust)
- Use a monospaced font (default; configurable via `font`).
- Determine `charWidth` once by measuring a known string in a hidden measurement entity:
  - Set measurement `text.value = "MMMMMMMMMM"` (10 chars), compute width/10.
- Compute derived metrics:
  - `charsPerLine = floor((width - 2*paddingX)/charWidth)`
  - `visibleLines = floor((height - 2*paddingY)/lineHeight)`
- Wrap algorithm:
  - For `wrap=soft`: wrap by `charsPerLine` boundaries, preserving `\n`.
  - For `wrap=hard`: insert `\n` when exceeding `charsPerLine` (mutates value) — optional.
  - For `wrap=off`: no wrapping, allow horizontal overflow (caret may go beyond width) — optional.
- Caret position:
  - Map `selectionStart` to `(lineIndex, columnIndex)` in wrapped layout.
  - `caretX = paddingX + columnIndex * charWidth`
  - `caretY = baselineY - lineIndex * lineHeight`
- Selection highlights:
  - For each visible line, compute selected segment(s) and size a plane at `(x, y)` with width = `selectedChars * charWidth` and height = `lineHeight`.

### Advanced (Proportional fonts)
- Option A: Integrate `troika-three-text` (A‑Frame wrapper) for reliable glyph metrics.
- Option B: Hidden measurement entity strategy:
  - Set its `text.value` to the substring up to the caret/selection boundary.
  - After `loaded/object3dset`, measure width via public mesh bounds.
  - Cache results per line/chunk to reduce reflow.

## Scrolling
- Maintain `firstVisibleLine`.
- Always render full value into the content entity (simple path), but compute caret and selection against visible lines and clip highlights.
- `ensureCaretVisible()` adjusts `firstVisibleLine` when caret moves above/below the viewport.
- Optional scrollbar visuals with drag interaction (phase 3).

## Background & Theming
- Use the existing `a-rounded` primitive for the background.
- Apply `rounded.opacity = backgroundOpacity` directly.
- Expose `backgroundRadius`, `backgroundHeight` in schema and map to `a-rounded`.
- Stateful styling (optional): `focusedBackgroundColor`, `disabledBackgroundColor`.

## Performance
- Debounce `updateTextLayout()` during rapid typing.
- Batch `setAttribute('text', ...)` updates.
- Pool selection planes; reuse instead of creating/destroying.
- Cache derived metrics (`charWidth`, `wrapCount`, `visibleLines`) and recompute only on style/size changes.
- Avoid toggling visibility to measure; rely on events and `requestAnimationFrame`.

## File Structure (proposed)
- `src/textarea/index.js` — component + primitive registration, lifecycle, layout, caret, events.
- Reuse existing helpers:
  - `src/rounded/index.js` for background.
  - `src/utils.js` for cloning and opacity utilities (extend as needed).
  - `src/core/event.js` for CustomEvent emit helper.
- `docs/textarea-implementation-plan.md` — this document.

## Phased Roadmap & Tasks

### Phase 1 — MVP (Monospaced, no selection/scroll)
- Component + primitive scaffolding
  - Register `textarea` and `a-textarea` with full schema and mappings.
- Children creation
  - Background (`a-rounded`), content (`a-entity` with `text`), placeholder, caret plane.
  - Apply `backgroundColor/backgroundOpacity/backgroundRadius` to `a-rounded`.
- Focus & input
  - Click-to-focus; emit `focus`/`blur` and optional global events.
  - Methods: `focus`, `blur`, `appendString`, `deleteLast`.
  - Enforce `maxLength` early.
- Layout & caret (monospaced)
  - Measurement entity for `charWidth`.
  - Compute wrapping, caret `(x,y)`.
  - Blink via animation or interval; pause while typing; cleanup in `pause/remove`.
- Events
  - Emit `input`+`change` on value updates.
- Event-driven lifecycle
  - Recompute on `componentchanged` (textarea/text), `object3dset`, `loaded`, with `requestAnimationFrame` gating.

### Phase 2 — Selection
- State: `selectionStart`, `selectionEnd`; methods: `setSelection`, `selectAll`.
- Pointer drag to select (raycaster intersection within bounds).
- Selection highlight planes (pooled) behind text.
- Emit `selectionchange`.

### Phase 3 — Scrolling
- State: `firstVisibleLine`; methods: `setScrollTop`, `ensureCaretVisible`.
- Recompute visible window based on `height` and `lineHeight`.
- Optional scrollbar visuals & drag interaction; emit `scroll`.

### Phase 4 — Theming & Polish
- Add stateful styles (focused/disabled/error) with smooth transitions.
- Expose `backgroundHeight`, strengthen primitive mappings.
- Keyboard navigation (arrows, Home/End, PageUp/Down) if keyboard device is present.

### Phase 5 — Proportional Fonts (optional)
- Integrate troika text or measurement-entity substrings for precise metrics.
- Replace monospaced assumptions in caret/selection width computations.

## Test Plan
- Visual and functional
  - Typing speed, enter/newlines, long paragraphs.
  - Different widths/heights/lineHeights/padding.
  - Focus/blur, disabled/readonly states.
  - Rotation/scale transforms; z-order and depth testing.
- Performance
  - Rapid input; ensure no dropped frames; minimal attribute churn.
  - Large content (10k+ chars) within `maxLength`; debounced layout.
- Scrolling & selection (phases 2–3)
  - Caret visibility, selection across lines, scrollbar interactions.

## Risks & Mitigations
- Proportional font metrics are brittle with built-in text.
  - Mitigation: default monospaced MVP; offer troika integration path.
- Timer leaks (blink).
  - Mitigation: cleanup in `pause`/`remove`; prefer animation component.
- Large values causing slow text geometry rebuilds.
  - Mitigation: debounce updates; avoid unnecessary `setAttribute('text', ...)` calls.

## Definition of Done (MVP)
- Primitive `a-textarea` renders background, text, placeholder, and a blinking caret.
- Input methods work; value updates emit `input`/`change`.
- Event-driven recompute (no `tick()`), with timers cleaned up.
- Monospaced layout with wrapping and caret placement is correct.
- Documentation and usage example added to `docs`.

## Example Usage (MVP)
```html
<a-textarea
  name="message"
  value=""
  placeholder="Type your message..."
  width="1.8"
  height="0.9"
  color="#111"
  font="url(path/to/mono-msdf.json)"
  line-height="0.12"
  background-color="#FFF"
  background-opacity="0.95"
  cursor-width="0.01"
  cursor-color="#007AFF"
  position="0 1.5 -1"
></a-textarea>
```

## Gaps to Address (Spec and Plan Alignment)
- **Schema gaps**
  - Add `selectionColor: color` and `selectionOpacity: number` for selection highlight visuals.
  - Add `scroll: boolean` to allow disabling scrolling completely.
  - Add `maxRows: int` to constrain height by rows as an alternative to absolute `height`.
  - Add `backgroundHeight: number` (pass-through to `a-rounded`) when background height should differ from viewport height.
  - Clarify `cursorHeight`: derive from `lineHeight` by default; consider optional override if needed.
- **Primitive mappings**
  - Provide an explicit attribute mapping table (like `a-input`) enumerating all `a-textarea` attributes to `textarea.*` and `rounded.*` props for background (`color`, `opacity`, `radius`, `height`, `width`).
- **Measurement details**
  - Document the MVP monospaced method: compute `charWidth` using a hidden measurement entity set to a known string (e.g., `"MMMMMMMMMM"`) and divide by length. Cache result until font/size changes.
  - Document the advanced proportional strategy: prefer `troika-three-text` for reliable metrics or use an offscreen measurement entity to measure substrings up to caret/selection boundaries after `loaded/object3dset`. Avoid relying on internal fields like `visibleGlyphs`.
- **Caret behavior and lifecycle**
  - Specify that caret height equals `lineHeight` and vertical position aligns to the current visual line baseline.
  - Pause blinking while typing; resume after short idle. Implement via animation or timer; debounce to avoid flicker.
  - Ensure timers are cleared in `pause()` and `remove()` (not only on `blur()`).
- **Background pass-through**
  - State explicitly that `backgroundColor`, `backgroundOpacity`, `backgroundRadius`, and `backgroundHeight` map directly to `a-rounded` (`rounded.color`, `rounded.opacity`, `rounded.radius`, `rounded.height`). Apply opacity directly on `a-rounded`.
- **Global events and property parity**
  - Decide global event naming convention: keep `didfocustextarea`/`didblurtextarea` or unify across fields. Document the choice.
  - Provide an ergonomic `el.value` getter/setter proxy (as in `a-input`) for parity.
- **Scrolling specifics**
  - Define `firstVisibleLine`, `visibleLines`, and clipping rules for selection highlights within the viewport.
  - Document `ensureCaretVisible()` behavior and when it updates `firstVisibleLine`.
  - If `scroll=false`, specify behavior (no scroll state changes, caret may move offscreen or auto-resize if desired—choose and document one).
  - Optional scrollbar visuals and interactions; note they are part of a later phase.
- **Selection visuals**
  - Specify pooling strategy and geometry for selection highlight quads, z-order (`≈0.0025`), color/opacity controlled by the new schema fields.
- **Testing additions**
  - Add cases for monospaced vs proportional fonts, extremely long lines, trailing spaces at EOL, and rapid edits while scrolling.
- **Security and accessibility (optional but recommended)**
  - If needed, document input sanitization boundaries (what is in/out of scope) and accessibility targets (focus cues, contrast).
