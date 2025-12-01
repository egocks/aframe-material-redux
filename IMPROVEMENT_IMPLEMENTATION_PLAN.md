# Radio & Checkbox Implementation Plan

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Proposed

---

## Executive Summary

This document outlines a phased approach to improve the radio and checkbox components, addressing critical bugs, performance issues, accessibility gaps, and architectural limitations. The plan prioritizes immediate fixes while establishing a foundation for long-term maintainability.

**Total Estimated Effort:** 5-7 days  
**Recommended Team Size:** 1-2 developers

---

## Phase 1: Critical Fixes (Priority: URGENT)

**Estimated Time:** 1 day  
**Goal:** Fix bugs and prevent memory leaks

### 1.1 Fix Checkbox SFX Asset References

**Issue:** Wrong asset IDs in `src/checkbox/sfx.js`

**Files to Modify:**
- `src/checkbox/sfx.js`

**Implementation:**
```javascript
// Line 12 - Change key name
el.setAttribute('key', 'aframeCheckboxClickDisabledSound');

// Line 14 - Change asset reference
el.setAttribute('src', '#aframeCheckboxClickDisabled');

// Line 27 - Update query selector
let el = parent.querySelector('[key=aframeCheckboxClickDisabledSound]');
```

**Testing:**
- Verify disabled sound plays correctly for checkbox
- Ensure no console errors about missing assets
- Test in both VR and desktop mode

---

### 1.2 Implement Component Cleanup

**Issue:** Memory leaks from unremoved event listeners and DOM elements

**Files to Modify:**
- `src/radio/index.js`
- `src/checkbox/index.js`

**Implementation Steps:**

**Step 1:** Store bound event handlers
```javascript
init: function () {
  // Store bound handlers for cleanup
  this.boundClickHandler = this.handleClick.bind(this);
  this.boundMousedownHandler = this.handleMousedown.bind(this);
  
  this.el.addEventListener('click', this.boundClickHandler);
  this.el.addEventListener('mousedown', this.boundMousedownHandler);
  // ... rest of init
},

handleClick: function() {
  if (this.data.disabled) { return; }
  // ... existing click logic
},

handleMousedown: function() {
  if (this.data.disabled) {
    return SFX.clickDisabled(this.el);
  }
  SFX.click(this.el);
}
```

**Step 2:** Implement remove lifecycle
```javascript
remove: function () {
  // Remove event listeners
  if (this.boundClickHandler) {
    this.el.removeEventListener('click', this.boundClickHandler);
  }
  if (this.boundMousedownHandler) {
    this.el.removeEventListener('mousedown', this.boundMousedownHandler);
  }
  
  // Remove child elements
  const elementsToRemove = [
    this.hitbox,
    this.outline,
    this.circle || this.checkmark,
    this.inside, // checkbox only
    this.label
  ];
  
  elementsToRemove.forEach(el => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  
  // Remove sound elements
  const sounds = this.el.querySelectorAll('[sfx]');
  sounds.forEach(sound => sound.parentNode.removeChild(sound));
  
  // Clear references
  this.hitbox = null;
  this.outline = null;
  this.circle = null;
  this.checkmark = null;
  this.inside = null;
  this.label = null;
}
```

**Testing:**
- Create and destroy components dynamically
- Monitor memory usage with Chrome DevTools
- Verify no leaked event listeners in Performance Monitor

---

### 1.3 Fix Disabled State Color Logic

**Issue:** `disabled()` method sets incorrect colors when component is checked

**Files to Modify:**
- `src/radio/index.js` (lines 118-121)
- `src/checkbox/index.js` (lines 107-110)

**Implementation:**
```javascript
disabled: function() {
  // Maintain current checked state colors, just reduce opacity
  // Don't change colors - this is handled by check/uncheck
  // Remove these lines:
  // this.outline.setAttribute('color', this.data.radioColor);
  // this.circle.setAttribute('color', this.data.radioColor);
}
```

