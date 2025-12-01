# Datepicker (Dynamic SVG) – Implementation Plan

This document specifies a performant A‑Frame datepicker built with a single textured plane driven by a dynamically generated SVG (no canvas). It aligns with existing form control patterns (`a-input`, `a-textarea`) and the core architecture (event-driven updates, pooled resources, `FormManager`, `FormControlHelpers`, `AssetsRegistry`).

## Goals
- Low draw calls: render calendar as one textured plane (+ minimal overlays/hitboxes).
- Event-driven updates: re-generate SVG only on month/locale/theme changes; no `tick()`.
- Clean integration with forms and existing systems.
- Strong UX in VR: large hit targets, crisp text, clear selection states.

## Non-Goals (MVP)
- Range selection (start/end). (Phase 2)
- Year/month dropdowns or fast-scrolling pickers. (Phase 2)
- Non-Gregorian calendars. (Out-of-scope)

## Components

### `datepicker` (inline calendar)
A single entity rendering the current month’s calendar as a dynamic SVG texture on a plane, with hit testing to select a day.

- Primitive: `a-datepicker`
- Component: `datepicker`

#### Schema (MVP)
- Value & constraints
  - `value: string` — ISO `YYYY-MM-DD` (empty allowed)
  - `min: string` — ISO min date (inclusive)
  - `max: string` — ISO max date (inclusive)
  - `disabledDates: string[]` — ISO dates to disable (JSON string)
  - `weekStart: int` — 0=Sunday…6=Saturday (default 0)
  - `locale: string` — e.g., `en-US` (default `en-US`)
  - `disabled: boolean` — disable interaction (default false)
- Layout
  - `width: number` — visual width of the calendar plane (default 1.2)
  - `paddingX: number` — horizontal padding in SVG units (default 24)
  - `paddingY: number` — vertical padding in SVG units (default 24)
  - `cellGap: number` — gap between cells in SVG units (default 8)
- Styling (colors)
  - `bgColor: color` — calendar background (default `#FFFFFF`)
  - `gridColor: color` — grid lines (default `#E5E7EB`)
  - `dayTextColor: color` — active month days (default `#111827`)
  - `mutedTextColor: color` — other-month days (default `#9CA3AF`)
  - `disabledTextColor: color` — disabled dates (default `#9CA3AF`)
  - `weekdayTextColor: color` — weekday labels (default `#6B7280`)
  - `monthTextColor: color` — header (default `#111827`)
  - `selectionFill: color` — selected cell fill (default `#2563EB`)
  - `selectionTextColor: color` — selected text (default `#FFFFFF`)
  - `todayRingColor: color` — outline for today (default `#2563EB`)
- Typography
  - `fontFamily: string` — font family name (default `system-ui, -apple-system, Segoe UI, Roboto`)
  - `fontSizeMonth: number` — px (default 36)
  - `fontSizeWeekday: number` — px (default 20)
  - `fontSizeDay: number` — px (default 26)
- Background (outer container)
  - `backgroundColor: color` — outer rounded panel color (default `#FFF`)
  - `backgroundRadius: number` — outer corner radius (default 0.02)
  - `backgroundOpacity: number` — default 0.95
  - `backgroundHeight: number` — optional override
- Navigation
  - `navEnabled: boolean` — show prev/next hit targets (default true)

#### Events
- `focus` / `blur`
- `change` — detail: `{ value: 'YYYY-MM-DD' }`
- `invalid` — detail includes reason (e.g., out-of-range)

#### Methods
- `focus()`, `blur()`
- `setValue(isoDate)`, `clear()`
- `prevMonth()`, `nextMonth()`, `goTo(month, year)`

### `datefield` (optional, Phase 2)
A readonly `a-input` that opens a popup `a-datepicker` anchored beneath it.

- Adds: `open()`, `close()`, `openOnFocus`, `format` (display), and popup positioning (`popoverOffset`, `billboard`).

