# Slider Component (a-slider) — Implementation Proposal

A 3D value slider control for A‑Frame scenes, consistent with `a-input`, `a-textarea`, `a-radio`, and `a-checkbox`. Follows the repo’s architectural patterns, event-driven updates (A‑Frame 1.7.1), and the improved helpers/form manager introduced for radio/checkbox.

## Goals
- **Interactive value selection** across a numeric range with optional discrete steps and marks.
- **Consistent architecture** with other controls: component + primitive, Utils, core Event helper, FormControlHelpers, FormManager.
- **Event-driven rendering** (no `tick()` polling), clean lifecycle, and VR-ready interactions (mouse, touch, controllers, keyboard).
- **Accessible**: ARIA role `slider`, `aria-valuemin/max/now`, tab focus, keyboard navigation.

## Non-Goals (MVP)
- Range selection with two thumbs.
- Vertical orientation. (Planned later.)
- Complex tooltips (single numeric bubble only in MVP).

## UX Behavior Summary
- Click/tap/drag the thumb to change value; track fills to the thumb position.
- Optional marks (small ticks) at step positions.
- Optional value bubble above the thumb during focus/drag.
- Disabled state blocks interaction and dims visuals.

## Public API

### Component: `slider`
- Value & range
  - `min: number` — default `0`
  - `max: number` — default `100`
  - `step: number` — default `1` (supports fractional)
  - `value: number` — initial value; clamped and snapped to step
  - `name: string`
  - `disabled: boolean`
  - `readonly: boolean` — allows focus but no change
- Layout & visuals
  - `width: number` — visual width of track (world units)
  - `trackHeight: number` — default `0.06`
  - `thumbRadius: number` — default `0.09`
  - `trackColor: color` — base (inactive) track color
  - `activeTrackColor: color` — filled portion color
  - `thumbColor: color`
  - `focusRingColor: color` — focus indicator color (optional)
  - `opacity: number`
- Marks & bubble
  - `marks: boolean|number[]|'auto'` — show ticks; `auto` uses `step`
  - `markColor: color` — tick color
  - `markSize: number` — default `0.012`
  - `showValueBubble: boolean` — show numeric bubble while focused/dragging
  - `format: string|function` — e.g., `"0"`, `"0.0"` or function(value)->string
- Accessibility
  - `ariaLabel: string`
  - `tabIndex: int` — default `0` (−1 when disabled)
- SFX (optional; routed via FormManager when available)
  - `soundEnabled: boolean` — default `true`
  - `sfxSlideStart: string` — `#id` of asset (default from assets)
  - `sfxSlideEnd: string`
  - `sfxTick: string` — optional step tick

### Primitive: `a-slider`
Maps HTML-like attributes to `slider.*` schema.

- `min` → `slider.min`
- `max` → `slider.max`
- `step` → `slider.step`
- `value` → `slider.value`
- `name` → `slider.name`
- `disabled` → `slider.disabled`
- `readonly` → `slider.readonly`
- `width` → `slider.width`
- `track-height` → `slider.trackHeight`
- `thumb-radius` → `slider.thumbRadius`
- `track-color` → `slider.trackColor`
- `active-track-color` → `slider.activeTrackColor`
- `thumb-color` → `slider.thumbColor`
- `opacity` → `slider.opacity`
- `marks` → `slider.marks`
- `mark-color` → `slider.markColor`
- `mark-size` → `slider.markSize`
- `show-value-bubble` → `slider.showValueBubble`
- `format` → `slider.format`
- `aria-label` → `slider.ariaLabel`
- `tabindex` → `slider.tabIndex`

## Entity Structure
- Root entity: `a-slider`/`slider` component.
- Children created in `init()`:
  - `a-rounded` track (inactive) at `z ≈ 0.001` with `width = slider.width`, `height = trackHeight`, `radius = trackHeight/2`.
  - `a-rounded` active track overlay at `z ≈ 0.002`, width bound to current value.
  - Marks container: `a-entity` holding tick planes/circles at `z ≈ 0.003` (optional).
  - Thumb: `a-circle` (or `a-rounded` with equal sides) at `z ≈ 0.004`, radius `thumbRadius`.
  - Focus ring: `a-circle`/`a-ring` slightly larger, toggled on focus.
  - Value bubble group (optional): `a-rounded` rect + small pointer triangle + `a-entity[text]` at `z ≈ 0.005`, positioned above thumb.
  - Hitbox: transparent `a-plane` covering the control for easy interaction.