**Testing:**
- Check disabled checked radio - should maintain checked color
- Check disabled unchecked radio - should maintain unchecked color
- Toggle disabled state dynamically

---

## Phase 2: Performance Improvements (Priority: HIGH)

**Estimated Time:** 1.5 days  
**Goal:** Eliminate performance anti-patterns

### 2.1 Remove setInterval Polling Pattern

**Issue:** Polling for Object3D children every 10ms

**Files to Modify:**
- `src/radio/index.js`
- `src/checkbox/index.js`

**Implementation:**

**Option A: Use component loaded event**
```javascript
update: function () {
  // Remove setTimeout wrapper
  this.updateUI();
},

updateUI: function() {
  var that = this;
  
  // Update hitbox
  this.hitbox.setAttribute('width', this.data.width);
  this.hitbox.setAttribute('position', this.data.width/2 + ' 0 0.001');
  
  // Update label
  this.updateLabel();
  
  // Update opacity when ready
  if (this.outline.object3D && this.outline.object3D.children.length > 0) {
    this.updateOpacity();
  } else {
    this.outline.addEventListener('loaded', function onLoaded() {
      that.updateOpacity();
      that.outline.removeEventListener('loaded', onLoaded);
    });
  }
},

updateOpacity: function() {
  const opacity = this.data.disabled ? 0.4 : 1;
  Utils.updateOpacity(this.outline, opacity);
  Utils.updateOpacity(this.circle || this.checkmark, opacity);
  Utils.updateOpacity(this.label, opacity);
}
```

**Option B: Use requestAnimationFrame (single check)**
```javascript
updateOpacity: function() {
  const opacity = this.data.disabled ? 0.4 : 1;
  
  const checkAndUpdate = () => {
    if (this.outline.object3D && this.outline.object3D.children.length > 0) {
      Utils.updateOpacity(this.outline, opacity);
      Utils.updateOpacity(this.circle || this.checkmark, opacity);
      Utils.updateOpacity(this.label, opacity);
    } else {
      requestAnimationFrame(checkAndUpdate);
    }
  };
  
  requestAnimationFrame(checkAndUpdate);
}
```

**Testing:**
- Verify opacity changes work correctly
- Check performance in browser profiler
- Ensure no visual glitches during component creation

---

### 2.2 Optimize Text Width Calculation

**Issue:** Recursive string slicing with DOM mutations

**Files to Modify:**
- `src/radio/index.js` (lines 144-166)
- `src/checkbox/index.js` (lines 134-155)

**Implementation:**

**Step 1:** Create optimized helper
```javascript
// Add to src/utils.js
Utils.trimTextToWidth = function(text, maxWidth, textProps) {
  if (!text || !maxWidth) return text;
  
  // Binary search approach for efficiency
  let low = 0;
  let high = text.length;
  let result = text;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testText = text.substring(0, mid);
    
    // Estimate width (this is approximate)
    const estimatedWidth = mid * 0.1; // Adjust factor based on font
    
    if (estimatedWidth <= maxWidth) {
      result = testText;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return result;
};

// Or use Canvas measurement for accuracy
Utils.measureTextWidth = function(text, font) {
  const canvas = Utils._textCanvas = Utils._textCanvas || document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font || '16px Arial';
  return context.measureText(text).width;
};
```

**Step 2:** Replace in components
```javascript
updateLabel: function() {
  const props = {
    color: this.data.color,
    align: 'left',
    wrapCount: 10 * (this.data.width + 0.2),
    width: this.data.width,
  };
  if (this.data.font) props.font = this.data.font;
  
  props.value = this.data.label;
  this.label.setAttribute('text', props);
  this.label.setAttribute('position', this.data.width/2 + 0.24 + ' 0 0.002');
  
  // Simplified trimming - let A-Frame handle it with wrapCount
  // Or implement one-time trim if needed
}
```

**Testing:**
- Test with various label lengths
- Verify text doesn't overflow
- Compare performance with old implementation

---

### 2.3 Cache DOM Queries for Radio Groups

**Issue:** `querySelectorAll` on every radio click

