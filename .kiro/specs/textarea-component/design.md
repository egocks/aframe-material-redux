# Design Document

## Overview

The textarea component (`a-textarea`) will be implemented as a multiline text input field for A-Frame scenes, following the same architectural patterns as the existing `a-input` component. The design emphasizes event-driven updates, proper 3D rendering layering, and seamless integration with A-Frame's component system.

The component will consist of a main `textarea` component and an `a-textarea` primitive that provides HTML-like attribute mapping for ease of use. The implementation will support text wrapping, scrolling, and all the visual feedback expected from a modern text input interface.

## Architecture

### Component Structure

The textarea follows A-Frame's entity-component-system (ECS) architecture:

- **Main Component**: `textarea` - handles all logic, state management, and rendering
- **Primitive**: `a-textarea` - provides declarative HTML attribute mapping
- **Child Entities**: Background, text content, placeholder, caret, and selection highlights

### Entity Hierarchy

```
a-textarea (root entity)
├── a-rounded (background)
├── a-entity (content text)
├── a-entity (placeholder text)  
├── a-plane (caret/cursor)
└── a-entity[] (selection highlight pool - future)
```

### Rendering Layers (Z-positioning)

To ensure proper visual ordering without z-fighting:

- Background: `z = 0.001`
- Selection highlights: `z = 0.0025` (future)
- Text content: `z = 0.002`
- Caret: `z = 0.003`

## Components and Interfaces

### Primitive Attribute Mappings

The `a-textarea` primitive provides HTML-like attribute mapping to the `textarea` component:

```javascript
mappings: {
  // Value and behavior
  value: 'textarea.value',
  name: 'textarea.name',
  disabled: 'textarea.disabled',
  readonly: 'textarea.readonly',
  'max-length': 'textarea.maxLength',
  
  // Layout
  width: 'textarea.width',
  height: 'textarea.height',
  'padding-x': 'textarea.paddingX',
  'padding-y': 'textarea.paddingY',
  'line-height': 'textarea.lineHeight',
  
  // Text styling
  color: 'textarea.color',
  font: 'textarea.font',
  'letter-spacing': 'textarea.letterSpacing',
  align: 'textarea.align',
  side: 'textarea.side',
  
  // Placeholder
  placeholder: 'textarea.placeholder',
  'placeholder-color': 'textarea.placeholderColor',
  
  // Cursor
  'cursor-width': 'textarea.cursorWidth',
  'cursor-height': 'textarea.cursorHeight',
  'cursor-color': 'textarea.cursorColor',
  'blink-rate': 'textarea.blinkRate',
  
  // Background (pass-through to a-rounded)
  'background-color': 'textarea.backgroundColor',
  'background-opacity': 'textarea.backgroundOpacity',
  'background-radius': 'textarea.backgroundRadius',
  'background-height': 'textarea.backgroundHeight',
  
  // Wrapping & scrolling
  wrap: 'textarea.wrap',
  'wrap-count': 'textarea.wrapCount',
  scroll: 'textarea.scroll',
  'max-rows': 'textarea.maxRows',
  
  // Selection
  'selection-color': 'textarea.selectionColor',
  'selection-opacity': 'textarea.selectionOpacity',
}
```

### Schema Definition

```javascript
schema: {
  // Value and behavior
  value: { type: "string", default: "" },
  name: { type: "string", default: "" },
  disabled: { type: "boolean", default: false },
  readonly: { type: "boolean", default: false },
  maxLength: { type: "int", default: 0 },
  
  // Layout
  width: { type: "number", default: 1.8 },
  height: { type: "number", default: 0.9 },
  paddingX: { type: "number", default: 0.021 },
  paddingY: { type: "number", default: 0.021 },
  lineHeight: { type: "number", default: 0.12 },
  
  // Text styling
  color: { type: "color", default: "#000" },
  font: { type: "string", default: "" },
  letterSpacing: { type: "int", default: 0 },
  align: { type: "string", default: "left" },
  side: { type: "string", default: "front" },
  
  // Placeholder
  placeholder: { type: "string", default: "" },
  placeholderColor: { type: "color", default: "#AAA" },
  
  // Cursor
  cursorWidth: { type: "number", default: 0.01 },
  cursorHeight: { type: "number", default: 0 }, // 0 = derive from lineHeight
  cursorColor: { type: "color", default: "#007AFF" },
  blinkRate: { type: "number", default: 500 },
  
  // Background
  backgroundColor: { type: "color", default: "#FFF" },
  backgroundOpacity: { type: "number", default: 1 },
  backgroundRadius: { type: "number", default: 0.01 },
  backgroundHeight: { type: "number", default: 0 }, // 0 = use height
  
  // Wrapping & scrolling
  wrap: { type: "string", default: "soft" }, // soft|hard|off
  wrapCount: { type: "int", default: 0 }, // auto-calculated if 0
  scroll: { type: "boolean", default: true },
  maxRows: { type: "int", default: 0 }, // 0 = no row limit
  
  // Selection
  selectionColor: { type: "color", default: "#007AFF" },
  selectionOpacity: { type: "number", default: 0.3 },
}
```

