# Input Component (a-input)

A 3D single-line text input for A-Frame scenes. This document explains how it works, how to use and style it, and how to build similar form fields following the same design.

The reader is not expected to have access to the source code; relevant implementation details are described here.

## Overview
- **What it is**: A focusable text input with a rounded rectangular background, live text rendering, placeholder text, and a blinking caret.
- **How it’s built**: An A-Frame component named `input` plus a convenience primitive `a-input` that maps HTML-like attributes to component properties.
- **Key parts**: Background box (`a-rounded`), text entity, placeholder entity, and a plane used as the caret.

## Structure
- **Container**
  - The `a-input`/`input` entity is a regular A-Frame entity you can position/rotate/scale in 3D.
  - All visual parts are children of this entity and inherit its transform.

- **Background (rounded rectangle)**
  - Implemented using a custom primitive `a-rounded` (backed by a `rounded` component) that draws a `THREE.ShapeBufferGeometry` with rounded corners and a `MeshPhongMaterial` (DoubleSide).
  - Default values: small corner radius, height ≈ 0.18 (world units), double-sided material.
  - `width` is bound to the input’s `width` property; color comes from `background-color`.
  - Positioned slightly forward and down: `z ≈ 0.001` and `y ≈ -height/2` so that text baseline visually centers within the rectangle.

- **Text and Placeholder**
  - Two separate `a-entity` elements, each using the built-in `text` component.
  - Both are positioned with a small left padding offset and at `z ≈ 0.002` to render above the background.
  - Placeholder visibility toggles based on whether the current value is empty.

- **Caret (cursor)**
  - A thin `a-plane` (vertical bar) at `z ≈ 0.003` so it renders in front.
  - Width, height, color are configurable.
  - Visibility blinks on a timer when focused and pauses during typing.

## Attributes (Primitive Mappings)
Use `a-input` to configure the component declaratively. The primitive maps these attributes to the `input` component’s schema:

- **Value and behavior**
  - `value` (string) — current text value.
  - `name` (string) — name for form semantics.
  - `disabled` (boolean) — if true, click focus is ignored.
  - `max-length` (int) — maximum allowed characters (truncates visually and in `value`).
  - `type` (string) — supports `text` and `password` (password renders `*`, underlying value is preserved).

- **Text styling**
  - `color` (color) — text color.
  - `align` (string) — text alignment.
  - `font` (string) — font URL or font key supported by the `text` component.
  - `letter-spacing` (int) — spacing between characters.
  - `line-height` (string) — unused for single-line, available for parity.
  - `side` (string) — text material side.
  - `tab-size` (int) — width of tabs in characters.

- **Layout**
  - `width` (number) — input’s visual width; affects background and text wrapping/computation.

- **Placeholder**
  - `placeholder` (string) — hint text when empty.
  - `placeholder-color` (color) — color of placeholder.

- **Cursor (caret)**
  - `cursor-width` (number)
  - `cursor-height` (number)
  - `cursor-color` (color)

- **Background**
  - `background-color` (color)
  - `background-opacity` (number) — currently defined but not applied in the original code; see Improvements.

Example usage:

```html
<a-input
  value=""
  placeholder="Your name"
  width="1.2"
  color="#111"
  placeholder-color="#AAA"
  background-color="#FFF"
  cursor-width="0.01"
  cursor-height="0.08"
  cursor-color="#007AFF"
  position="0 1.6 -1"
></a-input>
```

## Events and Methods
- **Events emitted**
  - `focus` (on the input entity) — when focused.
  - `blur` (on the input entity) — when blurred.
  - `change` (on the input entity) — when `value` changes; `detail` carries the new string.
  - `didfocusinput` (on `document.body`) — global focus notification, `detail` is the input entity.
  - `didblurinput` (on `document.body`) — global blur notification, `detail` is the input entity.

- **Imperative methods** (attached to the element)
  - `el.focus()` — focuses the input and starts caret blinking.
  - `el.blur()` — blurs the input and stops blinking.
  - `el.appendString(text)` — appends text; handles `"\n"` by blurring (mimics submit).
  - `el.deleteLast()` — removes the last character.

Note: A consuming virtual keyboard, controller, or system should call `appendString()` / `deleteLast()` based on input events.

## Layout and Caret Computation
- **Text application**
  - Setting the `text` component triggers the geometry/material update for the rendered glyphs.
  - The input defers measurement until the next tick, then measures rendered glyphs to compute the caret x-position.

- **Measurement approach**
  - Computes the width based on the last visible glyph’s position and advance.
  - Uses an internal geometry array of visible glyphs and a “width factor” derived from the current font.
  - Applies left/right padding; if the text would overflow, it trims characters (from the beginning or end) until it fits and then places the caret.

- **Blink behavior**
  - When the value changes, blinking pauses (interval cleared), caret is shown, then blinking restarts after a short delay.

## 3D Placement and Rotation
- **Freedom**
  - The input can be freely positioned, rotated, and scaled like any A-Frame entity. All children respect the parent transform.
- **Rendering tips**
  - Small positive z-offsets are used to ensure proper draw order (background < text < caret) and avoid z-fighting.
  - For robust ordering in complex scenes, consider `material.depthTest=false` or `renderOrder` on the caret.

## Limitations and Known Issues
- **Trailing space bug**
  - “Space has no effect when no letter comes after.” Trailing spaces often lack visible geometry, so caret doesn’t advance when relying strictly on visible glyphs.
- **Background opacity**
  - `background-opacity` is defined but not applied to the `a-rounded` background in the original implementation.
- **Reliance on internal text fields**
  - Caret placement relies on non-public geometry fields from the text component; these are subject to change across A-Frame versions.

