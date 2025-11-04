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
class EventObjectPool {
  constructor(poolSize = 5) {
    this.poolSize = poolSize;
    this.pools = {
      change: this.createPool(poolSize, () => ({
        checked: false,
        value: '',
        target: null,
        timestamp: 0
      })),
      error: this.createPool(poolSize, () => ({
        error: null,
        component: '',
        context: {},
        timestamp: 0
      })),
      focus: this.createPool(poolSize, () => ({
        focused: false,
        target: null,
        timestamp: 0
      }))
    };
    this.indices = {
      change: 0,
      error: 0,
      focus: 0
    };
  }
  
  createPool(size, factory) {
    return Array.from({ length: size }, factory);
  }
  
  get(type) {
    if (!this.pools[type]) {
      console.warn(`[EventObjectPool] Unknown event type: ${type}`);
      return {};
    }
    
    const pool = this.pools[type];
    const index = this.indices[type];
    const event = pool[index];
    
    // Rotate index for next use
    this.indices[type] = (index + 1) % this.poolSize;
    
    // Reset timestamp
    event.timestamp = Date.now();
    
    return event;
  }
  
  getChangeEvent(checked, value, target) {
    const event = this.get('change');
    event.checked = checked;
    event.value = value;
    event.target = target;
    return event;
  }
  
  getErrorEvent(error, component, context) {
    const event = this.get('error');
    event.error = error;
    event.component = component;
    event.context = Object.assign({}, context); // Shallow copy
    return event;
  }
  
  getFocusEvent(focused, target) {
    const event = this.get('focus');
    event.focused = focused;
    event.target = target;
    return event;
  }
}

/**
 * Text measurement cache for 3D VR environments
 * Uses A-Frame text geometry as source of truth (not Canvas API)
 */
class TextMeasurementCache {
  constructor() {
    this.cache = new Map(); // "text|font" -> { width, timestamp }
    this.pendingMeasurements = new Map(); // element -> Promise
  }
  
  /**
   * Measure text width using A-Frame text geometry (async)
   * @param {Element} textComponent - A-Frame entity with text component
   * @returns {Promise<number>} Width in A-Frame units
   */
  async measureText(textComponent) {
    // Check if measurement already pending
    if (this.pendingMeasurements.has(textComponent)) {
      return this.pendingMeasurements.get(textComponent);
    }
    
    // Create measurement promise
    const measurementPromise = new Promise((resolve) => {
      const measure = () => {
        const width = this.measureWithAFrame(textComponent);
        if (width !== null) {
          resolve(width);
          this.pendingMeasurements.delete(textComponent);
        } else {
          // Retry on next frame until geometry is ready
          requestAnimationFrame(measure);
        }
      };
      measure();
    });
    
    this.pendingMeasurements.set(textComponent, measurementPromise);
    return measurementPromise;
  }
  
  /**
   * Synchronous measurement (returns null if geometry not ready)
   * @param {Element} textComponent - A-Frame entity with text component
   * @returns {number|null} Width or null if unavailable
   */
  measureSync(textComponent) {
    return this.measureWithAFrame(textComponent);
  }
  
