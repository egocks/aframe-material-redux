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
var SFX = __webpack_require__(/*! ./sfx */ "./src/checkbox/sfx.js");
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
    }
  },
  init: function init() {
    var that = this;

    // Assets
    Utils.preloadAssets(Assets);

    // SFX
    SFX.init(this.el);

    // HITBOX
    this.hitbox = document.createElement('a-plane');
    this.hitbox.setAttribute('height', 0.2);
    this.hitbox.setAttribute('opacity', 0);
    this.el.appendChild(this.hitbox);

    // OUTLINE
    this.outline = document.createElement('a-rounded');
    this.outline.setAttribute('width', 0.2);
    this.outline.setAttribute('height', 0.2);
    this.outline.setAttribute('radius', 0.02);
    this.outline.setAttribute('position', "0 -".concat(0.2 / 2, " 0.01"));
    this.el.appendChild(this.outline);

    // INSIDE
    this.inside = document.createElement('a-rounded');
    this.inside.setAttribute('width', 0.156);
    this.inside.setAttribute('height', 0.156);
    this.inside.setAttribute('radius', 0.01);
    this.inside.setAttribute('color', "#EEE");
    this.inside.setAttribute('position', "".concat(0.156 / 8, " -").concat(0.156 / 2, " 0.02"));
    this.el.appendChild(this.inside);

    // CHECKMARK
    this.checkmark = document.createElement('a-image');
    this.checkmark.setAttribute('width', 0.16);
    this.checkmark.setAttribute('height', 0.16);
    this.checkmark.setAttribute('src', "#aframeCheckboxMark");
    this.checkmark.setAttribute('position', '0.1 0 0.03');
    this.el.appendChild(this.checkmark);

    // LABEL
    this.label = document.createElement('a-entity');
    this.el.appendChild(this.label);

    // EVENTS
    this.el.addEventListener('click', function () {
      if (this.components.checkbox.data.disabled) {
        return;
      }
      this.components.checkbox.data.checked = !this.components.checkbox.data.checked;
      this.setAttribute('checked', this.components.checkbox.data.checked);
      that.onClick();
    });
    this.el.addEventListener('mousedown', function () {
      if (this.components.checkbox.data.disabled) {
        return SFX.clickDisabled(this);
      }
      SFX.click(this);
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
  },
  uncheck: function uncheck() {
    this.outline.setAttribute('color', this.data.checkboxColor);
    this.inside.setAttribute('color', "#EEE");
    this.checkmark.setAttribute('visible', false);
    if (this.data.disabled) {
      this.disabled();
    }
  },
  disabled: function disabled() {
    this.outline.setAttribute('color', this.data.checkboxColor);
    this.inside.setAttribute('color', this.data.checkboxColor);
  },
  update: function update() {
    var that = this;
    this.onClick(true);

    // HITBOX
    this.hitbox.setAttribute('width', this.data.width);
    this.hitbox.setAttribute('position', this.data.width / 2 + ' 0 0.01');
    var props = {
      color: this.data.color,
      align: 'left',
      wrapCount: 10 * (this.data.width + 0.2),
      width: this.data.width
    };
    if (this.data.font) {
      props.font = this.data.font;
    }

    // TITLE
    props.value = this.data.label;
    props.color = this.data.color;
    this.label.setAttribute('text', props);
    this.label.setAttribute('position', this.data.width / 2 + 0.24 + ' 0 0.01');

    // TRIM TEXT IF NEEDED.. @TODO: optimize this mess..
    function getTextWidth(el, _widthFactor) {
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
        props.value = props.value.slice(0, -1);
        el.setAttribute("text", props);
        return getTextWidth(el);
      } else {
        if (!_widthFactor) {
          _widthFactor = Utils.getWidthFactor(el, props.wrapCount);
        }
        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
        var textRatio = v / that.data.width;
        if (textRatio > 1) {
          props.value = props.value.slice(0, -1);
          el.setAttribute("text", props);
          return getTextWidth(el, _widthFactor);
        }
      }
      return v;
    }
    setTimeout(function () {
      if (that.data.label.length) {
        getTextWidth(that.label);
      }
      if (that.data.disabled) {
        var timer = setInterval(function () {
          if (that.checkmark.object3D.children[0]) {
            clearInterval(timer);
            Utils.updateOpacity(that.checkmark, 0.4);
            Utils.updateOpacity(that.label, 0.4);
          }
        }, 10);
      } else {
        var _timer = setInterval(function () {
          if (that.checkmark.object3D.children[0]) {
            clearInterval(_timer);
            Utils.updateOpacity(that.checkmark, 1);
            Utils.updateOpacity(that.label, 1);
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
    width: 'checkbox.width'
  }
});

/***/ }),

/***/ "./src/checkbox/sfx.js":
/*!*****************************!*\
  !*** ./src/checkbox/sfx.js ***!
  \*****************************/
/***/ ((module) => {

var SFX = {
  init: function init(parent) {
    var el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeCheckboxClickSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeCheckboxClick');
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
    var el = parent.querySelector('[key=aframeCheckboxClickSound]');
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
    if (!noemit) {
      Event.emit(document.body, 'didfocusinput', this.el);
    }
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
var SFX = __webpack_require__(/*! ./sfx */ "./src/radio/sfx.js");
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
    }
  },
  init: function init() {
    var that = this;

    // Assets
    Utils.preloadAssets(Assets);

    // SFX
    SFX.init(this.el);

    // HITBOX
    this.hitbox = document.createElement('a-plane');
    this.hitbox.setAttribute('height', 0.2);
    this.hitbox.setAttribute('opacity', 0);
    this.hitbox.setAttribute('position', '0 0 0.001');
    this.el.appendChild(this.hitbox);

    // OUTLINE
    this.outline = document.createElement('a-ring');
    this.outline.setAttribute('radius-outer', 0.1);
    this.outline.setAttribute('radius-inner', 0.078);
    this.outline.setAttribute('position', '0.1 0 0.002');
    this.el.appendChild(this.outline);

    // CIRCLE
    this.circle = document.createElement('a-circle');
    this.circle.setAttribute('radius', 0.05);
    this.circle.setAttribute('position', '0.1 0 0.002');
    this.el.appendChild(this.circle);

    // LABEL
    this.label = document.createElement('a-entity');
    this.el.appendChild(this.label);

    // EVENTS
    this.el.addEventListener('click', function () {
      if (this.components.radio.data.disabled) {
        return;
      }
      this.setAttribute('checked', true);
      that.onClick();
    });
    this.el.addEventListener('mousedown', function () {
      if (this.components.radio.data.disabled) {
        return SFX.clickDisabled(this);
      }
      SFX.click(this);
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
  onClick: function onClick(noemit) {
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
  },
  uncheck: function uncheck() {
    this.outline.setAttribute('color', this.data.radioColor);
    this.circle.setAttribute('visible', false);
    if (this.data.disabled) {
      this.disabled();
    }
  },
  disabled: function disabled() {
    this.outline.setAttribute('color', this.data.radioColor);
    this.circle.setAttribute('color', this.data.radioColor);
  },
  update: function update() {
    var that = this;
    this.onClick(true);

    // HITBOX
    this.hitbox.setAttribute('width', this.data.width);
    this.hitbox.setAttribute('position', this.data.width / 2 + ' 0 0.001');
    var props = {
      color: this.data.color,
      align: 'left',
      wrapCount: 10 * (this.data.width + 0.2),
      width: this.data.width
    };
    if (this.data.font) {
      props.font = this.data.font;
    }

    // TITLE
    props.value = this.data.label;
    props.color = this.data.color;
    this.label.setAttribute('text', props);
    this.label.setAttribute('position', this.data.width / 2 + 0.24 + ' 0 0.002');

    // TRIM TEXT IF NEEDED.. @TODO: optimize this mess..
    function getTextWidth(el, _widthFactor) {
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
        props.value = props.value.slice(0, -1);
        el.setAttribute("text", props);
        return getTextWidth(el);
      } else {
        if (!_widthFactor) {
          _widthFactor = Utils.getWidthFactor(el, props.wrapCount);
        }
        v = (v.position[0] + v.data.width) / (_widthFactor / that.data.width);
        var textRatio = v / that.data.width;
        if (textRatio > 1) {
          props.value = props.value.slice(0, -1);
          el.setAttribute("text", props);
          return getTextWidth(el, _widthFactor);
        }
      }
      return v;
    }
    setTimeout(function () {
      if (that.data.label.length) {
        getTextWidth(that.label);
      }
      if (that.data.disabled) {
        var timer = setInterval(function () {
          if (that.outline.object3D.children[0]) {
            clearInterval(timer);
            Utils.updateOpacity(that.outline, 0.4);
            Utils.updateOpacity(that.circle, 0.4);
            Utils.updateOpacity(that.label, 0.4);
          }
        }, 10);
      } else {
        var _timer = setInterval(function () {
          if (that.outline.object3D.children[0]) {
            clearInterval(_timer);
            Utils.updateOpacity(that.outline, 1);
            Utils.updateOpacity(that.circle, 1);
            Utils.updateOpacity(that.label, 1);
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
    width: 'radio.width'
  }
});

/***/ }),

/***/ "./src/radio/sfx.js":
/*!**************************!*\
  !*** ./src/radio/sfx.js ***!
  \**************************/
/***/ ((module) => {

var SFX = {
  init: function init(parent) {
    var el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeRadioClickSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeRadioClick');
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
    el = document.createElement('a-sound');
    el.setAttribute('key', 'aframeRadioClickDisabledSound');
    el.setAttribute('sfx', true);
    el.setAttribute('src', '#aframeRadioClickDisabled');
    el.setAttribute('position', '0 2 5');
    parent.appendChild(el);
  },
  click: function click(parent) {
    var el = parent.querySelector('[key=aframeRadioClickSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  },
  clickDisabled: function clickDisabled(parent) {
    var el = parent.querySelector('[key=aframeRadioClickDisabledSound]');
    if (!el) {
      return;
    }
    el.components.sound.stopSound();
    el.components.sound.playSound();
  }
};
module.exports = SFX;

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
    if (document && document.body) {
      Event.emit(document.body, 'didfocusinput', this.el);
    }
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
  if (!AFRAME) {
    return console.error('AFRAME is required!');
  }
  if (!AFRAME.ASSETS_PATH) {
    AFRAME.ASSETS_PATH = "./assets";
  }
  __webpack_require__(/*! ./rounded */ "./src/rounded/index.js");
  __webpack_require__(/*! ./fade */ "./src/fade/index.js");
  //require("./alert"); @TODO ;)
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