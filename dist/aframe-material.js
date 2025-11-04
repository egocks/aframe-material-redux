/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/button/assets.js":
/*!******************************!*\
  !*** ./src/button/assets.js ***!
  \******************************/
/***/ ((module) => {

module.exports = [{
  type: 'img',
  id: 'aframeButtonShadow',
  src: "".concat(AFRAME.ASSETS_PATH, "/images/ButtonShadow.png")
}, {
  type: 'audio',
  id: 'aframeButtonClick',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/ButtonClick.mp3")
}, {
  type: 'audio',
  id: 'aframeButtonClickDisabled',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/ButtonClickDisabled.mp3")
}];

/***/ }),

/***/ "./src/button/index.js":
/*!*****************************!*\
  !*** ./src/button/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
var Assets = __webpack_require__(/*! ./assets */ "./src/button/assets.js");
var SFX = __webpack_require__(/*! ./sfx */ "./src/button/sfx.js");
AFRAME.registerComponent('button', {
  schema: {
    disabled: {
      type: 'boolean',
      "default": false
    },
    type: {
      type: "string",
      "default": "raised"
    },
    name: {
      type: "string",
      "default": ""
    },
    value: {
      type: "string",
      "default": "Button"
    },
    buttonColor: {
      type: "color",
      "default": "#4076fd"
    },
    color: {
      type: "color",
      "default": "#FFF"
    },
    font: {
      type: "string",
      "default": ""
    },
    letterSpacing: {
      type: "int",
      "default": 0
    },
    lineHeight: {
      type: "string",
      "default": ""
    },
    opacity: {
      type: "number",
      "default": 1
    },
    width: {
      type: "number",
      "default": 1
    }
  },
  init: function init() {
    var that = this;

    // Assets
    Utils.preloadAssets(Assets);

    // SFX
    SFX.init(this.el);
    this.wrapper = document.createElement('a-entity');
    this.wrapper.setAttribute('position', '0 0 0.01');
    this.el.appendChild(this.wrapper);
    this.shadow = document.createElement('a-image');
    this.shadow.setAttribute('height', 0.36 * 1.25);
    this.shadow.setAttribute('src', '#aframeButtonShadow');
    this.wrapper.appendChild(this.shadow);

    // OUTLINE
    this.outline = document.createElement('a-rounded');
    this.outline.setAttribute('height', 0.36);
    this.outline.setAttribute('radius', 0.03);
    this.outline.setAttribute('position', "0 -".concat(0.36 / 2, " 0.01"));
    this.wrapper.appendChild(this.outline);

    // LABEL
    this.label = document.createElement('a-entity');
    this.outline.appendChild(this.label);

    // EVENTS
    this.el.addEventListener('click', function () {
      if (this.components.button && this.components.button.data.disabled) {
        return;
      }
      that.onClick();
    });
    this.el.addEventListener('mousedown', function () {
      if (this.components.button && this.components.button.data.disabled) {
        return SFX.clickDisabled(this);
      }
      that.wrapper.setAttribute('position', "0 0 0.036");
      SFX.click(this);
    });
    this.el.addEventListener('mouseup', function () {
      if (this.components.button && this.components.button.data.disabled) {
        return;
      }
      that.wrapper.setAttribute('position', "0 0 0");
    });
    this.el.getWidth = this.getWidth.bind(this);
    Object.defineProperty(this.el, 'value', {
      get: function get() {
        return this.getAttribute('value');
      },
      set: function set(value) {
        this.setAttribute('value', value);
      },
      enumerable: true,
      configurable: true
    });
  },
  onClick: function onClick() {
    //Event.emit(this.el, 'click');
  },
  getWidth: function getWidth() {
    return this.__width;
  },
  update: function update() {
    var that = this;
    this.outline.setAttribute('color', this.data.buttonColor);
    var props = {
      color: this.data.color,
      align: 'center',
      wrapCount: 10 * this.data.width,
      width: this.data.width
    };
    if (this.data.font) {
      props.font = this.data.font;
    }
    if (this.data.type === "flat") {
      props.color = this.data.buttonColor;
    }

    // TITLE
    props.value = this.data.value.toUpperCase();
    this.label.setAttribute('text', props);
    this.label.setAttribute('position', this.data.width / 2 + 0.24 + ' 0 0.01');

    // TRIM TEXT IF NEEDED.. @TODO: optimize this mess..
    function getTextWidth(el, callback, _widthFactor) {
      if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) {
        return setTimeout(function () {
          getTextWidth(el, callback);
        }, 10);
      }
      var v = el.object3D.children[0].geometry.visibleGlyphs;
      if (!v) {
        return setTimeout(function () {
          getTextWidth(el, callback);
        }, 10);
      }
      v = v[v.length - 1];
      if (!v) {
        return callback(0);
      }
      if (v.line) {
        props.value = props.value.slice(0, -1);
        el.setAttribute("text", props);
        return getTextWidth(el, callback);
      } else {
        if (!_widthFactor) {
          _widthFactor = Utils.getWidthFactor(el, props.wrapCount);
        }
        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
        var textRatio = v / that.data.width;
        if (textRatio > 1) {
          props.value = props.value.slice(0, -1);
          el.setAttribute("text", props);
          return getTextWidth(el, callback, _widthFactor);
        }
      }
      return callback(v);
    }
    setTimeout(function () {
      if (that.data.value.length) {
        getTextWidth(that.label, function (width) {
          that.label.setAttribute('position', "".concat(width / 2 + 0.28 / 2, " ").concat(0.36 / 2, " 0.02")); //
          width = width + 0.28;
          that.outline.setAttribute('width', width);
          that.__width = width;
          that.shadow.setAttribute('width', width * 1.17);
          that.shadow.setAttribute('position', width / 2 + ' 0 0');
          Event.emit(that.el, 'change:width', width);
        });
      }
      if (that.data.disabled) {
        that.shadow.setAttribute('visible', false);
        var timer = setInterval(function () {
          if (that.label.object3D.children[0] && that.label.object3D.children[0].geometry.visibleGlyphs) {
            clearInterval(timer);
            Utils.updateOpacity(that.el, 0.4);
          }
        }, 10);
      } else {
        var _timer = setInterval(function () {
          if (that.label.object3D.children[0] && that.label.object3D.children[0].geometry.visibleGlyphs) {
            clearInterval(_timer);
            Utils.updateOpacity(that.el, 1);
          }
        }, 10);
      }
      if (that.data.type === "flat") {
        that.shadow.setAttribute('visible', false);
        var _timer2 = setInterval(function () {
          if (that.label.object3D.children[0] && that.label.object3D.children[0].geometry.visibleGlyphs) {
            clearInterval(_timer2);
            Utils.updateOpacity(that.outline, 0);
            if (that.data.disabled) {
              Utils.updateOpacity(that.label, 0.4);
            }
          }
        }, 10);
      }
    }, 0);
  },
  tick: function tick() {},
  remove: function remove() {},
  pause: function pause() {},
  play: function play() {}
});
AFRAME.registerPrimitive('a-button', {
  defaultComponents: {
    button: {}
  },
  mappings: {
    disabled: 'button.disabled',
    type: 'button.type',
    name: 'button.name',
    value: 'button.value',
    'button-color': 'button.buttonColor',
    color: 'button.color',
    font: 'button.font',
    'letter-spacing': 'button.letterSpacing',
    'line-height': 'button.lineHeight',
    'opacity': 'button.opacity',
    'width': 'button.width'
  }
});

/***/ }),

/***/ "./src/button/sfx.js":
/*!***************************!*\
  !*** ./src/button/sfx.js ***!
  \***************************/