## State Model (internal)
- `isFocused: boolean`
- `isDragging: boolean`
- `valueNow: number` (snapped)
- `stepList: number[]` (derived when marks enabled)
- `dragStartX`, `thumbX` (computed from value)
- `keyboardStep: number` (derived from `step` with sane min)

## Events (emitted)
- `focus`, `blur`
- `input` (detail: `{ value }`) — while dragging/keyboard repeat
- `change` (detail: `{ value }`) — on commit (mouse/touch release, keyboard confirm)
- `slidestart`, `slide`, `slideend` (detail: `{ value }`) — lower-level interaction events

Global events on `document.body` are optional (e.g., `didfocusslider`, `didblurslider`) for parity.

## Methods (on element)
- `focus()`, `blur()`
- `setValue(number)` — clamps + snaps, updates visuals, emits `input`/`change` accordingly
- `increment(delta?: number)` — add by `delta` or `step`
- `decrement(delta?: number)` — subtract by `delta` or `step`

## Rendering & Update Lifecycle (A‑Frame 1.7.1)
- Avoid `tick()`; recompute visuals when:
  - `componentchanged` (name = `slider`) — for value/layout/style changes
  - `object3dset` on child visuals when meshes appear (first render)
  - `loaded` on sub-entities after `setAttribute`
- Use a single `requestAnimationFrame` when deferring one frame is needed (no `setTimeout(0)`).
- Cleanup listeners/timers in `pause()` and `remove()`.

## Layout & Value Mapping
- Map x-position in local space to `[min, max]`:
  - `t = clamp((localX / width), 0, 1)`
  - `raw = min + t * (max - min)`
  - `value = roundToStep(raw, step)` with stable epsilon handling
- Visuals:
  - Active track width = `t * width`
  - Thumb position x = `t * width`
  - Marks at `i` in `[min, max]` project to `((i - min) / (max - min)) * width`
- Formatting:
  - Built-in numeric formatter supports decimals implied by `step`
  - If `format` is a function, call with `(value)`; if string, apply a minimal formatter (e.g., fixed decimals inferred from `step`)

## Interaction & Input Methods
- Pointer (mouse/touch/controller ray):
  - Mousedown/press on hitbox → focus + `slidestart`
  - Drag updates value continuously (`slide`, `input`)
  - Mouseup/release → `slideend`, `change`
- Keyboard:
  - Left/Down → `value -= step`
  - Right/Up → `value += step`
  - PageDown/PageUp → `± 10 × step` (bounded)
  - Home/End → `min` / `max`
- Gamepad/VR controllers:
  - Primary press = start; axis X translated to incremental updates while held
  - Rumbles or sfx on tick crossings (optional)

## Accessibility
- `role="slider"`
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- `aria-label` when provided
- `tabindex` set to `0` or `-1` when disabled
- Visible focus indicator
- Keyboard interactions as above

## Background & Theming
- Use `a-rounded` for tracks; apply `opacity` via Utils to materials.
- Expose sizes/colors in schema (track, active track, thumb, marks).
- Disabled state: reduce opacity to the shared disabled value (e.g., 0.4) via Utils.

## Integration with Helpers & Manager
- Use `FormControlHelpers` for:
  - Initialization, child tracking, listener cleanup
  - Focus indicators (ring), ARIA update (extend helper for slider or set directly in component)
  - Keyboard handlers (customized for slider)
- Use `FormManager` when present for:
  - Shared sounds (slide start/end/tick)
  - Centralized error reporting

## Performance
- No per-frame polling.
- Avoid creating/destroying mark elements repeatedly: precompute pool on `schema` changes; reuse on `value` updates.
- Batch `setAttribute` changes.
- Use `requestAnimationFrame` to coalesce multiple updates during drag.

## File Structure (proposed)
- `src/slider/index.js` — component + primitive, visuals, interaction, lifecycle
- `src/slider/assets.js` — image/audio asset declarations (optional; reuse shared sounds from FormManager when available)
- `src/slider/sfx.js` — local SFX shim calling FormManager if present (mirrors button/checkbox pattern)
- `docs/slider-implementation-plan.md` — this document