### Public Methods

The component will expose these methods on the element:

```javascript
// Focus management
el.focus() // Focus the textarea and start caret blinking
el.blur()  // Blur the textarea and stop caret blinking

// Text manipulation
el.appendString(text)     // Append text at cursor position
el.deleteLast()          // Delete last character
el.insertAtCursor(text)  // Insert text at cursor position

// Selection (future enhancement)
el.setSelection(start, end) // Set selection range
el.selectAll()             // Select all text

// Scrolling (future enhancement)  
el.ensureCaretVisible()    // Scroll to show caret
el.setScrollTop(lineIndex) // Scroll to specific line
```

### Value Property Proxy

For API parity with `a-input`, the element will expose a `value` property:

```javascript
Object.defineProperty(this.el, 'value', {
  get: function() { return this.getAttribute('value'); },
  set: function(value) { this.setAttribute('value', value); },
  enumerable: true,
  configurable: true
});
```

### Events Emitted

```javascript
// Focus events
'focus' // When textarea gains focus
'blur'  // When textarea loses focus

// Value change events
'input'  // On every character change (detail: {value})
'change' // Alias for input for compatibility (detail: {value})

// Global events (on document.body)
'didfocustextarea' // Global focus notification (detail: element)
'didblurtextarea'  // Global blur notification (detail: element)

// Future enhancements
'selectionchange' // When selection changes (detail: {start, end})
'scroll'         // When scrolling occurs (detail: {firstVisibleLine, scrollTop})
```

### Global Event Naming Convention

The component follows the existing `a-input` pattern for global events:
- `didfocustextarea` - emitted when textarea gains focus
- `didblurtextarea` - emitted when textarea loses focus

This maintains consistency with the existing `didfocusinput`/`didblurinput` events from `a-input`.

## Data Models

### Internal State

```javascript
{
  // Focus and interaction state
  isFocused: boolean,
  
  // Text layout state
  lines: string[],           // Wrapped lines array
  charWidth: number,         // Character width for monospaced fonts
  charsPerLine: number,      // Characters that fit per line
  visibleLines: number,      // Lines visible in viewport
  
  // Cursor state
  cursorPosition: number,    // Character index in full text
  cursorLine: number,        // Line index of cursor
  cursorColumn: number,      // Column index within line
  
  // Scrolling state (future)
  firstVisibleLine: number,  // Top visible line index
  
  // Selection state (future)
  selectionStart: number,    // Selection start character index
  selectionEnd: number,      // Selection end character index
  
  // Timers and intervals
  blinkInterval: number,     // Caret blink timer ID
  blinkTimer: number,        // Timeout for resuming blink after typing
  updateRaf: number,         // RequestAnimationFrame ID for deferred updates
  
  // Cached measurements
  measurementEntity: Element, // Hidden entity for font measurements
  cachedMetrics: {           // Cached layout calculations
    charWidth: number,
    charsPerLine: number,
    visibleLines: number,
    lastFont: string,
    lastWidth: number,
    lastHeight: number,
  }
}
```

### Background Pass-through Mapping

The textarea component directly maps background properties to the `a-rounded` child:

```javascript
// Direct mappings to a-rounded component
backgroundColor → rounded.color
backgroundOpacity → rounded.opacity  
backgroundRadius → rounded.radius
backgroundHeight → rounded.height (or use height if backgroundHeight = 0)
width → rounded.width
```

### Caret Behavior Specification

