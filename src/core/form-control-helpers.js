/**
 * Form Control Helpers - Component utilities that USE Utils (no duplication)
 * 
 * Provides component-specific helper functions for radio/checkbox components.
 * All helpers use the Utils module for shared functionality rather than
 * reimplementing common operations.
 */

const Utils = require('../utils');

const FormControlHelpers = {
  /**
   * Initialize common form control functionality
   * Call from component init() after system reference is set
   * @param {object} component - A-Frame component instance
   */
  initFormControl(component) {
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
  bindEvent(component, target, eventName, handler) {
    const wrapped = function() {
      try {
        return handler.apply(component, arguments);
      } catch (error) {
        FormControlHelpers.handleError(component, error, 'event_handler_error');
      }
    };
    target.addEventListener(eventName, wrapped);
    if (!component.eventHandlers.has(target)) {
      component.eventHandlers.set(target, []);
    }
    component.eventHandlers.get(target).push({ eventName, boundHandler: wrapped });
    return wrapped;
  },
  
  /**
   * Unbind all tracked event listeners
   * @param {object} component - A-Frame component instance
   */
  unbindAllEvents(component) {
    if (!component.eventHandlers) return;
    
    component.eventHandlers.forEach((handlers, target) => {
      handlers.forEach(({ eventName, boundHandler }) => {
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
  updateARIA(component) {
    const role = component.attrName === 'radio' ? 'radio' : 'checkbox';
    
    // Core ARIA attributes (Requirement 4.1)
    component.el.setAttribute('role', role);
    component.el.setAttribute('aria-checked', String(component.data.checked));
    component.el.setAttribute('aria-disabled', String(component.data.disabled));
    
    // Tabindex management based on disabled state (Requirement 4.6)
    const tabIndex = component.data.disabled ? -1 : (component.data.tabIndex || 0);
    component.el.setAttribute('tabindex', tabIndex);
    
    // Label handling with priority: ariaLabel > label > default (Requirement 4.1)
    const label = component.data.ariaLabel || component.data.label;
    if (label) {
      component.el.setAttribute('aria-label', label);
    }
    
    // Radio-specific ARIA attributes
    if (component.attrName === 'radio' && component.data.name) {
      // Find radio group for aria-setsize and aria-posinset
      if (component.system && component.system.getRadioGroup) {
        const radioGroup = component.system.getRadioGroup(component.el);
        if (radioGroup.length > 1) {
          const position = radioGroup.indexOf(component.el) + 1;
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
  trackChild(component, element) {
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
  cleanupChildren(component) {
    if (!component.childElements) return;
    
    component.childElements.forEach(child => {
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
  validateConfiguration(component) {
    // Color validation using Utils
    const colorProps = ['radioColor', 'checkboxColor', 'radioColorChecked', 'checkboxColorChecked', 'color'];
    colorProps.forEach(prop => {
      if (component.data[prop] && !Utils.validateColor(component.data[prop])) {
        console.warn(`[${component.attrName}] Invalid ${prop}: ${component.data[prop]}, using default`);
        component.data[prop] = '#757575';
      }
    });
    
    // Size validation using Utils
    if (component.data.size !== undefined && !Utils.validateSize(component.data.size)) {
      console.warn(`[${component.attrName}] Invalid size: ${component.data.size}, using 1`);
      component.data.size = 1;
    }
    
    // Width validation
    if (component.data.width !== undefined) {
      const width = parseFloat(component.data.width);
      if (isNaN(width) || width <= 0) {
        console.warn(`[${component.attrName}] Invalid width: ${component.data.width}, using 1`);
        component.data.width = 1;
      }
    }
    
    // Label offset validation (clamp to reasonable range)
    if (component.data.labelOffset !== undefined) {
      let lo = parseFloat(component.data.labelOffset);
      if (isNaN(lo)) lo = 0.24;
      if (lo < -1) lo = -1;
      if (lo > 2) lo = 2;
      component.data.labelOffset = lo;
    }
    
    // Validate disabled opacity
    if (component.data.disabledOpacity !== undefined) {
      const opacity = parseFloat(component.data.disabledOpacity);
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        console.warn(`[${component.attrName}] Invalid disabledOpacity: ${component.data.disabledOpacity}, using 0.4`);
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
  handleError(component, error, errorType) {
    if (component.system && component.system.reportError) {
      component.system.reportError(component.attrName, error, {
        type: errorType,
        data: component.data
      });
    } else {
      console.error(`[${component.attrName}] ${errorType}:`, error);
    }
    
    if (errorType === 'initialization_failed') {
      FormControlHelpers.createFallbackUI(component);
    }
  },
  
  /**
   * Create fallback UI when initialization fails
   * @param {object} component - A-Frame component instance
   */
  createFallbackUI(component) {
    FormControlHelpers.cleanupChildren(component);
    
    const fallback = document.createElement('a-text');
    const stateIndicator = component.data.checked ? '✓' : '○';
    const labelText = component.data.label || 'Form Control';
    
    fallback.setAttribute('value', `${labelText} [${stateIndicator}]`);
    fallback.setAttribute('color', component.data.color || '#757575');
    fallback.setAttribute('position', '0 0 0.001');
    
    // Maintain basic interaction
    FormControlHelpers.bindEvent(component, fallback, 'click', () => {
      if (!component.data.disabled && component.toggle) {
        component.toggle();
      }
    });
    
    component.el.appendChild(fallback);
    FormControlHelpers.trackChild(component, fallback);
    
    // Add error indicator in development mode
    if (component.system && component.system.data && component.system.data.debug) {
      const errorIcon = document.createElement('a-text');
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
  getFormSystem(component) {
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
  updateOpacity(component, opacity) {
    Utils.updateOpacity(component.el, opacity);
  },
  
  /**
   * Measure text width using Utils (async)
   * @param {Element} textElement - A-Frame text entity
   * @returns {Promise<number>} Text width in A-Frame units
   */
  async measureTextWidth(textElement) {
    return Utils.measureTextWidth(textElement);
  },
  
  /**
   * Create keyboard event handlers for accessibility
   * Implements Requirements 4.3, 4.4, 4.7, 4.8, 4.9, 4.10 for keyboard navigation and focus management
   * @param {object} component - A-Frame component instance
   */
  setupKeyboardHandlers(component) {
    const keyHandler = (event) => {
      // Only handle if element is focused
      if (document.activeElement !== component.el) return;
      
      // Space or Enter activates the control (Requirement 4.3)
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        if (!component.data.disabled) {
          if (component.attrName === 'checkbox') {
            // Toggle checkbox
            const newChecked = !component.data.checked;
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
        const radioGroup = component.system.getRadioGroup(component.el);
        if (radioGroup.length > 1) {
          let currentIndex = radioGroup.indexOf(component.el);
          let nextIndex = -1;
          
          if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % radioGroup.length;
          } else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + radioGroup.length) % radioGroup.length;
          }
          
          if (nextIndex >= 0) {
            event.preventDefault();
            const nextRadio = radioGroup[nextIndex];
            
            // Skip disabled radios
            if (nextRadio.components && nextRadio.components.radio && nextRadio.components.radio.data.disabled) {
              // Find next non-disabled radio
              let attempts = 0;
              while (attempts < radioGroup.length) {
                if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
                  nextIndex = (nextIndex + 1) % radioGroup.length;
                } else {
                  nextIndex = (nextIndex - 1 + radioGroup.length) % radioGroup.length;
                }
                const candidateRadio = radioGroup[nextIndex];
                if (!candidateRadio.components.radio.data.disabled) {
                  break;
                }
                attempts++;
              }
            }
            
            const finalRadio = radioGroup[nextIndex];
            
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
        const radioGroup = component.system.getRadioGroup(component.el);
        if (radioGroup.length > 1) {
          let targetIndex = -1;
          
          if (event.code === 'Home') {
            targetIndex = 0;
          } else if (event.code === 'End') {
            targetIndex = radioGroup.length - 1;
          }
          
          if (targetIndex >= 0) {
            event.preventDefault();
            
            // Skip disabled radios for Home/End
            const targetRadio = radioGroup[targetIndex];
            if (targetRadio.components && targetRadio.components.radio && targetRadio.components.radio.data.disabled) {
              // Find first/last non-disabled radio
              if (event.code === 'Home') {
                for (let i = 0; i < radioGroup.length; i++) {
                  if (!radioGroup[i].components.radio.data.disabled) {
                    targetIndex = i;
                    break;
                  }
                }
              } else {
                for (let i = radioGroup.length - 1; i >= 0; i--) {
                  if (!radioGroup[i].components.radio.data.disabled) {
                    targetIndex = i;
                    break;
                  }
                }
              }
            }
            
            const finalRadio = radioGroup[targetIndex];
            finalRadio.focus();
            
            // Auto-select on Home/End navigation
            if (finalRadio.components && finalRadio.components.radio && !finalRadio.components.radio.data.disabled) {
              finalRadio.setAttribute('checked', true);
              finalRadio.components.radio.onClick();
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
    const focusInHandler = () => {
      // Ensure element is properly focused
      if (document.activeElement !== component.el) {
        component.el.focus();
      }
    };
    
    const focusOutHandler = () => {
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
  setupFocusIndicators(component) {
    const focusHandler = () => {
      // Add focus indicator with 3:1 contrast ratio (Requirement 4.7)
      if (!component.focusIndicator) {
        const indicator = document.createElement('a-ring');
        
        // Adjust size based on component type for better visibility
        const size = component.attrName === 'checkbox' ? 0.25 : 0.22;
        indicator.setAttribute('geometry', {
          radiusInner: size - 0.04,
          radiusOuter: size,
          segmentsTheta: 32
        });
        
        // High contrast color with 3:1 ratio against typical backgrounds (Requirement 4.7)
        indicator.setAttribute('material', {
          color: '#0066cc', // WCAG AA compliant blue (4.5:1 contrast on white)
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
    
    const blurHandler = () => {
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
        setTimeout(() => {
          if (component.focusIndicator && component.focusIndicator.parentNode) {
            component.focusIndicator.parentNode.removeChild(component.focusIndicator);
          }
          component.focusIndicator = null;
        }, 200);
      }
    };
    
    // VR controller gaze-based focus indication (Requirement 4.8)
    const gazeEnterHandler = () => {
      if (!component.data.disabled && !component.focusIndicator) {
        // Add subtle gaze indicator (different from keyboard focus)
        const gazeIndicator = document.createElement('a-ring');
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
    
    const gazeLeaveHandler = () => {
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
  updateRadioGroupTabindex(component) {
    if (component.attrName !== 'radio' || !component.system || !component.system.getRadioGroup) {
      return;
    }
    
    const radioGroup = component.system.getRadioGroup(component.el);
    if (radioGroup.length <= 1) return;
    
    // Find the checked radio, or the first non-disabled radio
    let tabbableRadio = null;
    
    // First, look for a checked radio
    for (const radio of radioGroup) {
      if (radio.components && radio.components.radio && radio.components.radio.data.checked && !radio.components.radio.data.disabled) {
        tabbableRadio = radio;
        break;
      }
    }
    
    // If no checked radio, use the first non-disabled radio
    if (!tabbableRadio) {
      for (const radio of radioGroup) {
        if (radio.components && radio.components.radio && !radio.components.radio.data.disabled) {
          tabbableRadio = radio;
          break;
        }
      }
    }
    
    // Set tabindex for all radios in the group
    radioGroup.forEach(radio => {
      if (radio.components && radio.components.radio) {
        const shouldBeTabbable = radio === tabbableRadio && !radio.components.radio.data.disabled;
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
  setupAccessibility(component) {
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
      setTimeout(() => {
        FormControlHelpers.updateRadioGroupTabindex(component);
      }, 0);
    }
  },
  
  /**
   * Test focus indicators across different viewing angles (VR optimization)
   * Implements Requirement 4.10 for testing focus indicators across viewing angles
   * @param {object} component - A-Frame component instance
   */
  testFocusIndicatorVisibility(component) {
    if (!component.focusIndicator) return;
    
    // Ensure focus indicator is visible from multiple angles in VR
    const indicator = component.focusIndicator;
    
    // Add billboard behavior for better VR visibility
    if (!indicator.hasAttribute('look-at')) {
      indicator.setAttribute('look-at', '[camera]');
    }
    
    // Ensure proper z-positioning for depth sorting
    const currentPos = indicator.getAttribute('position');
    if (currentPos.z >= 0) {
      indicator.setAttribute('position', `${currentPos.x} ${currentPos.y} -0.001`);
    }
    
    // Add debug logging in development mode
    if (component.system && component.system.data && component.system.data.debug) {
      console.log(`[${component.attrName}] Focus indicator visibility test:`, {
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
  cleanupFocusIndicators(component) {
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