## Schema (initial defaults)
```js
AFRAME.registerComponent('slider', {
  schema: {
    min: { type: 'number', default: 0 },
    max: { type: 'number', default: 100 },
    step: { type: 'number', default: 1 },
    value: { type: 'number', default: 0 },
    name: { type: 'string', default: '' },
    disabled: { type: 'boolean', default: false },
    readonly: { type: 'boolean', default: false },

    width: { type: 'number', default: 1.8 },
    trackHeight: { type: 'number', default: 0.06 },
    thumbRadius: { type: 'number', default: 0.09 },

    trackColor: { type: 'color', default: '#C7B8FF' },
    activeTrackColor: { type: 'color', default: '#6730FF' },
    thumbColor: { type: 'color', default: '#6230FF' },
    markColor: { type: 'color', default: '#FFFFFF' },
    markSize: { type: 'number', default: 0.012 },
    opacity: { type: 'number', default: 1 },

    marks: { default: 'auto' },
    showValueBubble: { type: 'boolean', default: true },
    format: { type: 'string', default: '' },

    ariaLabel: { type: 'string', default: '' },
    tabIndex: { type: 'int', default: 0 },

    soundEnabled: { type: 'boolean', default: true },
    sfxSlideStart: { type: 'string', default: '#aframeSliderStart' },
    sfxSlideEnd: { type: 'string', default: '#aframeSliderEnd' },
    sfxTick: { type: 'string', default: '#aframeSliderTick' }
  }
});
```

### Primitive mappings
```js
AFRAME.registerPrimitive('a-slider', {
  defaultComponents: { slider: {} },
  mappings: {
    min: 'slider.min',
    max: 'slider.max',
    step: 'slider.step',
    value: 'slider.value',
    name: 'slider.name',
    disabled: 'slider.disabled',
    readonly: 'slider.readonly',

    width: 'slider.width',
    'track-height': 'slider.trackHeight',
    'thumb-radius': 'slider.thumbRadius',

    'track-color': 'slider.trackColor',
    'active-track-color': 'slider.activeTrackColor',
    'thumb-color': 'slider.thumbColor',
    'mark-color': 'slider.markColor',
    'mark-size': 'slider.markSize',
    'opacity': 'slider.opacity',

    marks: 'slider.marks',
    'show-value-bubble': 'slider.showValueBubble',
    format: 'slider.format',

    'aria-label': 'slider.ariaLabel',
    tabindex: 'slider.tabIndex'
  }
});
```

## Implementation Notes
- Use `FormControlHelpers.initFormControl(this)` in `init()` and track created children for cleanup.
- Build visuals in `init()` and keep references on `this`.
- In `update(oldData)`, recompute derived state:
  - Clamp + snap `value`
  - Reposition thumb, resize active track
  - Rebuild marks only when `min/max/step/marks/width` changed
  - Update ARIA attributes
- Interaction handlers:
  - Pointer down on hitbox → focus, capture drag, play `sfxSlideStart`
  - Pointer move (while dragging) → compute localX using ray intersection on a plane aligned to the track; update `value` with `raf` throttling; optionally `sfxTick` when crossing step boundaries
  - Pointer up → release capture, emit `change`, play `sfxSlideEnd`
  - Keyboard handlers wired via helpers; prevent default when acting
- Value bubble: position `y = thumbRadius + trackHeight + 0.08`; set text via built-in `text` component; hide when not focused/dragging.
- Disabled: block pointer/keyboard; dim via Utils.updateOpacity.

## Testing
- Functional: drag, click-to-jump, keyboard increments, min/max clamp, fractional steps, disabled/readonly.
- Visual: marks alignment, bubble position, z-order (track < active < marks < thumb < bubble).
- Performance: long drags with frequent updates; ensure attribute batching and `raf`.
- Accessibility: tab focus, ARIA attributes reflect value and disabled state.

## Example Usage (MVP)
```html
<a-slider
  name="volume"
  min="0"
  max="100"
  step="5"
  value="50"
  width="2.4"
  track-height="0.06"
  thumb-radius="0.1"
  track-color="#C7B8FF"
  active-track-color="#6730FF"
  thumb-color="#6230FF"
  marks="auto"
  show-value-bubble="true"
  position="0 1.4 -1"
></a-slider>
```

## Roadmap & Phases
- **Phase 1 — MVP**: Horizontal slider, marks=auto, value bubble, keyboard support, event-driven updates, sounds (optional), full docs.
- **Phase 2 — Refinement**: Custom marks array, accessibility polish (aria-valuetext via `format`), focus ring animation, gamepad haptics, RTL support.
- **Phase 3 — Variants**: Vertical orientation, ranged (two thumbs), discrete-only mode (click-to-jump), theming presets.

## Definition of Done (MVP)
- `a-slider` renders track, active track, thumb, optional marks, and bubble.
- Pointer drag and keyboard input update value; emits `input` and `change` correctly.
- Event-driven updates; no `tick()`; listeners/timers cleaned in `pause/remove`.
- ARIA role/values set and updated.
- Disabled/readonly respected; visuals dimmed when disabled.
- Unit and integration tests cover interactions and edge cases.