/***/ ((module) => {

var SFX = {
  init: function init(parent) {
    var el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeButtonClickSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeButtonClick');
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
    el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeButtonClickDisabledSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeButtonClickDisabled');
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
  },
  click: function click(parent) {
    var el = parent.querySelector('[key=aframeButtonClickSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  },
  clickDisabled: function clickDisabled(parent) {
    var el = parent.querySelector('[key=aframeButtonClickDisabledSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  }
};
module.exports = SFX;

/***/ }),

/***/ "./src/checkbox/assets.js":
/*!********************************!*\
  !*** ./src/checkbox/assets.js ***!
  \********************************/
/***/ ((module) => {

module.exports = [{
  type: 'img',
  id: 'aframeCheckboxMark',
  src: "".concat(AFRAME.ASSETS_PATH, "/images/CheckmarkIcon.png")
}, {
  type: 'audio',
  id: 'aframeCheckboxClick',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/InputClick.mp3")
}, {
  type: 'audio',
  id: 'aframeCheckboxClickDisabled',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/ButtonClickDisabled.mp3")
}];

/***/ }),

/***/ "./src/checkbox/index.js":
/*!*******************************!*\
  !*** ./src/checkbox/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
var Assets = __webpack_require__(/*! ./assets */ "./src/checkbox/assets.js");
var FormControlHelpers = __webpack_require__(/*! ../core/form-control-helpers */ "./src/core/form-control-helpers.js");
var AssetsRegistry = __webpack_require__(/*! ../core/assets-registry */ "./src/core/assets-registry.js");
AFRAME.registerComponent('checkbox', {
  schema: {
    checked: {
      type: 'boolean',
      "default": false
    },
    disabled: {
      type: 'boolean',
      "default": false
    },
    name: {
      type: "string",
      "default": ""
    },
    value: {
      type: "string",
      "default": ""
    },
    label: {
      type: "string",
      "default": ""
    },
    checkboxColor: {
      type: "color",
      "default": "#757575"
    },
    checkboxColorChecked: {
      type: "color",
      "default": "#4076fd"
    },
    color: {
      type: "color",
      "default": "#757575"
    },
    font: {
      type: "string",
      "default": ""
    },
    letterSpacing: {
      type: "int",
      "default": 0
    },
    lineHeight: {
      type: "string",
      "default": ""
    },
    opacity: {
      type: "number",
      "default": 1
    },
    width: {
      type: "number",
      "default": 1
    },
    // Configurable dimensions (Requirements 6.1, 6.2, 6.3, 6.4)
    size: {
      type: "number",
      "default": 1
    },
    labelOffset: {
      type: "number",
      "default": 0.24
    },
    disabledOpacity: {
      type: "number",
      "default": 0.4
    },
    // Accessibility properties (Requirements 4.1, 4.2, 4.6)
    ariaLabel: {
      type: "string",
      "default": ""
    },
    tabIndex: {
      type: "int",
      "default": 0
    },
    description: {
      type: "string",
      "default": ""
    },
    required: {
      type: "boolean",
      "default": false
    },
    invalid: {
      type: "boolean",
      "default": false
    }
  },
  init: function init() {
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
    this.clickHandler = FormControlHelpers.bindEvent(this, this.el, 'click', function (event) {
      if (that.data.disabled) {
        return;
      }
      that.data.checked = !that.data.checked;
      that.el.setAttribute('checked', that.data.checked);
      that.onClick();
    });
    this.mousedownHandler = FormControlHelpers.bindEvent(this, this.el, 'mousedown', function (event) {
      if (!that.system || !that.system.playSound) return;
      if (that.data.disabled) {
        that.system.playSound('checkboxClickDisabled');
        return;
      }
      that.system.playSound('checkboxClick');
    });

    // HOVER EVENTS
    this.mouseenterHandler = FormControlHelpers.bindEvent(this, this.el, 'mouseenter', function (event) {
      if (!that.data.disabled) {
        that.onHoverStart();
      }
    });
    this.mouseleaveHandler = FormControlHelpers.bindEvent(this, this.el, 'mouseleave', function (event) {
      if (!that.data.disabled) {
        that.onHoverEnd();
      }
    });

    // Store original value property descriptor for cleanup
    this.originalValueDescriptor = Object.getOwnPropertyDescriptor(this.el, 'value');
    Object.defineProperty(this.el, 'value', {
      get: function get() {
        return this.getAttribute('value');
      },
      set: function set(value) {
        this.setAttribute('value', value);
      },
      enumerable: true,
      configurable: true
    });

    // Setup accessibility features (Requirements 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 4.10)
    FormControlHelpers.setupAccessibility(this);
  },
  onClick: function onClick(noemit) {
    if (this.data.checked) {
      this.check();
    } else {
      this.uncheck();
    }
    if (!noemit) {
      Event.emit(this.el, 'change', this.data.checked);
    }
  },
  check: function check() {
    this.outline.setAttribute('color', this.data.checkboxColorChecked);
    this.inside.setAttribute('color', this.data.checkboxColorChecked);
    this.checkmark.setAttribute('visible', true);
    if (this.data.disabled) {
      this.disabled();
    }

    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  uncheck: function uncheck() {
    this.outline.setAttribute('color', this.data.checkboxColor);
    this.inside.setAttribute('color', "#EEE");
    this.checkmark.setAttribute('visible', false);
    if (this.data.disabled) {
      this.disabled();
    }

    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  disabled: function disabled() {
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
  onHoverStart: function onHoverStart() {
    if (this.data.disabled || !this.outline) return;

    // Create subtle hover effect with smooth transition
    var hoverColor = this.data.checked ? this.data.checkboxColorChecked : this.data.checkboxColor;
    var brighterColor = this.brightenColor(hoverColor, 0.1);

    // Use A-Frame animation for smooth transitions
    if (this.outline && this.outline.setAttribute) {
      this.outline.setAttribute('animation__hover', {
        property: 'material.color',
        to: brighterColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
    if (this.data.checked && this.inside && this.inside.setAttribute) {
      this.inside.setAttribute('animation__hover', {
        property: 'material.color',
        to: brighterColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
  },
  /**
   * Handle hover end - return to normal state (Requirement 5.2)
   */
  onHoverEnd: function onHoverEnd() {
    if (this.data.disabled || !this.outline) return;

    // Return to normal colors with smooth transition
    var normalOutlineColor = this.data.checked ? this.data.checkboxColorChecked : this.data.checkboxColor;
    var normalInsideColor = this.data.checked ? this.data.checkboxColorChecked : "#EEE";
    if (this.outline && this.outline.setAttribute) {
      this.outline.setAttribute('animation__hover', {
        property: 'material.color',
        to: normalOutlineColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
    if (this.data.checked && this.inside && this.inside.setAttribute) {
      this.inside.setAttribute('animation__hover', {
        property: 'material.color',
        to: normalInsideColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
  },
  /**
   * Brighten a color by a given factor for hover effects
   */
  brightenColor: function brightenColor(color, factor) {
    // Simple hex color brightening without THREE.js dependency
    if (typeof color === 'string' && color.startsWith('#')) {
      var hex = color.slice(1);
      var r = parseInt(hex.substr(0, 2), 16);
      var g = parseInt(hex.substr(2, 2), 16);
      var b = parseInt(hex.substr(4, 2), 16);
      var brighterR = Math.min(255, Math.floor(r + (255 - r) * factor));
      var brighterG = Math.min(255, Math.floor(g + (255 - g) * factor));
      var brighterB = Math.min(255, Math.floor(b + (255 - b) * factor));
      return '#' + brighterR.toString(16).padStart(2, '0') + brighterG.toString(16).padStart(2, '0') + brighterB.toString(16).padStart(2, '0');
    }

    // Fallback to original color if parsing fails
    return color;
  },
  /**
   * Event-driven opacity update - replaces setInterval polling
   */
  updateOpacityWhenReady: function updateOpacityWhenReady() {
    var _this = this;
    var targetOpacity = this.data.disabled ? this.data.disabledOpacity : 1;

    // Try immediate update if geometry is ready
    if (this.checkmark && this.checkmark.object3D && this.checkmark.object3D.children[0]) {
      Utils.updateOpacity(this.checkmark, targetOpacity);
      Utils.updateOpacity(this.label, targetOpacity);
      return;
    }

    // Otherwise wait for loaded event
    var boundOnLoaded;
    var onLoaded = function onLoaded() {
      Utils.updateOpacity(_this.checkmark, targetOpacity);
      Utils.updateOpacity(_this.label, targetOpacity);
      _this.el.removeEventListener('loaded', boundOnLoaded);
    };
    boundOnLoaded = FormControlHelpers.bindEvent(this, this.el, 'loaded', onLoaded);

    // Fallback: single requestAnimationFrame check if loaded event doesn't fire
    requestAnimationFrame(function () {
      if (_this.checkmark && _this.checkmark.object3D && _this.checkmark.object3D.children[0]) {
        Utils.updateOpacity(_this.checkmark, targetOpacity);
        Utils.updateOpacity(_this.label, targetOpacity);
        _this.el.removeEventListener('loaded', boundOnLoaded);
      }
    });
  },
  /**
   * Optimized text width calculation - replaces recursive trimming
   * Simple approach that preserves labels while eliminating polling
   */
  updateTextWidth: function updateTextWidth() {
    if (!this.data.label.length) return;
    var props = {
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
  update: function update() {
    var that = this;
    this.onClick(true);

    // Calculate scaled dimensions based on size property (Requirements 6.1, 6.2)
    var boxSize = 0.2 * this.data.size;
    var insideSize = 0.156 * this.data.size;
    var checkmarkSize = 0.16 * this.data.size;
    var boxRadius = 0.02 * this.data.size;
    var insideRadius = 0.01 * this.data.size;
    var checkboxOffset = boxSize / 2; // Position checkbox at half its size from origin

    // HITBOX - scale proportionally with size (Requirement 6.4)
    this.hitbox.setAttribute('width', this.data.width);
    this.hitbox.setAttribute('height', boxSize);
    this.hitbox.setAttribute('position', this.data.width / 2 + ' 0 0.01');

    // OUTLINE - scale with size property
    this.outline.setAttribute('width', boxSize);
    this.outline.setAttribute('height', boxSize);
    this.outline.setAttribute('radius', boxRadius);
    this.outline.setAttribute('position', "0 -".concat(checkboxOffset, " 0.01"));

    // INSIDE - scale with size property
    this.inside.setAttribute('width', insideSize);
    this.inside.setAttribute('height', insideSize);
    this.inside.setAttribute('radius', insideRadius);
    this.inside.setAttribute('position', "".concat(insideSize / 8, " -").concat(insideSize / 2, " 0.02"));

    // CHECKMARK - scale with size property
    this.checkmark.setAttribute('width', checkmarkSize);
    this.checkmark.setAttribute('height', checkmarkSize);
    this.checkmark.setAttribute('position', checkboxOffset + ' 0 0.03');
    var props = {
      color: this.data.color,
      align: 'left',
      wrapCount: 10 * (this.data.width + 0.2),
      width: this.data.width
    };
    if (this.data.font) {
      props.font = this.data.font;
    }

    // LABEL - use configurable labelOffset (Requirement 6.3)
    props.value = this.data.label;
    props.color = this.data.color;
    this.label.setAttribute('text', props);
    this.label.setAttribute('position', this.data.width / 2 + this.data.labelOffset + ' 0 0.01');

    // Event-driven updates - no polling or setTimeout wrappers

    // Apply opacity immediately if geometry is ready, otherwise wait for loaded event
    this.updateOpacityWhenReady();

    // Update ARIA attributes when properties change (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  remove: function remove() {
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

/***/ }),

/***/ "./src/core/assets-registry.js":
/*!*************************************!*\
  !*** ./src/core/assets-registry.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var RadioAssets = __webpack_require__(/*! ../radio/assets */ "./src/radio/assets.js");
var CheckboxAssets = __webpack_require__(/*! ../checkbox/assets */ "./src/checkbox/assets.js");
var ButtonAssets, SwitchAssets, ToastAssets, KeyboardAssets;
try {
  ButtonAssets = __webpack_require__(/*! ../button/assets */ "./src/button/assets.js");
} catch (e) {
  ButtonAssets = [];
}
try {
  SwitchAssets = __webpack_require__(/*! ../switch/assets */ "./src/switch/assets.js");
} catch (e) {
  SwitchAssets = [];
}
try {
  ToastAssets = __webpack_require__(/*! ../toast/assets */ "./src/toast/assets.js");
} catch (e) {
  ToastAssets = [];
}
try {
  KeyboardAssets = __webpack_require__(/*! ../keyboard/assets */ "./src/keyboard/assets.js");
} catch (e) {
  KeyboardAssets = {};
}
function normalizeKeyboardAssets(obj) {
  var arr = [];
  if (!obj || _typeof(obj) !== 'object') return arr;
  Object.keys(obj).forEach(function (id) {
    var src = obj[id];
    if (typeof src !== 'string') return;
    var lower = src.toLowerCase();
    var type = 'img';
    if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg')) type = 'audio';
    arr.push({
      type: type,
      id: id,
      src: src
    });
  });
  return arr;
}
function normalizeArray(assets) {
  if (!assets) return [];
  if (Array.isArray(assets)) return assets;
  if (_typeof(assets) === 'object') return normalizeKeyboardAssets(assets);
  return [];
}
var FEATURE_ASSETS = {
  core: [],
  radio: normalizeArray(RadioAssets),
  checkbox: normalizeArray(CheckboxAssets),
  button: normalizeArray(ButtonAssets),
  "switch": normalizeArray(SwitchAssets),
  toast: normalizeArray(ToastAssets),
  keyboard: normalizeArray(KeyboardAssets)
};
var AssetsRegistry = {
  ensured: false,
  ensuredFeatures: new Set(),
  ensure: function ensure(features) {
    var _this = this;
    if (!features || !features.length) return;
    // Default assets path if not set
    if (typeof AFRAME !== 'undefined' && !AFRAME.ASSETS_PATH) {
      AFRAME.ASSETS_PATH = './assets';
    }

    // Build a deduped list by id
    var all = [];
    var ids = new Set();
    features.forEach(function (f) {
      var list = FEATURE_ASSETS[f] || [];
      list.forEach(function (item) {
        if (!item || !item.id || ids.has(item.id)) return;
        ids.add(item.id);
        all.push(item);
      });
      _this.ensuredFeatures.add(f);
    });
    if (all.length) {
      Utils.preloadAssets(all);
    }
  },
  ensureAll: function ensureAll() {
    this.ensure(Object.keys(FEATURE_ASSETS));
    this.ensured = true;
  }
};
module.exports = AssetsRegistry;

/***/ }),

/***/ "./src/core/event.js":
/*!***************************!*\
  !*** ./src/core/event.js ***!
  \***************************/
/***/ ((module) => {

module.exports = {
  emit: function emit(el, name, data) {
    el.dispatchEvent(new CustomEvent(name, {
      detail: data
    }));
  }
};

/***/ }),

/***/ "./src/core/form-control-helpers.js":
/*!******************************************!*\
  !*** ./src/core/form-control-helpers.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Form Control Helpers - Component utilities that USE Utils (no duplication)
 * 
 * Provides component-specific helper functions for radio/checkbox components.
 * All helpers use the Utils module for shared functionality rather than
 * reimplementing common operations.
 */

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var FormControlHelpers = {
  /**
   * Initialize common form control functionality
   * Call from component init() after system reference is set
   * @param {object} component - A-Frame component instance
   */
  initFormControl: function initFormControl(component) {
    component.eventHandlers = new Map();
    component.childElements = [];
    component.isInitialized = false;
    try {
      FormControlHelpers.validateConfiguration(component);
      component.isInitialized = true;
    } catch (error) {
      FormControlHelpers.handleError(component, error, 'initialization_failed');
    }
  },
  /**
   * Bind event listeners with automatic cleanup tracking
   * @param {object} component - A-Frame component instance
   * @param {Element} target - Target element for event
   * @param {string} eventName - Event name to bind
   * @param {Function} handler - Event handler function
   * @returns {Function} Bound handler function
   */
  bindEvent: function bindEvent(component, target, eventName, handler) {
    var boundHandler = handler.bind(component);
    target.addEventListener(eventName, boundHandler);
    if (!component.eventHandlers.has(target)) {
      component.eventHandlers.set(target, []);
    }
    component.eventHandlers.get(target).push({
      eventName: eventName,
      boundHandler: boundHandler
    });
    return boundHandler;
  },
  /**
   * Unbind all tracked event listeners
   * @param {object} component - A-Frame component instance
   */
  unbindAllEvents: function unbindAllEvents(component) {
    if (!component.eventHandlers) return;
    component.eventHandlers.forEach(function (handlers, target) {
      handlers.forEach(function (_ref) {
        var eventName = _ref.eventName,
          boundHandler = _ref.boundHandler;
        target.removeEventListener(eventName, boundHandler);
      });
    });
    component.eventHandlers.clear();
  },
  /**
   * Update ARIA attributes based on current state
   * Implements Requirements 4.1, 4.2, 4.6 for comprehensive ARIA support
   * @param {object} component - A-Frame component instance
   */
  updateARIA: function updateARIA(component) {
    var role = component.attrName === 'radio' ? 'radio' : 'checkbox';

    // Core ARIA attributes (Requirement 4.1)
    component.el.setAttribute('role', role);
    component.el.setAttribute('aria-checked', String(component.data.checked));
    component.el.setAttribute('aria-disabled', String(component.data.disabled));

    // Tabindex management based on disabled state (Requirement 4.6)
    var tabIndex = component.data.disabled ? -1 : component.data.tabIndex || 0;
    component.el.setAttribute('tabindex', tabIndex);

    // Label handling with priority: ariaLabel > label > default (Requirement 4.1)
    var label = component.data.ariaLabel || component.data.label;
    if (label) {
      component.el.setAttribute('aria-label', label);
    }

    // Radio-specific ARIA attributes
    if (component.attrName === 'radio' && component.data.name) {
      // Find radio group for aria-setsize and aria-posinset
      if (component.system && component.system.getRadioGroup) {
        var radioGroup = component.system.getRadioGroup(component.el);
        if (radioGroup.length > 1) {
          var position = radioGroup.indexOf(component.el) + 1;
          component.el.setAttribute('aria-setsize', radioGroup.length);
          component.el.setAttribute('aria-posinset', position);
        }
      }
    }

    // Add aria-describedby if there's additional context
    if (component.data.description) {
      component.el.setAttribute('aria-describedby', component.data.description);
    }

    // Required state for form validation
    if (component.data.required) {
      component.el.setAttribute('aria-required', 'true');
    }

    // Invalid state for form validation
    if (component.data.invalid) {
      component.el.setAttribute('aria-invalid', 'true');
    }
  },
  /**
   * Track child element for cleanup
   * @param {object} component - A-Frame component instance
   * @param {Element} element - Child element to track
   * @returns {Element} The tracked element
   */
  trackChild: function trackChild(component, element) {
    if (!component.childElements) {
      component.childElements = [];
    }
    component.childElements.push(element);
    return element;
  },
  /**
   * Clean up all tracked children
   * @param {object} component - A-Frame component instance
   */
  cleanupChildren: function cleanupChildren(component) {
    if (!component.childElements) return;
    component.childElements.forEach(function (child) {
      if (child && child.parentNode) {
        child.parentNode.removeChild(child);
      }
    });
    component.childElements = [];
  },
  /**
   * Validate component configuration using Utils
   * @param {object} component - A-Frame component instance
   */
  validateConfiguration: function validateConfiguration(component) {
    // Color validation using Utils
    var colorProps = ['radioColor', 'checkboxColor', 'radioColorChecked', 'checkboxColorChecked', 'color'];
    colorProps.forEach(function (prop) {
      if (component.data[prop] && !Utils.validateColor(component.data[prop])) {
        console.warn("[".concat(component.attrName, "] Invalid ").concat(prop, ": ").concat(component.data[prop], ", using default"));
        component.data[prop] = '#757575';
      }
    });

    // Size validation using Utils
    if (component.data.size !== undefined && !Utils.validateSize(component.data.size)) {
      console.warn("[".concat(component.attrName, "] Invalid size: ").concat(component.data.size, ", using 1"));
      component.data.size = 1;
    }

    // Width validation
    if (component.data.width !== undefined) {
      var width = parseFloat(component.data.width);
      if (isNaN(width) || width <= 0) {
        console.warn("[".concat(component.attrName, "] Invalid width: ").concat(component.data.width, ", using 1"));
        component.data.width = 1;
      }
    }

    // Label offset validation (clamp to reasonable range)
    if (component.data.labelOffset !== undefined) {
      var lo = parseFloat(component.data.labelOffset);
      if (isNaN(lo)) lo = 0.24;
      if (lo < -1) lo = -1;
      if (lo > 2) lo = 2;
      component.data.labelOffset = lo;
    }

    // Validate disabled opacity
    if (component.data.disabledOpacity !== undefined) {
      var opacity = parseFloat(component.data.disabledOpacity);
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        console.warn("[".concat(component.attrName, "] Invalid disabledOpacity: ").concat(component.data.disabledOpacity, ", using 0.4"));
        component.data.disabledOpacity = 0.4;
      }
    }
  },
  /**
   * Handle errors with appropriate strategy
   * @param {object} component - A-Frame component instance
   * @param {Error} error - Error object
   * @param {string} errorType - Type of error
   */
  handleError: function handleError(component, error, errorType) {
    if (component.system && component.system.reportError) {
      component.system.reportError(component.attrName, error, {
        type: errorType,
        data: component.data
      });
    } else {
      console.error("[".concat(component.attrName, "] ").concat(errorType, ":"), error);
    }
    if (errorType === 'initialization_failed') {
      FormControlHelpers.createFallbackUI(component);
    }
  },
  /**
   * Create fallback UI when initialization fails
   * @param {object} component - A-Frame component instance
   */
  createFallbackUI: function createFallbackUI(component) {
    FormControlHelpers.cleanupChildren(component);
    var fallback = document.createElement('a-text');
    var stateIndicator = component.data.checked ? '✓' : '○';
    var labelText = component.data.label || 'Form Control';
    fallback.setAttribute('value', "".concat(labelText, " [").concat(stateIndicator, "]"));
    fallback.setAttribute('color', component.data.color || '#757575');
    fallback.setAttribute('position', '0 0 0.001');

    // Maintain basic interaction
    FormControlHelpers.bindEvent(component, fallback, 'click', function () {
      if (!component.data.disabled && component.toggle) {
        component.toggle();
      }
    });
    component.el.appendChild(fallback);
    FormControlHelpers.trackChild(component, fallback);

    // Add error indicator in development mode
    if (component.system && component.system.data && component.system.data.debug) {
      var errorIcon = document.createElement('a-text');
      errorIcon.setAttribute('value', '⚠️');
      errorIcon.setAttribute('color', '#ff6b6b');
      errorIcon.setAttribute('position', '-0.3 0 0.001');
      errorIcon.setAttribute('scale', '0.8 0.8 0.8');
      component.el.appendChild(errorIcon);
      FormControlHelpers.trackChild(component, errorIcon);
    }
  },
  /**
   * Get material-form system with error handling
   * @param {object} component - A-Frame component instance
   * @returns {object|null} System instance or null if not available
   */
  getFormSystem: function getFormSystem(component) {
    if (!component.el.sceneEl || !component.el.sceneEl.systems) {
      return null;
    }
    return component.el.sceneEl.systems['material-form'];
  },
  /**
   * Update component opacity using Utils
   * @param {object} component - A-Frame component instance
   * @param {number} opacity - Opacity value (0-1)
   */
  updateOpacity: function updateOpacity(component, opacity) {
    Utils.updateOpacity(component.el, opacity);
  },
  /**
   * Measure text width using Utils (async)
   * @param {Element} textElement - A-Frame text entity
   * @returns {Promise<number>} Text width in A-Frame units
   */
  measureTextWidth: function measureTextWidth(textElement) {
    return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            return _context.a(2, Utils.measureTextWidth(textElement));
        }
      }, _callee);
    }))();
  },
  /**
   * Create keyboard event handlers for accessibility
   * Implements Requirements 4.3, 4.4, 4.7, 4.8, 4.9, 4.10 for keyboard navigation and focus management
   * @param {object} component - A-Frame component instance
   */
  setupKeyboardHandlers: function setupKeyboardHandlers(component) {
    var keyHandler = function keyHandler(event) {
      // Only handle if element is focused
      if (document.activeElement !== component.el) return;

      // Space or Enter activates the control (Requirement 4.3)
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        if (!component.data.disabled) {
          if (component.attrName === 'checkbox') {
            // Toggle checkbox
            var newChecked = !component.data.checked;
            component.el.setAttribute('checked', newChecked);
            component.onClick();
          } else if (component.attrName === 'radio') {
            // Select radio (only if not already selected)
            if (!component.data.checked) {
              component.el.setAttribute('checked', true);
              component.onClick();
            }
          }
        }
      }

      // Arrow keys for radio group navigation (radio only) (Requirement 4.4)
      if (component.attrName === 'radio' && component.system && component.system.getRadioGroup) {
        var radioGroup = component.system.getRadioGroup(component.el);
        if (radioGroup.length > 1) {
          var currentIndex = radioGroup.indexOf(component.el);
          var nextIndex = -1;
          if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % radioGroup.length;
          } else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + radioGroup.length) % radioGroup.length;
          }
          if (nextIndex >= 0) {
            event.preventDefault();
            var nextRadio = radioGroup[nextIndex];

            // Skip disabled radios
            if (nextRadio.components && nextRadio.components.radio && nextRadio.components.radio.data.disabled) {
              // Find next non-disabled radio
              var attempts = 0;
              while (attempts < radioGroup.length) {
                if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
                  nextIndex = (nextIndex + 1) % radioGroup.length;
                } else {
                  nextIndex = (nextIndex - 1 + radioGroup.length) % radioGroup.length;
                }
                var candidateRadio = radioGroup[nextIndex];
                if (!candidateRadio.components.radio.data.disabled) {
                  break;
                }
                attempts++;
              }
            }
            var finalRadio = radioGroup[nextIndex];

            // Move focus to next radio (Requirement 4.7, 4.8)
            finalRadio.focus();

            // Auto-select on navigation (standard radio behavior)
            if (finalRadio.components && finalRadio.components.radio && !finalRadio.components.radio.data.disabled) {
              finalRadio.setAttribute('checked', true);
              finalRadio.components.radio.onClick();
            }

            // Update ARIA attributes for the group
            FormControlHelpers.updateARIA(finalRadio.components.radio);
          }
        }
      }

      // Home/End keys for radio groups (enhanced navigation)
      if (component.attrName === 'radio' && component.system && component.system.getRadioGroup) {
        var _radioGroup = component.system.getRadioGroup(component.el);
        if (_radioGroup.length > 1) {
          var targetIndex = -1;
          if (event.code === 'Home') {
            targetIndex = 0;
          } else if (event.code === 'End') {
            targetIndex = _radioGroup.length - 1;
          }
          if (targetIndex >= 0) {
            event.preventDefault();

            // Skip disabled radios for Home/End
            var targetRadio = _radioGroup[targetIndex];
            if (targetRadio.components && targetRadio.components.radio && targetRadio.components.radio.data.disabled) {
              // Find first/last non-disabled radio
              if (event.code === 'Home') {
                for (var i = 0; i < _radioGroup.length; i++) {
                  if (!_radioGroup[i].components.radio.data.disabled) {
                    targetIndex = i;
                    break;
                  }
                }
              } else {
                for (var _i = _radioGroup.length - 1; _i >= 0; _i--) {
                  if (!_radioGroup[_i].components.radio.data.disabled) {
                    targetIndex = _i;
                    break;
                  }
                }
              }
            }
            var _finalRadio = _radioGroup[targetIndex];
            _finalRadio.focus();

            // Auto-select on Home/End navigation
            if (_finalRadio.components && _finalRadio.components.radio && !_finalRadio.components.radio.data.disabled) {
              _finalRadio.setAttribute('checked', true);
              _finalRadio.components.radio.onClick();
            }
          }
        }
      }

      // Escape key to blur focus (accessibility enhancement)
      if (event.code === 'Escape') {
        component.el.blur();
      }
    };

    // Add focus/blur handlers for proper focus management (Requirements 4.7, 4.8, 4.9, 4.10)
    var focusInHandler = function focusInHandler() {
      // Ensure element is properly focused
      if (document.activeElement !== component.el) {
        component.el.focus();
      }
    };
    var focusOutHandler = function focusOutHandler() {
      // Clean up any focus-related state
      if (component.focusIndicator) {
        // Focus indicator cleanup is handled in setupFocusIndicators
      }
    };
    FormControlHelpers.bindEvent(component, component.el, 'keydown', keyHandler);
    FormControlHelpers.bindEvent(component, component.el, 'focusin', focusInHandler);
    FormControlHelpers.bindEvent(component, component.el, 'focusout', focusOutHandler);
  },
  /**
   * Setup focus indicators for accessibility
   * Implements Requirements 4.7, 4.8, 4.9, 4.10 for visible focus indicators with VR support
   * @param {object} component - A-Frame component instance
   */
  setupFocusIndicators: function setupFocusIndicators(component) {
    var focusHandler = function focusHandler() {
      // Add focus indicator with 3:1 contrast ratio (Requirement 4.7)
      if (!component.focusIndicator) {
        var indicator = document.createElement('a-ring');

        // Adjust size based on component type for better visibility
        var size = component.attrName === 'checkbox' ? 0.25 : 0.22;
        indicator.setAttribute('geometry', {
          radiusInner: size - 0.04,
          radiusOuter: size,
          segmentsTheta: 32
        });

        // High contrast color with 3:1 ratio against typical backgrounds (Requirement 4.7)
        indicator.setAttribute('material', {
          color: '#0066cc',
          // WCAG AA compliant blue (4.5:1 contrast on white)
          transparent: true,
          opacity: 0,
          shader: 'flat' // Ensures consistent appearance in VR
        });
        indicator.setAttribute('position', '0 0 -0.001');

        // Smooth fade-in animation (Requirement 4.9)
        indicator.setAttribute('animation__focusin', {
          property: 'material.opacity',
          from: 0,
          to: 0.9,
          dur: 200,
          easing: 'easeOutQuad'
        });

        // Pulsing animation for VR visibility (Requirement 4.8)
        indicator.setAttribute('animation__pulse', {
          property: 'scale',
          from: '1 1 1',
          to: '1.1 1.1 1.1',
          dur: 1000,
          direction: 'alternate',
          loop: true,
          easing: 'easeInOutSine'
        });
        component.el.appendChild(indicator);
        component.focusIndicator = indicator;
        FormControlHelpers.trackChild(component, indicator);
      }
    };
    var blurHandler = function blurHandler() {
      // Remove focus indicator with smooth transition (Requirement 4.10)
      if (component.focusIndicator) {
        // Stop pulsing animation
        component.focusIndicator.removeAttribute('animation__pulse');

        // Fade out animation
        component.focusIndicator.setAttribute('animation__focusout', {
          property: 'material.opacity',
          from: 0.9,
          to: 0,
          dur: 200,
          easing: 'easeInQuad'
        });

        // Remove after animation completes
        setTimeout(function () {
          if (component.focusIndicator && component.focusIndicator.parentNode) {
            component.focusIndicator.parentNode.removeChild(component.focusIndicator);
          }
          component.focusIndicator = null;
        }, 200);
      }
    };

    // VR controller gaze-based focus indication (Requirement 4.8)
    var gazeEnterHandler = function gazeEnterHandler() {
      if (!component.data.disabled && !component.focusIndicator) {
        // Add subtle gaze indicator (different from keyboard focus)
        var gazeIndicator = document.createElement('a-ring');
        gazeIndicator.setAttribute('geometry', {
          radiusInner: 0.16,
          radiusOuter: 0.18,
          segmentsTheta: 24
        });
        gazeIndicator.setAttribute('material', {
          color: '#ffffff',
          transparent: true,
          opacity: 0.3,
          shader: 'flat'
        });
        gazeIndicator.setAttribute('position', '0 0 -0.0005');
        component.el.appendChild(gazeIndicator);
        component.gazeIndicator = gazeIndicator;
        FormControlHelpers.trackChild(component, gazeIndicator);
      }
    };
    var gazeLeaveHandler = function gazeLeaveHandler() {
      if (component.gazeIndicator) {
        if (component.gazeIndicator.parentNode) {
          component.gazeIndicator.parentNode.removeChild(component.gazeIndicator);
        }
        component.gazeIndicator = null;
      }
    };

    // Bind focus events
    FormControlHelpers.bindEvent(component, component.el, 'focus', focusHandler);
    FormControlHelpers.bindEvent(component, component.el, 'blur', blurHandler);

    // Bind VR gaze events (Requirement 4.8)
    FormControlHelpers.bindEvent(component, component.el, 'mouseenter', gazeEnterHandler);
    FormControlHelpers.bindEvent(component, component.el, 'mouseleave', gazeLeaveHandler);

    // Additional VR controller events
    FormControlHelpers.bindEvent(component, component.el, 'raycaster-intersected', gazeEnterHandler);
    FormControlHelpers.bindEvent(component, component.el, 'raycaster-intersected-cleared', gazeLeaveHandler);
  },
  /**
   * Manage roving tabindex for radio groups (Requirements 4.4, 4.7, 4.8)
   * Only one radio in a group should be tabbable at a time
   * @param {object} component - A-Frame component instance
   */
  updateRadioGroupTabindex: function updateRadioGroupTabindex(component) {
    if (component.attrName !== 'radio' || !component.system || !component.system.getRadioGroup) {
      return;
    }
    var radioGroup = component.system.getRadioGroup(component.el);
    if (radioGroup.length <= 1) return;

    // Find the checked radio, or the first non-disabled radio
    var tabbableRadio = null;

    // First, look for a checked radio
    var _iterator = _createForOfIteratorHelper(radioGroup),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _radio = _step.value;
        if (_radio.components && _radio.components.radio && _radio.components.radio.data.checked && !_radio.components.radio.data.disabled) {
          tabbableRadio = _radio;
          break;
        }
      }

      // If no checked radio, use the first non-disabled radio
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    if (!tabbableRadio) {
      var _iterator2 = _createForOfIteratorHelper(radioGroup),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var radio = _step2.value;
          if (radio.components && radio.components.radio && !radio.components.radio.data.disabled) {
            tabbableRadio = radio;
            break;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    // Set tabindex for all radios in the group
    radioGroup.forEach(function (radio) {
      if (radio.components && radio.components.radio) {
        var shouldBeTabbable = radio === tabbableRadio && !radio.components.radio.data.disabled;
        radio.setAttribute('tabindex', shouldBeTabbable ? 0 : -1);
      }
    });
  },
  /**
   * Initialize all accessibility features for a form control
   * Call this from component init() after basic setup is complete
   * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 4.10
   * @param {object} component - A-Frame component instance
   */
  setupAccessibility: function setupAccessibility(component) {
    // Set initial ARIA attributes
    FormControlHelpers.updateARIA(component);

    // Setup keyboard navigation
    FormControlHelpers.setupKeyboardHandlers(component);

    // Setup focus indicators
    FormControlHelpers.setupFocusIndicators(component);

    // Make element focusable if not disabled
    if (!component.data.disabled) {
      component.el.setAttribute('tabindex', component.data.tabIndex || 0);
    }

    // For radio buttons, manage roving tabindex
    if (component.attrName === 'radio') {
      // Delay to ensure all radios in group are initialized
      setTimeout(function () {
        FormControlHelpers.updateRadioGroupTabindex(component);
      }, 0);
    }
  },
  /**
   * Test focus indicators across different viewing angles (VR optimization)
   * Implements Requirement 4.10 for testing focus indicators across viewing angles
   * @param {object} component - A-Frame component instance
   */
  testFocusIndicatorVisibility: function testFocusIndicatorVisibility(component) {
    if (!component.focusIndicator) return;

    // Ensure focus indicator is visible from multiple angles in VR
    var indicator = component.focusIndicator;

    // Add billboard behavior for better VR visibility
    if (!indicator.hasAttribute('look-at')) {
      indicator.setAttribute('look-at', '[camera]');
    }

    // Ensure proper z-positioning for depth sorting
    var currentPos = indicator.getAttribute('position');
    if (currentPos.z >= 0) {
      indicator.setAttribute('position', "".concat(currentPos.x, " ").concat(currentPos.y, " -0.001"));
    }

    // Add debug logging in development mode
    if (component.system && component.system.data && component.system.data.debug) {
      console.log("[".concat(component.attrName, "] Focus indicator visibility test:"), {
        position: indicator.getAttribute('position'),
        material: indicator.getAttribute('material'),
        geometry: indicator.getAttribute('geometry')
      });
    }
  },
  /**
   * Enhanced cleanup for focus indicators
   * @param {object} component - A-Frame component instance
   */
  cleanupFocusIndicators: function cleanupFocusIndicators(component) {
    // Clean up keyboard focus indicator
    if (component.focusIndicator) {
      if (component.focusIndicator.parentNode) {
        component.focusIndicator.parentNode.removeChild(component.focusIndicator);
      }
      component.focusIndicator = null;
    }

    // Clean up VR gaze indicator
    if (component.gazeIndicator) {
      if (component.gazeIndicator.parentNode) {
        component.gazeIndicator.parentNode.removeChild(component.gazeIndicator);
      }
      component.gazeIndicator = null;
    }
  }
};
module.exports = FormControlHelpers;

/***/ }),

/***/ "./src/core/form-manager.js":
/*!**********************************!*\
  !*** ./src/core/form-manager.js ***!
  \**********************************/
/***/ ((module) => {

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * FormManager - Core form control resource management
 * 
 * Pure JavaScript class (not A-Frame system) for better testability.
 * Manages shared resources for all form components: sound pool, event pooling,
 * text measurement cache, radio group registry, and form ID management.
 */
/**
 * Circular buffer event pool to prevent race conditions in VR
 */
var EventObjectPool = /*#__PURE__*/function () {
  function EventObjectPool() {
    var poolSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
    _classCallCheck(this, EventObjectPool);
    this.poolSize = poolSize;
    this.pools = {
      change: this.createPool(poolSize, function () {
        return {
          checked: false,
          value: '',
          target: null,
          timestamp: 0
        };
      }),
      error: this.createPool(poolSize, function () {
        return {
          error: null,
          component: '',
          context: {},
          timestamp: 0
        };
      }),
      focus: this.createPool(poolSize, function () {
        return {
          focused: false,
          target: null,
          timestamp: 0
        };
      })
    };
    this.indices = {
      change: 0,
      error: 0,
      focus: 0
    };
  }
  return _createClass(EventObjectPool, [{
    key: "createPool",
    value: function createPool(size, factory) {
      return Array.from({
        length: size
      }, factory);
    }
  }, {
    key: "get",
    value: function get(type) {
      if (!this.pools[type]) {
        console.warn("[EventObjectPool] Unknown event type: ".concat(type));
        return {};
      }
      var pool = this.pools[type];
      var index = this.indices[type];
      var event = pool[index];

      // Rotate index for next use
      this.indices[type] = (index + 1) % this.poolSize;

      // Reset timestamp
      event.timestamp = Date.now();
      return event;
    }
  }, {
    key: "getChangeEvent",
    value: function getChangeEvent(checked, value, target) {
      var event = this.get('change');
      event.checked = checked;
      event.value = value;
      event.target = target;
      return event;
    }
  }, {
    key: "getErrorEvent",
    value: function getErrorEvent(error, component, context) {
      var event = this.get('error');
      event.error = error;
      event.component = component;
      event.context = Object.assign({}, context); // Shallow copy
      return event;
    }
  }, {
    key: "getFocusEvent",
    value: function getFocusEvent(focused, target) {
      var event = this.get('focus');
      event.focused = focused;
      event.target = target;
      return event;
    }
  }]);
}();
/**
 * Text measurement cache for 3D VR environments
 * Uses A-Frame text geometry as source of truth (not Canvas API)
 */
var TextMeasurementCache = /*#__PURE__*/function () {
  function TextMeasurementCache() {
    _classCallCheck(this, TextMeasurementCache);
    this.cache = new Map(); // "text|font" -> { width, timestamp }
    this.pendingMeasurements = new Map(); // element -> Promise
  }

  /**
   * Measure text width using A-Frame text geometry (async)
   * @param {Element} textComponent - A-Frame entity with text component
   * @returns {Promise<number>} Width in A-Frame units
   */
  return _createClass(TextMeasurementCache, [{
    key: "measureText",
    value: (function () {
      var _measureText = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(textComponent) {
        var _this = this;
        var measurementPromise;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (!this.pendingMeasurements.has(textComponent)) {
                _context.n = 1;
                break;
              }
              return _context.a(2, this.pendingMeasurements.get(textComponent));
            case 1:
              // Create measurement promise
              measurementPromise = new Promise(function (resolve) {
                var _measure = function measure() {
                  var width = _this.measureWithAFrame(textComponent);
                  if (width !== null) {
                    resolve(width);
                    _this.pendingMeasurements["delete"](textComponent);
                  } else {
                    // Retry on next frame until geometry is ready
                    requestAnimationFrame(_measure);
                  }
                };
                _measure();
              });
              this.pendingMeasurements.set(textComponent, measurementPromise);
              return _context.a(2, measurementPromise);
          }
        }, _callee, this);
      }));
      function measureText(_x) {
        return _measureText.apply(this, arguments);
      }
      return measureText;
    }()
    /**
     * Synchronous measurement (returns null if geometry not ready)
     * @param {Element} textComponent - A-Frame entity with text component
     * @returns {number|null} Width or null if unavailable
     */
    )
  }, {
    key: "measureSync",
    value: function measureSync(textComponent) {
      return this.measureWithAFrame(textComponent);
    }

    /**
     * Measure using A-Frame text component geometry
     * This is the ONLY reliable method for 3D text measurement
     * @param {Element} textComponent - A-Frame entity with text component
     * @returns {number|null} Width in A-Frame units or null if unavailable
     */
  }, {
    key: "measureWithAFrame",
    value: function measureWithAFrame(textComponent) {
      try {
        var _textComponent$compon, _geometry$visibleGlyp;
        // Validate component exists
        if (!(textComponent !== null && textComponent !== void 0 && (_textComponent$compon = textComponent.components) !== null && _textComponent$compon !== void 0 && _textComponent$compon.text)) {
          return null;
        }

        // Check if geometry is loaded
        var mesh = textComponent.object3D.children[0];
        if (!(mesh !== null && mesh !== void 0 && mesh.geometry)) {
          return null;
        }
        var geometry = mesh.geometry;

        // Method 1: Use visible glyphs (troika-text - most accurate)
        if (((_geometry$visibleGlyp = geometry.visibleGlyphs) === null || _geometry$visibleGlyp === void 0 ? void 0 : _geometry$visibleGlyp.length) > 0) {
          var lastGlyph = geometry.visibleGlyphs[geometry.visibleGlyphs.length - 1];
          var width = lastGlyph.position[0] + lastGlyph.data.width;
          return width;
        }

        // Method 2: Use bounding box (fallback)
        if (geometry.boundingBox) {
          geometry.computeBoundingBox();
          return geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        }
        return null;
      } catch (error) {
        console.warn('[TextMeasurementCache] A-Frame measurement failed', error);
        return null;
      }
    }

    /**
     * Wait for text geometry to be ready, then measure
     * @param {Element} textComponent - A-Frame entity with text component
     * @param {number} timeout - Max wait time in ms (default: 5000)
     * @returns {Promise<number>} Width in A-Frame units
     */
  }, {
    key: "waitAndMeasure",
    value: (function () {
      var _waitAndMeasure = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(textComponent) {
        var timeout,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              timeout = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : 5000;
              return _context2.a(2, Promise.race([this.measureText(textComponent), new Promise(function (_, reject) {
                return setTimeout(function () {
                  return reject(new Error('Text measurement timeout'));
                }, timeout);
              })]));
          }
        }, _callee2, this);
      }));
      function waitAndMeasure(_x2) {
        return _waitAndMeasure.apply(this, arguments);
      }
      return waitAndMeasure;
    }()
    /**
     * Clear measurement cache (useful for dynamic text updates)
     */
    )
  }, {
    key: "clearCache",
    value: function clearCache() {
      this.cache.clear();
      this.pendingMeasurements.clear();
    }
  }]);
}();
/**
 * Radio group registry with hierarchical form ID management
 */