**Files to Modify:**
- `src/radio/index.js`

**Implementation:**

**Step 1:** Create caching mechanism
```javascript
init: function() {
  // ... existing init code
  
  // Cache form reference
  this.formElement = null;
  this.radioGroupCache = null;
  
  // Listen for DOM changes that might affect group
  this.updateGroupCache();
},

updateGroupCache: function() {
  if (!this.data.name) return;
  
  this.formElement = this.el.closest('a-form');
  if (this.formElement) {
    this.radioGroupCache = Array.from(
      this.formElement.querySelectorAll(`[name="${this.data.name}"]`)
    ).filter(el => el.components.radio);
  }
},

update: function(oldData) {
  // Refresh cache if name changed
  if (oldData.name !== this.data.name) {
    this.updateGroupCache();
  }
  
  // ... rest of update
}
```

**Step 2:** Use cache in onClick
```javascript
onClick: function(noemit) {
  if (!this.data.name) return;
  
  // Use cached group
  const group = this.radioGroupCache || [];
  
  let didCheck = false;
  for (let i = group.length - 1; i >= 0; i--) {
    const child = group[i];
    if (child === this.el && child.hasAttribute('checked')) {
      didCheck = true;
      child.components.radio.check();
      if (!noemit) Event.emit(child, 'change', true);
    } else {
      if (!didCheck && !this.data.checked && child.hasAttribute('checked')) {
        didCheck = true;
        child.components.radio.check();
      } else {
        child.components.radio.uncheck();
      }
    }
  }
  
  if (!didCheck && this.el.hasAttribute('checked')) {
    this.check();
    if (!noemit) Event.emit(this.el, 'change', true);
  }
}
```

**Testing:**
- Test radio groups with 3+ radios
- Verify mutual exclusivity still works
- Test dynamic addition/removal of radios

---

### 2.4 Remove Empty Lifecycle Methods

**Issue:** Empty `tick()`, `pause()`, `play()` still get called

**Files to Modify:**
- `src/radio/index.js` (lines 192-195)
- `src/checkbox/index.js` (lines 179-182)

**Implementation:**
```javascript
// Simply delete these lines:
// tick: function () {},
// pause: function () {},
// play: function () {}

// Keep remove() as we're now implementing it
```

**Testing:**
- Verify components still function correctly
- No A-Frame errors in console

---

## Phase 3: Accessibility Enhancements (Priority: HIGH)

**Estimated Time:** 1 day  
**Goal:** Add keyboard navigation and screen reader support

### 3.1 Add ARIA Attributes

**Files to Modify:**
- `src/radio/index.js`
- `src/checkbox/index.js`

**Implementation:**
```javascript
init: function() {
  // ... existing init
  
  // Add ARIA attributes
  this.updateARIA();
},

updateARIA: function() {
  this.el.setAttribute('role', 'radio'); // or 'checkbox'
  this.el.setAttribute('aria-checked', this.data.checked.toString());
  this.el.setAttribute('aria-disabled', this.data.disabled.toString());
  
  if (this.data.label) {
    this.el.setAttribute('aria-label', this.data.label);
  }
  
  if (this.data.name) {
    this.el.setAttribute('aria-labelledby', this.data.name);
  }
},

update: function(oldData) {
  // ... existing update
  
  // Update ARIA when relevant properties change
  if (oldData.checked !== this.data.checked ||
      oldData.disabled !== this.data.disabled ||
      oldData.label !== this.data.label) {
    this.updateARIA();
  }
}
```

---

### 3.2 Implement Keyboard Navigation

**Files to Modify:**
- `src/radio/index.js`
- `src/checkbox/index.js`

