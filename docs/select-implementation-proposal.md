# Select Component (a-select) – Implementation Proposal

This document proposes the implementation of a dropdown select field component for A-Frame, following the architectural patterns established by `a-input`, `a-textarea`, `a-radio`, and `a-checkbox` components.

## Overview

A 3D dropdown select component that displays a selected value in a closed state (similar to `a-input`), expands to show a list of options when activated, supports single selection with change events, integrates with the form system, and follows event-driven architecture (no polling).

## Goals

- **Single selection UI**: Click to open, select an option, auto-close
- **Form integration**: Works with `a-form` for data collection
- **Keyboard support**: Navigable via arrow keys, enter to select
- **Event-driven updates**: No `tick()` or polling patterns (following a-input/textarea patterns)
- **Accessibility**: ARIA support for screen readers and VR controllers
- **Theming**: Configurable colors, sizes, fonts, spacing
- **Performance**: Efficient rendering, event object pooling, cached measurements
- **Shared resources**: Uses FormManager, sound pool, event pool (following radio/checkbox improvements)

## Non-Goals (Initial MVP)

- Multi-select mode (future enhancement)
- Option groups/categories (future enhancement)
- Search/filter within options (future enhancement)
- Custom option rendering (HTML-like templates)

## UX Behavior

### Closed State
- Displays selected option value (or placeholder if none selected)
- Shows dropdown indicator icon (▼)
- Click/tap to open options list
- Keyboard focus indicator when focused

### Open State
- Expands below (or above if insufficient space) to show options
- Highlights hovered option
- Current selection indicated with checkmark
- Click option to select and close
- Click outside or Escape to close without selection

## Public API

### Component Schema

```javascript
schema: {
  // Value and behavior
  value: { type: 'string', default: '' },
  name: { type: 'string', default: '' },
  disabled: { type: 'boolean', default: false },
  options: { type: 'array', default: [] }, // [{value, label}, ...]
  
  // Layout
  width: { type: 'number', default: 1.2 },
  maxHeight: { type: 'number', default: 1.5 },
  optionHeight: { type: 'number', default: 0.18 },
  
  // Text styling (mirror a-input)
  color: { type: 'color', default: '#111' },
  font: { type: 'string', default: '' },
  letterSpacing: { type: 'int', default: 0 },
  align: { type: 'string', default: 'left' },
  
  // Placeholder
  placeholder: { type: 'string', default: 'Select an option' },
  placeholderColor: { type: 'color', default: '#AAA' },
  
  // Background (mirror a-input/textarea)
  backgroundColor: { type: 'color', default: '#FFF' },
  backgroundOpacity: { type: 'number', default: 1 },
  backgroundRadius: { type: 'number', default: 0.02 },
  
  // Selection colors
  selectedColor: { type: 'color', default: '#4076fd' },
  hoverColor: { type: 'color', default: '#E3F2FD' },
  
  // Icons
  dropdownIcon: { type: 'string', default: '▼' },
  checkmarkIcon: { type: 'string', default: '✓' },
  
  // Behavior
  openDirection: { type: 'string', default: 'down' }, // down|up|auto
  closeOnSelect: { type: 'boolean', default: true },
  
  // Accessibility
  ariaLabel: { type: 'string', default: '' },
  tabIndex: { type: 'int', default: 0 },
  
  // VR-specific (from radio/checkbox improvements)
  dwellTime: { type: 'number', default: 1000 },
  spatialAudio: { type: 'boolean', default: false }
}
```

### Primitive Mapping

```javascript
AFRAME.registerPrimitive('a-select', {
  defaultComponents: { select: {} },
  mappings: {
    value: 'select.value',
    name: 'select.name',
    disabled: 'select.disabled',
    options: 'select.options',
    width: 'select.width',
    'max-height': 'select.maxHeight',
    'option-height': 'select.optionHeight',
    color: 'select.color',
    font: 'select.font',
    'letter-spacing': 'select.letterSpacing',
    align: 'select.align',
    placeholder: 'select.placeholder',
    'placeholder-color': 'select.placeholderColor',
    'background-color': 'select.backgroundColor',
    'background-opacity': 'select.backgroundOpacity',
    'background-radius': 'select.backgroundRadius',
    'selected-color': 'select.selectedColor',
    'hover-color': 'select.hoverColor',
    'dropdown-icon': 'select.dropdownIcon',
    'checkmark-icon': 'select.checkmarkIcon',
    'open-direction': 'select.openDirection',
    'close-on-select': 'select.closeOnSelect',
    'aria-label': 'select.ariaLabel',
    'tab-index': 'select.tabIndex',
    'dwell-time': 'select.dwellTime',
    'spatial-audio': 'select.spatialAudio'
  }
});
```

