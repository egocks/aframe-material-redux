# Slider Component Design Document

## Overview

The slider component (`a-slider`) is a 3D interactive value selection control for A-Frame scenes that allows users to select numeric values within a defined range. It follows the established architectural patterns of existing form controls and integrates with the FormControlHelpers and FormManager systems for consistent behavior, accessibility, and audio feedback.

The component consists of a horizontal track with an active portion, a draggable thumb, optional tick marks, and an optional value display bubble. It supports multiple interaction methods including mouse, touch, VR controllers, and keyboard navigation.

## Architecture

### Component Structure
- **Primary Component**: `slider` - Core functionality and state management
- **Primitive Wrapper**: `a-slider` - HTML-like attribute interface
- **Integration Layer**: FormControlHelpers and FormManager integration
- **Asset Management**: Shared sound assets through FormManager

### Entity Hierarchy
```
a-slider (root entity)
├── track (a-rounded) - Base track background
├── activeTrack (a-rounded) - Filled portion overlay  
├── marksContainer (a-entity) - Container for tick marks
│   └── mark_N (a-plane/a-circle) - Individual tick marks
├── thumb (a-circle) - Draggable handle
├── focusRing (a-ring) - Focus indicator
├── valueBubble (a-entity) - Value display container
│   ├── bubbleBackground (a-rounded) - Bubble background
│   ├── bubblePointer (a-plane) - Small triangle pointer
│   └── bubbleText (a-entity[text]) - Numeric value display
└── hitbox (a-plane) - Transparent interaction area
```

## Components and Interfaces

### Core Component Schema
```javascript
{
  // Value & Range
  min: { type: 'number', default: 0 },
  max: { type: 'number', default: 100 },
  step: { type: 'number', default: 1 },
  value: { type: 'number', default: 0 },
  name: { type: 'string', default: '' },
  disabled: { type: 'boolean', default: false },
  readonly: { type: 'boolean', default: false },

  // Layout & Visuals
  width: { type: 'number', default: 1.8 },
  trackHeight: { type: 'number', default: 0.06 },
  thumbRadius: { type: 'number', default: 0.09 },
  trackColor: { type: 'color', default: '#C7B8FF' },
  activeTrackColor: { type: 'color', default: '#6730FF' },
  thumbColor: { type: 'color', default: '#6230FF' },
  focusRingColor: { type: 'color', default: '#007AFF' },
  opacity: { type: 'number', default: 1 },

  // Marks & Bubble
  marks: { default: 'auto' }, // boolean|number[]|'auto'
  markColor: { type: 'color', default: '#FFFFFF' },
  markSize: { type: 'number', default: 0.012 },
  showValueBubble: { type: 'boolean', default: true },
  format: { type: 'string', default: '' }, // string template or function

  // Accessibility
  ariaLabel: { type: 'string', default: '' },
  tabIndex: { type: 'int', default: 0 },

  // Sound Effects
  soundEnabled: { type: 'boolean', default: true },
  sfxSlideStart: { type: 'string', default: '#aframeSliderStart' },
  sfxSlideEnd: { type: 'string', default: '#aframeSliderEnd' },
  sfxTick: { type: 'string', default: '#aframeSliderTick' }
}
```

### Primitive Mappings
The `a-slider` primitive maps HTML-style attributes to component properties:
- `min` → `slider.min`
- `max` → `slider.max` 
- `step` → `slider.step`
- `value` → `slider.value`
- `track-color` → `slider.trackColor`
- `active-track-color` → `slider.activeTrackColor`
- `thumb-color` → `slider.thumbColor`
- `show-value-bubble` → `slider.showValueBubble`
- And all other kebab-case to camelCase conversions

### Public Methods
```javascript
// Focus management
element.focus()
element.blur()

// Value manipulation  
element.setValue(number) // Clamps, snaps, updates visuals
element.increment(delta?) // Add by delta or step
element.decrement(delta?) // Subtract by delta or step

// Utility
element.value // Getter/setter proxy for current value
```

### Events Emitted
```javascript
// Focus events
'focus' // { target: element }
'blur' // { target: element }

// Value events  
'input' // { detail: { value } } - During interaction
'change' // { detail: { value } } - On commit

// Interaction events
'slidestart' // { detail: { value } } - Interaction begins
'slide' // { detail: { value } } - During drag
'slideend' // { detail: { value } } - Interaction ends

// Global events (optional)
'didfocusslider' // On document.body
'didblurslider' // On document.body
```

## Data Models

