const Utils = require('../utils');
const Event = require('../core/event');
const FormControlHelpers = require('../core/form-control-helpers');

AFRAME.registerComponent('slider', {
  schema: {
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
    sfxTick: { type: 'string', default: '#aframeSliderTick' },

    // Disabled state styling
    disabledOpacity: { type: 'number', default: 0.4 }
  },

  init: function () {
    var that = this;

    // Initialize form control helpers for resource tracking
    FormControlHelpers.initFormControl(this);

    // Get system reference for cleanup
    this.system = FormControlHelpers.getFormSystem(this);
    this.formSystem = this.system;

    // Initialize internal state
    this.state = {
      isFocused: false,
      isDragging: false,
      valueNow: this.clampValue(this.snapToStep(this.data.value)),
      stepList: [],
      thumbX: 0,
      dragStartX: 0,
      keyboardStep: Math.max(0.01, this.data.step),
      marks: []
    };

    // Create visual elements
    this.createVisualElements();

    // Set up event listeners
    this.setupEventListeners();

    // Setup accessibility features
    FormControlHelpers.setupAccessibility(this);

    // Initialize derived state
    this.updateDerivedState();

    // Store original value property descriptor for cleanup
    this.originalValueDescriptor = Object.getOwnPropertyDescriptor(this.el, 'value');
    
    Object.defineProperty(this.el, 'value', {
      get: function() { return this.getAttribute('value'); },
      set: function(value) { this.setAttribute('value', value); },
      enumerable: true,
      configurable: true
    });

    // Add public methods to element
    this.el.focus = this.focus.bind(this);
    this.el.blur = this.blur.bind(this);
    this.el.setValue = this.setValue.bind(this);
    this.el.increment = this.increment.bind(this);
    this.el.decrement = this.decrement.bind(this);
  },

  createVisualElements: function() {
    // TRACK - Base track background
    this.track = document.createElement('a-rounded');
    this.track.setAttribute('position', '0 0 0.001');
    this.track.setAttribute('width', this.data.width);
    this.track.setAttribute('height', this.data.trackHeight);
    this.track.setAttribute('radius', this.data.trackHeight / 2);
    this.track.setAttribute('color', this.data.trackColor);
    this.track.setAttribute('opacity', this.data.opacity);
    this.el.appendChild(this.track);
    FormControlHelpers.trackChild(this, this.track);

    // ACTIVE TRACK - Filled portion overlay
    this.activeTrack = document.createElement('a-rounded');
    this.activeTrack.setAttribute('position', `${-this.data.width / 2} 0 0.002`);
    this.activeTrack.setAttribute('width', 0); // Will be updated based on value
    this.activeTrack.setAttribute('height', this.data.trackHeight);
    this.activeTrack.setAttribute('radius', this.data.trackHeight / 2);
    this.activeTrack.setAttribute('color', this.data.activeTrackColor);
    this.activeTrack.setAttribute('opacity', this.data.opacity);
    this.el.appendChild(this.activeTrack);
    FormControlHelpers.trackChild(this, this.activeTrack);

    // MARKS CONTAINER - Container for tick marks
    this.marksContainer = document.createElement('a-entity');
    this.marksContainer.setAttribute('position', '0 0 0.003');
    this.el.appendChild(this.marksContainer);
    FormControlHelpers.trackChild(this, this.marksContainer);

    // THUMB - Draggable handle
    this.thumb = document.createElement('a-circle');
    this.thumb.setAttribute('position', `${-this.data.width / 2} 0 0.004`); // Start at min position
    this.thumb.setAttribute('radius', this.data.thumbRadius);
    this.thumb.setAttribute('color', this.data.thumbColor);
    this.thumb.setAttribute('opacity', this.data.opacity);
    this.el.appendChild(this.thumb);
    FormControlHelpers.trackChild(this, this.thumb);

    // FOCUS RING - Focus indicator
    this.focusRing = document.createElement('a-ring');
    this.focusRing.setAttribute('position', `${-this.data.width / 2} 0 0.004`); // Same as thumb
    this.focusRing.setAttribute('radius-inner', this.data.thumbRadius + 0.01);
    this.focusRing.setAttribute('radius-outer', this.data.thumbRadius + 0.02);
    this.focusRing.setAttribute('color', this.data.focusRingColor);
    this.focusRing.setAttribute('opacity', this.data.opacity);
    this.focusRing.setAttribute('visible', false);
    this.el.appendChild(this.focusRing);
    FormControlHelpers.trackChild(this, this.focusRing);

    // VALUE BUBBLE - Value display container (will be configured in task 10)
    this.valueBubble = document.createElement('a-entity');
    this.valueBubble.setAttribute('position', `${-this.data.width / 2} ${this.data.thumbRadius + 0.15} 0.005`);
    this.valueBubble.setAttribute('visible', false);
    this.el.appendChild(this.valueBubble);
    FormControlHelpers.trackChild(this, this.valueBubble);

    // HITBOX - Transparent interaction area
    this.hitbox = document.createElement('a-plane');
    this.hitbox.setAttribute('position', '0 0 0.000');
    this.hitbox.setAttribute('width', this.data.width + this.data.thumbRadius * 2); // Extend beyond track for easier interaction
    this.hitbox.setAttribute('height', Math.max(this.data.trackHeight, this.data.thumbRadius * 2) + 0.1); // Ensure adequate hit area
    this.hitbox.setAttribute('color', '#000000');
    this.hitbox.setAttribute('opacity', 0);
    this.hitbox.setAttribute('transparent', true);
    this.el.appendChild(this.hitbox);
    FormControlHelpers.trackChild(this, this.hitbox);
  },

  // Core value logic functions
  clampValue: function(value) {
    return Math.max(this.data.min, Math.min(this.data.max, value));
  },

  snapToStep: function(value) {
    if (this.data.step <= 0) {
      return value;
    }
    
    // Use epsilon for floating point precision issues
    const epsilon = 1e-10;
    const steps = Math.round((value - this.data.min) / this.data.step);
    const snappedValue = this.data.min + (steps * this.data.step);
    
    // Handle floating point precision
    const decimals = this.getDecimalPlaces(this.data.step);
    return parseFloat(snappedValue.toFixed(decimals));
  },

  getDecimalPlaces: function(num) {
    const str = num.toString();
    if (str.indexOf('.') !== -1 && str.indexOf('e-') === -1) {
      return str.split('.')[1].length;
    } else if (str.indexOf('e-') !== -1) {
      const parts = str.split('e-');
      return parseInt(parts[1], 10);
    }
    return 0;
  },

  valueToPosition: function(value) {
    if (this.data.max === this.data.min) {
      return 0;
    }
    const t = (value - this.data.min) / (this.data.max - this.data.min);
    return t * this.data.width;
  },

  positionToValue: function(localX) {
    if (this.data.width === 0) {
      return this.data.min;
    }
    const t = Math.max(0, Math.min(1, localX / this.data.width));
    return this.data.min + t * (this.data.max - this.data.min);
  },

  generateAutoSteps: function() {
    const steps = [];
    if (this.data.step <= 0) {
      return steps;
    }
    
    for (let value = this.data.min; value <= this.data.max; value += this.data.step) {
      // Handle floating point precision
      const decimals = this.getDecimalPlaces(this.data.step);
      const roundedValue = parseFloat(value.toFixed(decimals));
      if (roundedValue <= this.data.max) {
        steps.push(roundedValue);
      }
    }
    
    // Ensure max value is included if it's not already
    if (steps.length === 0 || steps[steps.length - 1] !== this.data.max) {
      steps.push(this.data.max);
    }
    
    return steps;
  },

  setupEventListeners: function() {
    var that = this;

    // Click/tap interaction
    this.clickHandler = FormControlHelpers.bindEvent(this, this.hitbox, 'click', function(event) {
      if (that.data.disabled || that.data.readonly) { return; }
      that.handlePointerInteraction(event);
    });

    // Mouse down for drag start
    this.mousedownHandler = FormControlHelpers.bindEvent(this, this.hitbox, 'mousedown', function(event) {
      if (that.data.disabled || that.data.readonly) { return; }
      that.startDrag(event);
    });

    // Focus events
    this.focusHandler = FormControlHelpers.bindEvent(this, this.el, 'focus', function(event) {
      that.focus();
    });

    this.blurHandler = FormControlHelpers.bindEvent(this, this.el, 'blur', function(event) {
      that.blur();
    });

    // Keyboard navigation (will be implemented in task 7)
    this.keydownHandler = FormControlHelpers.bindEvent(this, this.el, 'keydown', function(event) {
      if (that.data.disabled) { return; }
      if (that.data.readonly && that.isValueChangingKey(event)) { return; }
      that.handleKeyboardInput(event);
    });
  },

  handlePointerInteraction: function(event) {
    // Placeholder for pointer interaction logic
    // Will be implemented in task 6
  },

  startDrag: function(event) {
    // Placeholder for drag interaction logic
    // Will be implemented in task 6
  },

  focus: function() {
    if (this.state.isFocused || this.data.disabled) { return; }
    this.state.isFocused = true;
    if (this.focusRing) {
      this.focusRing.setAttribute('visible', true);
    }
    Event.emit(this.el, 'focus');
  },

  blur: function() {
    if (!this.state.isFocused) { return; }
    this.state.isFocused = false;
    if (this.focusRing) {
      this.focusRing.setAttribute('visible', false);
    }
    Event.emit(this.el, 'blur');
  },

  setValue: function(value) {
    // Block value changes when disabled or readonly
    if (this.data.disabled || this.data.readonly) {
      return;
    }

    // Convert to number and validate
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      console.warn('a-slider: Invalid value provided:', value);
      return;
    }
    
    // Clamp and snap the value
    const clampedValue = this.clampValue(numValue);
    const snappedValue = this.snapToStep(clampedValue);
    
    // Only update if value actually changed
    if (snappedValue !== this.data.value) {
      // Update the component data
      this.el.setAttribute('value', snappedValue);
      
      // Update internal state
      this.state.valueNow = snappedValue;
      this.state.thumbX = this.valueToPosition(snappedValue);
      
      // Update visuals for value-related changes
      const changedProperties = new Set(['value']);
      this.updateVisuals(changedProperties);
      
      // Emit events
      Event.emit(this.el, 'input', { value: snappedValue });
      Event.emit(this.el, 'change', { value: snappedValue });
    }
  },

  increment: function(delta) {
    // Block value changes when disabled or readonly
    if (this.data.disabled || this.data.readonly) {
      return;
    }
    
    // Placeholder for increment logic
    // Will be implemented in task 7
    const step = delta || this.data.step;
    this.setValue(this.data.value + step);
  },

  decrement: function(delta) {
    // Block value changes when disabled or readonly
    if (this.data.disabled || this.data.readonly) {
      return;
    }
    
    // Placeholder for decrement logic
    // Will be implemented in task 7
    const step = delta || this.data.step;
    this.setValue(this.data.value - step);
  },

  isValueChangingKey: function(event) {
    // Helper to identify keys that would change the value
    const valueChangingKeys = [
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ];
    return valueChangingKeys.includes(event.code);
  },

  handleKeyboardInput: function(event) {
    // Placeholder for keyboard input handling
    // Will be implemented in task 7
  },

  update: function (oldData) {
    // Determine which properties have changed for selective updates
    const changedProperties = new Set();
    for (const key in this.data) {
      if (oldData[key] !== this.data[key]) {
        changedProperties.add(key);
      }
    }

    // Update derived state
    this.updateDerivedState();
    
    // Update visuals with selective updates
    this.updateVisuals(changedProperties);
    
    // Update accessibility
    this.updateAccessibility();
  },

  updateDerivedState: function() {
    // Update clamped and snapped value
    this.state.valueNow = this.clampValue(this.snapToStep(this.data.value));
    
    // Update thumb position based on current value
    this.state.thumbX = this.valueToPosition(this.state.valueNow);
    
    // Update keyboard step (minimum 0.01 for fractional steps)
    this.state.keyboardStep = Math.max(0.01, this.data.step);
    
    // Update step list for marks if needed
    if (this.data.marks === 'auto') {
      this.state.stepList = this.generateAutoSteps();
    } else if (Array.isArray(this.data.marks)) {
      this.state.stepList = this.data.marks.slice();
    } else {
      this.state.stepList = [];
    }
  },

  updateVisuals: function(changedProperties) {
    // If no specific properties provided, update all
    if (!changedProperties) {
      changedProperties = new Set(Object.keys(this.data));
    }

    // Calculate effective opacity based on disabled state
    const effectiveOpacity = this.data.disabled ? 
      this.data.opacity * this.data.disabledOpacity : 
      this.data.opacity;

    // Update track dimensions and colors
    if (this.track && this.shouldUpdateTrack(changedProperties)) {
      this.track.setAttribute('width', this.data.width);
      this.track.setAttribute('height', this.data.trackHeight);
      this.track.setAttribute('radius', this.data.trackHeight / 2);
      this.track.setAttribute('color', this.data.trackColor);
      this.track.setAttribute('opacity', effectiveOpacity);
    }

    // Update active track with proper width binding to current value
    if (this.activeTrack && this.shouldUpdateActiveTrack(changedProperties)) {
      // Calculate active track width based on current value position
      const activeWidth = this.state.thumbX;
      // Position active track so its left edge aligns with track's left edge
      const activeTrackX = -this.data.width / 2 + (activeWidth / 2);
      
      this.activeTrack.setAttribute('position', `${activeTrackX} 0 0.002`);
      this.activeTrack.setAttribute('width', Math.max(0, activeWidth));
      this.activeTrack.setAttribute('height', this.data.trackHeight);
      this.activeTrack.setAttribute('radius', this.data.trackHeight / 2);
      this.activeTrack.setAttribute('color', this.data.activeTrackColor);
      this.activeTrack.setAttribute('opacity', effectiveOpacity);
    }

    // Update thumb appearance and position
    if (this.thumb && this.shouldUpdateThumb(changedProperties)) {
      const thumbX = -this.data.width / 2 + this.state.thumbX;
      this.thumb.setAttribute('position', `${thumbX} 0 0.004`);
      this.thumb.setAttribute('radius', this.data.thumbRadius);
      this.thumb.setAttribute('color', this.data.thumbColor);
      this.thumb.setAttribute('opacity', effectiveOpacity);
    }

    // Update focus ring to match thumb
    if (this.focusRing && this.shouldUpdateFocusRing(changedProperties)) {
      const thumbX = -this.data.width / 2 + this.state.thumbX;
      this.focusRing.setAttribute('position', `${thumbX} 0 0.004`);
      this.focusRing.setAttribute('radius-inner', this.data.thumbRadius + 0.01);
      this.focusRing.setAttribute('radius-outer', this.data.thumbRadius + 0.02);
      this.focusRing.setAttribute('color', this.data.focusRingColor);
      this.focusRing.setAttribute('opacity', effectiveOpacity);
    }

    // Update value bubble position (content will be handled in task 10)
    if (this.valueBubble && this.shouldUpdateValueBubble(changedProperties)) {
      const thumbX = -this.data.width / 2 + this.state.thumbX;
      this.valueBubble.setAttribute('position', `${thumbX} ${this.data.thumbRadius + 0.15} 0.005`);
    }

    // Update hitbox dimensions
    if (this.hitbox && this.shouldUpdateHitbox(changedProperties)) {
      this.hitbox.setAttribute('width', this.data.width + this.data.thumbRadius * 2);
      this.hitbox.setAttribute('height', Math.max(this.data.trackHeight, this.data.thumbRadius * 2) + 0.1);
    }
  },

  // Selective update helpers - only update when relevant properties change
  shouldUpdateTrack: function(changedProperties) {
    return changedProperties.has('width') || 
           changedProperties.has('trackHeight') || 
           changedProperties.has('trackColor') || 
           changedProperties.has('opacity') ||
           changedProperties.has('disabled') ||
           changedProperties.has('disabledOpacity');
  },

  shouldUpdateActiveTrack: function(changedProperties) {
    return changedProperties.has('width') || 
           changedProperties.has('trackHeight') || 
           changedProperties.has('activeTrackColor') || 
           changedProperties.has('opacity') ||
           changedProperties.has('disabled') ||
           changedProperties.has('disabledOpacity') ||
           changedProperties.has('value') ||
           changedProperties.has('min') ||
           changedProperties.has('max');
  },

  shouldUpdateThumb: function(changedProperties) {
    return changedProperties.has('thumbRadius') || 
           changedProperties.has('thumbColor') || 
           changedProperties.has('opacity') ||
           changedProperties.has('disabled') ||
           changedProperties.has('disabledOpacity') ||
           changedProperties.has('value') ||
           changedProperties.has('min') ||
           changedProperties.has('max') ||
           changedProperties.has('width');
  },

  shouldUpdateFocusRing: function(changedProperties) {
    return changedProperties.has('thumbRadius') || 
           changedProperties.has('focusRingColor') || 
           changedProperties.has('opacity') ||
           changedProperties.has('disabled') ||
           changedProperties.has('disabledOpacity') ||
           changedProperties.has('value') ||
           changedProperties.has('min') ||
           changedProperties.has('max') ||
           changedProperties.has('width');
  },

  shouldUpdateValueBubble: function(changedProperties) {
    return changedProperties.has('thumbRadius') ||
           changedProperties.has('value') ||
           changedProperties.has('min') ||
           changedProperties.has('max') ||
           changedProperties.has('width');
  },

  shouldUpdateHitbox: function(changedProperties) {
    return changedProperties.has('width') || 
           changedProperties.has('trackHeight') || 
           changedProperties.has('thumbRadius');
  },

  updateAccessibility: function() {
    // Set ARIA role and attributes for slider
    this.el.setAttribute('role', 'slider');
    this.el.setAttribute('aria-valuemin', this.data.min);
    this.el.setAttribute('aria-valuemax', this.data.max);
    this.el.setAttribute('aria-valuenow', this.state.valueNow);
    this.el.setAttribute('aria-disabled', String(this.data.disabled));
    
    // Set tabIndex based on disabled state (Requirement 4.6)
    const tabIndex = this.data.disabled ? -1 : (this.data.tabIndex || 0);
    this.el.setAttribute('tabindex', tabIndex);
    
    // Apply aria-label if provided
    if (this.data.ariaLabel) {
      this.el.setAttribute('aria-label', this.data.ariaLabel);
    }
    
    // Add readonly indication (not standard ARIA but useful for debugging)
    if (this.data.readonly) {
      this.el.setAttribute('aria-readonly', 'true');
    } else {
      this.el.removeAttribute('aria-readonly');
    }
  },

  pause: function () {
    // Clean up timers and event listeners
    this.cleanupTimers();
    FormControlHelpers.unbindAllEvents(this);
  },

  remove: function () {
    // Comprehensive component cleanup to prevent memory leaks
    
    // Clean up focus indicators
    FormControlHelpers.cleanupFocusIndicators(this);
    
    // Unbind all tracked event listeners
    FormControlHelpers.unbindAllEvents(this);
    
    // Clean up all tracked child DOM elements
    FormControlHelpers.cleanupChildren(this);
    
    // Restore original value property descriptor if it existed
    if (this.originalValueDescriptor) {
      Object.defineProperty(this.el, 'value', this.originalValueDescriptor);
    } else {
      // Remove the property we added
      delete this.el.value;
    }
    
    // Clear component references to prevent memory leaks
    this.track = null;
    this.activeTrack = null;
    this.marksContainer = null;
    this.thumb = null;
    this.focusRing = null;
    this.valueBubble = null;
    this.hitbox = null;
    this.state = null;
    this.system = null;
    this.formSystem = null;
    this.originalValueDescriptor = null;
  },

  cleanupTimers: function() {
    // Placeholder for timer cleanup
    // Will be implemented as needed in later tasks
  }
});