var RadioGroupRegistry = /*#__PURE__*/function () {
  function RadioGroupRegistry(formManager) {
    _classCallCheck(this, RadioGroupRegistry);
    this.formManager = formManager;
    this.groups = new Map(); // formId -> Map(groupName -> Set(radioElements))
    this.radioToGroup = new WeakMap(); // radioElement -> {formId, groupName}
  }
  return _createClass(RadioGroupRegistry, [{
    key: "register",
    value: function register(radioElement) {
      var formId = this.formManager.getFormId(radioElement);
      var groupName = radioElement.getAttribute('name');
      if (!groupName) {
        console.warn('[RadioGroupRegistry] Radio without name attribute', radioElement);
        return;
      }

      // Check if radio is already registered with different group (name attribute changed)
      var existingGroupInfo = this.radioToGroup.get(radioElement);
      if (existingGroupInfo && (existingGroupInfo.formId !== formId || existingGroupInfo.groupName !== groupName)) {
        // Re-register: unregister from old group first
        this.unregister(radioElement);
      }

      // Initialize nested maps if needed
      if (!this.groups.has(formId)) {
        this.groups.set(formId, new Map());
      }
      if (!this.groups.get(formId).has(groupName)) {
        this.groups.get(formId).set(groupName, new Set());
      }

      // Add to group
      this.groups.get(formId).get(groupName).add(radioElement);
      this.radioToGroup.set(radioElement, {
        formId: formId,
        groupName: groupName
      });
    }
  }, {
    key: "unregister",
    value: function unregister(radioElement) {
      var _this$groups$get;
      var groupInfo = this.radioToGroup.get(radioElement);
      if (!groupInfo) return;
      var formId = groupInfo.formId,
        groupName = groupInfo.groupName;
      var group = (_this$groups$get = this.groups.get(formId)) === null || _this$groups$get === void 0 ? void 0 : _this$groups$get.get(groupName);
      if (group) {
        group["delete"](radioElement);

        // Cleanup empty groups
        if (group.size === 0) {
          this.groups.get(formId)["delete"](groupName);
          if (this.groups.get(formId).size === 0) {
            this.groups["delete"](formId);
          }
        }
      }
      this.radioToGroup["delete"](radioElement);
    }
  }, {
    key: "getGroup",
    value: function getGroup(radioElement) {
      var _this$groups$get2;
      var groupInfo = this.radioToGroup.get(radioElement);
      if (!groupInfo) return [];
      var formId = groupInfo.formId,
        groupName = groupInfo.groupName;
      var group = (_this$groups$get2 = this.groups.get(formId)) === null || _this$groups$get2 === void 0 ? void 0 : _this$groups$get2.get(groupName);
      return group ? Array.from(group) : [];
    }

    /**
     * Check if radio element needs cache refresh (Requirement 3.8)
     * @param {Element} radioElement - Radio button element
     * @returns {boolean} True if cache needs refreshing
     */
  }, {
    key: "needsCacheRefresh",
    value: function needsCacheRefresh(radioElement) {
      var currentFormId = this.formManager.getFormId(radioElement);
      var currentGroupName = radioElement.getAttribute('name');
      var cachedGroupInfo = this.radioToGroup.get(radioElement);

      // No cached info means needs registration
      if (!cachedGroupInfo) {
        return true;
      }

      // Check if form ID or group name changed
      return cachedGroupInfo.formId !== currentFormId || cachedGroupInfo.groupName !== currentGroupName;
    }

    /**
     * Update radio registration if cache needs refresh (Requirements 3.7, 3.8)
     * @param {Element} radioElement - Radio button element
     * @returns {boolean} True if registration was updated
     */
  }, {
    key: "updateIfNeeded",
    value: function updateIfNeeded(radioElement) {
      if (this.needsCacheRefresh(radioElement)) {
        this.register(radioElement);
        return true;
      }
      return false;
    }
  }]);
}();
/**
 * FormManager - Core form control resource management
 * 
 * Pure JavaScript class for managing shared resources across all form components.
 * Handles sound pool, event pooling, text measurement, radio groups, and form IDs.
 */
var FormManager = /*#__PURE__*/function () {
  function FormManager() {
    _classCallCheck(this, FormManager);
    this.formCounter = 0;
    this.hasWarnedGlobal = false;
    this.sounds = {};
    this.eventPool = new EventObjectPool();
    this.textCache = new TextMeasurementCache();
    this.radioGroupRegistry = new RadioGroupRegistry(this);
  }

  /**
   * Load all component sounds into shared pool
   * Reduces memory usage by 90% compared to per-component sounds
   */
  return _createClass(FormManager, [{
    key: "loadSounds",
    value: function loadSounds() {
      var _this2 = this;
      // Sound asset IDs defined in each component's assets.js
      var soundAssets = {
        // Radio sounds
        radioClick: '#aframeRadioClick',
        radioClickDisabled: '#aframeRadioClickDisabled',
        // Checkbox sounds
        checkboxClick: '#aframeCheckboxClick',
        checkboxClickDisabled: '#aframeCheckboxClickDisabled'
      };
      var scene = typeof document !== 'undefined' ? document.querySelector('a-scene') : null;
      if (!scene) return;

      // Create sound elements in scene
      Object.entries(soundAssets).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          soundId = _ref2[0],
          assetSelector = _ref2[1];
        try {
          var soundEl = document.createElement('a-sound');
          soundEl.setAttribute('src', assetSelector);
          soundEl.setAttribute('autoplay', false);
          soundEl.setAttribute('preload', 'auto');
          soundEl.setAttribute('positional', false);
          scene.appendChild(soundEl);
          _this2.sounds[soundId] = soundEl;
        } catch (error) {
          console.warn("[FormManager] Failed to load sound ".concat(soundId, ":"), error);
        }
      });
    }

    /**
     * Play sound from shared pool
     * @param {string} soundId - Sound identifier
     */
  }, {
    key: "playSound",
    value: function playSound(soundId) {
      var soundEl = this.sounds[soundId];
      if (soundEl && soundEl.components && soundEl.components.sound) {
        try {
          soundEl.components.sound.playSound();
        } catch (error) {
          console.warn("[FormManager] Failed to play sound ".concat(soundId, ":"), error);
        }
      }
    }

    /**
     * Get pooled event detail object
     * @param {string} type - Event type (change, error, focus)
     * @returns {object} Reusable event detail object
     */
  }, {
    key: "getEventDetail",
    value: function getEventDetail(type) {
      return this.eventPool.get(type);
    }

    /**
     * Measure text width using cached A-Frame geometry
     * @param {Element} textComponent - A-Frame entity with text component
     * @returns {Promise<number>} Width in A-Frame units
     */
  }, {
    key: "measureText",
    value: function measureText(textComponent) {
      return this.textCache.measureText(textComponent);
    }

    /**
     * Register radio button with group registry
     * @param {Element} radioElement - Radio button element
     */
  }, {
    key: "registerRadioGroup",
    value: function registerRadioGroup(radioElement) {
      this.radioGroupRegistry.register(radioElement);
    }

    /**
     * Get radio group members
     * @param {Element} radioElement - Radio button element
     * @returns {Element[]} Array of radio elements in same group
     */
  }, {
    key: "getRadioGroup",
    value: function getRadioGroup(radioElement) {
      return this.radioGroupRegistry.getGroup(radioElement);
    }

    /**
     * Unregister radio button from group registry
     * @param {Element} radioElement - Radio button element
     */
  }, {
    key: "unregisterRadio",
    value: function unregisterRadio(radioElement) {
      this.radioGroupRegistry.unregister(radioElement);
    }

    /**
     * Check if radio element needs cache refresh (Requirement 3.8)
     * @param {Element} radioElement - Radio button element
     * @returns {boolean} True if cache needs refreshing
     */
  }, {
    key: "radioNeedsCacheRefresh",
    value: function radioNeedsCacheRefresh(radioElement) {
      return this.radioGroupRegistry.needsCacheRefresh(radioElement);
    }

    /**
     * Update radio registration if needed (Requirements 3.7, 3.8)
     * @param {Element} radioElement - Radio button element
     * @returns {boolean} True if registration was updated
     */
  }, {
    key: "updateRadioIfNeeded",
    value: function updateRadioIfNeeded(radioElement) {
      return this.radioGroupRegistry.updateIfNeeded(radioElement);
    }

    /**
     * Get or generate form ID for element
     * @param {Element} element - Form control element
     * @returns {string} Form ID
     */
  }, {
    key: "getFormId",
    value: function getFormId(element) {
      var form = element.closest('a-form');

      // No form parent - use global namespace with warning
      if (!form) {
        if (!this.hasWarnedGlobal) {
          console.warn("[FormManager] Component without a-form parent detected. " + "Radio button grouping will use global namespace. " + "Wrap in <a-form> for proper grouping.", element);
          this.hasWarnedGlobal = true;
        }
        return '_global_';
      }

      // Use existing ID if present
      if (form.id) {
        return form.id;
      }

      // Generate stable ID
      form.id = "form-".concat(this.formCounter++);
      return form.id;
    }

    /**
     * Report error with centralized logging
     * @param {string} component - Component name
     * @param {Error} error - Error object
     * @param {object} context - Additional context
     */
  }, {
    key: "reportError",
    value: function reportError(component, error, context) {
      console.error("[FormManager] ".concat(component, " error:"), error, context);

      // Emit error event for debugging
      if (typeof document !== 'undefined' && document.querySelector('a-scene')) {
        var errorEvent = this.eventPool.getErrorEvent(error, component, context);
        document.querySelector('a-scene').emit('form-error', errorEvent);
      }
    }
  }]);
}();
module.exports = FormManager;

/***/ }),

/***/ "./src/core/material-form-system.js":
/*!******************************************!*\
  !*** ./src/core/material-form-system.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var FormManager = __webpack_require__(/*! ./form-manager */ "./src/core/form-manager.js");
var AssetsRegistry = __webpack_require__(/*! ./assets-registry */ "./src/core/assets-registry.js");
AFRAME.registerSystem('material-form', {
  schema: {
    // EXISTING properties (backward compatibility)
    objects: {
      "default": 'a-form *'
    },
    enableMouse: {
      "default": true
    },
    appendMode: {
      "default": true
    },
    interval: {
      "default": 0
    },
    debug: {
      "default": false
    },
    // NEW properties
    soundEnabled: {
      type: 'boolean',
      "default": true
    }
  },
  init: function init() {
    var _this = this;
    // KEEP: Existing raycaster setup (backward compatibility)
    var sceneEl = this.sceneEl;
    var onSceneLoaded = function onSceneLoaded() {
      AssetsRegistry.ensureAll();
      if (_this.data.soundEnabled) {
        _this.formManager.loadSounds();
      }
      _this.setupCameraRaycaster();
      _this.log('Material-form system initialized');
    };
    if (sceneEl.hasLoaded) onSceneLoaded();else sceneEl.addEventListener('loaded', onSceneLoaded);

    // NEW: FormManager composition
    this.formManager = new FormManager();
  },
  // KEEP: Existing methods
  log: function log() {
    if (this.data.debug) {
      var _console;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (_console = console).log.apply(_console, ['[material-form]'].concat(args));
    }
  },
  setupCameraRaycaster: function setupCameraRaycaster() {
    if (!this.data.enableMouse) return;
    var sceneEl = this.sceneEl;
    var camEl = sceneEl.camera && sceneEl.camera.el || sceneEl.querySelector('a-camera');
    if (!camEl) {
      this.log('No camera found to attach cursor/raycaster');
      return;
    }

    // Ensure cursor
    var cursor = camEl.getAttribute('cursor') || {};
    if (!cursor || !cursor.rayOrigin) camEl.setAttribute('cursor', Object.assign({}, cursor, {
      rayOrigin: 'mouse'
    }));

    // Ensure raycaster
    var rc = camEl.getAttribute('raycaster') || {};
    var wantObjects = this.data.objects;
    var newObjects = wantObjects;
    if (this.data.appendMode && rc.objects && rc.objects.length) {
      // Append if not already present
      if (rc.objects.indexOf(wantObjects) === -1) {
        newObjects = rc.objects + ', ' + wantObjects;
      } else {
        newObjects = rc.objects;
      }
    }
    camEl.setAttribute('raycaster', Object.assign({}, rc, {
      objects: newObjects,
      interval: this.data.interval
    }));
    this.log('Camera raycaster configured with objects:', newObjects);
  },
  // NEW: Delegate to FormManager
  playSound: function playSound(soundId) {
    return this.formManager.playSound(soundId);
  },
  getEventDetail: function getEventDetail(type) {
    return this.formManager.getEventDetail(type);
  },
  measureText: function measureText(textComponent) {
    return this.formManager.measureText(textComponent);
  },
  registerRadioGroup: function registerRadioGroup(radio) {
    return this.formManager.registerRadioGroup(radio);
  },
  getRadioGroup: function getRadioGroup(radio) {
    return this.formManager.getRadioGroup(radio);
  },
  unregisterRadio: function unregisterRadio(radio) {
    return this.formManager.unregisterRadio(radio);
  },
  getFormId: function getFormId(element) {
    return this.formManager.getFormId(element);
  },
  reportError: function reportError(component, error, context) {
    return this.formManager.reportError(component, error, context);
  }
});

/***/ }),

/***/ "./src/fade/index.js":
/*!***************************!*\
  !*** ./src/fade/index.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
var opacityUpdate = function opacityUpdate(opacity) {
  this.el.object3D.traverse(function (o) {
    if (o.material) {
      o.material.transparent = true;
      o.material.opacity = opacity;
    }
  });
  var _iterator = _createForOfIteratorHelper(this.textEntities),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var text = _step.value;
      text.setAttribute('opacity', opacity);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

// -----------------------------------------------------------------------------
// FADEIN

AFRAME.registerComponent('fadein', {
  schema: {
    duration: {
      type: 'int',
      "default": 200
    }
  },
  init: function init() {
    this.textEntities = this.el.querySelectorAll('a-text');
    this.opacityUpdate(0);
    this.start = null;
  },
  tick: function tick(t) {
    if (!this.start) {
      this.start = t;
    }
    var opacity = Math.min((t - this.start) / this.data.duration, 1);
    this.opacityUpdate(opacity);
    if (opacity === 1) {
      this.el.removeAttribute('fadein');
      Event.emit(this.el, 'animationend');
    }
  },
  opacityUpdate: opacityUpdate
});

// -----------------------------------------------------------------------------
// FADEOUT

AFRAME.registerComponent('fadeout', {
  schema: {
    duration: {
      type: 'int',
      "default": 200
    }
  },
  init: function init() {
    this.textEntities = this.el.querySelectorAll('a-text');
    this.opacityUpdate(1);
    this.start = null;
  },
  tick: function tick(t) {
    if (!this.start) {
      this.start = t;
    }
    var opacity = 1 - Math.min((t - this.start) / this.data.duration, 1);
    this.opacityUpdate(opacity);
    if (opacity === 0) {
      this.el.removeAttribute('fadeout');
      Event.emit(this.el, 'animationend');
    }
  },
  opacityUpdate: opacityUpdate
});

// -----------------------------------------------------------------------------
// SHOW

AFRAME.registerComponent('show', {
  init: function init() {
    this.textEntities = this.el.querySelectorAll('a-text');
    this.opacityUpdate(1);
    this.el.removeAttribute('show');
  },
  opacityUpdate: opacityUpdate
});

// -----------------------------------------------------------------------------
// HIDE

AFRAME.registerComponent('hide', {
  init: function init() {
    this.textEntities = this.el.querySelectorAll('a-text');
    this.opacityUpdate(0);
    this.el.removeAttribute('hide');
  },
  opacityUpdate: opacityUpdate
});

/***/ }),

