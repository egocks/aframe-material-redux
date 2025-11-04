const Utils = require('../utils');
const Event = require('../core/event');
const Assets = require('./assets');
const FormControlHelpers = require('../core/form-control-helpers');
const AssetsRegistry = require('../core/assets-registry');

AFRAME.registerComponent('checkbox', {
  schema: {
    checked: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
    name: { type: "string", default: "" },
    value: { type: "string", default: "" },
    label: { type: "string", default: "" },
    checkboxColor: { type: "color", default: "#757575"},
    checkboxColorChecked: { type: "color", default: "#4076fd"},
    color: { type: "color", default: "#757575" },
    font: { type: "string", default: "" },
    letterSpacing: { type: "int", default: 0 },
    lineHeight: { type: "string", default: "" },
    opacity: { type: "number", default: 1 },
    width: { type: "number", default: 1 },
    
    // Configurable dimensions (Requirements 6.1, 6.2, 6.3, 6.4)
    size: { type: "number", default: 1 },
    labelOffset: { type: "number", default: 0.24 },
    disabledOpacity: { type: "number", default: 0.4 },
    
    // Accessibility properties (Requirements 4.1, 4.2, 4.6)
    ariaLabel: { type: "string", default: "" },
    tabIndex: { type: "int", default: 0 },
    description: { type: "string", default: "" },
    required: { type: "boolean", default: false },
    invalid: { type: "boolean", default: false }
  },
  init: function () {
    var that = this;

    // Initialize form control helpers for resource tracking
    FormControlHelpers.initFormControl(this);

    // Get system reference for cleanup
    this.system = FormControlHelpers.getFormSystem(this);
    this.formSystem = this.system;

    // Ensure assets for this feature via centralized registry
    AssetsRegistry.ensure(['checkbox']);

    // HITBOX - will be sized in update() based on size property
    this.hitbox = document.createElement('a-plane');
    this.hitbox.setAttribute('opacity', 0);
    this.el.appendChild(this.hitbox);
    FormControlHelpers.trackChild(this, this.hitbox);

    // OUTLINE - will be sized in update() based on size property
    this.outline = document.createElement('a-rounded');
    this.el.appendChild(this.outline);
    FormControlHelpers.trackChild(this, this.outline);

    // INSIDE - will be sized in update() based on size property
    this.inside = document.createElement('a-rounded');
    this.inside.setAttribute('color', "#EEE");
    this.el.appendChild(this.inside);
    FormControlHelpers.trackChild(this, this.inside);

    // CHECKMARK - will be sized in update() based on size property
    this.checkmark = document.createElement('a-image');
    this.checkmark.setAttribute('src', "#aframeCheckboxMark");
    this.el.appendChild(this.checkmark);
    FormControlHelpers.trackChild(this, this.checkmark);

    // LABEL
    this.label = document.createElement('a-entity');
    this.el.appendChild(this.label);
    FormControlHelpers.trackChild(this, this.label);

    // EVENTS - Use FormControlHelpers for automatic tracking
    this.clickHandler = FormControlHelpers.bindEvent(this, this.el, 'click', function(event) {
      if (that.data.disabled) { return; }
      that.data.checked = !that.data.checked;
      that.el.setAttribute('checked', that.data.checked);
      that.onClick();
    });
    
    this.mousedownHandler = FormControlHelpers.bindEvent(this, this.el, 'mousedown', function(event) {
      if (!that.system || !that.system.playSound) return;
      if (that.data.disabled) { that.system.playSound('checkboxClickDisabled'); return; }
      that.system.playSound('checkboxClick');
    });

    // HOVER EVENTS
    this.mouseenterHandler = FormControlHelpers.bindEvent(this, this.el, 'mouseenter', function(event) {
      if (!that.data.disabled) {
        that.onHoverStart();
      }
    });
    
    this.mouseleaveHandler = FormControlHelpers.bindEvent(this, this.el, 'mouseleave', function(event) {
      if (!that.data.disabled) {
        that.onHoverEnd();
      }
    });

    // Store original value property descriptor for cleanup
    this.originalValueDescriptor = Object.getOwnPropertyDescriptor(this.el, 'value');
    
    Object.defineProperty(this.el, 'value', {
      get: function() { return this.getAttribute('value'); },
      set: function(value) { this.setAttribute('value', value); },
      enumerable: true,
      configurable: true
    });
    
    // Setup accessibility features (Requirements 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 4.10)
    FormControlHelpers.setupAccessibility(this);
  },
  onClick: function(noemit) {
    if (this.data.checked) {
      this.check();
    } else {
      this.uncheck();
    }
    if (!noemit) { Event.emit(this.el, 'change', this.data.checked); }
  },
  check: function() {
    this.outline.setAttribute('color', this.data.checkboxColorChecked);
    this.inside.setAttribute('color', this.data.checkboxColorChecked);
    this.checkmark.setAttribute('visible', true);
    if (this.data.disabled) { this.disabled(); }
    
    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  uncheck: function() {
    this.outline.setAttribute('color', this.data.checkboxColor);
    this.inside.setAttribute('color', "#EEE");
    this.checkmark.setAttribute('visible', false);
    if (this.data.disabled) { this.disabled(); }
    
    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  disabled: function() {
    // Preserve checked state colors when disabled
    if (this.data.checked) {
      this.outline.setAttribute('color', this.data.checkboxColorChecked);
      this.inside.setAttribute('color', this.data.checkboxColorChecked);
    } else {
      this.outline.setAttribute('color', this.data.checkboxColor);
      this.inside.setAttribute('color', this.data.checkboxColor);
    }
    
    // Update ARIA attributes when disabled state changes (Requirement 4.2, 4.6)
    FormControlHelpers.updateARIA(this);
  },
  
  /**
   * Handle hover start - subtle visual feedback for enabled controls (Requirement 5.2)
   */
  onHoverStart: function() {
    if (this.data.disabled || !this.outline) return;
    
    // Create subtle hover effect with smooth transition
    const hoverColor = this.data.checked ? this.data.checkboxColorChecked : this.data.checkboxColor;
    const brighterColor = this.brightenColor(hoverColor, 0.1);
    
    // Use A-Frame animation for smooth transitions
    if (this.outline && this.outline.setAttribute) {
      this.outline.setAttribute('animation__hover', {
        property: 'color',
        to: brighterColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
    
    if (this.data.checked && this.inside && this.inside.setAttribute) {
      this.inside.setAttribute('animation__hover', {
        property: 'color',
        to: brighterColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
  },
  
  /**
   * Handle hover end - return to normal state (Requirement 5.2)
   */
  onHoverEnd: function() {
    if (this.data.disabled || !this.outline) return;
    
    // Return to normal colors with smooth transition
    const normalOutlineColor = this.data.checked ? this.data.checkboxColorChecked : this.data.checkboxColor;
    const normalInsideColor = this.data.checked ? this.data.checkboxColorChecked : "#EEE";
    
    if (this.outline && this.outline.setAttribute) {
      this.outline.setAttribute('animation__hover', {
        property: 'color',
        to: normalOutlineColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
    
    if (this.data.checked && this.inside && this.inside.setAttribute) {
      this.inside.setAttribute('animation__hover', {
        property: 'color',
        to: normalInsideColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
  },
  
  /**
   * Brighten a color by a given factor for hover effects
   */
  brightenColor: function(color, factor) {
    // Simple hex color brightening without THREE.js dependency
    if (typeof color === 'string' && color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const brighterR = Math.min(255, Math.floor(r + (255 - r) * factor));
      const brighterG = Math.min(255, Math.floor(g + (255 - g) * factor));
      const brighterB = Math.min(255, Math.floor(b + (255 - b) * factor));
      
      return '#' + 
        brighterR.toString(16).padStart(2, '0') +
        brighterG.toString(16).padStart(2, '0') +
        brighterB.toString(16).padStart(2, '0');
    }
    
    // Fallback to original color if parsing fails
    return color;
  },
  
  /**
   * Event-driven opacity update - replaces setInterval polling
   */
  updateOpacityWhenReady: function() {
    const targetOpacity = this.data.disabled ? this.data.disabledOpacity : 1;
    
    // Try immediate update if geometry is ready
    if (this.checkmark && this.checkmark.object3D && this.checkmark.object3D.children[0]) {
      Utils.updateOpacity(this.checkmark, targetOpacity);
      Utils.updateOpacity(this.label, targetOpacity);
      return;
    }
    
    // Otherwise wait for loaded event
    let boundOnLoaded;
    const onLoaded = () => {
      Utils.updateOpacity(this.checkmark, targetOpacity);
      Utils.updateOpacity(this.label, targetOpacity);
      this.el.removeEventListener('loaded', boundOnLoaded);
    };
    
    boundOnLoaded = FormControlHelpers.bindEvent(this, this.el, 'loaded', onLoaded);
    
    // Fallback: single requestAnimationFrame check if loaded event doesn't fire
    requestAnimationFrame(() => {
      if (this.checkmark && this.checkmark.object3D && this.checkmark.object3D.children[0]) {
        Utils.updateOpacity(this.checkmark, targetOpacity);
        Utils.updateOpacity(this.label, targetOpacity);
        this.el.removeEventListener('loaded', boundOnLoaded);
      }
    });
  },
  
  /**
   * Optimized text width calculation - replaces recursive trimming
   * Simple approach that preserves labels while eliminating polling
   */
  updateTextWidth: function() {
    if (!this.data.label.length) return;
    
    const props = {
      value: this.data.label,
      color: this.data.color,
      align: 'left',
      wrapCount: 10 * (this.data.width + 0.2),
      width: this.data.width
    };
    
    if (this.data.font) {
      props.font = this.data.font;
    }
    
    // Simply set the text - A-Frame handles wrapping automatically
    this.label.setAttribute('text', props);
  },
  update: function () {
    var that = this;
    this.onClick(true);

    // Calculate scaled dimensions based on size property (Requirements 6.1, 6.2)
    const boxSize = 0.2 * this.data.size;
    const insideSize = 0.156 * this.data.size;
    const checkmarkSize = 0.16 * this.data.size;
    const boxRadius = 0.02 * this.data.size;
    const insideRadius = 0.01 * this.data.size;
    const checkboxOffset = boxSize / 2; // Position checkbox at half its size from origin

    // HITBOX - scale proportionally with size (Requirement 6.4)
    this.hitbox.setAttribute('width', this.data.width);
    this.hitbox.setAttribute('height', boxSize);
    this.hitbox.setAttribute('position', this.data.width/2 + ' 0 0.01');

    // OUTLINE - scale with size property
    this.outline.setAttribute('width', boxSize);
    this.outline.setAttribute('height', boxSize);
    this.outline.setAttribute('radius', boxRadius);
    this.outline.setAttribute('position', `0 -${checkboxOffset} 0.01`);

    // INSIDE - scale with size property
    this.inside.setAttribute('width', insideSize);
    this.inside.setAttribute('height', insideSize);
    this.inside.setAttribute('radius', insideRadius);
    this.inside.setAttribute('position', `${insideSize/8} -${insideSize/2} 0.02`);

    // CHECKMARK - scale with size property
    this.checkmark.setAttribute('width', checkmarkSize);
    this.checkmark.setAttribute('height', checkmarkSize);
    this.checkmark.setAttribute('position', checkboxOffset + ' 0 0.03');

    let props = {
      color: this.data.color,
      align: 'left',
      wrapCount: 10*(this.data.width+0.2),
      width: this.data.width,
    }
    if (this.data.font) { props.font = this.data.font; }

    // LABEL - use configurable labelOffset (Requirement 6.3)
    props.value = this.data.label;
    props.color = this.data.color;
    this.label.setAttribute('text', props);
    this.label.setAttribute('position', (this.data.width/2 + this.data.labelOffset) + ' 0 0.01');

    // Event-driven updates - no polling or setTimeout wrappers
    
    // Apply opacity immediately if geometry is ready, otherwise wait for loaded event
    this.updateOpacityWhenReady();
    
    // Update ARIA attributes when properties change (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  remove: function () {
    // Comprehensive component cleanup to prevent memory leaks
    
    // 1. Clean up focus indicators (Requirements 4.7, 4.8, 4.9, 4.10)
    FormControlHelpers.cleanupFocusIndicators(this);
    
    // 2. Unbind all tracked event listeners
    FormControlHelpers.unbindAllEvents(this);
    
    // 3. Clean up all tracked child DOM elements
    FormControlHelpers.cleanupChildren(this);
    
    
    
    // 5. Restore original value property descriptor if it existed
    if (this.originalValueDescriptor) {
      Object.defineProperty(this.el, 'value', this.originalValueDescriptor);
    } else {
      // Remove the property we added
      delete this.el.value;
    }
    
    // 6. Clear component references to prevent memory leaks
    this.hitbox = null;
    this.outline = null;
    this.inside = null;
    this.checkmark = null;
    this.label = null;
    this.system = null;
    this.clickHandler = null;
    this.mousedownHandler = null;
    // this.mouseenterHandler = null;
    // this.mouseleaveHandler = null;
    this.originalValueDescriptor = null;
    
    // 7. No timers to clear - using event-driven updates
  }
});

AFRAME.registerPrimitive('a-checkbox', {
  defaultComponents: {
    checkbox: {}
  },
  mappings: {
    checked: 'checkbox.checked',
    disabled: 'checkbox.disabled',
    name: 'checkbox.name',
    value: 'checkbox.value',
    label: 'checkbox.label',
    'checkbox-color': 'checkbox.checkboxColor',
    'checkbox-color-checked': 'checkbox.checkboxColorChecked',
    color: 'checkbox.color',
    align: 'checkbox.align',
    font: 'checkbox.font',
    'letter-spacing': 'checkbox.letterSpacing',
    'line-height': 'checkbox.lineHeight',
    'opacity': 'checkbox.opacity',
    width: 'checkbox.width',
    
    // Configurable dimensions mappings
    size: 'checkbox.size',
    'label-offset': 'checkbox.labelOffset',
    'disabled-opacity': 'checkbox.disabledOpacity',
    
    // Accessibility mappings
    'aria-label': 'checkbox.ariaLabel',
    'tab-index': 'checkbox.tabIndex',
    description: 'checkbox.description',
    required: 'checkbox.required',
    invalid: 'checkbox.invalid'
  }
});