**Implementation:**
```javascript
init: function() {
  // ... existing init
  
  // Add keyboard support
  this.boundKeyHandler = this.handleKey.bind(this);
  this.el.addEventListener('keydown', this.boundKeyHandler);
  
  // Make focusable
  this.updateTabIndex();
},

updateTabIndex: function() {
  this.el.setAttribute('tabindex', this.data.disabled ? -1 : 0);
},

handleKey: function(evt) {
  if (this.data.disabled) return;
  
  // Space or Enter activates
  if (evt.key === ' ' || evt.key === 'Enter') {
    evt.preventDefault();
    this.el.click();
  }
  
  // Arrow keys for radio group navigation
  if (this.data.name && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown' || 
                          evt.key === 'ArrowLeft' || evt.key === 'ArrowRight')) {
    evt.preventDefault();
    this.navigateGroup(evt.key);
  }
},

navigateGroup: function(key) {
  // Radio only - move focus within group
  if (!this.radioGroupCache) return;
  
  const currentIndex = this.radioGroupCache.indexOf(this.el);
  let nextIndex;
  
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % this.radioGroupCache.length;
  } else {
    nextIndex = (currentIndex - 1 + this.radioGroupCache.length) % this.radioGroupCache.length;
  }
  
  const nextRadio = this.radioGroupCache[nextIndex];
  if (nextRadio && !nextRadio.components.radio.data.disabled) {
    nextRadio.focus();
    nextRadio.click();
  }
},

remove: function() {
  // Add to existing remove
  if (this.boundKeyHandler) {
    this.el.removeEventListener('keydown', this.boundKeyHandler);
  }
  // ... rest of cleanup
}
```

**Testing:**
- Test keyboard navigation with Tab, Enter, Space
- Test arrow keys for radio groups
- Verify focus indicators visible
- Test with screen reader (NVDA/JAWS/VoiceOver)

---

## Phase 4: Configuration & Flexibility (Priority: MEDIUM)

**Estimated Time:** 1 day  
**Goal:** Make dimensions and styling configurable

### 4.1 Add Configurable Dimensions

**Files to Modify:**
- `src/radio/index.js`
- `src/checkbox/index.js`

**Implementation:**
```javascript
// Add constants module
// src/constants.js
module.exports = {
  RADIO: {
    OUTLINE_OUTER_RATIO: 0.1,
    OUTLINE_INNER_RATIO: 0.078,
    CIRCLE_RATIO: 0.05,
    HITBOX_HEIGHT: 0.2,
  },
  CHECKBOX: {
    SIZE: 0.2,
    INNER_SIZE_RATIO: 0.78,
    CORNER_RADIUS_RATIO: 0.1,
    ICON_SIZE_RATIO: 0.8,
  },
  LABEL_OFFSET: 0.24,
  DISABLED_OPACITY: 0.4
};

// Update schema
schema: {
  // ... existing schema
  size: { type: 'number', default: 1 },
  labelOffset: { type: 'number', default: 0.24 },
  disabledOpacity: { type: 'number', default: 0.4 }
}

// Use in init
init: function() {
  const Constants = require('../constants');
  const size = this.data.size;
  
  // Radio outline
  this.outline.setAttribute('radius-outer', Constants.RADIO.OUTLINE_OUTER_RATIO * size);
  this.outline.setAttribute('radius-inner', Constants.RADIO.OUTLINE_INNER_RATIO * size);
  
  // etc...
}
```

---

### 4.2 Add Hover State Support

**Files to Modify:**
- `src/radio/index.js`
- `src/checkbox/index.js`

**Implementation:**
```javascript
init: function() {
  // ... existing init
  
  // Add hover handlers
  this.boundMouseEnter = this.handleMouseEnter.bind(this);
  this.boundMouseLeave = this.handleMouseLeave.bind(this);
  
  this.el.addEventListener('mouseenter', this.boundMouseEnter);
  this.el.addEventListener('mouseleave', this.boundMouseLeave);
},

handleMouseEnter: function() {
  if (this.data.disabled) return;
  
  // Subtle scale or brightness increase
  this.outline.setAttribute('animation', {
    property: 'scale',
    to: '1.1 1.1 1.1',
    dur: 150,
    easing: 'easeOutQuad'
  });
},

handleMouseLeave: function() {
  this.outline.setAttribute('animation', {
    property: 'scale',
    to: '1 1 1',
    dur: 150,
    easing: 'easeOutQuad'
  });
}
```