/***/ "./src/form/index.js":
/*!***************************!*\
  !*** ./src/form/index.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
AFRAME.registerComponent('form', {
  schema: {},
  init: function init() {},
  update: function update() {},
  tick: function tick() {},
  remove: function remove() {},
  pause: function pause() {},
  play: function play() {}
});
AFRAME.registerPrimitive('a-form', {
  defaultComponents: {
    form: {}
  },
  mappings: {}
});

/***/ }),

/***/ "./src/input/index.js":
/*!****************************!*\
  !*** ./src/input/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");

/*
@BUG: Space has not effect when no letter comes after.
@TODO: <progress value="70" max="100">70 %</progress>
*/

AFRAME.registerComponent('input', {
  schema: {
    value: {
      type: "string",
      "default": ""
    },
    name: {
      type: "string",
      "default": ""
    },
    disabled: {
      type: "boolean",
      "default": false
    },
    color: {
      type: "color",
      "default": "#000"
    },
    align: {
      type: "string",
      "default": "left"
    },
    font: {
      type: "string",
      "default": ""
    },
    letterSpacing: {
      type: "int",
      "default": 0
    },
    lineHeight: {
      type: "string",
      "default": ""
    },
    opacity: {
      type: "number",
      "default": 1
    },
    side: {
      type: "string",
      "default": 'front'
    },
    tabSize: {
      type: "int",
      "default": 4
    },
    placeholder: {
      type: "string",
      "default": ""
    },
    placeholderColor: {
      type: "color",
      "default": "#AAA"
    },
    maxLength: {
      type: "int",
      "default": 0
    },
    type: {
      type: "string",
      "default": "text"
    },
    width: {
      type: "number",
      "default": 1
    },
    cursorWidth: {
      type: "number",
      "default": 0.01
    },
    cursorHeight: {
      type: "number",
      "default": 0.08
    },
    cursorColor: {
      type: "color",
      "default": "#007AFF"
    },
    backgroundColor: {
      type: "color",
      "default": "#FFF"
    },
    backgroundOpacity: {
      type: "number",
      "default": 1
    }
  },
  init: function init() {
    var that = this;
    this.background = document.createElement('a-rounded');
    this.background.setAttribute('radius', 0.01);
    this.background.setAttribute('height', 0.18);
    this.background.setAttribute('side', 'double');
    this.el.appendChild(this.background);
    this.cursor = document.createElement('a-plane');
    this.cursor.setAttribute('position', '0 0 0.003');
    this.cursor.setAttribute('visible', false);
    this.el.appendChild(this.cursor);
    this.text = document.createElement('a-entity');
    this.el.appendChild(this.text);
    this.placeholder = document.createElement('a-entity');
    this.placeholder.setAttribute('visible', false);
    this.el.appendChild(this.placeholder);
    this.el.focus = this.focus.bind(this);
    this.el.blur = this.blur.bind(this);
    this.el.appendString = this.appendString.bind(this);
    this.el.deleteLast = this.deleteLast.bind(this);

    //setTimeout(function() { that.updateText(); }, 0);
    this.blink();
    this.el.addEventListener('click', function () {
      if (this.components.input.data.disabled) {
        return;
      }
      that.focus();
    });
    Object.defineProperty(this.el, 'value', {
      get: function get() {
        return this.getAttribute('value');
      },
      set: function set(value) {
        this.setAttribute('value', value);
      },
      enumerable: true,
      configurable: true
    });
  },
  blink: function blink() {
    var that = this;
    if (!this.isFocused) {
      that.cursor.setAttribute('visible', false);
      clearInterval(this.cursorInterval);
      this.cursorInterval = null;
      return;
    }
    this.cursorInterval = setInterval(function () {
      that.cursor.setAttribute('visible', !that.cursor.getAttribute('visible'));
    }, 500);
  },
  isFocused: false,
  focus: function focus(noemit) {
    if (this.isFocused) {
      return;
    }
    this.isFocused = true;
    this.cursor.setAttribute('visible', true);
    this.blink();
    Event.emit(this.el, 'focus');
    // if (!noemit) { Event.emit(document.body, 'didfocusinput', this.el); }
  },
  blur: function blur(noemit) {
    if (!this.isFocused) {
      return;
    }
    this.isFocused = false;
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
      this.cursorInterval = null;
    }
    this.cursor.setAttribute('visible', false);
    Event.emit(this.el, 'blur');
    if (!noemit) {
      Event.emit(document.body, 'didblurinput', this.el);
    }
  },
  appendString: function appendString(data) {
    if (data === '\n') {
      return this.blur();
    }
    var str = this.el.getAttribute("value");
    if (!str) {
      str = "";
    }
    str = str + data;
    this.el.setAttribute("value", str);
    Event.emit(this.el, 'change', str);
  },
  deleteLast: function deleteLast() {
    var str = this.el.getAttribute("value");
    if (!str) {
      str = "";
    }
    str = str.slice(0, -1);
    this.el.setAttribute("value", str);
    Event.emit(this.el, 'change', str);
  },
  updateText: function updateText() {
    var that = this;
    var padding = {
      left: 0.021,
      right: 0.021
    };
    var props = {
      color: this.data.color,
      align: this.data.align,
      side: this.data.side,
      tabSize: this.data.tabSize,
      wrapCount: 24 * this.data.width,
      width: this.data.width
    };

    // Make cursor stop blinking when typing..
    // (and blinking again after typing stop).
    var attr = this.text.getAttribute("text");
    if (attr) {
      if (this.data.value !== attr.value) {
        if (this.cursorInterval) {
          clearInterval(this.cursorInterval);
          this.cursorInterval = null;
        }
        if (this.cursorTimer) {
          clearTimeout(this.cursorTimer);
          this.cursorTimer = null;
        }
        this.cursor.setAttribute('visible', true);
        this.cursorTimer = setTimeout(function () {
          that.blink();
        }, 50);
      }
    }

    // Max length
    if (this.data.maxLength) {
      props.value = this.data.value.substring(0, this.data.maxLength);
      this.el.setAttribute('value', props.value);
    } else {
      props.value = this.data.value;
    }
    if (this.data.type === "password") {
      props.value = "*".repeat(this.data.value.length);
    }
    if (this.data.font.length) {
      props.font = this.data.font;
    }
    if (this.data.letterSpacing) {
      props.letterSpacing = this.data.letterSpacing;
    }
    if (this.data.lineHeight.length) {
      props.lineHeight = this.data.lineHeight;
    }
    this.text.setAttribute('visible', false);
    this.text.setAttribute("text", props);
    function getTextWidth(el, data, trimFirst, _widthFactor) {
      if (!el.object3D || !el.object3D.children || !el.object3D.children[0]) {
        return 0;
      }
      var v = el.object3D.children[0].geometry.visibleGlyphs;
      if (!v) {
        return 0;
      }
      v = v[v.length - 1];
      if (!v) {
        return 0;
      }
      if (v.line) {
        if (trimFirst) {
          data.value = data.value.substr(1);
        } else {
          data.value = data.value.slice(0, -1);
        }
        el.setAttribute("text", data);
        return getTextWidth(el, data, trimFirst);
      } else {
        if (!_widthFactor) {
          _widthFactor = Utils.getWidthFactor(el, data.wrapCount);
        }
        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
        var textRatio = (v + padding.left + padding.right) / that.data.width;
        if (textRatio > 1) {
          if (trimFirst) {
            data.value = data.value.substr(1);
          } else {
            data.value = data.value.slice(0, -1);
          }
          el.setAttribute("text", data);
          return getTextWidth(el, data, trimFirst, _widthFactor);
        }
      }
      return v;
    }
    if (props.value.length) {
      this.placeholder.setAttribute('visible', false);
    } else {
      this.placeholder.setAttribute('visible', true);
    }
    var placeholder_props = Utils.clone(props);
    placeholder_props.value = this.data.placeholder;
    placeholder_props.color = this.data.placeholderColor;
    this.placeholder.setAttribute("text", placeholder_props);
    setTimeout(function () {
      if (that.text.object3D) {
        var children = that.text.object3D.children;
        if (children[0] && children[0].geometry && children[0].geometry.visibleGlyphs) {
          var v = 0;
          if (children[0].geometry.visibleGlyphs.length) {
            v = getTextWidth(that.text, props, true);
            that.text.setAttribute('visible', true);
          }
          that.cursor.setAttribute('position', v + padding.left + ' 0 0.003');
        } else {
          that.cursor.setAttribute('position', padding.left + ' 0 0.003');
        }
      } else {
        that.cursor.setAttribute('position', padding.left + ' 0 0.003');
      }
      getTextWidth(that.placeholder, placeholder_props);
    }, 0);
    this.background.setAttribute('color', this.data.backgroundColor);
    /*if (this.data.backgroundOpacity) {
      setTimeout(function() {
        Utils.updateOpacity(that.background, that.data.backgroundOpacity);
      }, 0);
    }*/
    this.background.setAttribute('width', this.data.width);
    //this.background.setAttribute('position', this.data.width/2+' 0 0');
    this.background.setAttribute('position', '0 -0.09 0.001');
    this.text.setAttribute('position', padding.left - 0.001 + this.data.width / 2 + ' 0 0.002');
    this.placeholder.setAttribute('position', padding.left - 0.001 + this.data.width / 2 + ' 0 0.002');
  },
  updateCursor: function updateCursor() {
    this.cursor.setAttribute('width', this.data.cursorWidth);
    this.cursor.setAttribute('height', this.data.cursorHeight);
    this.cursor.setAttribute('color', this.data.cursorColor);
  },
  update: function update() {
    var that = this;
    setTimeout(function () {
      //  Utils.updateOpacity(that.el, that.data.opacity);
    }, 0);
    this.updateCursor();
    this.updateText();
  },
  tick: function tick() {},
  remove: function remove() {},
  pause: function pause() {},
  play: function play() {}
});
AFRAME.registerPrimitive('a-input', {
  defaultComponents: {
    input: {}
  },
  mappings: {
    value: 'input.value',
    name: 'input.name',
    disabled: 'input.disabled',
    color: 'input.color',
    align: 'input.align',
    font: 'input.font',
    'letter-spacing': 'input.letterSpacing',
    'line-height': 'input.lineHeight',
    'opacity': 'input.opacity',
    'side': 'input.side',
    'tab-size': 'input.tabSize',
    placeholder: 'input.placeholder',
    'placeholder-color': 'input.placeholderColor',
    'max-length': 'input.maxLength',
    type: 'input.type',
    width: 'input.width',
    'cursor-width': "input.cursorWidth",
    'cursor-height': "input.cursorHeight",
    'cursor-color': "input.cursorColor",
    'background-color': 'input.backgroundColor',
    'background-opacity': 'input.backgroundOpacity'
  }
});

/***/ }),

/***/ "./src/keyboard/assets.js":
/*!********************************!*\
  !*** ./src/keyboard/assets.js ***!
  \********************************/
/***/ ((module) => {

module.exports = {
  aframeKeyboardShift: "".concat(AFRAME.ASSETS_PATH, "/images/ShiftIcon.png"),
  aframeKeyboardShiftActive: "".concat(AFRAME.ASSETS_PATH, "/images/ShiftActiveIcon.png"),
  aframeKeyboardGlobal: "".concat(AFRAME.ASSETS_PATH, "/images/GlobalIcon.png"),
  aframeKeyboardBackspace: "".concat(AFRAME.ASSETS_PATH, "/images/BackspaceIcon.png"),
  aframeKeyboardEnter: "".concat(AFRAME.ASSETS_PATH, "/images/EnterIcon.png"),
  aframeKeyboardDismiss: "".concat(AFRAME.ASSETS_PATH, "/images/DismissIcon.png"),
  aframeKeyboardShadow: "".concat(AFRAME.ASSETS_PATH, "/images/KeyShadow.png"),
  aframeKeyboardKeyIn: "".concat(AFRAME.ASSETS_PATH, "/sounds/KeyIn.mp3"),
  aframeKeyboardKeyDown: "".concat(AFRAME.ASSETS_PATH, "/sounds/KeyDown.mp3")
};

/***/ }),

/***/ "./src/keyboard/behaviors.js":
/*!***********************************!*\
  !*** ./src/keyboard/behaviors.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var Assets = __webpack_require__(/*! ./assets */ "./src/keyboard/assets.js");
var Config = __webpack_require__(/*! ./config */ "./src/keyboard/config.js");
var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
var SFX = __webpack_require__(/*! ./sfx */ "./src/keyboard/sfx.js");
var Behaviors = {};
Behaviors.el = null;

// -----------------------------------------------------------------------------
// KEYBOARD METHODS

Behaviors.showKeyboard = function (el) {
  if (el.o_position) {
    el.object3D.position.copy(el.o_position);
  }
  el.isOpen = true;
  var _iterator = _createForOfIteratorHelper(el.querySelectorAll('[data-ui]')),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var item = _step.value;
      var _iterator2 = _createForOfIteratorHelper(item.children),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var child = _step2.value;
          child.setAttribute('show', true);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var parent = el.parentNode;
  if (parent) {
    return;
  }
  el.sceneEl.appendChild(el);
};
Behaviors.hideKeyboard = function (el) {
  var position = el.getAttribute("position");
  if (position.x !== -10000) {
    if (!el.o_position) {
      el.o_position = new THREE.Vector3();
    }
    el.o_position.copy(position);
  }
  el.isOpen = false;
  el.setAttribute("position", "-10000 -10000 -10000");
  el.setAttribute('fadeout', {
    duration: 1
  });
};
Behaviors.destroyKeyboard = function (el) {
  var parent = el.parentNode;
  if (!parent) {
    return;
  }
  parent.removeChild(el);
};
Behaviors.openKeyboard = function (el) {
  if (el.o_position) {
    el.object3D.position.copy(el.o_position);
  }
  el.isOpen = true;
  el._transitioning = true;
  var parent = el.parentNode;
  if (!parent) {
    el.sceneEl.appendChild(el);
  }
  var _iterator3 = _createForOfIteratorHelper(el.querySelectorAll('[data-ui]')),
    _step3;
  try {
    var _loop = function _loop() {
      var item = _step3.value;
      var _iterator4 = _createForOfIteratorHelper(item.children),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var child = _step4.value;
          child.setAttribute('hide', true);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      function animationend() {
        item.children[0].removeEventListener('animationend', animationend);
        setTimeout(function () {
          item.children[1].setAttribute('fadein', {
            duration: 160
          });
          Event.emit(Behaviors.el, 'didopen');
          el._transitioning = false;
        }, 10);
      }
      item.children[0].setAttribute('fadein', {
        duration: 160
      });
      item.children[0].addEventListener('animationend', animationend);
    };
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
};
Behaviors.dismissKeyboard = function (el) {
  el._transitioning = true;
  var _iterator5 = _createForOfIteratorHelper(el.querySelectorAll('[data-ui]')),
    _step5;
  try {
    var _loop2 = function _loop2() {
      var item = _step5.value;
      var _iterator6 = _createForOfIteratorHelper(item.children),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var child = _step6.value;
          child.setAttribute('show', true);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      el.isOpen = false;
      function animationend() {
        item.children[1].removeEventListener('animationend', animationend);
        setTimeout(function () {
          function animationend() {
            item.children[0].removeEventListener('animationend', animationend);
            Behaviors.hideKeyboard(el);
            Event.emit(Behaviors.el, 'diddismiss');
            el._transitioning = false;
          }
          item.children[0].setAttribute('fadeout', {
            duration: 160
          });
          item.children[0].addEventListener('animationend', animationend);
        }, 10);
      }
      item.children[1].setAttribute('fadeout', {
        duration: 160
      });
      item.children[1].addEventListener('animationend', animationend);
    };
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      _loop2();
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
};

// -----------------------------------------------------------------------------
// KEY EVENTS

Behaviors.addKeyEvents = function (el) {
  el.addEventListener('click', Behaviors.keyClick);
  el.addEventListener('mousedown', Behaviors.keyDown);
  el.addEventListener('mouseup', Behaviors.keyOut);
  el.addEventListener('raycaster-intersected', Behaviors.keyIn);
  el.addEventListener('raycaster-intersected-cleared', Behaviors.keyOut);
  //triggerdown
  // https://aframe.io/docs/0.6.0/components/hand-controls.html
};

// -----------------------------------------------------------------------------
// KEYCLICK

Behaviors.keyClick = function () {
  SFX.keyDown(Behaviors.el);
  var type = this.getAttribute('key-type');
  var value = this.getAttribute('key-value');
  if (type === 'text' || type === 'spacebar') {
    if (type === 'spacebar') {
      value = ' ';
    }
    if (Behaviors.isShiftEnabled) {
      value = value.toUpperCase();
      Behaviors.shiftToggle();
    } else if (Behaviors.isSymbols) {
      Behaviors.symbolsToggle();
    }
    Event.emit(Behaviors.el, 'input', value);
  } else if (type === 'shift') {
    Behaviors.shiftToggle();
  } else if (type === 'symbol') {
    Behaviors.symbolsToggle();
  } else if (type === 'backspace') {
    Event.emit(Behaviors.el, 'backspace');
  } else if (type === 'enter') {
    Event.emit(Behaviors.el, 'input', '\n');
    Event.emit(Behaviors.el, 'enter', '\n');
  } else if (type === 'dismiss') {
    Event.emit(Behaviors.el, 'dismiss');
  }
};

// -----------------------------------------------------------------------------
// KEYDOWN

Behaviors.keyDown = function () {
  if (Behaviors.el._transitioning) {
    return;
  }
  this.object3D.position.z = 0.003;
  if (this.getAttribute('key-type') === 'spacebar') {
    this.setAttribute('color', Config.SPACEBAR_COLOR_ACTIVE);
  } else {
    this.setAttribute('color', Config.KEY_COLOR_ACTIVE);
  }
};

// -----------------------------------------------------------------------------
// KEYIN

Behaviors.keyIn = function () {
  if (Behaviors.el._transitioning) {
    return;
  }
  if (this.object3D.children[2] && this.object3D.children[2].material && !this.object3D.children[2].material.opacity) {
    return;
  }
  SFX.keyIn(Behaviors.el);
  if (this.getAttribute('key-type') === 'spacebar') {
    this.setAttribute('color', Config.SPACEBAR_COLOR_HIGHLIGHT);
  } else {
    this.setAttribute('color', Config.KEY_COLOR_HIGHLIGHT);
  }
};

// -----------------------------------------------------------------------------
// KEYOUT

Behaviors.keyOut = function () {
  this.object3D.position.z = 0;
  if (this.getAttribute('key-type') === 'spacebar') {
    this.setAttribute('color', Config.KEY_COLOR_ACTIVE);
  } else {
    this.setAttribute('color', Config.KEYBOARD_COLOR);
  }
};

// -----------------------------------------------------------------------------
// SHIFT

Behaviors.isShiftEnabled = false;
Behaviors.shiftToggle = function () {
  Behaviors.isShiftEnabled = !Behaviors.isShiftEnabled;
  var icon_el = Behaviors.el.shiftKey.querySelector('[data-type]');
  if (Behaviors.isShiftEnabled) {
    icon_el.setAttribute('src', Assets.aframeKeyboardShiftActive);
  } else {
    icon_el.setAttribute('src', Assets.aframeKeyboardShift);
  }
  var _iterator7 = _createForOfIteratorHelper(document.querySelectorAll("[key-id]")),
    _step7;
  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var keyEl = _step7.value;
      var key_id = keyEl.getAttribute('key-id'),
        key_type = keyEl.getAttribute('key-type');
      if (key_id.startsWith('main-') && key_type === "text") {
        var textEl = keyEl.querySelector('a-text');
        if (textEl) {
          var value = textEl.getAttribute('value').toLowerCase();
          if (this.isShiftEnabled) {
            value = value.toUpperCase();
          }
          textEl.setAttribute('value', value);
        }
      }
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
};

// -----------------------------------------------------------------------------
// SYMBOLS

Behaviors.isSymbols = false;
Behaviors.symbolsToggle = function () {
  Behaviors.isSymbols = !Behaviors.isSymbols;
  if (!Behaviors.isSymbols) {
    var parent = Behaviors.el.symbolsLayout.parentNode;
    parent.removeChild(Behaviors.el.symbolsLayout);
    parent.appendChild(Behaviors.el.alphabeticalLayout);
    setTimeout(function () {
      Utils.updateOpacity(Behaviors.el.alphabeticalLayout, 1);
    }, 0);
  } else {
    var _parent = Behaviors.el.alphabeticalLayout.parentNode;
    _parent.removeChild(Behaviors.el.alphabeticalLayout);
    _parent.appendChild(Behaviors.el.symbolsLayout);
  }
};
module.exports = Behaviors;

/***/ }),

/***/ "./src/keyboard/config.js":
/*!********************************!*\
  !*** ./src/keyboard/config.js ***!
  \********************************/
/***/ ((module) => {

var Config = {
  KEYBOARD_COLOR: "#263238",
  KEY_COLOR_HIGHLIGHT: "#29363c",
  KEY_COLOR_ACTIVE: "#404b50",
  SPACEBAR_COLOR_ACTIVE: "#3c464b",
  SPACEBAR_COLOR_HIGHLIGHT: "#445055",
  KEY_WIDTH: 0.08,
  SPACE_KEY_WIDTH: 0.368,
  SPACE_KEY_HEIGHT: 0.05,
  ACTION_WIDTH: 0.140
};
module.exports = Config;

/***/ }),

/***/ "./src/keyboard/draw.js":
/*!******************************!*\
  !*** ./src/keyboard/draw.js ***!
  \******************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var _this = this;
var Assets = __webpack_require__(/*! ./assets */ "./src/keyboard/assets.js");
var Layouts = __webpack_require__(/*! ./layouts */ "./src/keyboard/layouts.js");
var Config = __webpack_require__(/*! ./config */ "./src/keyboard/config.js");
var Behaviors = __webpack_require__(/*! ./behaviors */ "./src/keyboard/behaviors.js");
var Draw = {};
Draw.el = null;
Draw.init = function (el) {
  Draw.el = el;
  Behaviors.el = el;
  Behaviors.SFX = el.SFX;
};

// -----------------------------------------------------------------------------
// DRAW NUMERICAL UI

Draw.numericalUI = function () {
  var wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', '0.025 0 0.12');
  wrapper.setAttribute('rotation', '0 25 0');
  wrapper.setAttribute('data-ui', true);
  var el = document.createElement('a-rounded');
  el.setAttribute('width', '0.280');
  el.setAttribute('height', '0.360');
  el.setAttribute('radius', '0.02');
  el.setAttribute('color', Config.KEYBOARD_COLOR);
  wrapper.appendChild(el);
  return wrapper;
};

// -----------------------------------------------------------------------------
// DRAW MAIN UI