AFRAME.registerPrimitive('a-slider', {
  defaultComponents: {
    slider: {}
  },
  mappings: {
    // Value & Range mappings
    min: 'slider.min',
    max: 'slider.max',
    step: 'slider.step',
    value: 'slider.value',
    name: 'slider.name',
    disabled: 'slider.disabled',
    readonly: 'slider.readonly',

    // Layout & Visuals mappings
    width: 'slider.width',
    'track-height': 'slider.trackHeight',
    'thumb-radius': 'slider.thumbRadius',
    'track-color': 'slider.trackColor',
    'active-track-color': 'slider.activeTrackColor',
    'thumb-color': 'slider.thumbColor',
    'focus-ring-color': 'slider.focusRingColor',
    opacity: 'slider.opacity',

    // Marks & Bubble mappings
    marks: 'slider.marks',
    'mark-color': 'slider.markColor',
    'mark-size': 'slider.markSize',
    'show-value-bubble': 'slider.showValueBubble',
    format: 'slider.format',

    // Accessibility mappings
    'aria-label': 'slider.ariaLabel',
    'tab-index': 'slider.tabIndex',

    // Sound Effects mappings
    'sound-enabled': 'slider.soundEnabled',
    'sfx-slide-start': 'slider.sfxSlideStart',
    'sfx-slide-end': 'slider.sfxSlideEnd',
    'sfx-tick': 'slider.sfxTick',

    // Disabled state mappings
    'disabled-opacity': 'slider.disabledOpacity'
  }
});