**Height and Positioning:**
- Caret height equals `lineHeight` by default
- If `cursorHeight > 0`, use that value instead
- Vertical position aligns to current visual line baseline
- Horizontal position: `paddingX + columnIndex * charWidth`

**Blinking Lifecycle:**
- Start blinking when focused (500ms interval by default)
- Pause blinking while typing (show solid caret)
- Resume blinking after 50ms idle period
- Stop blinking when blurred
- Clear all timers in `pause()` and `remove()` methods

### Text Layout Model

The component will use a line-based layout model:

1. **Text Parsing**: Split input value by `\n` to get logical lines
2. **Wrapping**: Apply wrapping rules to create visual lines
3. **Positioning**: Calculate character and line positions for rendering
4. **Caret Mapping**: Map cursor position to visual coordinates

### Measurement Strategies

**MVP (Monospaced Method):**
- Create hidden measurement entity in `init()`
- Set measurement entity text to `"MMMMMMMMMM"` (10 characters)
- After `loaded`/`object3dset` events, measure width and divide by 10
- Cache `charWidth` until font or size changes
- Compute derived metrics:
  - `charsPerLine = floor((width - 2*paddingX) / charWidth)`
  - `visibleLines = floor((height - 2*paddingY) / lineHeight)`

**Advanced (Proportional Fonts):**
- Option A: Integrate `troika-three-text` for reliable glyph metrics
- Option B: Use measurement entity with substrings:
  - Set measurement text to substring up to caret/selection boundary
  - Measure width after `loaded`/`object3dset` events
  - Cache results per line/chunk to reduce recomputation
  - Avoid relying on internal fields like `visibleGlyphs`

### Scrolling Behavior

**When `scroll = true`:**
- Maintain `firstVisibleLine` state (0-based index)
- Render full text content but clip selection highlights to viewport
- `ensureCaretVisible()` adjusts `firstVisibleLine` when caret moves outside viewport
- Emit `scroll` events with `{firstVisibleLine, scrollTop}` detail

**When `scroll = false`:**
- No scroll state changes
- Caret may move offscreen (developer choice)
- All content remains visible (may extend beyond height)

### Selection Visual Implementation

**Highlight Geometry:**
- Pool of `a-plane` entities at `z ≈ 0.0025` (between background and text)
- Each plane sized: `width = selectedChars * charWidth`, `height = lineHeight`
- Color and opacity controlled by `selectionColor` and `selectionOpacity` schema
- Reuse pooled planes instead of creating/destroying for performance

## Error Handling

### Input Validation

- **Max Length**: Truncate input when `maxLength` is exceeded
- **Invalid Characters**: Filter out unsupported characters (if any)
- **Disabled State**: Ignore all input when `disabled = true`
- **Readonly State**: Allow focus but prevent text changes when `readonly = true`

### Rendering Errors

- **Font Loading**: Graceful fallback to default font if custom font fails
- **Geometry Errors**: Retry text rendering with simplified content if geometry creation fails
- **Measurement Failures**: Use fallback character width calculations

### Event Handling

- **Missing Elements**: Check for child entity existence before manipulation
- **Timer Cleanup**: Ensure all intervals and timeouts are cleared on component removal
- **Memory Leaks**: Proper cleanup of event listeners and references

## Testing Strategy

### Unit Testing

1. **Component Lifecycle**
   - Test init, update, pause, remove methods
   - Verify proper child entity creation and cleanup
   - Test schema validation and default values

2. **Text Layout**
   - Test wrapping algorithms with various text lengths
   - Verify caret positioning accuracy
   - Test line height and character width calculations

3. **Event Handling**
   - Test focus/blur state management
   - Verify event emission with correct detail data
   - Test method calls and their effects

### Integration Testing

1. **A-Frame Integration**
   - Test with different A-Frame versions
   - Verify compatibility with other components
   - Test in various scene configurations

2. **Performance Testing**
   - Test with large text content (1000+ characters)
   - Measure update performance during rapid typing
   - Verify no memory leaks during extended use

3. **Visual Testing**
   - Test rendering in different 3D transforms
   - Verify z-ordering and visual layering
   - Test with various fonts and styling options

### User Acceptance Testing

1. **Interaction Testing**
   - Test with virtual keyboards
   - Test with controller input
   - Test focus management in complex scenes