### Internal State
```javascript
{
  // Interaction state
  isFocused: boolean,
  isDragging: boolean,
  
  // Computed values
  valueNow: number, // Clamped and snapped current value
  stepList: number[], // Derived mark positions when marks enabled
  
  // Layout cache
  thumbX: number, // Computed thumb position
  dragStartX: number, // Initial drag position
  keyboardStep: number, // Derived from step with minimum threshold
  
  // Visual references
  track: Entity,
  activeTrack: Entity, 
  thumb: Entity,
  focusRing: Entity,
  valueBubble: Entity,
  hitbox: Entity,
  marksContainer: Entity,
  marks: Entity[] // Pool of mark elements
}
```

### Value Mapping Algorithm
```javascript
// Position to value
function positionToValue(localX, width, min, max, step) {
  const t = Math.max(0, Math.min(1, localX / width));
  const raw = min + t * (max - min);
  return roundToStep(raw, step);
}

// Value to position  
function valueToPosition(value, min, max, width) {
  const t = (value - min) / (max - min);
  return t * width;
}

// Step rounding with epsilon handling
function roundToStep(value, step) {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}
```

## Error Handling

### Input Validation
- **Value Clamping**: All values are automatically clamped to [min, max] range
- **Step Snapping**: Values are snapped to nearest step increment with epsilon tolerance
- **Parameter Validation**: Invalid min/max/step combinations are corrected (e.g., min > max swaps values)
- **Type Coercion**: String numeric inputs are parsed to numbers with fallback to defaults

### Interaction Edge Cases
- **Disabled State**: All interactions are blocked, visual feedback provided
- **Readonly State**: Focus allowed but value changes prevented
- **Rapid Updates**: RequestAnimationFrame throttling prevents performance issues
- **Missing Dependencies**: Graceful degradation when FormManager/FormControlHelpers unavailable

### Error Reporting
```javascript
// Through FormManager if available
if (this.formManager) {
  this.formManager.reportError(this.el, 'validation', message);
}

// Fallback to console warnings
console.warn('a-slider:', message);
```

## Testing Strategy

### Unit Tests
- **Value Logic**: Clamping, snapping, step calculations
- **Position Mapping**: Coordinate transformations, boundary conditions
- **Event Emission**: Proper event timing and payload structure
- **State Management**: Focus, drag, and interaction state transitions

### Integration Tests  
- **FormManager Integration**: Sound playback, error reporting, form data collection
- **FormControlHelpers Integration**: Initialization, cleanup, accessibility features
- **A-Frame Lifecycle**: Component initialization, updates, cleanup
- **Cross-browser Compatibility**: Mouse, touch, and keyboard interactions

### Visual Tests
- **Rendering**: Track, thumb, marks positioning at various configurations
- **Theming**: Color, size, opacity applications
- **Focus States**: Focus ring visibility and styling
- **Disabled States**: Visual dimming and interaction blocking

### Performance Tests
- **Rapid Interaction**: High-frequency drag operations
- **Multiple Instances**: Many sliders in single scene
- **Mark Rendering**: Large numbers of tick marks
- **Memory Leaks**: Event listener and timer cleanup

### Accessibility Tests
- **ARIA Attributes**: Proper role and value announcements
- **Keyboard Navigation**: All keyboard shortcuts functional
- **Focus Management**: Tab order and focus indicators
- **Screen Reader**: Compatible with assistive technologies

## Implementation Notes

### Lifecycle Management
```javascript
// Event-driven updates (no tick())
init() {
  FormControlHelpers.initFormControl(this);
  this.createVisualElements();
  this.setupEventListeners();
}

update(oldData) {
  this.updateDerivedState();
  this.updateVisuals();
  this.updateAccessibility();
}

pause() {
  this.cleanupTimers();
  this.removeEventListeners();
}

remove() {
  FormControlHelpers.cleanup(this);
  this.cleanupResources();
}
```

### Performance Optimizations
- **Mark Pooling**: Reuse mark elements instead of create/destroy
- **RAF Throttling**: Batch visual updates during rapid interactions
- **Selective Updates**: Only update changed visual properties
- **Event Delegation**: Minimize event listener overhead

### Integration Patterns
```javascript
// FormControlHelpers integration
FormControlHelpers.initFormControl(this);
FormControlHelpers.setupAccessibility(this, 'slider');
FormControlHelpers.handleKeyboard(this, this.keyboardHandlers);

// FormManager integration  
if (this.formManager) {
  this.formManager.registerControl(this);
  this.formManager.playSound(this.data.sfxSlideStart);
}
```

### Z-Order Management
- Track: z = 0.001
- Active Track: z = 0.002  
- Marks: z = 0.003
- Thumb: z = 0.004
- Focus Ring: z = 0.004 (same as thumb, slightly larger)
- Value Bubble: z = 0.005
- Hitbox: z = 0.000 (behind everything for interaction)

This layered approach ensures proper visual ordering while maintaining interaction capabilities.