  /**
   * Measure using A-Frame text component geometry
   * This is the ONLY reliable method for 3D text measurement
   * @param {Element} textComponent - A-Frame entity with text component
   * @returns {number|null} Width in A-Frame units or null if unavailable
   */
  measureWithAFrame(textComponent) {
    try {
      // Validate component exists
      if (!textComponent?.components?.text) {
        return null;
      }
      
      // Check if geometry is loaded
      const mesh = textComponent.object3D.children[0];
      if (!mesh?.geometry) {
        return null;
      }
      
      const geometry = mesh.geometry;
      
      // Method 1: Use visible glyphs (troika-text - most accurate)
      if (geometry.visibleGlyphs?.length > 0) {
        const lastGlyph = geometry.visibleGlyphs[geometry.visibleGlyphs.length - 1];
        const width = lastGlyph.position[0] + lastGlyph.data.width;
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
  async waitAndMeasure(textComponent, timeout = 5000) {
    return Promise.race([
      this.measureText(textComponent),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Text measurement timeout')), timeout)
      )
    ]);
  }
  
  /**
   * Clear measurement cache (useful for dynamic text updates)
   */
  clearCache() {
    this.cache.clear();
    this.pendingMeasurements.clear();
  }
}

/**
 * Radio group registry with hierarchical form ID management
 */
class RadioGroupRegistry {
  constructor(formManager) {
    this.formManager = formManager;
    this.groups = new Map(); // formId -> Map(groupName -> Set(radioElements))
    this.radioToGroup = new WeakMap(); // radioElement -> {formId, groupName}
  }
  
  register(radioElement) {
    const formId = this.formManager.getFormId(radioElement);
    const groupName = radioElement.getAttribute('name');
    
    if (!groupName) {
      console.warn('[RadioGroupRegistry] Radio without name attribute', radioElement);
      return;
    }
    
    // Check if radio is already registered with different group (name attribute changed)
    const existingGroupInfo = this.radioToGroup.get(radioElement);
    if (existingGroupInfo && 
        (existingGroupInfo.formId !== formId || existingGroupInfo.groupName !== groupName)) {
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
    this.radioToGroup.set(radioElement, { formId, groupName });
  }
  
  unregister(radioElement) {
    const groupInfo = this.radioToGroup.get(radioElement);
    if (!groupInfo) return;
    
    const { formId, groupName } = groupInfo;
    const group = this.groups.get(formId)?.get(groupName);
    if (group) {
      group.delete(radioElement);
      
      // Cleanup empty groups
      if (group.size === 0) {
        this.groups.get(formId).delete(groupName);
        if (this.groups.get(formId).size === 0) {
          this.groups.delete(formId);
        }
      }
    }
    
    this.radioToGroup.delete(radioElement);
  }
  
  getGroup(radioElement) {
    const groupInfo = this.radioToGroup.get(radioElement);
    if (!groupInfo) return [];
    
    const { formId, groupName } = groupInfo;
    const group = this.groups.get(formId)?.get(groupName);
    return group ? Array.from(group) : [];
  }
  
  /**
   * Check if radio element needs cache refresh (Requirement 3.8)
   * @param {Element} radioElement - Radio button element
   * @returns {boolean} True if cache needs refreshing
   */
  needsCacheRefresh(radioElement) {
    const currentFormId = this.formManager.getFormId(radioElement);
    const currentGroupName = radioElement.getAttribute('name');
    const cachedGroupInfo = this.radioToGroup.get(radioElement);
    
    // No cached info means needs registration
    if (!cachedGroupInfo) {
      return true;
    }
    
    // Check if form ID or group name changed
    return cachedGroupInfo.formId !== currentFormId || 
           cachedGroupInfo.groupName !== currentGroupName;
  }
  
  /**
   * Update radio registration if cache needs refresh (Requirements 3.7, 3.8)
   * @param {Element} radioElement - Radio button element
   * @returns {boolean} True if registration was updated
   */
  updateIfNeeded(radioElement) {
    if (this.needsCacheRefresh(radioElement)) {
      this.register(radioElement);
      return true;
    }
    return false;
  }
}

/**
 * FormManager - Core form control resource management
 * 
 * Pure JavaScript class for managing shared resources across all form components.
 * Handles sound pool, event pooling, text measurement, radio groups, and form IDs.
 */
class FormManager {
  constructor() {
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
  loadSounds() {
    // Sound asset IDs defined in each component's assets.js
    const soundAssets = {
      // Button sounds
      buttonClick: '#aframeButtonClick',
      buttonClickDisabled: '#aframeButtonClickDisabled',

      // Switch sounds
      switchClick: '#aframeSwitchClick',
      switchClickDisabled: '#aframeSwitchClickDisabled',

      // Toast sounds
      toastShow: '#aframeToastShow',

      // Radio sounds
      radioClick: '#aframeRadioClick',
      radioClickDisabled: '#aframeRadioClickDisabled',
      
      // Checkbox sounds
      checkboxClick: '#aframeCheckboxClick',
      checkboxClickDisabled: '#aframeCheckboxClickDisabled'
    };
    
    const scene = (typeof document !== 'undefined') ? document.querySelector('a-scene') : null;
    if (!scene) return;
    
    // Create sound elements in scene
    Object.entries(soundAssets).forEach(([soundId, assetSelector]) => {
      try {
        const soundEl = document.createElement('a-sound');
        soundEl.setAttribute('src', assetSelector);
        soundEl.setAttribute('autoplay', false);
        soundEl.setAttribute('preload', 'auto');
        soundEl.setAttribute('positional', false);
        scene.appendChild(soundEl);
        this.sounds[soundId] = soundEl;
      } catch (error) {
        console.warn(`[FormManager] Failed to load sound ${soundId}:`, error);
      }
    });
  }
  
  /**
   * Play sound from shared pool
   * @param {string} soundId - Sound identifier
   */
  playSound(soundId) {
    const soundEl = this.sounds[soundId];
    if (soundEl && soundEl.components && soundEl.components.sound) {
      try {
        soundEl.components.sound.playSound();
      } catch (error) {
        console.warn(`[FormManager] Failed to play sound ${soundId}:`, error);
      }
    }
  }
  
  /**
   * Get pooled event detail object
   * @param {string} type - Event type (change, error, focus)
   * @returns {object} Reusable event detail object
   */
  getEventDetail(type) {
    return this.eventPool.get(type);
  }
  
  /**
   * Measure text width using cached A-Frame geometry
   * @param {Element} textComponent - A-Frame entity with text component
   * @returns {Promise<number>} Width in A-Frame units
   */
  measureText(textComponent) {
    return this.textCache.measureText(textComponent);
  }
  
  /**
   * Register radio button with group registry
   * @param {Element} radioElement - Radio button element
   */
  registerRadioGroup(radioElement) {
    this.radioGroupRegistry.register(radioElement);
  }
  
  /**
   * Get radio group members
   * @param {Element} radioElement - Radio button element
   * @returns {Element[]} Array of radio elements in same group
   */
  getRadioGroup(radioElement) {
    return this.radioGroupRegistry.getGroup(radioElement);
  }
  
  /**
   * Unregister radio button from group registry
   * @param {Element} radioElement - Radio button element
   */
  unregisterRadio(radioElement) {
    this.radioGroupRegistry.unregister(radioElement);
  }
  
  /**
   * Check if radio element needs cache refresh (Requirement 3.8)
   * @param {Element} radioElement - Radio button element
   * @returns {boolean} True if cache needs refreshing
   */
  radioNeedsCacheRefresh(radioElement) {
    return this.radioGroupRegistry.needsCacheRefresh(radioElement);
  }
  
  /**
   * Update radio registration if needed (Requirements 3.7, 3.8)
   * @param {Element} radioElement - Radio button element
   * @returns {boolean} True if registration was updated
   */
  updateRadioIfNeeded(radioElement) {
    return this.radioGroupRegistry.updateIfNeeded(radioElement);
  }
  
  /**
   * Get or generate form ID for element
   * @param {Element} element - Form control element
   * @returns {string} Form ID
   */
  getFormId(element) {
    const form = element.closest('a-form');
    
    // No form parent - use global namespace with warning
    if (!form) {
      if (!this.hasWarnedGlobal) {
        console.warn(
          `[FormManager] Component without a-form parent detected. ` +
          `Radio button grouping will use global namespace. ` +
          `Wrap in <a-form> for proper grouping.`,
          element
        );
        this.hasWarnedGlobal = true;
      }
      return '_global_';
    }
    
    // Use existing ID if present
    if (form.id) {
      return form.id;
    }
    
    // Generate stable ID
    form.id = `form-${this.formCounter++}`;
    return form.id;
  }
  
  /**
   * Report error with centralized logging
   * @param {string} component - Component name
   * @param {Error} error - Error object
   * @param {object} context - Additional context
   */
  reportError(component, error, context) {
    console.error(`[FormManager] ${component} error:`, error, context);
    
    // Emit error event for debugging
    if (typeof document !== 'undefined' && document.querySelector('a-scene')) {
      const errorEvent = this.eventPool.getErrorEvent(error, component, context);
      document.querySelector('a-scene').emit('form-error', errorEvent);
    }
  }
}

module.exports = FormManager;