2. **Font and Layout Testing**
   - Test monospaced vs proportional fonts
   - Test extremely long lines (1000+ characters)
   - Test trailing spaces at end of lines
   - Test rapid edits while scrolling
   - Test various `lineHeight` and `paddingX/Y` values

3. **Accessibility Testing**
   - Test with screen readers (where applicable)
   - Verify adequate visual contrast
   - Test keyboard navigation
   - Ensure focus indicators are clearly visible

## Implementation Phases

### Phase 1: Core MVP (Monospaced)

**Scope**: Basic multiline input with monospaced font support

**Components**:
- Component registration and schema definition
- Child entity creation (background, text, placeholder, caret)
- Basic focus/blur functionality
- Text input and display
- Simple wrapping algorithm
- Caret positioning and blinking
- Event emission

**Deliverables**:
- Working `textarea` component
- `a-textarea` primitive with attribute mapping
- Basic documentation and examples

### Phase 2: Enhanced Layout

**Scope**: Improved text handling and visual features

**Components**:
- Proportional font support (optional)
- Selection highlighting
- Improved wrapping algorithms
- Better caret positioning
- Visual state indicators (focus, disabled)

**Deliverables**:
- Enhanced text measurement
- Selection visual feedback
- Improved user experience

### Phase 3: Advanced Features

**Scope**: Scrolling and advanced interaction

**Components**:
- Vertical scrolling support
- Scrollbar visualization
- Keyboard navigation (arrows, page up/down)
- Performance optimizations

**Deliverables**:
- Full-featured textarea component
- Comprehensive documentation
- Performance benchmarks

## Performance Considerations

### Event-Driven Updates

- Use `componentchanged`, `object3dset`, and `loaded` events instead of `tick()`
- Implement `requestAnimationFrame` for deferred operations instead of `setTimeout(0)`
- Debounce rapid text updates to prevent excessive geometry rebuilds

### Memory Management

- Pool selection highlight entities for reuse
- Clear all timers and intervals in `pause()` and `remove()`
- Remove event listeners and references during cleanup

### Rendering Optimization

- Minimize `setAttribute('text', ...)` calls
- Cache calculated metrics (character width, line height)
- Use efficient text measurement strategies
- Avoid unnecessary visibility toggles

### Text Geometry Optimization

- Batch text updates when possible
- Use monospaced fonts for predictable layout
- Consider text texture caching for static content
- Implement lazy rendering for off-screen content (future)

## Security Considerations

### Input Sanitization

**Scope**: Basic text validation for VR/AR context
- Validate and sanitize text input to prevent XSS-like attacks in web contexts
- Enforce maximum length limits to prevent memory exhaustion
- Filter potentially harmful characters or sequences (configurable)

**Out of Scope**: 
- Complex input validation (leave to application layer)
- Server-side validation (client-side component only)

### Event Security

- Validate event data before processing
- Prevent event spoofing through proper event source validation
- Limit event emission frequency to prevent DoS

## Accessibility

### Visual Accessibility Targets

**Focus Indicators:**
- Clear visual distinction when textarea is focused
- High contrast caret that's visible against background
- Optional focus ring or border highlight

**Color Contrast:**
- Ensure text meets WCAG AA contrast ratios against background
- Provide theme support for high contrast modes
- Make placeholder text distinguishable but not distracting

**Responsive Design:**
- Support various viewing distances in VR/AR
- Ensure text remains readable at different scales
- Provide adequate touch/interaction targets for controllers

## Accessibility

### Visual Accessibility

- Ensure adequate color contrast for text and background
- Provide clear focus indicators
- Support high contrast themes through CSS custom properties

### Interaction Accessibility

- Support keyboard navigation where applicable
- Provide clear visual feedback for all states
- Ensure component works with assistive technologies

## Browser and Platform Compatibility

### A-Frame Compatibility

- Target A-Frame 1.7.1+ for optimal performance
- Maintain backward compatibility where possible
- Test with WebXR-enabled browsers

### Device Support

- Optimize for VR/AR headsets
- Support desktop and mobile browsers
- Test with various input methods (controllers, hands, mouse)

## Migration and Upgrade Path

### From Existing Input Component

- Maintain API compatibility where possible
- Provide migration guide for attribute changes
- Support gradual adoption in existing projects

### Future Enhancements

- Design extensible architecture for future features
- Maintain backward compatibility in schema changes
- Provide clear upgrade documentation