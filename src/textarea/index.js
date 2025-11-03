/**
 * A-Frame Textarea Component
 * Multiline text input component for A-Frame scenes
 */

const Event = require('../core/event');
// Register the textarea component
AFRAME.registerComponent('textarea', {
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
    backgroundOpacity: { type: "number", default: 0.95 },
    backgroundRadius: { type: "number", default: 0.02 },
    backgroundHeight: { type: "number", default: 0 }, // 0 = use height
    borderColor: { type: "color", default: "#999" },
    borderWidth: { type: "number", default: 0.01 },
    
    // Wrapping & scrolling
    wrap: { type: "string", default: "soft" }, // soft|hard|off
    wrapCount: { type: "int", default: 0 }, // auto-calculated if 0
    scroll: { type: "boolean", default: true },
    maxRows: { type: "int", default: 0 }, // 0 = no row limit
    
    // Selection
    selectionColor: { type: "color", default: "#007AFF" },
    selectionOpacity: { type: "number", default: 0.3 },
  },

  getFallbackWrapCount: function () {
    // Approximate characters per line before metrics are ready
    // Mirrors legacy input behavior: ~24 chars per world unit of width
    return Math.max(1, Math.floor(24 * this.data.width));
  },

  init: function () {
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
      lastHeight: 0,
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

  createChildEntities: function () {
    const data = this.data;
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
      const bgH = (data.backgroundHeight || data.height);
      // Left-bottom anchored like a-input: x=0, y=-height/2
      this.backgroundEntity.setAttribute('position', `0 ${-bgH/2} 0.001`);
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
      const bgH = (data.backgroundHeight || data.height);
      const bw = data.borderWidth;
      // Left-bottom anchored border slightly larger
      this.borderEntity.setAttribute('position', `${-bw} ${-(bgH/2 + bw)} 0`);
    }
    this.el.appendChild(this.borderEntity);
    
    // Create content text entity
    this.contentEntity = document.createElement('a-entity');
    {
      const props = {
        value: '',
        color: data.color,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: data.width,
        wrapCount: (data.wrap !== 'off') ? (data.wrapCount || Math.floor(24 * data.width)) : 0
      };
      if (data.font) { props.font = data.font; }
      this.contentEntity.setAttribute('text', props);
    }
    // Position text like a-input: baseline at y=0, x at left padding + width/2
    this.contentEntity.setAttribute('position', `${data.paddingX - 0.001 + data.width/2} 0 0.002`);
    // Ensure text props are applied once mesh is ready
    this._onContentReady = () => { this.ensureTextPropsFor(this.contentEntity); };
    this.contentEntity.addEventListener('loaded', this._onContentReady);
    this.contentEntity.addEventListener('object3dset', this._onContentReady);
    requestAnimationFrame(() => this.ensureTextPropsFor(this.contentEntity));
    // Also allow clicking text area to focus
    this.contentEntity.addEventListener('mousedown', this.boundHandleClick);
    this.contentEntity.addEventListener('click', this.boundHandleClick);
    this.el.appendChild(this.contentEntity);
    
    // Create placeholder text entity
    this.placeholderEntity = document.createElement('a-entity');
    {
      const props = {
        value: data.placeholder,
        color: data.placeholderColor,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: data.width,
        wrapCount: (data.wrap !== 'off') ? (data.wrapCount || Math.floor(24 * data.width)) : 0
      };
      if (data.font) { props.font = data.font; }
      this.placeholderEntity.setAttribute('text', props);
    }
    this.placeholderEntity.setAttribute('position', `${data.paddingX - 0.001 + data.width/2} 0 0.002`);
    this.placeholderEntity.setAttribute('visible', data.value === '');
    // Ensure placeholder text props are applied once mesh is ready
    this._onPlaceholderReady = () => { this.ensureTextPropsFor(this.placeholderEntity); };
    this.placeholderEntity.addEventListener('loaded', this._onPlaceholderReady);
    this.placeholderEntity.addEventListener('object3dset', this._onPlaceholderReady);
    requestAnimationFrame(() => this.ensureTextPropsFor(this.placeholderEntity));
    this.placeholderEntity.addEventListener('mousedown', this.boundHandleClick);
    this.placeholderEntity.addEventListener('click', this.boundHandleClick);
    this.el.appendChild(this.placeholderEntity);
    
    // Create caret entity
    this.caretEntity = document.createElement('a-entity');
    const caretHeight = data.cursorHeight || data.lineHeight;
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
    this.caretEntity.setAttribute('position', `${data.paddingX - 0.001 + data.width/2} 0 0.003`);
    this.caretEntity.setAttribute('visible', false);
    this.el.appendChild(this.caretEntity);
    
    // Create hidden measurement entity for font metrics
    this.measurementEntity = document.createElement('a-entity');
    {
      const props = {
        value: 'MMMMMMMMMM',
        color: '#000',
        letterSpacing: data.letterSpacing,
        align: 'left',
        side: 'front',
      };
      if (data.font) { props.font = data.font; }
      this.measurementEntity.setAttribute('text', props);
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
    setTimeout(() => {
      this.updateLayout();
    }, 100);
  },

  setupMeasurementSystem: function () {
    // Listen for measurement entity to be ready
    // Bind and store listeners so we can remove them later
    this._onMeasureLoaded = this.calculateMetrics.bind(this);
    this._onMeasureObject3D = this.calculateMetrics.bind(this);
    this.measurementEntity.addEventListener('loaded', this._onMeasureLoaded);
    this.measurementEntity.addEventListener('object3dset', this._onMeasureObject3D);
  },

  calculateMetrics: function () {
    try {
      if (!this.measurementEntity) {
        setTimeout(() => this.calculateMetrics(), 100);
        return;
      }
      const data = this.data;
      // Try to access the text mesh via public object3D names first
      const mesh = this.measurementEntity.getObject3D('text') || this.measurementEntity.getObject3D('mesh');
      let geom = mesh && mesh.geometry ? mesh.geometry : null;
      if (!geom) {
        // As a fallback, look at first child
        const obj3d = this.measurementEntity.object3D;
        if (obj3d && obj3d.children && obj3d.children[0] && obj3d.children[0].geometry) {
          geom = obj3d.children[0].geometry;
        }
      }
      if (geom) {
        // Ensure position attribute exists before computing bbox
        if (geom.isBufferGeometry) {
          if (!geom.attributes || !geom.attributes.position || !geom.attributes.position.array) {
            // geometry not ready yet; retry shortly
            setTimeout(() => this.calculateMetrics(), 50);
            return;
          }
        }
        if (!geom.boundingBox) {
          try { geom.computeBoundingBox(); } catch (e) {
            setTimeout(() => this.calculateMetrics(), 50);
            return;
          }
        }
        const bbox = geom.boundingBox;
        if (!bbox) {
          setTimeout(() => this.calculateMetrics(), 50);
          return;
        }
        const measurementWidth = (bbox.max.x - bbox.min.x);
        
        // Calculate character width (10 M's) with fallback
        this.charWidth = measurementWidth > 0 ? measurementWidth / 10 : 0.1;
        
        // Calculate derived metrics with validation
        const contentWidth = Math.max(0, data.width - (data.paddingX * 2));
        const contentHeight = Math.max(0, data.height - (data.paddingY * 2));
        
        this.charsPerLine = this.charWidth > 0 ? Math.max(1, Math.floor(contentWidth / this.charWidth)) : 1;
        this.visibleLines = data.lineHeight > 0 ? Math.max(1, Math.floor(contentHeight / data.lineHeight)) : 1;
        
        // Cache metrics
        this.cachedMetrics = {
          charWidth: this.charWidth,
          charsPerLine: this.charsPerLine,
          visibleLines: this.visibleLines,
          lastFont: data.font,
          lastWidth: data.width,
          lastHeight: data.height,
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

  shouldRecalculateMetrics: function () {
    const data = this.data;
    return (
      this.cachedMetrics.lastFont !== data.font ||
      this.cachedMetrics.lastWidth !== data.width ||
      this.cachedMetrics.lastHeight !== data.height ||
      this.charWidth === 0
    );
  },

  parseLines: function (text) {
    if (!text) {
      return [''];
    }
    
    const data = this.data;
    const logicalLines = text.split('\n');
    const visualLines = [];
    
    if (data.wrap === 'off' || this.charsPerLine <= 0) {
      // No wrapping
      return logicalLines;
    }
    
    // Soft wrapping
    for (let i = 0; i < logicalLines.length; i++) {
      const line = logicalLines[i];
      if (line.length <= this.charsPerLine) {
        visualLines.push(line);
      } else {
        // Wrap long lines
        for (let j = 0; j < line.length; j += this.charsPerLine) {
          visualLines.push(line.substring(j, j + this.charsPerLine));
        }
      }
    }
    
    return visualLines;
  },

  getCaretCoordinates: function (position) {
    const text = this.data.value || '';
    const lines = this.parseLines(text);
    
    let currentPos = 0;
    let lineIndex = 0;
    let columnIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length;
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
    
    return { line: lineIndex, column: columnIndex };
  },

  getVisualCaretPosition: function (line, column) {
    const data = this.data;
    // Baseline at y=0; advance downward by lineHeight per line
    const x = -data.width/2 + data.paddingX + (column * this.charWidth);
    const y = -(line * data.lineHeight);
    
    return { x: x, y: y };
  },

  updateLayout: function () {
    // Always render text even if metrics are still computing
    if (this.shouldRecalculateMetrics()) {
      this.updateTextContent();
      this.calculateMetrics();
      return;
    }
    
    this.updateCaretPosition();
    this.updateTextContent();
  },

  updatePositions: function () {
    const data = this.data;
    // Align with a-input: baseline y=0; text x at padding-left + width/2
    const baseX = data.paddingX - 0.001 + data.width/2;
    const baseY = 0;
    if (this.contentEntity) {
      this.contentEntity.setAttribute('position', `${baseX} ${baseY} 0.002`);
    }
    if (this.placeholderEntity) {
      this.placeholderEntity.setAttribute('position', `${baseX} ${baseY} 0.002`);
    }
  },

  updateCaretPosition: function () {
    if (!this.caretEntity || this.charWidth === 0) {
      return;
    }
    
    const coords = this.getCaretCoordinates(this.cursorPosition);
    const pos = this.getVisualCaretPosition(coords.line, coords.column);
    
    this.caretEntity.setAttribute('position', `${pos.x} ${pos.y} 0.003`);
    this.cursorLine = coords.line;
    this.cursorColumn = coords.column;
  },

  updateTextContent: function () {
    if (!this.contentEntity || !this.placeholderEntity) {
      return;
    }
    
    const data = this.data;
    let displayValue = data.value || '';
    
    // Handle maxLength truncation
    if (data.maxLength > 0 && displayValue.length > data.maxLength) {
      displayValue = displayValue.substring(0, data.maxLength);
    }
    
    // Compute content width and wrap
    const contentWidth = data.width;
    const wrapCount = (data.wrap !== 'off') ? (data.wrapCount || this.charsPerLine || Math.floor(24 * data.width)) : 0;
    // Update content text
    {
      const props = {
        value: displayValue,
        color: data.color,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: contentWidth,
        wrapCount: wrapCount
      };
      if (data.font) { props.font = data.font; }
      this.contentEntity.setAttribute('text', props);
      // Guard: if wrapCount is still too small, re-apply after mesh is ready
      if (wrapCount < 2) { this.ensureTextPropsFor(this.contentEntity); }
    }
    
    // Update placeholder visibility
    const showPlaceholder = displayValue === '' && data.placeholder;
    this.placeholderEntity.setAttribute('visible', showPlaceholder);
    
    if (showPlaceholder) {
      const props = {
        value: data.placeholder,
        color: data.placeholderColor,
        letterSpacing: data.letterSpacing,
        align: data.align,
        side: data.side,
        width: contentWidth,
        wrapCount: wrapCount
      };
      if (data.font) { props.font = data.font; }
      this.placeholderEntity.setAttribute('text', props);
      if (wrapCount < 2) { this.ensureTextPropsFor(this.placeholderEntity); }
    }
  },

  ensureTextPropsFor: function (entity) {
    if (!entity) { return; }
    const data = this.data;
    const width = data.width;
    const wrap = (data.wrap !== 'off') ? (data.wrapCount || Math.max(10, Math.floor(24 * width))) : 0;
    const apply = () => {
      const t = entity.getAttribute('text') || {};
      const needsWidth = t.width !== width;
      const needsWrap = (t.wrapCount | 0) < wrap;
      if (needsWidth || needsWrap) {
        entity.setAttribute('text', Object.assign({}, t, { width: width, wrapCount: wrap }));
      }
    };
    // Apply on next frame to ensure mesh is initialized
    requestAnimationFrame(apply);
  },

  updateBackground: function () {
    if (!this.backgroundEntity) {
      return;
    }
    
    const data = this.data;
    this.backgroundEntity.setAttribute('color', data.backgroundColor);
    this.backgroundEntity.setAttribute('opacity', data.backgroundOpacity);
    this.backgroundEntity.setAttribute('radius', data.backgroundRadius);
    this.backgroundEntity.setAttribute('width', data.width);
    this.backgroundEntity.setAttribute('height', data.backgroundHeight || data.height);
    {
      const bgH = (data.backgroundHeight || data.height);
      // Left-bottom anchored: x=0, y=-height/2
      this.backgroundEntity.setAttribute('position', `0 ${-bgH/2} 0.001`);
    }
    
    if (this.borderEntity) {
      this.borderEntity.setAttribute('color', data.borderColor);
      this.borderEntity.setAttribute('opacity', 1);
      this.borderEntity.setAttribute('radius', data.backgroundRadius);
      this.borderEntity.setAttribute('width', data.width + (data.borderWidth * 2));
      this.borderEntity.setAttribute('height', (data.backgroundHeight || data.height) + (data.borderWidth * 2));
      const bw = data.borderWidth;
      const bgH = (data.backgroundHeight || data.height);
      // Left-bottom anchored border slightly larger
      this.borderEntity.setAttribute('position', `${-bw} ${-(bgH/2 + bw)} 0`);
    }
  },

  handleClick: function (evt) {
    if (!this.data.disabled) {
      evt.stopPropagation();
      this.focus();
    }
  },

  setupValueProxy: function () {
    // Create value property on element for API compatibility
    const self = this;
    Object.defineProperty(this.el, 'value', {
      get: function() { 
        return self.data.value || '';
      },
      set: function(value) { 
        self.el.setAttribute('textarea', 'value', value);
      },
      enumerable: true,
      configurable: true
    });
  },

  update: function (oldData) {
    if (!oldData) return;
    
    const data = this.data;
    
    // Check if we need to recalculate metrics
    if (oldData.font !== data.font || 
        oldData.width !== data.width || 
        oldData.height !== data.height ||
        oldData.letterSpacing !== data.letterSpacing) {
      
      // Update measurement entity
      if (this.measurementEntity) {
        const props = {
          value: 'MMMMMMMMMM',
          color: '#000',
          letterSpacing: data.letterSpacing,
          align: 'left',
          side: 'front',
          // Do not set width here to avoid scaling metrics
        };
        if (data.font) { props.font = data.font; }
        this.measurementEntity.setAttribute('text', props);
      }
      
      this.scheduleUpdate();
    }
    // Layout-only changes (no charWidth change) that still require update
    if (oldData.paddingX !== data.paddingX ||
        oldData.paddingY !== data.paddingY ||
        oldData.lineHeight !== data.lineHeight ||
        oldData.wrap !== data.wrap ||
        oldData.wrapCount !== data.wrapCount ||
        oldData.align !== data.align) {
      this.updatePositions();
      this.scheduleUpdate();
    }
    
    // Update background if background properties changed
    if (oldData.backgroundColor !== data.backgroundColor ||
        oldData.backgroundOpacity !== data.backgroundOpacity ||
        oldData.backgroundRadius !== data.backgroundRadius ||
        oldData.backgroundHeight !== data.backgroundHeight) {
      this.updateBackground();
    }
    
    // Update caret if cursor properties changed
    if (oldData.cursorWidth !== data.cursorWidth ||
        oldData.cursorHeight !== data.cursorHeight ||
        oldData.cursorColor !== data.cursorColor) {
      this.updateCaretGeometry();
    }
    
    // Update text content if value or text properties changed
    if (oldData.value !== data.value ||
        oldData.color !== data.color ||
        oldData.placeholder !== data.placeholder ||
        oldData.placeholderColor !== data.placeholderColor) {
      this.scheduleUpdate();
    }
    
    // Update blink rate if changed
    if (oldData.blinkRate !== data.blinkRate && this.isFocused) {
      this.startBlinking();
    }
  },

  scheduleUpdate: function () {
    if (this.updateRaf) {
      cancelAnimationFrame(this.updateRaf);
    }
    
    this.updateRaf = requestAnimationFrame(() => {
      this.updateLayout();
      this.updateRaf = null;
    });
  },

  updateCaretGeometry: function () {
    if (!this.caretEntity) return;
    
    const data = this.data;
    const caretHeight = data.cursorHeight || data.lineHeight;
    
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

  pause: function () {
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

  remove: function () {
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
  focus: function () {
    
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
    this.el.emit('focus', { target: this.el });
    // Temporarily disabled to prevent keyboard from opening and causing freeze
    // if (document && document.body) {
    //   Event.emit(document.body, 'didfocusinput', this.el);
    // }
    if (this.el.sceneEl) {
      this.el.sceneEl.emit('didfocustextarea', { target: this.el });
    }
    
    // Update layout to ensure caret is positioned correctly
    this.updateLayout();
  },

  blur: function () {
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
    this.el.emit('blur', { target: this.el });
    if (document && document.body) {
      Event.emit(document.body, 'didblurinput', this.el);
    }
    if (this.el.sceneEl) {
      this.el.sceneEl.emit('didblurtextarea', { target: this.el });
    }
  },

  startBlinking: function () {
    this.stopBlinking();
    if (this.data.blinkRate > 0) {
      this.blinkInterval = setInterval(() => {
        if (this.caretEntity && this.isFocused) {
          const visible = this.caretEntity.getAttribute('visible');
          this.caretEntity.setAttribute('visible', !visible);
        }
      }, this.data.blinkRate);
    }
  },

  stopBlinking: function () {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
  },

  appendString: function (text) {
    if (this.data.disabled || this.data.readonly) {
      return;
    }
    
    // Handle Enter key - insert newline instead of blurring (different from a-input)
    if (text === '\n' || text === 'Enter') { text = '\n'; }
    // Insert at cursor position
    this.insertAtCursor(text);
  },

  deleteLast: function () {
    
    if (this.data.disabled || this.data.readonly) {
      return;
    }
    // Backspace behavior at cursor
    let currentValue = this.data.value || '';
    if (this.cursorPosition > 0) {
      const before = currentValue.substring(0, this.cursorPosition - 1);
      const after = currentValue.substring(this.cursorPosition);
      const newValue = before + after;
      this.setValue(newValue);
      this.cursorPosition = this.cursorPosition - 1;
      this.pauseBlinking();
    }
  },

  insertAtCursor: function (text) {
    if (this.data.disabled || this.data.readonly) {
      return;
    }
    
    let currentValue = this.data.value || '';
    const beforeCursor = currentValue.substring(0, this.cursorPosition);
    const afterCursor = currentValue.substring(this.cursorPosition);
    let newValue = beforeCursor + text + afterCursor;
    
    // Handle maxLength
    if (this.data.maxLength > 0 && newValue.length > this.data.maxLength) {
      newValue = newValue.substring(0, this.data.maxLength);
    }
    
    this.setValue(newValue);
    this.cursorPosition = Math.min(beforeCursor.length + text.length, newValue.length);
    this.pauseBlinking();
  },

  setValue: function (value) {
    try {
      // Validate and sanitize value
      if (typeof value !== 'string') {
        value = String(value || '');
      }
      
      const oldValue = this.data.value;
      this.el.setAttribute('textarea', 'value', value);
      
      if (oldValue !== value) {
        // Emit events with error handling
        try {
          this.el.emit('input', { target: this.el, value: value });
          this.el.emit('change', { target: this.el, value: value });
        } catch (eventError) {
          console.warn('Textarea: Error emitting events', eventError);
        }
      }
    } catch (error) {
      console.warn('Textarea: Error setting value', error);
    }
  },

  pauseBlinking: function () {
    if (this.caretEntity && this.isFocused) {
      this.caretEntity.setAttribute('visible', true);
      this.stopBlinking();
      
      // Resume blinking after a short delay
      this.blinkTimer = setTimeout(() => {
        if (this.isFocused) {
          this.startBlinking();
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
    'selection-opacity': 'textarea.selectionOpacity',
  }
});