### Usage Example

```html
<a-select
  name="country"
  value="us"
  placeholder="Select a country"
  width="1.5"
  options='[
    {"value": "us", "label": "United States"},
    {"value": "uk", "label": "United Kingdom"},
    {"value": "ca", "label": "Canada"}
  ]'
  position="0 1.6 -2"
></a-select>
```

### Events

- `focus` — when select receives focus
- `blur` — when select loses focus
- `open` — when options list opens
- `close` — when options list closes
- `change` — when selection changes (detail: `{value, label, previousValue}`)
- `hover` — when option is hovered (detail: `{value, label, index}`)

### Methods

```javascript
// Exposed on element (like a-input)
el.open()              // Open options list
el.close()             // Close options list
el.toggle()            // Toggle open/closed
el.selectValue(value)  // Select option by value
el.selectIndex(index)  // Select option by index
el.getSelectedOption() // Returns {value, label} or null
el.focus()             // Focus the select
el.blur()              // Blur the select

// Value property (like a-input/textarea)
el.value = 'us';       // Set selected value
console.log(el.value); // Get selected value
```

## Entity Structure

### Closed State (Always Visible)

```
a-select (root)
├── a-rounded (background, z=0.001)
├── a-entity (selected text, z=0.003)
├── a-entity (dropdown icon ▼, z=0.003)
└── a-plane (hitbox, z=0.002, opacity=0)
```

### Open State (Conditionally Visible)

```
a-select (root)
└── a-entity (options container, visible when open)
    ├── a-rounded (options background, z=0.001)
    └── Option entities (pooled, reusable)
        ├── a-plane (hover background, z=0.002)
        ├── a-entity (option text, z=0.003)
        └── a-entity (checkmark ✓, z=0.004, visible if selected)
```

## Architecture Integration

### FormManager Integration (Following Radio/Checkbox Improvements)

```javascript
const FormControlHelpers = require('../core/form-control-helpers');
const Utils = require('../utils');
const Event = require('../core/event');

init: function() {
  // Get material-form system with defensive pattern
  this.formSystem = this.el.sceneEl?.systems['material-form'];
  if (!this.formSystem) {
    console.error('[select] material-form system not found');
    FormControlHelpers.createFallbackUI(this);
    return;
  }
  
  // Initialize with helpers
  FormControlHelpers.initFormControl(this);
  if (!this.isInitialized) return;
  
  // Register with form
  const form = this.el.closest('a-form');
  if (form) {
    this.formId = this.formSystem.getFormId(form);
  }
  
  // Create UI
  this.createSelectUI();
  this.createOptionsPool();
  
  // Bind events with automatic cleanup tracking
  FormControlHelpers.bindEvent(this, this.hitbox, 'click', this.toggle);
  
  // Setup ARIA
  FormControlHelpers.updateARIA(this);
},

// Use sound pool
playSound: function(soundType) {
  if (this.formSystem) {
    this.formSystem.playSound(`select-${soundType}`);
  }
},

// Use event pool
emitChange: function(value, label, previousValue) {
  if (!this.formSystem) return;
  const detail = this.formSystem.getEventDetail('change');
  detail.value = value;
  detail.label = label;
  detail.previousValue = previousValue;
  detail.target = this.el;
  Event.emit(this.el, 'change', detail);
},

remove: function() {
  FormControlHelpers.unbindAllEvents(this);
  FormControlHelpers.cleanupChildren(this);
}
```

## Rendering Lifecycle (Event-Driven, No Polling)

Following `a-input` and `a-textarea` patterns:

```javascript
init: function() {
  // Listen for text geometry ready (like a-textarea)
  this.selectedTextEntity.addEventListener('loaded', () => {
    this.updateTextLayout();
  });
  this.selectedTextEntity.addEventListener('object3dset', () => {
    this.updateTextLayout();
  });
  
  // Initial layout after RAF (not setTimeout)
  requestAnimationFrame(() => this.updateLayout());
},

update: function(oldData) {
  if (!oldData) return;
  
  // Schedule updates on RAF, not setTimeout
  if (oldData.value !== this.data.value) {
    this.scheduleUpdate('display');
  }
  if (oldData.options !== this.data.options) {
    this.scheduleUpdate('options');
  }
},

scheduleUpdate: function(updateType) {
  if (this.updateRaf) cancelAnimationFrame(this.updateRaf);
  
  this.updateRaf = requestAnimationFrame(() => {
    switch(updateType) {
      case 'display': this.updateSelectedDisplay(); break;
      case 'options': this.updateVisibleOptions(); break;
    }
    this.updateRaf = null;
  });
},

pause: function() {
  // Clean up timers (like a-textarea)
  if (this.updateRaf) {
    cancelAnimationFrame(this.updateRaf);
    this.updateRaf = null;
  }
  if (this.closeTimer) {
    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }
},

// NO tick() method - purely event-driven
```