Draw.mainUI = function () {
  var wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', '0.312 0 0');
  wrapper.setAttribute('data-ui', true);
  var el = document.createElement('a-rounded');
  el.setAttribute('width', '0.840');
  el.setAttribute('height', '0.360');
  el.setAttribute('radius', '0.02');
  el.setAttribute('color', Config.KEYBOARD_COLOR);
  wrapper.appendChild(el);
  return wrapper;
};

// -----------------------------------------------------------------------------
// DRAW ACTION UI

Draw.actionsUI = function () {
  var wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', '1.180 0 0.01');
  wrapper.setAttribute('rotation', '0 -25 0');
  wrapper.setAttribute('data-ui', true);
  var el = document.createElement('a-rounded');
  el.setAttribute('width', '0.180');
  el.setAttribute('height', '0.360');
  el.setAttribute('radius', '0.02');
  el.setAttribute('color', Config.KEYBOARD_COLOR);
  wrapper.appendChild(el);
  return wrapper;
};

// -----------------------------------------------------------------------------
// DRAW NUMERICAL LAYOUT

Draw.numericalLayout = function () {
  var data = Layouts.numerical;
  var wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', '0.02 0.26 0.001');
  var index_y = 0;
  for (var i in data) {
    var key_id = 'num-' + i;
    var key = Draw.key(key_id, data[i].type, data[i].value);
    var index_x = i % 3;
    var x = Config.KEY_WIDTH * index_x;
    var y = Config.KEY_WIDTH * index_y;
    key.setAttribute('position', "".concat(x, " -").concat(y, " 0"));
    if (index_x === 2) {
      index_y++;
    }
    wrapper.appendChild(key);
  }
  return wrapper;
};

// -----------------------------------------------------------------------------
// DRAW ALPHABETICAL LAYOUT

Draw.alphabeticalLayout = function () {
  var data = Layouts.alphabetical;
  var wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', '0.02 0.26 0.001');
  var index_y = 0,
    index_x = 0,
    prev_was_space = false;
  for (var i in data) {
    var key_id = 'main-' + i;
    var key = Draw.key(key_id, data[i].type, data[i].value);
    var x = Config.KEY_WIDTH * index_x;
    var y = Config.KEY_WIDTH * index_y;

    // Add left padding on the second line
    if (index_y === 1) {
      x = x + Config.KEY_WIDTH / 2;
    }

    // Add margin on the key next to the spacebar key
    if (prev_was_space) {
      x = x + Config.SPACE_KEY_WIDTH - Config.KEY_WIDTH + 0.055 * 2;
    }

    // Add margin to the spacebar key
    if (data[i].type === 'spacebar') {
      prev_was_space = true;
      x = x + 0.055;
      y = Config.KEY_WIDTH * index_y - 0.01;
    }
    key.setAttribute('position', "".concat(x, " -").concat(y, " 0"));
    if (index_y === 1 && index_x === 8) {
      index_x = -1;
      index_y++;
    } else if (index_x === 9) {
      index_x = -1;
      index_y++;
    }
    index_x++;
    wrapper.appendChild(key);
  }
  return wrapper;
};

// -----------------------------------------------------------------------------
// DRAW SYMBOLS LAYOUT

Draw.symbolsLayout = function () {
  var data = Layouts.symbols;
  var wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', '0.02 0.26 0.001');
  var index_y = 0,
    index_x = 0,
    prev_was_space = false;
  for (var i in data) {
    var key_id = 'symbols-' + i;
    var key = Draw.key(key_id, data[i].type, data[i].value);
    var x = Config.KEY_WIDTH * index_x;
    var y = Config.KEY_WIDTH * index_y;

    // Add margin on the key next to the spacebar key
    if (prev_was_space) {
      x = x + Config.SPACE_KEY_WIDTH - Config.KEY_WIDTH + 0.055 * 2;
    }

    // Add margin to the spacebar key
    if (data[i].type === 'spacebar') {
      prev_was_space = true;
      x = x + 0.055;
      y = Config.KEY_WIDTH * index_y - 0.01;
    }
    key.setAttribute('position', "".concat(x, " -").concat(y, " 0"));
    if (index_x === 9) {
      index_x = -1;
      index_y++;
    }
    index_x++;
    wrapper.appendChild(key);
  }
  return wrapper;
};

// -----------------------------------------------------------------------------
// DRAW ACTIONS LAYOUT

Draw.actionsLayout = function () {
  var data = Layouts.actions;
  var wrapper = document.createElement('a-entity');
  wrapper.setAttribute('position', '0.02 0.26 0.001');
  var val_y = 0;
  for (var i in data) {
    var key_id = 'action-' + i;
    var key = Draw.key(key_id, data[i].type, data[i].value);
    key.setAttribute('position', "0 -".concat(val_y, " 0"));
    if (i == 0) {
      val_y += Config.ACTION_WIDTH + 0.01;
    } else if (i == 1) {
      val_y += Config.KEY_WIDTH + 0.01;
    }
    wrapper.appendChild(key);
  }
  return wrapper;
};

// -----------------------------------------------------------------------------
// DRAW KEY

Draw.key = function (id, type, value) {
  var that = _this;
  var el = document.createElement('a-rounded');
  el.setAttribute('key-id', id);
  el.setAttribute('width', Config.KEY_WIDTH);
  el.setAttribute('height', Config.KEY_WIDTH);
  el.setAttribute('radius', '0.008');
  el.setAttribute('position', '0 0 0');
  el.setAttribute('key-type', type);
  el.setAttribute('key-value', value);
  el.setAttribute('color', Config.KEYBOARD_COLOR);

  // ---------------------------------------------------------------------------
  // EVENTS

  Behaviors.addKeyEvents(el);

  // ---------------------------------------------------------------------------
  // SHADOW

  el.shadow_el = document.createElement('a-image');
  el.shadow_el.setAttribute('width', Config.KEY_WIDTH * 1.25);
  el.shadow_el.setAttribute('height', Config.KEY_WIDTH * 1.25);
  el.shadow_el.setAttribute('position', Config.KEY_WIDTH / 2 + ' ' + Config.KEY_WIDTH / 2 + ' -0.002');
  el.shadow_el.setAttribute('src', Assets.aframeKeyboardShadow);
  el.appendChild(el.shadow_el);

  // ---------------------------------------------------------------------------
  // TEXT KEY

  if (type === 'text' || type === 'spacebar' || type === 'symbol') {
    var letter_el = document.createElement('a-text');
    letter_el.setAttribute('value', value);
    letter_el.setAttribute('color', '#dbddde');
    letter_el.setAttribute('position', Config.KEY_WIDTH / 2 + ' ' + Config.KEY_WIDTH / 2 + ' 0.01');
    letter_el.setAttribute('scale', '0.16 0.16 0.16');
    letter_el.setAttribute('align', 'center');
    letter_el.setAttribute('baseline', 'center');
    el.appendChild(letter_el);
  }

  // ---------------------------------------------------------------------------
  // SPACEBAR KEY

  if (type === 'spacebar') {
    el.setAttribute('width', Config.SPACE_KEY_WIDTH);
    el.setAttribute('height', Config.SPACE_KEY_HEIGHT);
    el.setAttribute('color', '#404b50');
    el.shadow_el.setAttribute('width', Config.SPACE_KEY_WIDTH * 1.12);
    el.shadow_el.setAttribute('height', Config.SPACE_KEY_HEIGHT * 1.2);
    el.shadow_el.setAttribute('position', Config.SPACE_KEY_WIDTH / 2 + ' ' + Config.SPACE_KEY_HEIGHT / 2 + ' -0.02');
    letter_el.setAttribute('color', '#adb1b3');
    letter_el.setAttribute('scale', '0.12 0.12 0.12');
    letter_el.setAttribute('position', Config.SPACE_KEY_WIDTH / 2 + ' ' + Config.SPACE_KEY_HEIGHT / 2 + ' 0');
  }

  // ---------------------------------------------------------------------------
  // SYMBOL KEY
  else if (type === 'symbol') {
    letter_el.setAttribute('scale', '0.12 0.12 0.12');
  }

  // ---------------------------------------------------------------------------
  // ACTION KEY

  if (type === 'backspace' || type === 'enter' || type === 'dismiss') {
    el.setAttribute('width', Config.ACTION_WIDTH);
    el.shadow_el.setAttribute('width', Config.ACTION_WIDTH * 1.25);
    el.shadow_el.setAttribute('position', Config.ACTION_WIDTH / 2 + ' ' + Config.KEY_WIDTH / 2 + ' -0.02');
  }

  // ---------------------------------------------------------------------------
  // SHIFT KEY

  if (type === 'shift') {
    var icon_el = document.createElement('a-image');
    icon_el.setAttribute('data-type', 'icon');
    icon_el.setAttribute('width', '0.032');
    icon_el.setAttribute('height', '0.032');
    icon_el.setAttribute('position', '0.04 0.04 0.01');
    icon_el.setAttribute('src', Assets.aframeKeyboardShift);
    el.appendChild(icon_el);
    Draw.el.shiftKey = el;
  }

  // ---------------------------------------------------------------------------
  // GLOBAL
  else if (type === 'global') {
    var icon_el = document.createElement('a-image');
    icon_el.setAttribute('width', '0.032');
    icon_el.setAttribute('height', '0.032');
    icon_el.setAttribute('position', '0.04 0.04 0.01');
    icon_el.setAttribute('src', Assets.aframeKeyboardGlobal);
    el.appendChild(icon_el);
  }

  // ---------------------------------------------------------------------------
  // BACKSPACE
  else if (type === 'backspace') {
    var icon_el = document.createElement('a-image');
    icon_el.setAttribute('width', '0.046');
    icon_el.setAttribute('height', '0.046');
    icon_el.setAttribute('position', '0.07 0.04 0.01');
    icon_el.setAttribute('src', Assets.aframeKeyboardBackspace);
    el.appendChild(icon_el);
  }

  // ---------------------------------------------------------------------------
  // ENTER
  else if (type === 'enter') {
    el.setAttribute('height', Config.ACTION_WIDTH);
    el.shadow_el.setAttribute('height', Config.ACTION_WIDTH * 1.25);
    el.shadow_el.setAttribute('position', Config.ACTION_WIDTH / 2 + ' ' + Config.ACTION_WIDTH / 2 + ' -0.02');
    var circle_el = document.createElement('a-circle');
    circle_el.setAttribute('color', '#4285f4');
    circle_el.setAttribute('radius', 0.044);
    circle_el.setAttribute('position', '0.07 0.07 0.01');
    el.appendChild(circle_el);
    var icon_el = document.createElement('a-image');
    icon_el.setAttribute('width', '0.034');
    icon_el.setAttribute('height', '0.034');
    icon_el.setAttribute('position', '0.07 0.07 0.011');
    icon_el.setAttribute('src', Assets.aframeKeyboardEnter);
    el.appendChild(icon_el);
  }

  // ---------------------------------------------------------------------------
  // DISMISS
  else if (type === 'dismiss') {
    var icon_el = document.createElement('a-image');
    icon_el.setAttribute('width', '0.046');
    icon_el.setAttribute('height', '0.046');
    icon_el.setAttribute('position', '0.07 0.04 0.01');
    icon_el.setAttribute('src', Assets.aframeKeyboardDismiss);
    el.appendChild(icon_el);
  }
  return el;
};
module.exports = Draw;

/***/ }),

/***/ "./src/keyboard/index.js":
/*!*******************************!*\
  !*** ./src/keyboard/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Draw = __webpack_require__(/*! ./draw */ "./src/keyboard/draw.js");
var Behaviors = __webpack_require__(/*! ./behaviors */ "./src/keyboard/behaviors.js");
var SFX = __webpack_require__(/*! ./sfx */ "./src/keyboard/sfx.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
AFRAME.registerComponent('keyboard', {
  schema: {
    isOpen: {
      type: "boolean",
      "default": false
    },
    physicalKeyboard: {
      type: "boolean",
      "default": false
    }
  },
  currentInput: null,
  init: function init() {
    var that = this;

    // SFX
    SFX.init(this.el);

    // Draw
    Draw.init(this.el);

    // Init keyboard UI
    var numericalUI = Draw.numericalUI(),
      mainUI = Draw.mainUI(),
      actionsUI = Draw.actionsUI();

    // Create layout
    this.el.alphabeticalLayout = Draw.alphabeticalLayout();
    this.el.symbolsLayout = Draw.symbolsLayout();

    // Append layouts to UI
    numericalUI.appendChild(Draw.numericalLayout());
    mainUI.appendChild(this.el.alphabeticalLayout);
    actionsUI.appendChild(Draw.actionsLayout());
    this.el.appendChild(numericalUI);
    this.el.appendChild(mainUI);
    this.el.appendChild(actionsUI);

    // Inject methods in elements..
    this.el.show = function () {
      Behaviors.showKeyboard(that.el);
    };
    this.el.hide = function () {
      Behaviors.hideKeyboard(that.el);
    };
    this.el.open = function () {
      Behaviors.openKeyboard(that.el);
    };
    this.el.dismiss = function () {
      Behaviors.dismissKeyboard(that.el);
    };
    this.el.destroy = function () {
      Behaviors.destroyKeyboard(that.el);
    };

    // Set default value
    this.el.setAttribute("scale", "2 2 2");
    this.el.setAttribute("rotation", "-20 0 0");
    this.el.setAttribute("position", "-1.5 -0.3 -2");

    // Register keyboard events
    this.el.addEventListener('input', this.inputEvent.bind(this));
    this.el.addEventListener('backspace', this.backspaceEvent.bind(this));
    this.el.addEventListener('dismiss', this.dismissEvent.bind(this));

    // Register global events
    document.addEventListener('keydown', this.keydownEvent.bind(this));
    document.body.addEventListener('didfocusinput', this.didFocusInputEvent.bind(this));
    document.body.addEventListener('didblurinput', this.didBlurInputEvent.bind(this));
  },
  update: function update() {
    if (this.data.isOpen) {
      Behaviors.showKeyboard(this.el);
    } else {
      Behaviors.hideKeyboard(this.el);
    }
  },
  tick: function tick() {},
  remove: function remove() {
    this.el.removeEventListener('input', this.inputEvent.bind(this));
    this.el.removeEventListener('backspace', this.backspaceEvent.bind(this));
    this.el.removeEventListener('dismiss', this.dismissEvent.bind(this));
    document.removeEventListener('keydown', this.keydownEvent.bind(this));
    document.body.removeEventListener('didfocusinput', this.didFocusInputEvent.bind(this));
    document.body.removeEventListener('didblurinput', this.didBlurInputEvent.bind(this));
  },
  pause: function pause() {},
  play: function play() {},
  // Fired on keyboard key press
  inputEvent: function inputEvent(e) {
    if (this.currentInput) {
      this.currentInput.appendString(e.detail);
    }
  },
  // Fired on backspace key press
  backspaceEvent: function backspaceEvent(e) {
    if (this.currentInput) {
      this.currentInput.deleteLast();
    }
  },
  dismissEvent: function dismissEvent(e) {
    if (this.currentInput) {
      this.currentInput.blur();
    }
  },
  // physical keyboard event
  keydownEvent: function keydownEvent(e) {
    if (this.currentInput && this.data.physicalKeyboard) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Enter') {
        Event.emit(Behaviors.el, 'input', '\n');
        Event.emit(Behaviors.el, 'enter', '\n');
      } else if (e.key === 'Backspace') {
        Event.emit(Behaviors.el, 'backspace');
      } else if (e.key === 'Escape') {
        Event.emit(Behaviors.el, 'dismiss');
      } else if (e.key.length < 2) {
        Event.emit(Behaviors.el, 'input', e.key);
      }
    }
  },
  // Fired when an input has been selected
  didFocusInputEvent: function didFocusInputEvent(e) {
    if (this.currentInput) {
      this.currentInput.blur(true);
    }
    this.currentInput = e.detail;
    if (!this.el.isOpen) {
      Behaviors.openKeyboard(this.el);
    }
  },
  // Fired when an input has been deselected
  didBlurInputEvent: function didBlurInputEvent(e) {
    this.currentInput = null;
    Behaviors.dismissKeyboard(this.el);
  }
});
AFRAME.registerPrimitive('a-keyboard', {
  defaultComponents: {
    keyboard: {}
  },
  mappings: {
    'is-open': 'keyboard.isOpen',
    'physical-keyboard': 'keyboard.physicalKeyboard'
  }
});

/***/ }),

/***/ "./src/keyboard/layouts.js":
/*!*********************************!*\
  !*** ./src/keyboard/layouts.js ***!
  \*********************************/
/***/ ((module) => {

var Layouts = {
  numerical: [{
    type: 'text',
    value: '1'
  }, {
    type: 'text',
    value: '2'
  }, {
    type: 'text',
    value: '3'
  }, {
    type: 'text',
    value: '4'
  }, {
    type: 'text',
    value: '5'
  }, {
    type: 'text',
    value: '6'
  }, {
    type: 'text',
    value: '7'
  }, {
    type: 'text',
    value: '8'
  }, {
    type: 'text',
    value: '9'
  }, {
    type: 'text',
    value: '.'
  }, {
    type: 'text',
    value: '0'
  }, {
    type: 'text',
    value: '-'
  }],
  alphabetical: [{
    type: 'text',
    value: 'q'
  }, {
    type: 'text',
    value: 'w'
  }, {
    type: 'text',
    value: 'e'
  }, {
    type: 'text',
    value: 'r'
  }, {
    type: 'text',
    value: 't'
  }, {
    type: 'text',
    value: 'y'
  }, {
    type: 'text',
    value: 'u'
  }, {
    type: 'text',
    value: 'i'
  }, {
    type: 'text',
    value: 'o'
  }, {
    type: 'text',
    value: 'p'
  }, {
    type: 'text',
    value: 'a'
  }, {
    type: 'text',
    value: 's'
  }, {
    type: 'text',
    value: 'd'
  }, {
    type: 'text',
    value: 'f'
  }, {
    type: 'text',
    value: 'g'
  }, {
    type: 'text',
    value: 'h'
  }, {
    type: 'text',
    value: 'j'
  }, {
    type: 'text',
    value: 'k'
  }, {
    type: 'text',
    value: 'l'
  }, {
    type: 'shift'
  }, {
    type: 'text',
    value: 'z'
  }, {
    type: 'text',
    value: 'x'
  }, {
    type: 'text',
    value: 'c'
  }, {
    type: 'text',
    value: 'v'
  }, {
    type: 'text',
    value: 'b'
  }, {
    type: 'text',
    value: 'n'
  }, {
    type: 'text',
    value: 'm'
  }, {
    type: 'text',
    value: '!'
  }, {
    type: 'text',
    value: '?'
  }, {
    type: 'symbol',
    value: '#+='
  }, {
    type: 'text',
    value: '@'
  }, {
    type: 'spacebar',
    value: ''
  }, {
    type: 'text',
    value: ','
  }, {
    type: 'text',
    value: '.'
  }],
  symbols: [{
    type: 'text',
    value: '@'
  }, {
    type: 'text',
    value: '#'
  }, {
    type: 'text',
    value: '$'
  }, {
    type: 'text',
    value: '%'
  }, {
    type: 'text',
    value: '&'
  }, {
    type: 'text',
    value: '*'
  }, {
    type: 'text',
    value: '-'
  }, {
    type: 'text',
    value: '+'
  }, {
    type: 'text',
    value: '('
  }, {
    type: 'text',
    value: ')'
  }, {
    type: 'text',
    value: '~'
  }, {
    type: 'text',
    value: '`'
  }, {
    type: 'text',
    value: '"'
  }, {
    type: 'text',
    value: '\''
  }, {
    type: 'text',
    value: ':'
  }, {
    type: 'text',
    value: ';'
  }, {
    type: 'text',
    value: '_'
  }, {
    type: 'text',
    value: '='
  }, {
    type: 'text',
    value: '\\'
  }, {
    type: 'text',
    value: '/'
  }, {
    type: 'text',
    value: '{'
  }, {
    type: 'text',
    value: '}'
  }, {
    type: 'text',
    value: '['
  }, {
    type: 'text',
    value: ']'
  }, {
    type: 'text',
    value: '<'
  }, {
    type: 'text',
    value: '>'
  }, {
    type: 'text',
    value: '^'
  }, {
    type: 'text',
    value: '|'
  }, {
    type: 'text',
    value: '!'
  }, {
    type: 'text',
    value: '?'
  }, {
    type: 'symbol',
    value: 'ABC'
  }, {
    type: 'text',
    value: '@'
  }, {
    type: 'spacebar',
    value: ''
  }, {
    type: 'text',
    value: ','
  }, {
    type: 'text',
    value: '.'
  }],
  actions: [{
    type: 'backspace',
    value: 'Del'
  }, {
    type: 'enter',
    value: 'OK'
  }, {
    type: 'dismiss',
    value: 'W'
  }]
};
module.exports = Layouts;

/***/ }),

/***/ "./src/keyboard/sfx.js":
/*!*****************************!*\
  !*** ./src/keyboard/sfx.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Assets = __webpack_require__(/*! ./assets */ "./src/keyboard/assets.js");