## Entity Structure
- Root `a-entity` with `datepicker`.
  - Optional outer background: `a-rounded` with width bound to component `width` and computed height.
  - Calendar plane: `a-plane` with material `map` set to Blob URL (dynamic SVG); size set to `width × autoHeight` preserving aspect ratio.
  - Hitbox plane: invisible `a-plane` matching calendar plane size to capture clicks (ensures `intersection.uv`).
  - Optional overlay quads for selection/today highlight to avoid re-uploading the base texture on every click (see Interaction).
  - Optional nav hit targets: small transparent planes on left/right of header.

## Dynamic SVG Rendering

### Coordinate System and Sizing
- SVG root attributes:
  - `viewBox="0 0 1024 768"` (example target resolution)
  - `width="1024" height="768"` to encourage crisp rasterization when decoded as an image.
- A‑Frame plane size:
  - Component `width` defines world width. Height scales by `height = width * (768/1024)` (or computed based on rows and paddings if you change the SVG canvas size).
- Internal layout regions (in SVG units):
  - Margins: `paddingX`, `paddingY`.
  - Header area (month + nav): `headerH` (e.g., 120).
  - Weekday row: `weekdayH` (e.g., 60).
  - Grid area height: `gridH = (svgH - paddingY*2 - headerH - weekdayH)`.
  - Rows: `rowCount` = 6 if the month needs 6 rows, else 5. `cellH = (gridH - cellGap*(rowCount-1)) / rowCount`.
  - Columns: `7` columns. `cellW = (svgW - paddingX*2 - cellGap*6) / 7`.

### Content
- Background rectangle for calendar (rounded if desired).
- Header month/year text centered.
- Weekday labels using `Intl.DateTimeFormat(locale, { weekday: 'short' })` adjusted for `weekStart`.
- 42 day cells (7×6); compute:
  - `firstWeekday` of the month (0..6), offset by `weekStart` → `startOffset` in [0..6].
  - `daysInMonth` and `daysInPrevMonth`.
  - For `i ∈ [0..41]`, compute `(row = Math.floor(i/7), col = i % 7)`
    - If `i < startOffset` → previous month day number.
    - Else if `i >= startOffset + daysInMonth` → next month day number.
    - Else → current month day number.
  - For each cell, decide styling class: `active`, `otherMonth`, `disabled`, `today`, `selected`.
- Draw the base grid once per month/locale/theme change.

### Font and Crispness Notes (No Canvas)
- Because the GPU finally samples a rasterized texture, ensure:
  - SVG root `width/height` at 1024×768 or 2048×1536 for sharper text.
  - Use standard font family names; avoid webfonts unless already loaded globally.
  - Prefer solid text colors (no filters) for better minification and mipmapping.

### Generation Flow
1. Build data model for the current month (see Month Math below).
2. Create SVG string with header, weekdays, and grid (with day numbers).
3. Generate a Blob (type `image/svg+xml`) and `URL.createObjectURL(blob)`.
4. Set calendar plane material `src` to the Blob URL.
5. Revoke previous Blob URLs to avoid leaks when replaced.

## Hit Testing and Day Mapping

### Picking Setup
- Always use an invisible `a-plane` hitbox co-located with the calendar plane (same size, position, rotation).
- On click, A‑Frame’s raycaster provides `intersection.uv` in [0,1]×[0,1]. Map UVs to SVG coordinates:
  - `xSvg = uv.x * svgW`
  - `ySvg = (1 - uv.y) * svgH` (UV origin is bottom-left in A‑Frame; adjust if needed)

### Mapping to Cell
1. Subtract padding: `x = xSvg - paddingX`, `y = ySvg - paddingY`.
2. If `y < headerH` → header nav hit zones:
   - Left nav rect: `[paddingX .. paddingX+navW] × [paddingY .. paddingY+headerH]`
   - Right nav rect: `[svgW-paddingX-navW .. svgW-paddingX] × [paddingY .. paddingY+headerH]`