## Text Measurement (A-Frame API Only)

Following `a-textarea` pattern for 3D text measurement:

```javascript
// Use A-Frame's text component geometry (NOT Canvas API)
measureText: function(textEntity) {
  return new Promise((resolve) => {
    const measure = () => {
      const mesh = textEntity.object3D?.children[0];
      if (!mesh?.geometry) {
        requestAnimationFrame(measure);
        return;
      }
      
      const geometry = mesh.geometry;
      
      // Method 1: Use visible glyphs (most accurate)
      if (geometry.visibleGlyphs?.length > 0) {
        const lastGlyph = geometry.visibleGlyphs[geometry.visibleGlyphs.length - 1];
        resolve(lastGlyph.position[0] + lastGlyph.data.width);
        return;
      }
      
      // Method 2: Use bounding box (fallback)
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        resolve(geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        return;
      }
      
      resolve(this.data.width * 0.8); // Final fallback
    };
    measure();
  });
}
```

## Option Pool Management (Performance Optimization)

Reuse option entities instead of creating/destroying:

```javascript
createOptionsPool: function() {
  const maxVisible = Math.ceil(this.data.maxHeight / this.data.optionHeight);
  this.optionPool = [];
  
  for (let i = 0; i < maxVisible; i++) {
    const optionEntity = this.createOptionEntity();
    optionEntity.setAttribute('visible', false);
    this.optionsContainer.appendChild(optionEntity);
    this.optionPool.push(optionEntity);
    FormControlHelpers.trackChild(this, optionEntity);
  }
},

updateVisibleOptions: function() {
  if (!this.isOpen) return; // Don't update when closed
  
  const startIdx = this.firstVisibleIndex;
  const endIdx = Math.min(startIdx + this.optionPool.length, this.data.options.length);
  
  for (let i = 0; i < this.optionPool.length; i++) {
    const optionIdx = startIdx + i;
    const optionEntity = this.optionPool[i];
    
    if (optionIdx < endIdx) {
      const option = this.data.options[optionIdx];
      this.updateOptionEntity(optionEntity, option, optionIdx);
      optionEntity.setAttribute('visible', true);
    } else {
      optionEntity.setAttribute('visible', false);
    }
  }
}
```

## Interaction Handling

### Open/Close Logic

```javascript
toggle: function() {
  if (this.data.disabled) return;
  this.isOpen ? this.close() : this.open();
},

open: function() {
  if (this.data.disabled || this.isOpen) return;
  
  this.isOpen = true;
  this.optionsContainer.setAttribute('visible', true);
  
  // Position options (down or up based on openDirection)
  const yOffset = this.data.openDirection === 'down' ? -this.data.optionHeight : this.data.optionHeight;
  this.optionsContainer.setAttribute('position', `0 ${yOffset} 0.005`);
  
  this.updateVisibleOptions();
  this.playSound('open');
  Event.emit(this.el, 'open');
  
  // Setup click-outside handler
  this.setupOutsideClickHandler();
},

close: function() {
  if (!this.isOpen) return;
  
  this.isOpen = false;
  this.hoveredIndex = -1;
  this.optionsContainer.setAttribute('visible', false);
  
  this.playSound('close');
  Event.emit(this.el, 'close');
  this.removeOutsideClickHandler();
}
```

### Option Selection

```javascript
selectValue: function(value) {
  const option = this.data.options.find(opt => opt.value === value);
  if (!option) return;
  
  const previousValue = this.data.value;
  this.el.setAttribute('select', 'value', value);
  this.selectedIndex = this.data.options.indexOf(option);
  
  // Emit change event using event pool
  this.emitChange(value, option.label, previousValue);
  this.playSound('select');
  
  if (this.data.closeOnSelect) this.close();
  
  this.updateSelectedDisplay();
  this.updateVisibleOptions(); // Update checkmarks
}
```

### Keyboard Navigation