var SFX = {
  init: function init(parent) {
    var el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeKeyboardKeyInSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', Assets.aframeKeyboardKeyIn);
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
    el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeKeyboardKeyDownSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', Assets.aframeKeyboardKeyDown);
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
  },
  keyIn: function keyIn(parent) {
    var el = parent.querySelector('[key=aframeKeyboardKeyInSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  },
  keyDown: function keyDown(parent) {
    var el = parent.querySelector('[key=aframeKeyboardKeyDownSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  }
};
module.exports = SFX;

/***/ }),

/***/ "./src/radio/assets.js":
/*!*****************************!*\
  !*** ./src/radio/assets.js ***!
  \*****************************/
/***/ ((module) => {

module.exports = [{
  type: 'audio',
  id: 'aframeRadioClick',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/InputClick.mp3")
}, {
  type: 'audio',
  id: 'aframeRadioClickDisabled',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/ButtonClickDisabled.mp3")
}];

/***/ }),

/***/ "./src/radio/index.js":
/*!****************************!*\
  !*** ./src/radio/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
var Assets = __webpack_require__(/*! ./assets */ "./src/radio/assets.js");
var FormControlHelpers = __webpack_require__(/*! ../core/form-control-helpers */ "./src/core/form-control-helpers.js");
var AssetsRegistry = __webpack_require__(/*! ../core/assets-registry */ "./src/core/assets-registry.js");
AFRAME.registerComponent('radio', {
  schema: {
    checked: {
      type: 'boolean',
      "default": false
    },
    disabled: {
      type: 'boolean',
      "default": false
    },
    name: {
      type: "string",
      "default": ""
    },
    value: {
      type: "string",
      "default": ""
    },
    label: {
      type: "string",
      "default": ""
    },
    radioColor: {
      type: "color",
      "default": "#757575"
    },
    radioColorChecked: {
      type: "color",
      "default": "#4076fd"
    },
    color: {
      type: "color",
      "default": "#757575"
    },
    font: {
      type: "string",
      "default": ""
    },
    letterSpacing: {
      type: "int",
      "default": 0
    },
    lineHeight: {
      type: "string",
      "default": ""
    },
    opacity: {
      type: "number",
      "default": 1
    },
    width: {
      type: "number",
      "default": 1
    },
    // Configurable dimensions (Requirements 6.1, 6.2, 6.3, 6.4)
    size: {
      type: "number",
      "default": 1
    },
    labelOffset: {
      type: "number",
      "default": 0.24
    },
    disabledOpacity: {
      type: "number",
      "default": 0.4
    },
    // Accessibility properties (Requirements 4.1, 4.2, 4.6)
    ariaLabel: {
      type: "string",
      "default": ""
    },
    tabIndex: {
      type: "int",
      "default": 0
    },
    description: {
      type: "string",
      "default": ""
    },
    required: {
      type: "boolean",
      "default": false
    },
    invalid: {
      type: "boolean",
      "default": false
    }
  },
  init: function init() {
    var that = this;

    // Initialize form control helpers for resource tracking
    FormControlHelpers.initFormControl(this);

    // Get system reference for cleanup
    this.system = FormControlHelpers.getFormSystem(this);
    this.formSystem = this.system;

    // Ensure assets for this feature via centralized registry
    AssetsRegistry.ensure(['radio']);
    if (this.system && this.system.registerRadioGroup) {
      this.system.registerRadioGroup(this.el);
    }

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
    this.clickHandler = FormControlHelpers.bindEvent(this, this.el, 'click', function (event) {
      if (that.data.disabled) {
        return;
      }
      that.el.setAttribute('checked', true);
      that.onClick();
    });
    this.mousedownHandler = FormControlHelpers.bindEvent(this, this.el, 'mousedown', function (event) {
      if (!that.system || !that.system.playSound) return;
      if (that.data.disabled) {
        that.system.playSound('radioClickDisabled');
        return;
      }
      that.system.playSound('radioClick');
    });

    // HOVER EVENTS
    this.mouseenterHandler = FormControlHelpers.bindEvent(this, this.el, 'mouseenter', function (event) {
      if (!that.data.disabled) {
        that.onHoverStart();
      }
    });
    this.mouseleaveHandler = FormControlHelpers.bindEvent(this, this.el, 'mouseleave', function (event) {
      if (!that.data.disabled) {
        that.onHoverEnd();
      }
    });

    // Store original value property descriptor for cleanup
    this.originalValueDescriptor = Object.getOwnPropertyDescriptor(this.el, 'value');
    Object.defineProperty(this.el, 'value', {
      get: function get() {
        return this.getAttribute('value');
      },
      set: function set(value) {
        this.setAttribute('value', value);
      },
      enumerable: true,
      configurable: true
    });

    // Setup accessibility features (Requirements 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 4.10)
    FormControlHelpers.setupAccessibility(this);
  },
  onClick: function onClick(noemit) {
    var _this = this;
    if (this.data.name && this.system && this.system.getRadioGroup) {
      var group = this.system.getRadioGroup(this.el) || [];
      if (group.length) {
        group.forEach(function (el) {
          if (el === _this.el) {
            if (!_this.data.checked) {
              _this.check();
              if (!noemit) {
                Event.emit(_this.el, 'change', true);
              }
            }
          } else if (el.components && el.components.radio) {
            el.components.radio.uncheck();
          }
        });
        return;
      }
    }
    if (this.data.name) {
      var nearestForm = this.el.closest("a-form");
      if (nearestForm) {
        var didCheck = false;
        var children = Array.from(nearestForm.querySelectorAll("[name=".concat(this.data.name, "]")));
        children.reverse();
        for (var _i = 0, _children = children; _i < _children.length; _i++) {
          var child = _children[_i];
          // Radio + not disabled
          if (child.components.radio) {
            // Currently checked
            if (child === this.el && child.hasAttribute('checked')) {
              didCheck = true;
              child.components.radio.check();
              if (!noemit) {
                Event.emit(child, 'change', true);
              }
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
          if (!noemit) {
            Event.emit(this.el, 'change', true);
          }
        }
      }
    }
  },
  check: function check() {
    this.outline.setAttribute('color', this.data.radioColorChecked);
    this.circle.setAttribute('color', this.data.radioColorChecked);
    this.circle.setAttribute('visible', true);
    if (this.data.disabled) {
      this.disabled();
    }

    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);

    // Update roving tabindex for radio group (Requirements 4.4, 4.7, 4.8)
    FormControlHelpers.updateRadioGroupTabindex(this);
  },
  uncheck: function uncheck() {
    this.outline.setAttribute('color', this.data.radioColor);
    this.circle.setAttribute('visible', false);
    if (this.data.disabled) {
      this.disabled();
    }

    // Update ARIA attributes when state changes (Requirement 4.2)
    FormControlHelpers.updateARIA(this);

    // Update roving tabindex for radio group (Requirements 4.4, 4.7, 4.8)
    FormControlHelpers.updateRadioGroupTabindex(this);
  },
  disabled: function disabled() {
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
  onHoverStart: function onHoverStart() {
    if (this.data.disabled || !this.outline) return;

    // Create subtle hover effect with smooth transition
    var hoverColor = this.data.checked ? this.data.radioColorChecked : this.data.radioColor;
    var brighterColor = this.brightenColor(hoverColor, 0.1);

    // Use A-Frame animation for smooth transitions
    if (this.outline && this.outline.setAttribute) {
      this.outline.setAttribute('animation__hover', {
        property: 'material.color',
        to: brighterColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
    if (this.data.checked && this.circle && this.circle.getAttribute && this.circle.getAttribute('visible')) {
      this.circle.setAttribute('animation__hover', {
        property: 'material.color',
        to: brighterColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
  },
  /**
   * Handle hover end - return to normal state (Requirement 5.2)
   */
  onHoverEnd: function onHoverEnd() {
    if (this.data.disabled || !this.outline) return;

    // Return to normal colors with smooth transition
    var normalColor = this.data.checked ? this.data.radioColorChecked : this.data.radioColor;
    if (this.outline && this.outline.setAttribute) {
      this.outline.setAttribute('animation__hover', {
        property: 'material.color',
        to: normalColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
    if (this.data.checked && this.circle && this.circle.getAttribute && this.circle.getAttribute('visible')) {
      this.circle.setAttribute('animation__hover', {
        property: 'material.color',
        to: normalColor,
        dur: 150,
        easing: 'easeOutQuad'
      });
    }
  },
  /**
   * Brighten a color by a given factor for hover effects
   */
  brightenColor: function brightenColor(color, factor) {
    // Simple hex color brightening without THREE.js dependency
    if (typeof color === 'string' && color.startsWith('#')) {
      var hex = color.slice(1);
      var r = parseInt(hex.substr(0, 2), 16);
      var g = parseInt(hex.substr(2, 2), 16);
      var b = parseInt(hex.substr(4, 2), 16);
      var brighterR = Math.min(255, Math.floor(r + (255 - r) * factor));
      var brighterG = Math.min(255, Math.floor(g + (255 - g) * factor));
      var brighterB = Math.min(255, Math.floor(b + (255 - b) * factor));
      return '#' + brighterR.toString(16).padStart(2, '0') + brighterG.toString(16).padStart(2, '0') + brighterB.toString(16).padStart(2, '0');
    }

    // Fallback to original color if parsing fails
    return color;
  },
  /**
   * Event-driven opacity update - replaces setInterval polling
   */
  updateOpacityWhenReady: function updateOpacityWhenReady() {
    var _this2 = this;
    var targetOpacity = this.data.disabled ? this.data.disabledOpacity : 1;

    // Try immediate update if geometry is ready
    if (this.outline && this.outline.object3D && this.outline.object3D.children[0]) {
      Utils.updateOpacity(this.outline, targetOpacity);
      Utils.updateOpacity(this.circle, targetOpacity);
      Utils.updateOpacity(this.label, targetOpacity);
      return;
    }

    // Otherwise wait for loaded event
    var boundOnLoaded;
    var onLoaded = function onLoaded() {
      Utils.updateOpacity(_this2.outline, targetOpacity);
      Utils.updateOpacity(_this2.circle, targetOpacity);
      Utils.updateOpacity(_this2.label, targetOpacity);
      _this2.el.removeEventListener('loaded', boundOnLoaded);
    };
    boundOnLoaded = FormControlHelpers.bindEvent(this, this.el, 'loaded', onLoaded);

    // Fallback: single requestAnimationFrame check if loaded event doesn't fire
    requestAnimationFrame(function () {
      if (_this2.outline && _this2.outline.object3D && _this2.outline.object3D.children[0]) {
        Utils.updateOpacity(_this2.outline, targetOpacity);
        Utils.updateOpacity(_this2.circle, targetOpacity);
        Utils.updateOpacity(_this2.label, targetOpacity);
        _this2.el.removeEventListener('loaded', boundOnLoaded);
      }
    });
  },
  /**
   * Optimized text width calculation - replaces recursive trimming
   * Simple approach that preserves labels while eliminating polling
   */
  updateTextWidth: function updateTextWidth() {
    if (!this.data.label.length) return;
    var props = {
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
  update: function update() {
    var that = this;
    this.onClick(true);
    if (this.system && this.system.registerRadioGroup) {
      this.system.registerRadioGroup(this.el);
    }

    // Calculate scaled dimensions based on size property (Requirements 6.1, 6.2)
    var baseRadius = 0.1 * this.data.size;
    var innerRadius = 0.078 * this.data.size;
    var circleRadius = 0.05 * this.data.size;
    var hitboxHeight = 0.2 * this.data.size;
    var radioOffset = baseRadius; // Position radio at its radius from origin

    // HITBOX - scale proportionally with size (Requirement 6.4)
    this.hitbox.setAttribute('width', this.data.width);
    this.hitbox.setAttribute('height', hitboxHeight);
    this.hitbox.setAttribute('position', this.data.width / 2 + ' 0 0.001');

    // OUTLINE - scale with size property
    this.outline.setAttribute('radius-outer', baseRadius);
    this.outline.setAttribute('radius-inner', innerRadius);
    this.outline.setAttribute('position', radioOffset + ' 0 0.002');

    // CIRCLE - scale with size property
    this.circle.setAttribute('radius', circleRadius);
    this.circle.setAttribute('position', radioOffset + ' 0 0.002');
    var props = {
      color: this.data.color,
      align: 'left',
      wrapCount: 10 * (this.data.width + 0.2),
      width: this.data.width
    };
    if (this.data.font) {
      props.font = this.data.font;
    }

    // LABEL - use configurable labelOffset (Requirement 6.3)
    props.value = this.data.label;
    props.color = this.data.color;
    this.label.setAttribute('text', props);
    this.label.setAttribute('position', this.data.width / 2 + this.data.labelOffset + ' 0 0.002');

    // Event-driven updates - no polling or setTimeout wrappers

    // Apply opacity immediately if geometry is ready, otherwise wait for loaded event
    this.updateOpacityWhenReady();

    // Update ARIA attributes when properties change (Requirement 4.2)
    FormControlHelpers.updateARIA(this);
  },
  remove: function remove() {
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

/***/ }),

/***/ "./src/rounded/index.js":
/*!******************************!*\
  !*** ./src/rounded/index.js ***!
  \******************************/
/***/ (() => {

AFRAME.registerComponent('rounded', {
  schema: {
    enabled: {
      "default": true
    },
    width: {
      type: 'number',
      "default": 1
    },
    height: {
      type: 'number',
      "default": 1
    },
    radius: {
      type: 'number',
      "default": 0.3
    },
    topLeftRadius: {
      type: 'number',
      "default": -1
    },
    topRightRadius: {
      type: 'number',
      "default": -1
    },
    bottomLeftRadius: {
      type: 'number',
      "default": -1
    },
    bottomRightRadius: {
      type: 'number',
      "default": -1
    },
    color: {
      type: 'color',
      "default": "#F0F0F0"
    },
    opacity: {
      type: 'number',
      "default": 1
    }
  },
  init: function init() {
    this.rounded = new THREE.Mesh(this.draw(), new THREE.MeshPhongMaterial({
      color: new THREE.Color(this.data.color),
      side: THREE.DoubleSide
    }));
    this.updateOpacity();
    this.el.setObject3D('mesh', this.rounded);
  },
  update: function update() {
    if (this.data.enabled) {
      if (this.rounded) {
        this.rounded.visible = true;
        this.rounded.geometry = this.draw();
        this.rounded.material.color = new THREE.Color(this.data.color);
        this.updateOpacity();
      }
    } else {
      this.rounded.visible = false;
    }
  },
  updateOpacity: function updateOpacity() {
    if (this.data.opacity < 0) {
      this.data.opacity = 0;
    }
    if (this.data.opacity > 1) {
      this.data.opacity = 1;
    }
    if (this.data.opacity < 1) {
      this.rounded.material.transparent = true;
    } else {
      this.rounded.material.transparent = false;
    }
    this.rounded.material.opacity = this.data.opacity;
  },
  tick: function tick() {},
  remove: function remove() {
    if (!this.rounded) {
      return;
    }
    this.el.object3D.remove(this.rounded);
    this.rounded = null;
  },
  draw: function draw() {
    var roundedRectShape = new THREE.Shape();
    function roundedRect(ctx, x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
      if (!topLeftRadius) {
        topLeftRadius = 0.00001;
      }
      if (!topRightRadius) {
        topRightRadius = 0.00001;
      }
      if (!bottomLeftRadius) {
        bottomLeftRadius = 0.00001;
      }
      if (!bottomRightRadius) {
        bottomRightRadius = 0.00001;
      }
      ctx.moveTo(x, y + topLeftRadius);
      ctx.lineTo(x, y + height - topLeftRadius);
      ctx.quadraticCurveTo(x, y + height, x + topLeftRadius, y + height);
      ctx.lineTo(x + width - topRightRadius, y + height);
      ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - topRightRadius);
      ctx.lineTo(x + width, y + bottomRightRadius);
      ctx.quadraticCurveTo(x + width, y, x + width - bottomRightRadius, y);
      ctx.lineTo(x + bottomLeftRadius, y);
      ctx.quadraticCurveTo(x, y, x, y + bottomLeftRadius);
    }
    var corners = [this.data.radius, this.data.radius, this.data.radius, this.data.radius];
    if (this.data.topLeftRadius != -1) {
      corners[0] = this.data.topLeftRadius;
    }
    if (this.data.topRightRadius != -1) {
      corners[1] = this.data.topRightRadius;
    }
    if (this.data.bottomLeftRadius != -1) {
      corners[2] = this.data.bottomLeftRadius;
    }
    if (this.data.bottomRightRadius != -1) {
      corners[3] = this.data.bottomRightRadius;
    }
    roundedRect(roundedRectShape, 0, 0, this.data.width, this.data.height, corners[0], corners[1], corners[2], corners[3]);
    return new THREE.ShapeGeometry(roundedRectShape);
  },
  pause: function pause() {},
  play: function play() {}
});
AFRAME.registerPrimitive('a-rounded', {
  defaultComponents: {
    rounded: {}
  },
  mappings: {
    enabled: 'rounded.enabled',
    width: 'rounded.width',
    height: 'rounded.height',
    radius: 'rounded.radius',
    'top-left-radius': 'rounded.topLeftRadius',
    'top-right-radius': 'rounded.topRightRadius',
    'bottom-left-radius': 'rounded.bottomLeftRadius',
    'bottom-right-radius': 'rounded.bottomRightRadius',
    color: 'rounded.color',
    opacity: 'rounded.opacity'
  }
});

/***/ }),

/***/ "./src/switch/assets.js":
/*!******************************!*\
  !*** ./src/switch/assets.js ***!
  \******************************/
/***/ ((module) => {

module.exports = [{
  type: 'img',
  id: 'aframeSwitchShadow',
  src: "".concat(AFRAME.ASSETS_PATH, "/images/SwitchShadow.png")
}, {
  type: 'audio',
  id: 'aframeSwitchClick',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/InputClick.mp3")
}, {
  type: 'audio',
  id: 'aframeSwitchClickDisabled',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/ButtonClickDisabled.mp3")
}];

/***/ }),

/***/ "./src/switch/index.js":
/*!*****************************!*\
  !*** ./src/switch/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
var Assets = __webpack_require__(/*! ./assets */ "./src/switch/assets.js");
var SFX = __webpack_require__(/*! ./sfx */ "./src/switch/sfx.js");
AFRAME.registerComponent('switch', {
  schema: {
    name: {
      type: "string",
      "default": ""
    },
    enabled: {
      type: 'boolean',
      "default": false
    },
    disabled: {
      type: 'boolean',
      "default": false
    },
    fillColor: {
      type: "color",
      "default": "#bababa"
    },
    knobColor: {
      type: "color",
      "default": "#f5f5f5"
    },
    fillColorEnabled: {
      type: "color",
      "default": "#80a8ff"
    },
    knobColorEnabled: {
      type: "color",
      "default": "#4076fd"
    },
    fillColorDisabled: {
      type: "color",
      "default": "#939393"
    },
    knobColorDisabled: {
      type: "color",
      "default": "#a2a2a2"
    }
  },
  init: function init() {
    var that = this;

    // Assets
    Utils.preloadAssets(Assets);

    // SFX
    SFX.init(this.el);

    // FILL
    this.el.fill = document.createElement('a-rounded');
    this.el.fill.setAttribute('width', 0.36);
    this.el.fill.setAttribute('height', 0.16);
    this.el.fill.setAttribute('radius', 0.08);
    this.el.fill.setAttribute('side', 'double');
    this.el.fill.setAttribute('position', '0 0 0.01');
    this.el.appendChild(this.el.fill);

    // KNOB
    this.el.knob = document.createElement('a-circle');
    this.el.knob.setAttribute('position', '0.06 0.08 0.02');
    this.el.knob.setAttribute('radius', 0.12);
    this.el.knob.setAttribute('side', 'double');
    this.el.appendChild(this.el.knob);

    // SHADOW
    this.el.shadow_el = document.createElement('a-image');
    this.el.shadow_el.setAttribute('width', 0.24 * 1.25);
    this.el.shadow_el.setAttribute('height', 0.24 * 1.25);
    this.el.shadow_el.setAttribute('position', '0 0 -0.001');
    this.el.shadow_el.setAttribute('src', '#aframeSwitchShadow');
    this.el.knob.appendChild(this.el.shadow_el);
    this.el.addEventListener('click', function () {
      if (this.components["switch"].data.disabled) {
        return;
      }
      this.setAttribute('enabled', !this.components["switch"].data.enabled);
      Event.emit(this, 'change', this.components["switch"].data.enabled);
    });
    this.el.addEventListener('mousedown', function () {
      if (this.components["switch"].data.disabled) {
        return SFX.clickDisabled(this);
      }
      SFX.click(this);
    });
    Object.defineProperty(this.el, 'enabled', {
      get: function get() {
        return this.getAttribute('enabled');
      },
      set: function set(value) {
        this.setAttribute('enabled', value);
      },
      enumerable: true,
      configurable: true
    });
  },
  on: function on() {
    this.el.fill.setAttribute('color', this.data.fillColorEnabled);
    this.el.knob.setAttribute('position', '0.32 0.08 0.02');
    this.el.knob.setAttribute('color', this.data.knobColorEnabled);
  },
  off: function off() {
    this.el.fill.setAttribute('color', this.data.fillColor);
    this.el.knob.setAttribute('position', '0.06 0.08 0.02');
    this.el.knob.setAttribute('color', this.data.knobColor);
  },
  disable: function disable() {
    this.el.fill.setAttribute('color', this.data.fillColorDisabled);
    this.el.knob.setAttribute('color', this.data.knobColorDisabled);
  },
  update: function update() {
    if (this.data.enabled) {
      this.on();
    } else {
      this.off();
    }
    if (this.data.disabled) {
      this.disable();
    }
  },
  tick: function tick() {},
  remove: function remove() {},
  pause: function pause() {},
  play: function play() {}
});
AFRAME.registerPrimitive('a-switch', {
  defaultComponents: {
    "switch": {}
  },
  mappings: {
    name: 'switch.name',
    enabled: 'switch.enabled',
    disabled: 'switch.disabled',
    'fill-color': 'switch.fillColor',
    'knob-color': 'switch.knobColor',
    'fill-color-enabled': 'switch.fillColorEnabled',
    'knob-color-enabled': 'switch.knobColorEnabled',
    'fill-color-disabled': 'switch.fillColorDisabled',
    'knob-color-disabled': 'switch.knobColorDisabled'
  }
});

/***/ }),

/***/ "./src/switch/sfx.js":
/*!***************************!*\
  !*** ./src/switch/sfx.js ***!
  \***************************/
/***/ ((module) => {

var SFX = {
  init: function init(parent) {
    var el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeSwitchClickSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeSwitchClick');
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
    el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeSwitchClickDisabledSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeSwitchClickDisabled');
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
  },
  click: function click(parent) {
    var el = parent.querySelector('[key=aframeSwitchClickSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  },
  clickDisabled: function clickDisabled(parent) {
    var el = parent.querySelector('[key=aframeSwitchClickDisabledSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  }
};
module.exports = SFX;

/***/ }),

/***/ "./src/textarea/index.js":
/*!*******************************!*\
  !*** ./src/textarea/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/**
 * A-Frame Textarea Component
 * Multiline text input component for A-Frame scenes
 */

var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
// Register the textarea component
AFRAME.registerComponent('textarea', {
  schema: {
    // Value and behavior
    value: {
      type: "string",
      "default": ""
    },
    name: {
      type: "string",
      "default": ""
    },
    disabled: {
      type: "boolean",
      "default": false
    },
    readonly: {
      type: "boolean",
      "default": false
    },
    maxLength: {
      type: "int",
      "default": 0
    },
    // Layout
    width: {
      type: "number",
      "default": 1.8
    },
    height: {
      type: "number",
      "default": 0.9
    },
    paddingX: {
      type: "number",
      "default": 0.021
    },
    paddingY: {
      type: "number",
      "default": 0.021
    },
    lineHeight: {
      type: "number",
      "default": 0.12
    },
    // Text styling
    color: {
      type: "color",
      "default": "#000"
    },
    font: {
      type: "string",
      "default": ""
    },
    letterSpacing: {
      type: "int",
      "default": 0
    },
    align: {
      type: "string",
      "default": "left"
    },
    side: {
      type: "string",
      "default": "front"
    },
    // Placeholder
    placeholder: {
      type: "string",
      "default": ""
    },
    placeholderColor: {
      type: "color",
      "default": "#AAA"
    },
    // Cursor
    cursorWidth: {
      type: "number",
      "default": 0.01
    },
    cursorHeight: {
      type: "number",
      "default": 0
    },
    // 0 = derive from lineHeight
    cursorColor: {
      type: "color",
      "default": "#007AFF"
    },
    blinkRate: {
      type: "number",
      "default": 500
    },
    // Background
    backgroundColor: {
      type: "color",
      "default": "#FFF"
    },
    backgroundOpacity: {
      type: "number",
      "default": 0.95
    },
    backgroundRadius: {
      type: "number",
      "default": 0.02
    },
    backgroundHeight: {
      type: "number",
      "default": 0
    },
    // 0 = use height
    borderColor: {
      type: "color",
      "default": "#999"
    },
    borderWidth: {
      type: "number",
      "default": 0.01
    },
    // Wrapping & scrolling
    wrap: {
      type: "string",
      "default": "soft"
    },
    // soft|hard|off
    wrapCount: {
      type: "int",
      "default": 0
    },
    // auto-calculated if 0
    scroll: {
      type: "boolean",
      "default": true
    },
    maxRows: {
      type: "int",
      "default": 0
    },
    // 0 = no row limit

    // Selection
    selectionColor: {
      type: "color",
      "default": "#007AFF"
    },
    selectionOpacity: {
      type: "number",
      "default": 0.3
    }
  },
  getFallbackWrapCount: function getFallbackWrapCount() {
    // Approximate characters per line before metrics are ready
    // Mirrors legacy input behavior: ~24 chars per world unit of width
    return Math.max(1, Math.floor(24 * this.data.width));
  },
  init: function init() {
    // Initialize component state
    this.isFocused = false;
    this.lines = [];
    this.charWidth = 0;
    this.charsPerLine = 0;
    this.visibleLines = 0;
    this.cursorPosition = 0;
    this.cursorLine = 0;
    this.cursorColumn = 0;
    this.firstVisibleLine = 0;
    this.selectionStart = 0;
    this.selectionEnd = 0;

    // Timers and intervals
    this.blinkInterval = null;
    this.blinkTimer = null;
    this.updateRaf = null;

    // Cached measurements
    this.measurementEntity = null;
    this.cachedMetrics = {
      charWidth: 0,
      charsPerLine: 0,
      visibleLines: 0,
      lastFont: '',
      lastWidth: 0,
      lastHeight: 0
    };

    // Set up value property proxy for API parity with a-input
    this.setupValueProxy();
    // Bind imperative methods to the element for keyboard integration
    this.el.focus = this.focus.bind(this);
    this.el.blur = this.blur.bind(this);
    this.el.appendString = this.appendString.bind(this);
    this.el.deleteLast = this.deleteLast.bind(this);

    // Create child entities
    this.createChildEntities();
  },
  createChildEntities: function createChildEntities() {
    var _this = this;
    var data = this.data;
    // Bind click handler once for all child entities
    this.boundHandleClick = this.handleClick.bind(this);

    // Create background entity with a-rounded
    this.backgroundEntity = document.createElement('a-rounded');
    this.backgroundEntity.setAttribute('color', data.backgroundColor);
    this.backgroundEntity.setAttribute('opacity', data.backgroundOpacity);
    this.backgroundEntity.setAttribute('radius', data.backgroundRadius);
    this.backgroundEntity.setAttribute('width', data.width);
    this.backgroundEntity.setAttribute('height', data.backgroundHeight || data.height);
    {
      var bgH = data.backgroundHeight || data.height;
      // Left-bottom anchored like a-input: x=0, y=-height/2
      this.backgroundEntity.setAttribute('position', "0 ".concat(-bgH / 2, " 0.001"));
    }
    this.el.appendChild(this.backgroundEntity);

    // Create border entity (behind background)
    this.borderEntity = document.createElement('a-rounded');
    this.borderEntity.setAttribute('color', data.borderColor);
    this.borderEntity.setAttribute('opacity', 1);
    this.borderEntity.setAttribute('radius', data.backgroundRadius);
    this.borderEntity.setAttribute('width', data.width + data.borderWidth * 2);
    this.borderEntity.setAttribute('height', (data.backgroundHeight || data.height) + data.borderWidth * 2);
    {
      var _bgH = data.backgroundHeight || data.height;
      var bw = data.borderWidth;
      // Left-bottom anchored border slightly larger
      this.borderEntity.setAttribute('position', "".concat(-bw, " ").concat(-(_bgH / 2 + bw), " 0"));
    }
    this.el.appendChild(this.borderEntity);

    // Create content text entity
    this.contentEntity = document.createElement('a-entity');
    {
      var props = {
        value: '',
        color: data.color,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: data.width,
        wrapCount: data.wrap !== 'off' ? data.wrapCount || Math.floor(24 * data.width) : 0
      };
      if (data.font) {
        props.font = data.font;
      }
      this.contentEntity.setAttribute('text', props);
    }
    // Position text like a-input: baseline at y=0, x at left padding + width/2
    this.contentEntity.setAttribute('position', "".concat(data.paddingX - 0.001 + data.width / 2, " 0 0.002"));
    // Ensure text props are applied once mesh is ready
    this._onContentReady = function () {
      _this.ensureTextPropsFor(_this.contentEntity);
    };
    this.contentEntity.addEventListener('loaded', this._onContentReady);
    this.contentEntity.addEventListener('object3dset', this._onContentReady);
    requestAnimationFrame(function () {
      return _this.ensureTextPropsFor(_this.contentEntity);
    });
    // Also allow clicking text area to focus
    this.contentEntity.addEventListener('mousedown', this.boundHandleClick);
    this.contentEntity.addEventListener('click', this.boundHandleClick);
    this.el.appendChild(this.contentEntity);

    // Create placeholder text entity
    this.placeholderEntity = document.createElement('a-entity');
    {
      var _props = {
        value: data.placeholder,
        color: data.placeholderColor,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: data.width,
        wrapCount: data.wrap !== 'off' ? data.wrapCount || Math.floor(24 * data.width) : 0
      };
      if (data.font) {
        _props.font = data.font;
      }
      this.placeholderEntity.setAttribute('text', _props);
    }
    this.placeholderEntity.setAttribute('position', "".concat(data.paddingX - 0.001 + data.width / 2, " 0 0.002"));
    this.placeholderEntity.setAttribute('visible', data.value === '');
    // Ensure placeholder text props are applied once mesh is ready
    this._onPlaceholderReady = function () {
      _this.ensureTextPropsFor(_this.placeholderEntity);
    };
    this.placeholderEntity.addEventListener('loaded', this._onPlaceholderReady);
    this.placeholderEntity.addEventListener('object3dset', this._onPlaceholderReady);
    requestAnimationFrame(function () {
      return _this.ensureTextPropsFor(_this.placeholderEntity);
    });
    this.placeholderEntity.addEventListener('mousedown', this.boundHandleClick);
    this.placeholderEntity.addEventListener('click', this.boundHandleClick);
    this.el.appendChild(this.placeholderEntity);

    // Create caret entity
    this.caretEntity = document.createElement('a-entity');
    var caretHeight = data.cursorHeight || data.lineHeight;
    this.caretEntity.setAttribute('geometry', {
      primitive: 'plane',
      width: data.cursorWidth,
      height: caretHeight
    });
    this.caretEntity.setAttribute('material', {
      color: data.cursorColor,
      transparent: true,
      opacity: 1,
      depthTest: false
    });
    this.caretEntity.setAttribute('position', "".concat(data.paddingX - 0.001 + data.width / 2, " 0 0.003"));
    this.caretEntity.setAttribute('visible', false);
    this.el.appendChild(this.caretEntity);

    // Create hidden measurement entity for font metrics
    this.measurementEntity = document.createElement('a-entity');
    {
      var _props2 = {
        value: 'MMMMMMMMMM',
        color: '#000',
        letterSpacing: data.letterSpacing,
        align: 'left',
        side: 'front'
      };
      if (data.font) {
        _props2.font = data.font;
      }
      this.measurementEntity.setAttribute('text', _props2);
    }
    this.measurementEntity.setAttribute('position', '0 0 -1000'); // Hide far away
    this.measurementEntity.setAttribute('visible', false);
    this.el.appendChild(this.measurementEntity);

    // Add click event listener for focus - attach to all visible surfaces for better hit detection
    this.backgroundEntity.addEventListener('mousedown', this.boundHandleClick);
    this.backgroundEntity.addEventListener('click', this.boundHandleClick);
    this.borderEntity.addEventListener('mousedown', this.boundHandleClick);
    this.borderEntity.addEventListener('click', this.boundHandleClick);

    // Set up measurement system
    this.setupMeasurementSystem();

    // Initialize layout after a short delay to ensure entities are ready
    setTimeout(function () {
      _this.updateLayout();
    }, 100);
  },
  setupMeasurementSystem: function setupMeasurementSystem() {
    // Listen for measurement entity to be ready
    // Bind and store listeners so we can remove them later
    this._onMeasureLoaded = this.calculateMetrics.bind(this);
    this._onMeasureObject3D = this.calculateMetrics.bind(this);
    this.measurementEntity.addEventListener('loaded', this._onMeasureLoaded);
    this.measurementEntity.addEventListener('object3dset', this._onMeasureObject3D);
  },
  calculateMetrics: function calculateMetrics() {
    var _this2 = this;
    try {
      if (!this.measurementEntity) {
        setTimeout(function () {
          return _this2.calculateMetrics();
        }, 100);
        return;
      }
      var data = this.data;
      // Try to access the text mesh via public object3D names first
      var mesh = this.measurementEntity.getObject3D('text') || this.measurementEntity.getObject3D('mesh');
      var geom = mesh && mesh.geometry ? mesh.geometry : null;
      if (!geom) {
        // As a fallback, look at first child
        var obj3d = this.measurementEntity.object3D;
        if (obj3d && obj3d.children && obj3d.children[0] && obj3d.children[0].geometry) {
          geom = obj3d.children[0].geometry;
        }
      }
      if (geom) {
        // Ensure position attribute exists before computing bbox
        if (geom.isBufferGeometry) {
          if (!geom.attributes || !geom.attributes.position || !geom.attributes.position.array) {
            // geometry not ready yet; retry shortly
            setTimeout(function () {
              return _this2.calculateMetrics();
            }, 50);
            return;
          }
        }
        if (!geom.boundingBox) {
          try {
            geom.computeBoundingBox();
          } catch (e) {
            setTimeout(function () {
              return _this2.calculateMetrics();
            }, 50);
            return;
          }
        }
        var bbox = geom.boundingBox;
        if (!bbox) {
          setTimeout(function () {
            return _this2.calculateMetrics();
          }, 50);
          return;
        }
        var measurementWidth = bbox.max.x - bbox.min.x;

        // Calculate character width (10 M's) with fallback
        this.charWidth = measurementWidth > 0 ? measurementWidth / 10 : 0.1;

        // Calculate derived metrics with validation
        var contentWidth = Math.max(0, data.width - data.paddingX * 2);
        var contentHeight = Math.max(0, data.height - data.paddingY * 2);
        this.charsPerLine = this.charWidth > 0 ? Math.max(1, Math.floor(contentWidth / this.charWidth)) : 1;
        this.visibleLines = data.lineHeight > 0 ? Math.max(1, Math.floor(contentHeight / data.lineHeight)) : 1;

        // Cache metrics
        this.cachedMetrics = {
          charWidth: this.charWidth,
          charsPerLine: this.charsPerLine,
          visibleLines: this.visibleLines,
          lastFont: data.font,
          lastWidth: data.width,
          lastHeight: data.height
        };

        // Update layout if needed
        this.updateLayout();
      } else {
        // Fallback to default metrics if geometry calculation fails
        this.charWidth = 0.1;
        this.charsPerLine = Math.max(1, Math.floor((data.width - data.paddingX * 2) / this.charWidth));
        this.visibleLines = Math.max(1, Math.floor((data.height - data.paddingY * 2) / data.lineHeight));
      }
    } catch (error) {
      console.warn('Textarea: Error calculating metrics, using fallback values', error);
      // Use safe fallback values
      this.charWidth = 0.1;
      this.charsPerLine = 20;
      this.visibleLines = 5;
    }
  },
  shouldRecalculateMetrics: function shouldRecalculateMetrics() {
    var data = this.data;
    return this.cachedMetrics.lastFont !== data.font || this.cachedMetrics.lastWidth !== data.width || this.cachedMetrics.lastHeight !== data.height || this.charWidth === 0;
  },
  parseLines: function parseLines(text) {
    if (!text) {
      return [''];
    }
    var data = this.data;
    var logicalLines = text.split('\n');
    var visualLines = [];
    if (data.wrap === 'off' || this.charsPerLine <= 0) {
      // No wrapping
      return logicalLines;
    }

    // Soft wrapping
    for (var i = 0; i < logicalLines.length; i++) {
      var line = logicalLines[i];
      if (line.length <= this.charsPerLine) {
        visualLines.push(line);
      } else {
        // Wrap long lines
        for (var j = 0; j < line.length; j += this.charsPerLine) {
          visualLines.push(line.substring(j, j + this.charsPerLine));
        }
      }
    }
    return visualLines;
  },
  getCaretCoordinates: function getCaretCoordinates(position) {
    var text = this.data.value || '';
    var lines = this.parseLines(text);
    var currentPos = 0;
    var lineIndex = 0;
    var columnIndex = 0;
    for (var i = 0; i < lines.length; i++) {
      var lineLength = lines[i].length;
      if (currentPos + lineLength >= position) {
        lineIndex = i;
        columnIndex = position - currentPos;
        break;
      }
      currentPos += lineLength;
      if (i < lines.length - 1) {
        currentPos += 1; // Account for newline
      }
    }
    return {
      line: lineIndex,
      column: columnIndex
    };
  },
  getVisualCaretPosition: function getVisualCaretPosition(line, column) {
    var data = this.data;
    // Baseline at y=0; advance downward by lineHeight per line
    var x = -data.width / 2 + data.paddingX + column * this.charWidth;
    var y = -(line * data.lineHeight);
    return {
      x: x,
      y: y
    };
  },
  updateLayout: function updateLayout() {
    // Always render text even if metrics are still computing
    if (this.shouldRecalculateMetrics()) {
      this.updateTextContent();
      this.calculateMetrics();
      return;
    }
    this.updateCaretPosition();
    this.updateTextContent();
  },
  updatePositions: function updatePositions() {
    var data = this.data;
    // Align with a-input: baseline y=0; text x at padding-left + width/2
    var baseX = data.paddingX - 0.001 + data.width / 2;
    var baseY = 0;
    if (this.contentEntity) {
      this.contentEntity.setAttribute('position', "".concat(baseX, " ").concat(baseY, " 0.002"));
    }
    if (this.placeholderEntity) {
      this.placeholderEntity.setAttribute('position', "".concat(baseX, " ").concat(baseY, " 0.002"));
    }
  },
  updateCaretPosition: function updateCaretPosition() {
    if (!this.caretEntity || this.charWidth === 0) {
      return;
    }
    var coords = this.getCaretCoordinates(this.cursorPosition);
    var pos = this.getVisualCaretPosition(coords.line, coords.column);
    this.caretEntity.setAttribute('position', "".concat(pos.x, " ").concat(pos.y, " 0.003"));
    this.cursorLine = coords.line;
    this.cursorColumn = coords.column;
  },
  updateTextContent: function updateTextContent() {
    if (!this.contentEntity || !this.placeholderEntity) {
      return;
    }
    var data = this.data;
    var displayValue = data.value || '';

    // Handle maxLength truncation
    if (data.maxLength > 0 && displayValue.length > data.maxLength) {
      displayValue = displayValue.substring(0, data.maxLength);
    }

    // Compute content width and wrap
    var contentWidth = data.width;
    var wrapCount = data.wrap !== 'off' ? data.wrapCount || this.charsPerLine || Math.floor(24 * data.width) : 0;
    // Update content text
    {
      var props = {
        value: displayValue,
        color: data.color,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: contentWidth,
        wrapCount: wrapCount
      };
      if (data.font) {
        props.font = data.font;
      }
      this.contentEntity.setAttribute('text', props);
      // Guard: if wrapCount is still too small, re-apply after mesh is ready
      if (wrapCount < 2) {
        this.ensureTextPropsFor(this.contentEntity);
      }
    }

    // Update placeholder visibility
    var showPlaceholder = displayValue === '' && data.placeholder;
    this.placeholderEntity.setAttribute('visible', showPlaceholder);
    if (showPlaceholder) {
      var _props3 = {
        value: data.placeholder,
        color: data.placeholderColor,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: contentWidth,
        wrapCount: wrapCount
      };
      if (data.font) {
        _props3.font = data.font;
      }
      this.placeholderEntity.setAttribute('text', _props3);
      if (wrapCount < 2) {
        this.ensureTextPropsFor(this.placeholderEntity);
      }
    }
  },
  ensureTextPropsFor: function ensureTextPropsFor(entity) {
    if (!entity) {
      return;
    }
    var data = this.data;
    var width = data.width;
    var wrap = data.wrap !== 'off' ? data.wrapCount || Math.max(10, Math.floor(24 * width)) : 0;
    var apply = function apply() {
      var t = entity.getAttribute('text') || {};
      var needsWidth = t.width !== width;
      var needsWrap = (t.wrapCount | 0) < wrap;
      if (needsWidth || needsWrap) {
        entity.setAttribute('text', Object.assign({}, t, {
          width: width,
          wrapCount: wrap
        }));
      }
    };
    // Apply on next frame to ensure mesh is initialized
    requestAnimationFrame(apply);
  },
  updateBackground: function updateBackground() {
    if (!this.backgroundEntity) {
      return;
    }
    var data = this.data;
    this.backgroundEntity.setAttribute('color', data.backgroundColor);
    this.backgroundEntity.setAttribute('opacity', data.backgroundOpacity);
    this.backgroundEntity.setAttribute('radius', data.backgroundRadius);
    this.backgroundEntity.setAttribute('width', data.width);
    this.backgroundEntity.setAttribute('height', data.backgroundHeight || data.height);
    {
      var bgH = data.backgroundHeight || data.height;
      // Left-bottom anchored: x=0, y=-height/2
      this.backgroundEntity.setAttribute('position', "0 ".concat(-bgH / 2, " 0.001"));
    }
    if (this.borderEntity) {
      this.borderEntity.setAttribute('color', data.borderColor);
      this.borderEntity.setAttribute('opacity', 1);
      this.borderEntity.setAttribute('radius', data.backgroundRadius);
      this.borderEntity.setAttribute('width', data.width + data.borderWidth * 2);
      this.borderEntity.setAttribute('height', (data.backgroundHeight || data.height) + data.borderWidth * 2);
      var bw = data.borderWidth;
      var _bgH2 = data.backgroundHeight || data.height;
      // Left-bottom anchored border slightly larger
      this.borderEntity.setAttribute('position', "".concat(-bw, " ").concat(-(_bgH2 / 2 + bw), " 0"));
    }
  },
  handleClick: function handleClick(evt) {
    if (!this.data.disabled) {
      evt.stopPropagation();
      this.focus();
    }
  },
  setupValueProxy: function setupValueProxy() {
    // Create value property on element for API compatibility
    var self = this;
    Object.defineProperty(this.el, 'value', {
      get: function get() {
        return self.data.value || '';
      },
      set: function set(value) {
        self.el.setAttribute('textarea', 'value', value);
      },
      enumerable: true,
      configurable: true
    });
  },
  update: function update(oldData) {
    if (!oldData) return;
    var data = this.data;

    // Check if we need to recalculate metrics
    if (oldData.font !== data.font || oldData.width !== data.width || oldData.height !== data.height || oldData.letterSpacing !== data.letterSpacing) {
      // Update measurement entity
      if (this.measurementEntity) {
        var props = {
          value: 'MMMMMMMMMM',
          color: '#000',
          letterSpacing: data.letterSpacing,
          align: 'left',
          side: 'front'
          // Do not set width here to avoid scaling metrics
        };
        if (data.font) {
          props.font = data.font;
        }
        this.measurementEntity.setAttribute('text', props);
      }
      this.scheduleUpdate();
    }
    // Layout-only changes (no charWidth change) that still require update
    if (oldData.paddingX !== data.paddingX || oldData.paddingY !== data.paddingY || oldData.lineHeight !== data.lineHeight || oldData.wrap !== data.wrap || oldData.wrapCount !== data.wrapCount || oldData.align !== data.align) {
      this.updatePositions();
      this.scheduleUpdate();
    }

    // Update background if background properties changed
    if (oldData.backgroundColor !== data.backgroundColor || oldData.backgroundOpacity !== data.backgroundOpacity || oldData.backgroundRadius !== data.backgroundRadius || oldData.backgroundHeight !== data.backgroundHeight) {
      this.updateBackground();
    }

    // Update caret if cursor properties changed
    if (oldData.cursorWidth !== data.cursorWidth || oldData.cursorHeight !== data.cursorHeight || oldData.cursorColor !== data.cursorColor) {
      this.updateCaretGeometry();
    }

    // Update text content if value or text properties changed
    if (oldData.value !== data.value || oldData.color !== data.color || oldData.placeholder !== data.placeholder || oldData.placeholderColor !== data.placeholderColor) {
      this.scheduleUpdate();
    }

    // Update blink rate if changed
    if (oldData.blinkRate !== data.blinkRate && this.isFocused) {
      this.startBlinking();
    }
  },
  scheduleUpdate: function scheduleUpdate() {
    var _this3 = this;
    if (this.updateRaf) {
      cancelAnimationFrame(this.updateRaf);
    }
    this.updateRaf = requestAnimationFrame(function () {
      _this3.updateLayout();
      _this3.updateRaf = null;
    });
  },
  updateCaretGeometry: function updateCaretGeometry() {
    if (!this.caretEntity) return;
    var data = this.data;
    var caretHeight = data.cursorHeight || data.lineHeight;
    this.caretEntity.setAttribute('geometry', {
      primitive: 'plane',
      width: data.cursorWidth,
      height: caretHeight
    });
    this.caretEntity.setAttribute('material', {
      color: data.cursorColor,
      transparent: true,
      opacity: 1
    });
  },
  pause: function pause() {
    // Clean up timers and intervals
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.updateRaf) {
      cancelAnimationFrame(this.updateRaf);
      this.updateRaf = null;
    }
  },
  remove: function remove() {
    // Clean up on component removal
    this.pause();

    // Remove event listeners
    if (this.boundHandleClick) {
      if (this.backgroundEntity) {
        this.backgroundEntity.removeEventListener('mousedown', this.boundHandleClick);
        this.backgroundEntity.removeEventListener('click', this.boundHandleClick);
      }
      if (this.borderEntity) {
        this.borderEntity.removeEventListener('mousedown', this.boundHandleClick);
        this.borderEntity.removeEventListener('click', this.boundHandleClick);
      }
    }
    if (this._onContentReady && this.contentEntity) {
      this.contentEntity.removeEventListener('loaded', this._onContentReady);
      this.contentEntity.removeEventListener('object3dset', this._onContentReady);
    }
    if (this._onPlaceholderReady && this.placeholderEntity) {
      this.placeholderEntity.removeEventListener('loaded', this._onPlaceholderReady);
      this.placeholderEntity.removeEventListener('object3dset', this._onPlaceholderReady);
    }
    if (this.measurementEntity) {
      if (this._onMeasureLoaded) {
        this.measurementEntity.removeEventListener('loaded', this._onMeasureLoaded);
      }
      if (this._onMeasureObject3D) {
        this.measurementEntity.removeEventListener('object3dset', this._onMeasureObject3D);
      }
    }

    // Clear references
    this.backgroundEntity = null;
    this.borderEntity = null;
    this.contentEntity = null;
    this.placeholderEntity = null;
    this.caretEntity = null;
    this.measurementEntity = null;
    this.cachedMetrics = null;
  },
  // Public methods for programmatic control
  focus: function focus() {
    if (this.data.disabled || this.isFocused) {
      return;
    }
    this.isFocused = true;

    // Show caret
    if (this.caretEntity) {
      this.caretEntity.setAttribute('visible', true);
      this.startBlinking();
    }

    // Emit events for keyboard integration
    this.el.emit('focus', {
      target: this.el
    });
    // Temporarily disabled to prevent keyboard from opening and causing freeze
    // if (document && document.body) {
    //   Event.emit(document.body, 'didfocusinput', this.el);
    // }
    if (this.el.sceneEl) {
      this.el.sceneEl.emit('didfocustextarea', {
        target: this.el
      });
    }

    // Update layout to ensure caret is positioned correctly
    this.updateLayout();
  },
  blur: function blur() {
    if (!this.isFocused) {
      return;
    }
    this.isFocused = false;

    // Hide caret and stop blinking
    if (this.caretEntity) {
      this.caretEntity.setAttribute('visible', false);
      this.stopBlinking();
    }

    // Emit events
    this.el.emit('blur', {
      target: this.el
    });
    if (document && document.body) {
      Event.emit(document.body, 'didblurinput', this.el);
    }
    if (this.el.sceneEl) {
      this.el.sceneEl.emit('didblurtextarea', {
        target: this.el
      });
    }
  },
  startBlinking: function startBlinking() {
    var _this4 = this;
    this.stopBlinking();
    if (this.data.blinkRate > 0) {
      this.blinkInterval = setInterval(function () {
        if (_this4.caretEntity && _this4.isFocused) {
          var visible = _this4.caretEntity.getAttribute('visible');
          _this4.caretEntity.setAttribute('visible', !visible);
        }
      }, this.data.blinkRate);
    }
  },
  stopBlinking: function stopBlinking() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
  },
  appendString: function appendString(text) {
    if (this.data.disabled || this.data.readonly) {
      return;
    }

    // Handle Enter key - insert newline instead of blurring (different from a-input)
    if (text === '\n' || text === 'Enter') {
      text = '\n';
    }
    // Insert at cursor position
    this.insertAtCursor(text);
  },
  deleteLast: function deleteLast() {
    if (this.data.disabled || this.data.readonly) {
      return;
    }
    // Backspace behavior at cursor
    var currentValue = this.data.value || '';
    if (this.cursorPosition > 0) {
      var before = currentValue.substring(0, this.cursorPosition - 1);
      var after = currentValue.substring(this.cursorPosition);
      var newValue = before + after;
      this.setValue(newValue);
      this.cursorPosition = this.cursorPosition - 1;
      this.pauseBlinking();
    }
  },
  insertAtCursor: function insertAtCursor(text) {
    if (this.data.disabled || this.data.readonly) {
      return;
    }
    var currentValue = this.data.value || '';
    var beforeCursor = currentValue.substring(0, this.cursorPosition);
    var afterCursor = currentValue.substring(this.cursorPosition);
    var newValue = beforeCursor + text + afterCursor;

    // Handle maxLength
    if (this.data.maxLength > 0 && newValue.length > this.data.maxLength) {
      newValue = newValue.substring(0, this.data.maxLength);
    }
    this.setValue(newValue);
    this.cursorPosition = Math.min(beforeCursor.length + text.length, newValue.length);
    this.pauseBlinking();
  },
  setValue: function setValue(value) {
    try {
      // Validate and sanitize value
      if (typeof value !== 'string') {
        value = String(value || '');
      }
      var oldValue = this.data.value;
      this.el.setAttribute('textarea', 'value', value);
      if (oldValue !== value) {
        // Emit events with error handling
        try {
          this.el.emit('input', {
            target: this.el,
            value: value
          });
          this.el.emit('change', {
            target: this.el,
            value: value
          });
        } catch (eventError) {
          console.warn('Textarea: Error emitting events', eventError);
        }
      }
    } catch (error) {
      console.warn('Textarea: Error setting value', error);
    }
  },
  pauseBlinking: function pauseBlinking() {
    var _this5 = this;
    if (this.caretEntity && this.isFocused) {
      this.caretEntity.setAttribute('visible', true);
      this.stopBlinking();

      // Resume blinking after a short delay
      this.blinkTimer = setTimeout(function () {
        if (_this5.isFocused) {
          _this5.startBlinking();
        }
      }, 500);
    }
  }
});

// Register the a-textarea primitive
AFRAME.registerPrimitive('a-textarea', {
  defaultComponents: {
    textarea: {}
  },
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
    'border-color': 'textarea.borderColor',
    'border-width': 'textarea.borderWidth',
    // Wrapping & scrolling
    wrap: 'textarea.wrap',
    'wrap-count': 'textarea.wrapCount',
    scroll: 'textarea.scroll',
    'max-rows': 'textarea.maxRows',
    // Selection
    'selection-color': 'textarea.selectionColor',
    'selection-opacity': 'textarea.selectionOpacity'
  }
});

/***/ }),

/***/ "./src/toast/assets.js":
/*!*****************************!*\
  !*** ./src/toast/assets.js ***!
  \*****************************/
/***/ ((module) => {

module.exports = [{
  type: 'audio',
  id: 'aframeToastShow',
  src: "".concat(AFRAME.ASSETS_PATH, "/sounds/ToastShow.mp3")
}];

/***/ }),

/***/ "./src/toast/index.js":
/*!****************************!*\
  !*** ./src/toast/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var Utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
var Event = __webpack_require__(/*! ../core/event */ "./src/core/event.js");
var Assets = __webpack_require__(/*! ./assets */ "./src/toast/assets.js");
var SFX = __webpack_require__(/*! ./sfx */ "./src/toast/sfx.js");
AFRAME.registerComponent('toast', {
  schema: {
    message: {
      type: 'string',
      "default": "You are cool"
    },
    action: {
      type: 'string',
      "default": ""
    },
    backgroundColor: {
      type: "color",
      "default": "#222"
    },
    //242f35
    actionColor: {
      type: "color",
      "default": "#4076fd"
    },
    color: {
      type: "color",
      "default": "#FFF"
    },
    font: {
      type: "string",
      "default": ""
    },
    letterSpacing: {
      type: "int",
      "default": 0
    },
    lineHeight: {
      type: "string",
      "default": ""
    },
    width: {
      type: "number",
      "default": 3
    },
    duration: {
      type: 'number',
      "default": 2000
    },
    autoshow: {
      type: 'boolean',
      "default": true
    }
  },
  init: function init() {
    var that = this;

    // Assets
    Utils.preloadAssets(Assets);

    // SFX
    SFX.init(this.el);

    // CONFIG
    this.el.setAttribute("position", "10000 10000 10000");
    this.el.setAttribute("rotation", "-25 0 0");
    this.el.setAttribute("scale", "0.3 0.3 0.3");

    // OUTLINE
    this.background = document.createElement('a-rounded');
    this.background.setAttribute('height', 0.44);
    this.background.setAttribute('radius', 0.03);
    this.background.setAttribute('position', "0 -".concat(0.36 / 2, " 0.001"));
    this.el.appendChild(this.background);

    // LABEL
    this.label = document.createElement('a-entity');
    this.el.appendChild(this.label);

    // LABEL
    this.action = document.createElement('a-button');
    that.action.setAttribute('button-color', '#222');
    this.el.appendChild(this.action);
    function changeWidth(e) {
      var attr = that.label.getAttribute('text');
      attr.width = that.data.width - e.detail;
      attr.wrapCount = 10 * attr.width;
      that.label.setAttribute('text', attr);
      that.label.setAttribute('position', attr.width / 2 + 0.14 + ' 0.04 0.001');
      this.setAttribute('position', "".concat(that.data.width - e.detail, " ").concat((0.44 - 0.36) / 2, " 0.001"));
    }
    this.action.addEventListener('change:width', changeWidth);
    this.action.addEventListener('click', function () {
      Event.emit(that.el, 'actionclick');
    });
    var timer = setInterval(function () {
      if (that.action.object3D && that.action.object3D.children[0]) {
        clearInterval(timer);
        Utils.updateOpacity(that.el, 0);
        Utils.updateOpacity(that.label, 0);
        Utils.updateOpacity(that.action, 0);
        if (that.data.autoshow) {
          that.show();
        }
      }
    }, 10);

    // METHDOS
    this.el.show = this.show.bind(this);
    this.el.hide = this.hide.bind(this);
  },
  show: function show() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    this.el.setAttribute("position", "".concat(-this.data.width / (2 / this.el.object3D.scale.x), " 0.25 -1.6"));
    var that = this;
    /*if (!this.el.parentNode && this.el._parentNode) {
      this.el._parentNode.appendChild(this.el);
    }*/
    setTimeout(function () {
      that.el.setAttribute('fadein', {
        duration: 160
      });
      setTimeout(function () {
        Utils.updateOpacity(that.label, 1);
        that.action.components.button.shadow.setAttribute('visible', false);
      }, 10);
    }, 0);
    this.hideTimer = setTimeout(function () {
      that.hide();
    }, this.data.duration);
    SFX.show(this.el);
  },
  hide: function hide() {
    var that = this;
    setTimeout(function () {
      Utils.updateOpacity(that.label, 0);
      that.action.components.button.shadow.setAttribute('visible', false);
      setTimeout(function () {
        that.el.setAttribute('fadeout', {
          duration: 160
        });
        setTimeout(function () {
          /*if (that.el.parentNode) {
            that.el._parentNode = that.el.parentNode;
            that.el.parentNode.removeChild(that.el);
          }*/
          that.el.setAttribute("position", "10000 10000 10000");
        }, 200);
      }, 10);
    }, 0);
  },
  update: function update() {
    var that = this;

    // BACKGROUND
    this.background.setAttribute('color', this.data.backgroundColor);
    this.background.setAttribute('width', this.data.width);
    var props = {
      color: this.data.color,
      align: 'left',
      wrapCount: 10 * this.data.width,
      width: this.data.width,
      lineHeight: 64
    };
    if (this.data.font) {
      props.font = this.data.font;
    }
    if (this.data.type === "flat") {
      props.color = this.data.buttonColor;
    }

    // MESSAGE
    props.value = this.data.message;
    this.label.setAttribute('text', props);
    this.label.setAttribute('position', this.data.width / 2 + 0.14 + ' 0 0.001');

    // ACTION
    this.action.setAttribute('value', this.data.action.toUpperCase());
    this.action.setAttribute('color', this.data.actionColor);
  },
  tick: function tick() {},
  remove: function remove() {},
  pause: function pause() {},
  play: function play() {}
});
AFRAME.registerPrimitive('a-toast', {
  defaultComponents: {
    toast: {}
  },
  mappings: {
    message: 'toast.message',
    action: 'toast.action',
    'action-color': 'toast.actionColor',
    'background-color': 'toast.backgroundColor',
    color: 'toast.color',
    font: 'toast.font',
    'letter-spacing': 'toast.letterSpacing',
    'line-height': 'toast.lineHeight',
    'width': 'toast.width',
    'duration': 'toast.duration',
    'autoshow': 'toast.autoshow'
  }
});

/***/ }),

/***/ "./src/toast/sfx.js":
/*!**************************!*\
  !*** ./src/toast/sfx.js ***!
  \**************************/
/***/ ((module) => {

var SFX = {
  init: function init(parent) {
    var el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeToastShowSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeToastShow');
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
  },
  show: function show(parent) {
    var el = parent.querySelector('[key=aframeToastShowSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  }
};
module.exports = SFX;

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((module) => {

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var Utils = {};

/**
  Utils.preloadAssets([])
  Add assets to Assets managment system.
*/
Utils.preloadAssets = function (assets_arr) {
  var assets = document.querySelector('a-assets'),
    already_exists;
  if (!assets) {
    var scene = document.querySelector('a-scene');
    assets = document.createElement('a-assets');
    scene.appendChild(assets);
  }
  var _iterator = _createForOfIteratorHelper(assets_arr),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var item = _step.value;
      already_exists = false;

      /***** With Edge, assets.children is a HTMLCollection, not an Array! *****/
      for (var _i = 0, _Array$from = Array.from(assets.children); _i < _Array$from.length; _i++) {
        var stuff = _Array$from[_i];
        if (item.id === stuff.id) {
          already_exists = true;
        }
      }
      if (!already_exists) {
        var asset_item = document.createElement(item.type);
        asset_item.setAttribute('id', item.id);
        asset_item.setAttribute('src', item.src);
        assets.appendChild(asset_item);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

/**
  Utils.extend(a, b)
  Assign object to other object.
*/
Utils.extend = function (a, b) {
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
};
Utils.clone = function (original) {
  if (Array.isArray(original)) {
    return original.slice(0);
  }

  // First create an empty object with
  // same prototype of our original source
  var clone = Object.create(Object.getPrototypeOf(original));
  var i = undefined;
  var keys = Object.getOwnPropertyNames(original);
  i = 0;
  while (i < keys.length) {
    // copy each property into the clone
    Object.defineProperty(clone, keys[i], Object.getOwnPropertyDescriptor(original, keys[i]));
    i++;
  }
  return clone;
};
Utils.updateOpacity = function (el, opacity) {
  if (el.hasAttribute('text')) {
    var props = el.getAttribute('text');
    if (props) {
      props.opacity = opacity;
      el.setAttribute('text', props);
    }
  }
  el.object3D.traverse(function (o) {
    if (o.material) {
      o.material.transparent = true;
      o.material.opacity = opacity;
    }
  });
  var _iterator2 = _createForOfIteratorHelper(el.querySelectorAll('a-text')),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var text = _step2.value;
      text.setAttribute('opacity', opacity);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
};

// Calculate the width factor
Utils.getWidthFactor = function (el, wrapCount) {
  var widthFactor = 0.00001;
  if (el.components.text && el.components.text.currentFont) {
    widthFactor = el.components.text.currentFont.widthFactor;
    widthFactor = (0.5 + wrapCount) * widthFactor;
  }
  return widthFactor;
};

/**
 * NEW FUNCTIONS - Enhanced Utils for form controls
 */

/**
 * Validate color value (CSS color, hex, or A-Frame color)
 * @param {string} color - Color value to validate
 * @returns {boolean} True if valid color
 */
Utils.validateColor = function (color) {
  if (!color || typeof color !== 'string') {
    return false;
  }

  // Check hex colors (#fff, #ffffff)
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return true;
  }

  // Check CSS named colors and rgb/rgba
  var testEl = document.createElement('div');
  testEl.style.color = color;
  return testEl.style.color !== '';
};

/**
 * Validate size value (positive number)
 * @param {number|string} size - Size value to validate
 * @returns {boolean} True if valid size
 */
Utils.validateSize = function (size) {
  var num = parseFloat(size);
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Enhanced text width measurement using modern A-Frame geometry APIs
 * This is the primary method for 3D text measurement in VR
 * @param {Element} textComponent - A-Frame entity with text component
 * @returns {Promise<number>} Width in A-Frame units
 */
Utils.measureTextWidth = function (textComponent) {
  return new Promise(function (resolve) {
    function measure() {
      try {
        if (!textComponent || !textComponent.components || !textComponent.components.text) {
          resolve(0);
          return;
        }
        var obj = textComponent.object3D;
        if (!obj || !obj.children || obj.children.length === 0) {
          requestAnimationFrame(measure);
          return;
        }
        var mesh = obj.children[0];
        if (!mesh || !mesh.geometry) {
          requestAnimationFrame(measure);
          return;
        }
        var geometry = mesh.geometry;
        if (geometry.visibleGlyphs && geometry.visibleGlyphs.length > 0) {
          var lastGlyph = geometry.visibleGlyphs[geometry.visibleGlyphs.length - 1];
          var width = lastGlyph.position[0] + lastGlyph.data.width;
          resolve(width);
          return;
        }
        if (geometry.boundingBox) {
          geometry.computeBoundingBox();
          resolve(geometry.boundingBox.max.x - geometry.boundingBox.min.x);
          return;
        }
        var textData = textComponent.getAttribute('text');
        if (textData && textData.value) {
          var widthFactor = Utils.getWidthFactor(textComponent, textData.value.length);
          resolve(textData.value.length * widthFactor);
          return;
        }
        resolve(0);
      } catch (e) {
        console.warn('[Utils.measureTextWidth] Measurement failed:', e);
        resolve(0);
      }
    }
    measure();
  });
};

/**
 * Binary search text fitting - replaces recursive trimming
 * Efficiently finds the maximum text that fits within a given width
 * @param {Element} textComponent - A-Frame entity with text component
 * @param {string} originalText - Full text to fit
 * @param {number} maxWidth - Maximum width in A-Frame units
 * @param {object} textProps - Text component properties
 * @returns {Promise<string>} Fitted text (may be truncated with ellipsis)
 */
Utils.fitTextBinarySearch = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(textComponent, originalText, maxWidth, textProps) {
    var fullWidth, left, right, bestFit, mid, testText, testTextWithEllipsis, width;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          if (!(!originalText || maxWidth <= 0)) {
            _context.n = 1;
            break;
          }
          return _context.a(2, '');
        case 1:
          // First try the full text
          textComponent.setAttribute('text', Object.assign({}, textProps, {
            value: originalText
          }));
          _context.n = 2;
          return Utils.measureTextWidth(textComponent);
        case 2:
          fullWidth = _context.v;
          if (!(fullWidth <= maxWidth)) {
            _context.n = 3;
            break;
          }
          return _context.a(2, originalText);
        case 3:
          // Binary search for the longest fitting text
          left = 0;
          right = originalText.length;
          bestFit = '';
        case 4:
          if (!(left <= right)) {
            _context.n = 6;
            break;
          }
          mid = Math.floor((left + right) / 2);
          testText = originalText.substring(0, mid);
          testTextWithEllipsis = mid < originalText.length ? testText + '...' : testText;
          textComponent.setAttribute('text', Object.assign({}, textProps, {
            value: testTextWithEllipsis
          }));
          _context.n = 5;
          return Utils.measureTextWidth(textComponent);
        case 5:
          width = _context.v;
          if (width <= maxWidth) {
            bestFit = testTextWithEllipsis;
            left = mid + 1;
          } else {
            right = mid - 1;
          }
          _context.n = 4;
          break;
        case 6:
          return _context.a(2, bestFit);
      }
    }, _callee);
  }));
  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Synchronous text width estimation using cached font metrics
 * Fast approximation for immediate layout decisions
 * @param {string} text - Text to measure
 * @param {object} textProps - Text component properties
 * @returns {number} Estimated width in A-Frame units
 */
Utils.estimateTextWidth = function (text, textProps) {
  if (!text) return 0;

  // Use cached font metrics if available
  var fontSize = textProps.width || 1;
  var charCount = text.length;

  // Rough estimation: average character width is ~0.6 of font size
  // This is a fast approximation for immediate decisions
  return charCount * fontSize * 0.6;
};

/**
 * Documentation for Utils functions usage
 * 
 * EXISTING FUNCTIONS (keep for backward compatibility):
 * - Utils.preloadAssets(assets_arr) - Add assets to A-Frame asset management
 * - Utils.extend(a, b) - Assign object properties to another object
 * - Utils.clone(original) - Deep clone objects and arrays
 * - Utils.updateOpacity(el, opacity) - Update opacity for text and materials
 * - Utils.getWidthFactor(el, wrapCount) - Calculate text width factor (legacy)
 * 
 * NEW FUNCTIONS (for form controls):
 * - Utils.validateColor(color) - Validate CSS/hex color values
 * - Utils.validateSize(size) - Validate positive numeric sizes
 * - Utils.measureTextWidth(textComponent) - Modern 3D text measurement (async)
 * 
 * USAGE GUIDELINES:
 * - Use Utils as the primary location for shared utility functions
 * - Component-specific helpers should call Utils functions (don't duplicate)
 * - For text measurement in VR: use Utils.measureTextWidth() (A-Frame geometry)
 * - For validation: use Utils.validateColor() and Utils.validateSize()
 * - For opacity updates: continue using Utils.updateOpacity()
 */

module.exports = Utils;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
(function () {
  if (typeof AFRAME === 'undefined') {
    console.error('AFRAME is required!');
    return;
  }
  if (!AFRAME.ASSETS_PATH) {
    AFRAME.ASSETS_PATH = "./assets";
  }
  __webpack_require__(/*! ./rounded */ "./src/rounded/index.js");
  __webpack_require__(/*! ./fade */ "./src/fade/index.js");
  //require("./alert"); @TODO ;)
  __webpack_require__(/*! ./core/material-form-system */ "./src/core/material-form-system.js");
  __webpack_require__(/*! ./keyboard */ "./src/keyboard/index.js");
  __webpack_require__(/*! ./input */ "./src/input/index.js");
  __webpack_require__(/*! ./textarea */ "./src/textarea/index.js");
  __webpack_require__(/*! ./switch */ "./src/switch/index.js");
  __webpack_require__(/*! ./form */ "./src/form/index.js");
  __webpack_require__(/*! ./radio */ "./src/radio/index.js");
  __webpack_require__(/*! ./checkbox */ "./src/checkbox/index.js");
  __webpack_require__(/*! ./button */ "./src/button/index.js");
  __webpack_require__(/*! ./toast */ "./src/toast/index.js");
})();
})();

/******/ })()
;
//# sourceMappingURL=aframe-material.js.map