3. Else if `y < headerH + weekdayH` → ignore (weekday row)
4. Else within grid:
   - `gridY = y - headerH - weekdayH`
   - `col = clamp(floor(x / (cellW + cellGap)), 0, 6)` with compensation for `cellGap`
   - `row = clamp(floor(gridY / (cellH + cellGap)), 0, rowCount-1)`
   - Translate `(row,col)` to day index `i = row*7 + col` → derive date as per Month Math.
5. Validate date against `min`, `max`, `disabledDates`. If invalid, emit `invalid` and play disabled sound (optional). Otherwise, update selection and emit `change`.

## Interaction and State Updates

- Base texture (SVG) is regenerated on:
  - Month navigation (`prevMonth`, `nextMonth`, `goTo`) or `locale`/`weekStart` changes.
  - Theme/typography changes affecting the base look.
  - User clicks that change selection: we will REGENERATE the SVG on every click to bake the `selected` and `today` visuals directly into the texture.

- Notes on this decision:
  - This simplifies implementation (no overlay planes) and guarantees visual consistency.
  - Texture uploads occur per click; in typical date selection flows, this is acceptable on desktop and Quest-class devices.
  - If future perf profiling shows regressions during rapid navigation, we may introduce overlay planes as an optimization in a later phase.

## Accessibility
- `role="grid"` on root; `aria-label` describes the calendar (e.g., “November 2025 Calendar”).
- When a date is selected, update an offscreen text or announce via events for screen readers if bridged.
- Focus management: visible focus state on the calendar, larger hit targets for cells.

## Internationalization (i18n)
- Use `Intl.DateTimeFormat(locale)` to generate:
  - Month name: `{ month: 'long', year: 'numeric' }`
  - Weekday labels: `{ weekday: 'short' }`, rotated by `weekStart`.
- `weekStart` defaults to 0 (Sunday). For locale defaults, consider a mapping table later.

## Month Math (Reference)
- `daysInMonth(y, m)`: 28/29/30/31.
- `firstWeekday(y, m)`: 0..6.
- `startOffset = (firstWeekday - weekStart + 7) % 7`.
- `rowCount = (startOffset + daysInMonth) > 35 ? 6 : 5`.
- `today`: compare with current system date.

## Form System Integration
- Assets: optional left/right chevron icons via `AssetsRegistry` (or draw as text/glyphs in SVG).
- Sounds: play click/disabled via `FormManager.playSound()` if available.
- Helpers: use `FormControlHelpers` for event binding tracking, ARIA setup, and cleanup.

## Performance Considerations
- Draw calls: base plane + hitbox ≈ 2 draws (no overlays in MVP).
- Texture uploads: on month/theme/locale changes and on each click that changes selection. Click frequency for a datepicker is low in practice; uploads are brief.
- Memory: keep only current texture and revoke previous Blob URLs. Optionally cache adjacent months (prev/next) if fast navigation is common.

## Component/Primitive Mapping (MVP)

Example primitive mapping (to be implemented in `src/datepicker/index.js`):

- `value` → `datepicker.value`
- `min` → `datepicker.min`
- `max` → `datepicker.max`
- `disabled-dates` → `datepicker.disabledDates` (JSON string)
- `week-start` → `datepicker.weekStart`
- `locale` → `datepicker.locale`
- `width` → `datepicker.width`
- `padding-x` → `datepicker.paddingX`
- `padding-y` → `datepicker.paddingY`
- `cell-gap` → `datepicker.cellGap`
- Colors and typography map one-to-one (e.g., `bg-color`, `grid-color`, `day-text-color`, …)
- Background mappings to `a-rounded`: `background-color`, `background-radius`, `background-opacity`, `background-height`

## Implementation Steps (Checklist)

