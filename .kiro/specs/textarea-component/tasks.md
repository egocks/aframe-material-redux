# Implementation Plan

- [x] 1. Set up component scaffolding and registration
  - Create `src/textarea/index.js` file with basic A-Frame component structure
  - Register `textarea` component with complete schema definition including all properties (value, layout, styling, cursor, background, wrapping, selection)
  - Register `a-textarea` primitive with full attribute mappings to component properties
  - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 10.1, 10.2_

- [x] 2. Implement child entity creation and basic structure
  - Create `init()` method that builds entity hierarchy (background, content text, placeholder, caret, measurement entity)
  - Set up `a-rounded` background with proper z-positioning (0.001) and initial sizing
  - Create content and placeholder text entities with proper z-positioning (0.002)
  - Create caret plane entity with proper z-positioning (0.003)
  - Create hidden measurement entity for font metrics calculation
  - _Requirements: 1.2, 1.3, 9.1, 9.2, 10.3_

- [x] 3. Implement focus and blur functionality
  - Add click event listener to handle focus on textarea click
  - Implement `focus()` method that sets focus state, shows caret, and emits events
  - Implement `blur()` method that removes focus state, hides caret, and emits events
  - Add disabled state checking to prevent focus when disabled
  - Emit local `focus`/`blur` events and global `didfocustextarea`/`didblurtextarea` events
  - _Requirements: 2.1, 2.5, 2.6, 5.1, 5.2, 5.4, 5.5_

- [x] 4. Create value property proxy and basic text input methods
  - Implement `value` getter/setter property on element for API parity with a-input
  - Create `appendString()` method that adds text at cursor position and handles newlines
  - Create `deleteLast()` method that removes last character
  - Create `insertAtCursor()` method for future text insertion functionality
  - Emit `input` and `change` events when value changes
  - _Requirements: 2.2, 2.3, 2.4, 5.3, 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_

- [x] 5. Implement monospaced font measurement system
  - Create measurement entity setup in `init()` with hidden text component
  - Implement character width calculation using "MMMMMMMMMM" measurement string
  - Add event listeners for `loaded` and `object3dset` events on measurement entity
  - Cache character width and derived metrics (charsPerLine, visibleLines)
  - Implement metric recalculation when font, width, or height changes
  - _Requirements: 7.1, 7.2, 7.4, 4.1, 4.2, 4.4_

- [x] 6. Build text wrapping and layout engine
  - Implement soft wrapping algorithm that preserves newlines and wraps by character count
  - Create line parsing logic that splits text into logical and visual lines
  - Implement caret position calculation mapping character index to (line, column) coordinates
  - Add support for `wrap` modes: "soft" (default), "off" (no wrapping)
  - Calculate visual caret position using `paddingX + columnIndex * charWidth` formula
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Implement caret rendering and blinking behavior
  - Set caret height to `lineHeight` by default, with `cursorHeight` override support
  - Position caret at calculated coordinates with proper baseline alignment
  - Implement blink interval system with configurable `blinkRate`
  - Add blink pause functionality during typing with resume timer
  - Ensure caret visibility management during focus/blur state changes
  - _Requirements: 9.3, 9.4, 7.3_

- [x] 8. Create text content rendering and placeholder system
  - Implement `updateText()` method that applies text content to content entity
  - Set up placeholder visibility toggle based on empty value state
  - Apply text styling properties (color, font, letterSpacing, align, side)
  - Handle `maxLength` enforcement by truncating text content
  - Position text entities with proper padding offsets
  - _Requirements: 9.1, 9.2, 3.6, 9.5_

- [x] 9. Implement background rendering and theming
  - Map background properties directly to `a-rounded` component (color, opacity, radius, height)
  - Set background width to match textarea width and height to match textarea height
  - Position background with proper z-offset and centering
  - Apply `backgroundHeight` override when specified (non-zero value)
  - Ensure background opacity is applied directly to rounded component
  - _Requirements: 3.4, 3.5, 1.3, 9.6_

- [x] 10. Add event-driven update lifecycle
  - Implement `update()` method that responds to component attribute changes
  - Add `componentchanged` event listeners for textarea and text components
  - Use `requestAnimationFrame` for deferred layout updates instead of `setTimeout(0)`
  - Implement debounced text updates during rapid typing to prevent excessive geometry rebuilds
  - Ensure updates only trigger when necessary (value, layout, or style changes)
  - _Requirements: 7.1, 7.2, 7.4, 7.5, 10.4_

- [x] 11. Implement proper cleanup and lifecycle management
  - Add timer cleanup in `pause()` method (blink interval, blink timer, update RAF)
  - Add timer cleanup in `remove()` method with proper interval clearing
  - Remove event listeners and references during component removal
  - Ensure no memory leaks from cached entities or measurement objects
  - Test component removal and re-addition scenarios
  - _Requirements: 7.5, 10.3_

- [x] 12. Add comprehensive error handling and validation
  - Implement input validation for `maxLength` with early truncation
  - Add disabled and readonly state enforcement in input methods
  - Handle font loading failures with graceful fallback to default font
  - Add geometry creation error handling with retry logic
  - Validate event data and prevent invalid state transitions
  - _Requirements: 2.6, 3.6, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13. Create integration with existing keyboard system
  - Test textarea component with existing `a-keyboard` component
  - Verify `appendString()` and `deleteLast()` methods work with virtual keyboard input
  - Ensure Enter key inserts newline instead of blurring (different from a-input behavior)
  - Test focus management when multiple input components are present
  - Verify global event emission works correctly for keyboard integration
  - _Requirements: 2.2, 2.3, 8.3, 8.4_

- [ ] 14. Add textarea to demo page
  - Update `index.html` to include textarea component script
  - Add `<a-textarea>` element to the demo scene with sample configuration
  - Position textarea alongside existing form components
  - Configure textarea with placeholder text, styling, and dimensions appropriate for demo
  - Test textarea functionality in the complete demo environment
  - _Requirements: 8.1, 8.2, 8.5_

- [ ] 15. Write component documentation and usage examples
  - Create usage documentation showing basic textarea implementation
  - Document all available attributes and their effects
  - Provide code examples for common use cases (basic text input, styled textarea, integration with keyboard)
  - Document event handling and method usage
  - Add troubleshooting guide for common issues
  - _Requirements: 8.1, 8.2, 8.5_