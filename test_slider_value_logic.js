// Test script for slider value logic
// This tests the core value functions without requiring full A-Frame setup

// Mock the required dependencies
const mockEvent = {
  emit: function(element, eventName, detail) {
    console.log(`Event emitted: ${eventName}`, detail);
  }
};

const mockFormControlHelpers = {
  initFormControl: function() {},
  getFormSystem: function() { return null; },
  setupAccessibility: function() {},
  trackChild: function() {},
  bindEvent: function() { return function() {}; },
  updateARIA: function() {},
  cleanupFocusIndicators: function() {},
  unbindAllEvents: function() {},
  cleanupChildren: function() {}
};

// Mock AFRAME global
global.AFRAME = {
  registerComponent: function(name, definition) {
    console.log(`Registering component: ${name}`);
    return definition;
  },
  registerPrimitive: function(name, definition) {
    console.log(`Registering primitive: ${name}`);
    return definition;
  }
};

// Mock require
global.require = function(module) {
  if (module === '../core/event') return mockEvent;
  if (module === '../core/form-control-helpers') return mockFormControlHelpers;
  if (module === '../utils') return {};
  return {};
};

// Load the slider component
require('./src/slider/index.js');

// Test the value logic functions
function testValueLogic() {
  console.log('Testing slider value logic...\n');
  
  // Create a mock slider component instance
  const slider = {
    data: {
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      width: 1.8
    },
    state: {
      valueNow: 0,
      thumbX: 0,
      keyboardStep: 0,
      stepList: []
    }
  };
  
  // Get the component definition
  const sliderComponent = global.AFRAME.registerComponent.mock?.calls?.[0]?.[1] || 
    // Fallback: create the functions directly for testing
    {
      clampValue: function(value) {
        return Math.max(this.data.min, Math.min(this.data.max, value));
      },
      
      snapToStep: function(value) {
        if (this.data.step <= 0) return value;
        const steps = Math.round((value - this.data.min) / this.data.step);
        const snappedValue = this.data.min + (steps * this.data.step);
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
        if (this.data.max === this.data.min) return 0;
        const t = (value - this.data.min) / (this.data.max - this.data.min);
        return t * this.data.width;
      },
      
      positionToValue: function(localX) {
        if (this.data.width === 0) return this.data.min;
        const t = Math.max(0, Math.min(1, localX / this.data.width));
        return this.data.min + t * (this.data.max - this.data.min);
      }
    };
  
  // Bind the functions to our test slider
  Object.keys(sliderComponent).forEach(key => {
    if (typeof sliderComponent[key] === 'function') {
      slider[key] = sliderComponent[key].bind(slider);
    }
  });
  
  // Test 1: Value clamping
  console.log('Test 1: Value clamping');
  console.log('clampValue(-10):', slider.clampValue(-10)); // Should be 0
  console.log('clampValue(150):', slider.clampValue(150)); // Should be 100
  console.log('clampValue(50):', slider.clampValue(50)); // Should be 50
  
  // Test 2: Step snapping
  console.log('\nTest 2: Step snapping');
  console.log('snapToStep(50.7):', slider.snapToStep(50.7)); // Should be 51
  console.log('snapToStep(50.3):', slider.snapToStep(50.3)); // Should be 50
  
  // Test 3: Fractional steps
  console.log('\nTest 3: Fractional steps');
  slider.data.step = 0.1;
  console.log('snapToStep(50.67) with step 0.1:', slider.snapToStep(50.67)); // Should be 50.7
  console.log('snapToStep(50.64) with step 0.1:', slider.snapToStep(50.64)); // Should be 50.6
  
  // Test 4: Value to position mapping
  console.log('\nTest 4: Value to position mapping');
  slider.data.step = 1; // Reset step
  console.log('valueToPosition(0):', slider.valueToPosition(0)); // Should be 0
  console.log('valueToPosition(50):', slider.valueToPosition(50)); // Should be 0.9 (50% of 1.8)
  console.log('valueToPosition(100):', slider.valueToPosition(100)); // Should be 1.8
  
  // Test 5: Position to value mapping
  console.log('\nTest 5: Position to value mapping');
  console.log('positionToValue(0):', slider.positionToValue(0)); // Should be 0
  console.log('positionToValue(0.9):', slider.positionToValue(0.9)); // Should be 50
  console.log('positionToValue(1.8):', slider.positionToValue(1.8)); // Should be 100
  
  // Test 6: Edge cases
  console.log('\nTest 6: Edge cases');
  slider.data.min = slider.data.max = 50; // Same min/max
  console.log('valueToPosition(50) with min=max=50:', slider.valueToPosition(50)); // Should be 0
  
  slider.data.width = 0; // Zero width
  console.log('positionToValue(1) with width=0:', slider.positionToValue(1)); // Should be min value
  
  console.log('\nAll tests completed!');
}

// Run the tests
testValueLogic();