## Improvements (A-Frame 1.7.1)
- **Prefer event-driven updates over timers**
  - Replace `setTimeout(..., 0)` caret updates with event-driven hooks:
    - Listen for `componentchanged` on the `text` component to recompute after value or font changes.
    - Listen for `object3dset` on the text entity (e.g., when its `mesh` is created) and for `loaded` on the text entity after `setAttribute('text', ...)`.
    - These events signal when geometry is ready, avoiding extra scheduling and flakiness.
  - Use `requestAnimationFrame` if you need a single-frame defer, instead of `setTimeout(0)`.

- **Do not use tick() for layout**
  - `tick()` would recompute every frame, wasting CPU. Recompute only on relevant events (value change, font/geometry ready).

- **Fix trailing space handling**
  - Track logical caret advance using font metrics (advance width for spaces) instead of only visible geometry.
  - Alternatively, temporarily append a non-breaking space for measurement and then remove it.

- **Apply background opacity**
  - Set `opacity` on `a-rounded` directly via `this.background.setAttribute('opacity', backgroundOpacity)` so the material reflects the schema value.

- **Expose size/theming knobs**
  - Consider adding `background-height` and `background-radius` to the input schema and mapping them to `a-rounded` so themes can change control size and corner roundness.

- **Performance**
  - Minimize `setAttribute('text', ...)` calls; each rebuilds geometry.
  - Debounce `updateText()` while typing rapidly.
  - Avoid toggling `visible` on text solely for measurement; instead, recompute after `componentchanged`/`object3dset` events.
  - Cache any recurrent width-factor calculations per font/wrap settings.
  - Consider `material.depthTest=false` on the caret to avoid micro z-offset juggling.

- **Timer cleanup**
  - Clear blink intervals and timeouts in `pause()`/`remove()` in addition to `blur()` to avoid leaks when scenes pause or inputs are removed.

## Usage Patterns
- **Programmatic value access**
  - The element defines a `value` property proxying the component attribute:
    - `el.value` gets current value.
    - `el.value = 'new'` updates the value and triggers rendering.

- **Integrating with a virtual keyboard**
  - On keyboard button press: call `focusedInput.appendString(char)`.
  - On backspace: call `focusedInput.deleteLast()`.
  - On enter: call `focusedInput.appendString('\n')` (blurs input).

## Building a New Form Field (Guidelines)
Use this architecture to build other fields (e.g., textarea, number input, select, toggles):

1. **Define a component with a clear schema**
   - Include visual knobs (colors, sizes), behavior flags (disabled), and content (value, placeholder).
   - Keep values serializable so they map cleanly to primitive attributes.

2. **Create a primitive for markup ergonomics**
   - `AFRAME.registerPrimitive('a-yourfield', { defaultComponents, mappings })`.
   - Map common attributes to your component’s schema for easy theming.

3. **Compose visual sub-entities**
   - Background: reuse `a-rounded` and expose width/height/radius/opacity.
   - Content: one or more `a-entity` with `text` for labels/value.
   - Interaction cues: caret, focus ring, or highlight planes at slightly higher z to ensure ordering.

4. **Event-driven update loop**
   - Recompute layout on:
     - `componentchanged` for your component’s attributes and for `text`.
     - `object3dset` on sub-entities when meshes appear.
     - `loaded` on sub-entities after you set attributes that create geometry.
   - Avoid `tick()` except for effects that truly require per-frame updates.

5. **Focus and input handling**
   - Expose `focus()`/`blur()` methods and emit `focus`/`blur` events.
   - Emit `change` with `detail` carrying the new value.
   - Optionally emit global events on `document.body` for cross-component coordination.

6. **Robust measurement**
   - Do not depend on non-public geometry fields. Prefer public events and, if you need metrics, integrate a text library that exposes them (e.g., Troika Text via an A-Frame wrapper) or maintain your own logical caret advances based on font metadata.

7. **Styling/theming**
   - Provide schema fields for colors, sizes, fonts, spacing, and stateful colors (focus/disabled/error).
   - Apply opacity directly on the visual primitives’ components (e.g., `rounded.opacity`).

8. **Performance hygiene**
   - Batch `setAttribute` calls and avoid redundant geometry rebuilds.
   - Debounce updates from rapid user input.
   - Clean up timers/listeners in `pause()`/`remove()`.

9. **Accessibility & UX**
   - Provide visible focus indication (color/border change).
   - Ensure adequate size for readability at target distances/scales.
   - Consider controller/hands interaction hitboxes larger than the visual element.

10. **Testing**
    - Verify behavior with different fonts and wrap widths.
    - Test in various transforms (rotations, scales) to ensure ordering and visibility.

## FAQ
- **Should I use `tick()` instead of `setTimeout(0)`?**
  - No. Prefer event-driven updates (`componentchanged`, `object3dset`, `loaded`) and use a one-shot `requestAnimationFrame` if you need to defer a single frame. `tick()` would waste cycles.

- **Can I rotate the input in 3D?**
  - Yes, it’s a standard entity. All child visuals follow the parent transform.

- **How do I theme it?**
  - Set attributes on `a-input` (colors, fonts, spacing, width) and on the background via mapped properties. For deeper customization, extend the schema to expose background height/radius.

## Dependencies
- Custom `a-rounded` primitive (`rounded` component) draws the background.
- A small `Event` helper is used internally to dispatch CustomEvents.
- A small `Utils` helper provides shallow cloning and width-factor computation.

## Summary
- The input field composes a rounded background, text, placeholder, and a blinking caret, using event-driven rendering of text and a measurement step to position the caret.
- For A-Frame 1.7.1, prefer public events over timers, apply background opacity directly, handle trailing spaces with logical advances, and harden lifecycle cleanup. These patterns carry over when building new form fields.