---

## Phase 5: Shared Resources (Priority: MEDIUM)

**Estimated Time:** 0.5 days  
**Goal:** Reduce memory footprint via sound pooling

### 5.1 Create Form Controls System

**New File:** `src/core/form-controls-system.js`

**Implementation:**
```javascript
AFRAME.registerSystem('form-controls', {
  schema: {},
  
  init: function() {
    this.sounds = {};
    this.loadSounds();
  },
  
  loadSounds: function() {
    const soundConfigs = [
      { id: 'radioClick', src: '#aframeRadioClick' },
      { id: 'radioClickDisabled', src: '#aframeRadioClickDisabled' },
      { id: 'checkboxClick', src: '#aframeCheckboxClick' },
      { id: 'checkboxClickDisabled', src: '#aframeCheckboxClickDisabled' }
    ];
    
    soundConfigs.forEach(config => {
      const el = document.createElement('a-sound');
      el.setAttribute('src', config.src);
      el.setAttribute('poolSize', 5);
      this.el.appendChild(el);
      this.sounds[config.id] = el;
    });
  },
  
  playSound: function(soundId) {
    const sound = this.sounds[soundId];
    if (sound && sound.components.sound) {
      sound.components.sound.stopSound();
      sound.components.sound.playSound();
    }
  }
});
```

**Update Components:**
```javascript
// Remove SFX.init() from component init
// Replace SFX.click() with:
init: function() {
  this.system = this.el.sceneEl.systems['form-controls'];
  // ...
}

// In event handler:
this.system.playSound('radioClick');
```

---

## Phase 6: Testing & Documentation (Priority: MEDIUM)

**Estimated Time:** 1 day

### 6.1 Create Test Suite

**New File:** `tests/components/radio.test.js`

**Implementation:**
```javascript
describe('Radio Component', () => {
  let scene, radio;
  
  beforeEach((done) => {
    scene = document.createElement('a-scene');
    document.body.appendChild(scene);
    
    scene.addEventListener('loaded', () => {
      radio = document.createElement('a-radio');
      radio.setAttribute('label', 'Test');
      radio.setAttribute('value', 'test');
      scene.appendChild(radio);
      done();
    });
  });
  
  afterEach(() => {
    document.body.removeChild(scene);
  });
  
  it('should initialize with default values', () => {
    expect(radio.getAttribute('checked')).toBe(false);
    expect(radio.getAttribute('disabled')).toBe(false);
  });
  
  it('should toggle checked state on click', () => {
    radio.click();
    expect(radio.getAttribute('checked')).toBe(true);
  });
  
  it('should emit change event', (done) => {
    radio.addEventListener('change', (evt) => {
      expect(evt.detail).toBe(true);
      done();
    });
    radio.click();
  });
  
  it('should handle disabled state', () => {
    radio.setAttribute('disabled', true);
    radio.click();
    expect(radio.getAttribute('checked')).toBe(false);
  });
  
  // Add more tests...
});
```

---

### 6.2 Add JSDoc Documentation

**Implementation:**
```javascript
/**
 * Radio button component for A-Frame VR forms.
 * Part of a radio group identified by the 'name' attribute.
 * 
 * @component radio
 * @example
 * <a-form>
 *   <a-radio name="size" value="small" label="Small"></a-radio>
 *   <a-radio name="size" value="large" label="Large" checked></a-radio>
 * </a-form>
 * 
 * @property {boolean} checked - Whether the radio is selected
 * @property {boolean} disabled - Whether the radio is disabled
 * @property {string} name - Radio group identifier
 * @property {string} value - Value when selected
 * @property {string} label - Display label text
 * @property {color} radioColor - Color when unchecked (default: #757575)
 * @property {color} radioColorChecked - Color when checked (default: #4076fd)
 * @property {number} size - Control size multiplier (default: 1)
 * 
 * @fires change - Emitted when selection changes (detail: boolean)
 */
AFRAME.registerComponent('radio', {
  // ...
});
```