1. Scaffolding
   - Create `src/datepicker/index.js`. Register `AFRAME.registerComponent('datepicker', ...)` and `AFRAME.registerPrimitive('a-datepicker', ...)`.
   - Define schema per spec above with sensible defaults.
   - Ensure assets via `AssetsRegistry.ensure(['button'])` if using icon images, or draw nav in SVG.
2. Children
   - Optional `a-rounded` background (width bound, height computed from SVG aspect ratio + margins).
   - Calendar `a-plane` for the SVG texture (`material` with `src` = Blob URL, `side: double`, `transparent: false`).
   - Hitbox `a-plane` with `opacity: 0` and identical transform for UV picking.
   - Optional overlay planes for `selection` and `today` (z-order above the calendar plane, `depthTest:false`).
3. Lifecycle
   - `init()`: bind methods, create children, compute current month model, `renderSvg()`, `applyTexture()`.
   - `update(oldData)`: detect changes to month/locale/theme/size; re-render SVG and/or reposition overlays.
   - `pause()/remove()`: unbind events, revoke Blob URLs, cleanup children.
4. Rendering
   - Implement `buildMonthModel(year, month, weekStart)` returning:
     - `firstWeekday`, `startOffset`, `daysInMonth`, `daysPrevMonth`, `rowCount`.
   - Implement `renderSvg(model, data)` returning the SVG string (header, weekdays, grid, day numbers, base styles).
   - Implement `applyTexture(svgString)`:
     - `const blob = new Blob([svgString], { type: 'image/svg+xml' })`
     - `const url = URL.createObjectURL(blob)`
     - `calendarPlane.setAttribute('material', 'src', url)`
     - Revoke previous URL after texture swap (store previous URL to revoke later).
5. Interaction
   - Click handlers on the hitbox plane: on `click`, read `evt.detail.intersection.uv`.
   - Map `uv → (row,col)` and determine actual date.
   - Validate against `min/max/disabledDates`.
   - Update `value`, move the `selection` overlay (or regenerate SVG if choosing Option B), emit `change`.
   - Handle nav zones (left/right header) to call `prevMonth()/nextMonth()`.
6. Accessibility
   - Set `role="grid"`, `aria-label` on root. Optionally manage `aria-live` announcements on selection.
7. Testing
   - Verify day mapping on multiple aspect ratios, rotations, and scales.
   - Locale switching (weekday order, month string).
   - Min/Max/disabled enforcement.
   - Performance: confirm low draw calls and minimal re-upload frequency.

## Example Usage

```html
<a-datepicker
  value="2025-11-04"
  width="1.4"
  week-start="0"
  locale="en-US"
  bg-color="#FFFFFF"
  grid-color="#E5E7EB"
  day-text-color="#111827"
  selection-fill="#2563EB"
  month-text-color="#111827"
  background-color="#FFF"
  background-opacity="0.95"
  background-radius="0.02"
  position="0 1.5 -1">
</a-datepicker>
```

## Risks & Mitigations
- **Per-click texture upload**: Acceptable for typical usage. If profiling reveals issues during rapid navigation, consider introducing overlay planes for selection/today in a later optimization.
- **Text crispness**: Use 1024×768 (or 2048×1536) SVG dimensions; avoid excessive scaling of the plane; keep it frontal when possible.
- **Fonts**: Use commonly available system families; avoid late-loading webfonts.
- **UV mapping edge cases**: Carefully handle `cellGap` in hit testing; clamp indices to [0..6], [0..rowCount-1].

## Phase 2 (Optional)
- `datefield` popup anchored to an `a-input`.
- Range selection mode, hover states, keyboard navigation.
- Nav month/year pickers and simple animations.

---

Summary: The dynamic SVG datepicker renders a full calendar as a single texture on a plane for minimal draw calls and uses UV-based hit mapping for interaction. It updates only on meaningful state changes, integrates with existing systems, and remains flexible for theming and i18n without canvas or per-day 3D text.
