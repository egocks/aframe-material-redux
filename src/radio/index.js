const Utils = require('../utils');
const Event = require('../core/event');
const FormControlHelpers = require('../core/form-control-helpers');
const AssetsRegistry = require('../core/assets-registry');

AFRAME.registerComponent('radio', {
  schema: {
    checked: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
    name: { type: "string", default: "" },
    value: { type: "string", default: "" },
    label: { type: "string", default: "" },
    radioColor: { type: "color", default: "#757575"},
    radioColorChecked: { type: "color", default: "#4076fd"},
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
    AssetsRegistry.ensure(['radio']);
    if (this.system && this.system.registerRadioGroup) { this.system.registerRadioGroup(this.el); }

    

    // HITBOX - will be sized in update() based on size property
    this.hitbox = document.createElement('a-plane');
    this.hitbox.setAttribute('opacity', 0);
    this.el.appendChild(this.hitbox);
    FormControlHelpers.trackChild(this, this.hitbox);

    // OUTLINE - will be sized in update() based on size property
    this.outline = document.createElement('a-ring');
    this.el.appendChild(this.outline);
    FormControlHelpers.trackChild(this, this.outline);

    // CIRCLE - will be sized in update() based on size property
    this.circle = document.createElement('a-circle');
    this.el.appendChild(this.circle);
    FormControlHelpers.trackChild(this, this.circle);

    // LABEL
    this.label = document.createElement('a-entity');
    this.el.appendChild(this.label);
    FormControlHelpers.trackChild(this, this.label);

    // EVENTS - Use FormControlHelpers for automatic tracking
    this.clickHandler = FormControlHelpers.bindEvent(this, this.el, 'click', function(event) {
      if (that.data.disabled) { return; }
      that.el.setAttribute('checked', true);
      that.onClick();
    });
    
    this.mousedownHandler = FormControlHelpers.bindEvent(this, this.el, 'mousedown', function(event) {
      if (!that.system || !that.system.playSound) return;
      if (that.data.disabled) { that.system.playSound('radioClickDisabled'); return; }
      that.system.playSound('radioClick');
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
    if (this.data.name && this.system && this.system.getRadioGroup) {
      const group = this.system.getRadioGroup(this.el) || [];
      if (group.length) {
        group.forEach((el) => {
          if (el === this.el) {
            if (!this.data.checked) {
              this.check();
              if (!noemit) { Event.emit(this.el, 'change', true); }
            }
          } else if (el.components && el.components.radio) {
            el.components.radio.uncheck();
          }
        });
        return;
      }
    }
    if (this.data.name) {
      let nearestForm = this.el.closest("a-form");
      if (nearestForm) {
        let didCheck = false;
        let children = Array.from(nearestForm.querySelectorAll(`[name=${this.data.name}]`));
        children.reverse();
        for (let child of children) {
          // Radio + not disabled
          if (child.components.radio ) {
            // Currently checked
            if (child === this.el && child.hasAttribute('checked')) {
              didCheck = true;
              child.components.radio.check();
              if (!noemit) { Event.emit(child, 'change', true); }
            } else {
              if (!didCheck && !this.data.checked && child.hasAttribute('checked')) {
                didCheck = true;
                child.components.radio.check();
              } else {
                child.components.radio.uncheck();
              }
            }
          }
        }
        if (!didCheck && this.el.hasAttribute('checked')) {
          this.check();
          if (!noemit) { Event.emit(this.el, 'change', true); }
        }
      }
    }
  },
  check: function() {
    this.outline.setAttribute('color', this.data.radioColorChecked);
    this.circle.setAttribute('color', this.data.radioColorChecked);
    this.circle.setAttribute('visible', true);
    if (this.data.disabled) { this.disabled(); }
    
    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
    
    // Update roving tabindex for radio group (Requirements 4.4, 4.7, 4.8)
    FormControlHelpers.updateRadioGroupTabindex(this);
  },
  uncheck: function() {
    this.outline.setAttribute('color', this.data.radioColor);
    this.circle.setAttribute('visible', false);
    if (this.data.disabled) { this.disabled(); }
    
    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
    
    // Update roving tabindex for radio group (Requirements 4.4, 4.7, 4.8)
    FormControlHelpers.updateRadioGroupTabindex(this);
  },
  disabled: function() {
    // Preserve checked state colors when disabled
    if (this.data.checked) {
      this.outline.setAttribute('color', this.data.radioColorChecked);
      this.circle.setAttribute('color', this.data.radioColorChecked);
    } else {
      this.outline.setAttribute('color', this.data.radioColor);
      this.circle.setAttribute('color', this.data.radioColor);
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
    const hoverColor = this.data.checked ? this.data.radioColorChecked : this.data.radioColor;
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
    
    if (this.data.checked && this.circle && this.circle.getAttribute && this.circle.getAttribute('visible')) {
      this.circle.setAttribute('animation__hover', {
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
    const normalColor = this.data.checked ? this.data.radioColorChecked : this.data.radioColor;
    
    if (this.outline && this.outline.setAttribute) {
      this.outline.setAttribute('animation__hover', {
        property: 'color',
        to: normalColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
    
    if (this.data.checked && this.circle && this.circle.getAttribute && this.circle.getAttribute('visible')) {
      this.circle.setAttribute('animation__hover', {
        property: 'color',
        to: normalColor,
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
    if (this.outline && this.outline.object3D && this.outline.object3D.children[0]) {
      Utils.updateOpacity(this.outline, targetOpacity);
      Utils.updateOpacity(this.circle, targetOpacity);
      Utils.updateOpacity(this.label, targetOpacity);
      return;
    }
    
    // Otherwise wait for loaded event
    let boundOnLoaded;
    const onLoaded = () => {
      Utils.updateOpacity(this.outline, targetOpacity);
      Utils.updateOpacity(this.circle, targetOpacity);
      Utils.updateOpacity(this.label, targetOpacity);
      this.el.removeEventListener('loaded', boundOnLoaded);
    };
    
    boundOnLoaded = FormControlHelpers.bindEvent(this, this.el, 'loaded', onLoaded);
    
    // Fallback: single requestAnimationFrame check if loaded event doesn't fire
    requestAnimationFrame(() => {
      if (this.outline && this.outline.object3D && this.outline.object3D.children[0]) {
        Utils.updateOpacity(this.outline, targetOpacity);
        Utils.updateOpacity(this.circle, targetOpacity);
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
    if (this.system && this.system.registerRadioGroup) { this.system.registerRadioGroup(this.el); }

    // Calculate scaled dimensions based on size property (Requirements 6.1, 6.2)
    const baseRadius = 0.1 * this.data.size;
    const innerRadius = 0.078 * this.data.size;
    const circleRadius = 0.05 * this.data.size;
    const hitboxHeight = 0.2 * this.data.size;
    const radioOffset = baseRadius; // Position radio at its radius from origin

    // HITBOX - scale proportionally with size (Requirement 6.4)
    this.hitbox.setAttribute('width', this.data.width);
    this.hitbox.setAttribute('height', hitboxHeight);
    this.hitbox.setAttribute('position', this.data.width/2 + ' 0 0.001');

    // OUTLINE - scale with size property
    this.outline.setAttribute('radius-outer', baseRadius);
    this.outline.setAttribute('radius-inner', innerRadius);
    this.outline.setAttribute('position', radioOffset + ' 0 0.002');

    // CIRCLE - scale with size property
    this.circle.setAttribute('radius', circleRadius);
    this.circle.setAttribute('position', radioOffset + ' 0 0.002');

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
    this.label.setAttribute('position', (this.data.width/2 + this.data.labelOffset) + ' 0 0.002');

    // Event-driven updates - no polling or setTimeout wrappers
    
    // Apply opacity immediately if geometry is ready, otherwise wait for loaded event
    this.updateOpacityWhenReady();
    
    // Update ARIA attributes when properties change (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  remove: function () {
    // Comprehensive component cleanup to prevent memory leaks
    
    // 1. Unregister from radio group registry if system available
    if (this.system && this.system.unregisterRadio) {
      this.system.unregisterRadio(this.el);
    }
    
    // 2. Clean up focus indicators (Requirements 4.7, 4.8, 4.9, 4.10)
    FormControlHelpers.cleanupFocusIndicators(this);
    
    // 3. Unbind all tracked event listeners
    FormControlHelpers.unbindAllEvents(this);
    
    // 4. Clean up all tracked child DOM elements
    FormControlHelpers.cleanupChildren(this);
    
    
    
    // 6. Restore original value property descriptor if it existed
    if (this.originalValueDescriptor) {
      Object.defineProperty(this.el, 'value', this.originalValueDescriptor);
    } else {
      // Remove the property we added
      delete this.el.value;
    }
    
    // 7. Clear component references to prevent memory leaks
    this.hitbox = null;
    this.outline = null;
    this.circle = null;
    this.label = null;
    this.system = null;
    this.clickHandler = null;
    this.mousedownHandler = null;
    // this.mouseenterHandler = null;
    // this.mouseleaveHandler = null;
    this.originalValueDescriptor = null;
    
    // 8. No timers to clear - using event-driven updates
  }
});

AFRAME.registerPrimitive('a-radio', {
  defaultComponents: {
    radio: {}
  },
  mappings: {
    checked: 'radio.checked',
    disabled: 'radio.disabled',
    name: 'radio.name',
    value: 'radio.value',
    label: 'radio.label',
    'radio-color': 'radio.radioColor',
    'radio-color-checked': 'radio.radioColorChecked',
    color: 'radio.color',
    align: 'radio.align',
    font: 'radio.font',
    'letter-spacing': 'radio.letterSpacing',
    'line-height': 'radio.lineHeight',
    'opacity': 'radio.opacity',
    width: 'radio.width',
    
    // Configurable dimensions mappings
    size: 'radio.size',
    'label-offset': 'radio.labelOffset',
    'disabled-opacity': 'radio.disabledOpacity',
    
    // Accessibility mappings
    'aria-label': 'radio.ariaLabel',
    'tab-index': 'radio.tabIndex',
    description: 'radio.description',
    required: 'radio.required',
    invalid: 'radio.invalid'
  }
});