---

## Phase 7: Advanced Features (Priority: LOW)

**Estimated Time:** 1-2 days (optional)

### 7.1 Animation & Transitions

Add smooth state transitions:
```javascript
check: function() {
  // Animate circle appearance
  this.circle.setAttribute('animation', {
    property: 'scale',
    from: '0 0 0',
    to: '1 1 1',
    dur: 200,
    easing: 'easeOutElastic'
  });
  
  // Animate color
  this.outline.setAttribute('animation__color', {
    property: 'color',
    to: this.data.radioColorChecked,
    dur: 200
  });
}
```

### 7.2 Component Decomposition

Refactor into base + specific:
- `form-control` (base)
- `radio` extends `form-control`
- `checkbox` extends `form-control`

### 7.3 Custom Templates

Allow icon/visual customization via slots or templates.

---

## Implementation Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Critical Fixes | 1 day | None |
| Phase 2: Performance | 1.5 days | Phase 1 |
| Phase 3: Accessibility | 1 day | Phase 1 |
| Phase 4: Configuration | 1 day | Phase 2 |
| Phase 5: Shared Resources | 0.5 days | Phase 2 |
| Phase 6: Testing | 1 day | Phase 1-5 |
| Phase 7: Advanced | 1-2 days | Optional |

**Total: 6-7 days for Phases 1-6**

---

## Testing Strategy

### Unit Tests
- Component initialization
- State changes (checked/unchecked)
- Event emissions
- Keyboard interactions
- ARIA attribute updates

### Integration Tests
- Radio group behavior
- Form integration
- Sound playback
- Memory leak detection

### Visual Regression Tests
- Capture screenshots of each state
- Compare before/after refactoring

### Performance Tests
- Component creation time
- Memory usage with 50+ components
- Frame rate during interactions

### Accessibility Tests
- WAVE/aXe automated testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation

---

## Risk Mitigation

### Breaking Changes
- Maintain backward compatibility with existing attributes
- Deprecate rather than remove old APIs
- Provide migration guide

### Performance Regressions
- Benchmark before and after each phase
- Use A-Frame inspector performance tools
- Monitor in VR headsets (Quest, Vive)

### Browser Compatibility
- Test in Chrome, Firefox, Safari
- Test on mobile devices
- Test in VR browsers (Oculus Browser, Wolvic)

---

## Success Criteria

- ✅ All critical bugs fixed
- ✅ No memory leaks detected in 1-hour stress test
- ✅ 90%+ reduction in setInterval usage
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ 90%+ code coverage with tests
- ✅ Documentation complete for all public APIs
- ✅ No performance regressions (same or better FPS)

---

## Post-Implementation

### Monitoring
- Track error rates in production
- Monitor performance metrics
- Collect user feedback

### Future Enhancements
- Custom themes/skins
- More control shapes (switches, toggles)
- International keyboard layouts
- Mobile touch gesture support
- Haptic feedback for VR controllers

---

## Appendix: Quick Reference

### Modified Files Checklist

**Critical Fixes:**
- [ ] `src/checkbox/sfx.js`
- [ ] `src/radio/index.js` (remove lifecycle)
- [ ] `src/checkbox/index.js` (remove lifecycle)

**Performance:**
- [ ] `src/radio/index.js` (polling, caching)
- [ ] `src/checkbox/index.js` (polling)
- [ ] `src/utils.js` (text helpers)

**Accessibility:**
- [ ] `src/radio/index.js` (ARIA, keyboard)
- [ ] `src/checkbox/index.js` (ARIA, keyboard)

**New Files:**
- [ ] `src/constants.js`
- [ ] `src/core/form-controls-system.js`
- [ ] `tests/components/radio.test.js`
- [ ] `tests/components/checkbox.test.js`

### Command Reference

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build distribution
npm run build

# Watch for changes
npm run dev

# Performance profiling
npm run profile
```

---

**End of Implementation Plan**