```javascript
handleKeyDown: function(evt) {
  if (this.data.disabled) return;
  
  switch(evt.key) {
    case 'ArrowDown':
      evt.preventDefault();
      this.isOpen ? this.hoverNextOption() : this.open();
      break;
    case 'ArrowUp':
      evt.preventDefault();
      this.isOpen ? this.hoverPreviousOption() : this.open();
      break;
    case 'Enter':
    case ' ':
      evt.preventDefault();
      if (!this.isOpen) {
        this.open();
      } else if (this.hoveredIndex >= 0) {
        this.selectValue(this.data.options[this.hoveredIndex].value);
      }
      break;
    case 'Escape':
      evt.preventDefault();
      if (this.isOpen) this.close();
      break;
  }
}
```

## Accessibility

### ARIA Attributes

```javascript
updateARIA: function() {
  this.el.setAttribute('role', 'combobox');
  this.el.setAttribute('aria-expanded', String(this.isOpen));
  this.el.setAttribute('aria-haspopup', 'listbox');
  this.el.setAttribute('aria-disabled', String(this.data.disabled));
  
  const option = this.getSelectedOption();
  const label = option ? `${this.data.ariaLabel || 'Select'}: ${option.label}` 
                       : this.data.ariaLabel || this.data.placeholder || 'Select';
  this.el.setAttribute('aria-label', label);
  
  if (this.hoveredIndex >= 0) {
    this.el.setAttribute('aria-activedescendant', `option-${this.hoveredIndex}`);
  }
}
```

## File Structure

```
src/select/
├── index.js           # Main component + primitive registration
├── assets.js          # Sound/image assets
└── sfx.js             # Sound effects helpers

docs/
└── select-implementation-proposal.md  # This document
```

## Comparison with Existing Components

| Feature | a-input | a-textarea | a-radio | a-checkbox | **a-select** |
|---------|---------|------------|---------|------------|-------------|
| Single value | ✓ | ✓ | ✓ | ✓ | **✓** |
| Multiple values | — | — | ✓ (group) | ✓ | *Phase 2* |
| Text input | ✓ | ✓ | — | — | — |
| Options list | — | — | Implicit | — | **✓** |
| Keyboard nav | ✓ | ✓ | Arrow keys | Space | **Arrow+Enter** |
| Event-driven | ✓ | ✓ | Needs fix | Needs fix | **✓** |
| FormManager | — | — | *Planned* | *Planned* | **✓** |
| Sound pool | — | — | *Planned* | *Planned* | **✓** |
| Event pool | — | — | *Planned* | *Planned* | **✓** |

## Implementation Phases

### Phase 1 — MVP (Single Select, No Scroll)
- Component + primitive scaffolding with full schema
- Closed state UI (background, selected text, dropdown icon, hitbox)
- Open state UI (options container, background, option pool)
- Click to open/close, click option to select
- Change events with event pooling
- Keyboard navigation (arrows, enter, escape)
- ARIA attributes
- Sound effects via FormManager
- Event-driven lifecycle (no tick, no polling)

### Phase 2 — Scrolling & Polish
- Scrollable options list for long lists
- Scroll position management (`firstVisibleIndex`)
- Visual scrollbar indicator
- Smooth open/close animations
- Hover scale effects
- Focus ring indicator

### Phase 3 — Advanced Features
- Multi-select mode (checkboxes in options)
- Option groups with headers
- Search/filter input
- Custom option templates
- Lazy loading for very large lists

### Phase 4 — VR Enhancements
- Gaze-based dwell selection
- Positional audio feedback
- Controller haptics
- Hand tracking gestures
- Adaptive scaling based on viewing distance

## Testing Strategy

### Unit Tests
- Option selection logic
- Open/close state management
- Keyboard navigation
- Event emission with pooling
- ARIA attribute updates

### Integration Tests
- Form submission with selected values
- Multiple selects in same form
- Select within different parent containers
- Keyboard + mouse interaction

### VR Platform Tests
- Quest 2/3, PSVR2, PC VR
- Controller interactions
- Gaze-based selection
- Performance (60+ FPS with 10+ selects)

## Summary

The `a-select` component follows established patterns from `a-input`, `a-textarea`, `a-radio`, and `a-checkbox`, while integrating the architectural improvements from the radio/checkbox enhancement specifications:

- **Event-driven lifecycle** (no tick, no setTimeout polling)
- **FormManager integration** for shared resources
- **Event object pooling** to prevent race conditions
- **A-Frame text measurement** (not Canvas API)
- **Option entity pooling** for performance
- **Graceful error handling** with fallback UI
- **Full accessibility** (ARIA, keyboard, VR controllers)
- **Proper cleanup** (event listeners, timers, RAF)

This proposal provides a complete foundation for implementing a production-ready dropdown select component that fits seamlessly into the aframe-material-redux ecosystem.
