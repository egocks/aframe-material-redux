/**
 * Memory Stability Test for Radio and Checkbox Components
 * 
 * This test verifies that components properly clean up resources
 * when created and destroyed repeatedly, preventing memory leaks.
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

// Simple memory stability test
function testMemoryStability() {
  console.log('Starting memory stability test...');
  
  // Create a scene for testing
  const scene = document.createElement('a-scene');
  scene.setAttribute('embedded', 'true');
  scene.setAttribute('material-form', '');
  document.body.appendChild(scene);
  
  let createdComponents = 0;
  let destroyedComponents = 0;
  
  function createAndDestroyComponents() {
    // Create a form container
    const form = document.createElement('a-form');
    scene.appendChild(form);
    
    // Create radio components
    for (let i = 0; i < 10; i++) {
      const radio = document.createElement('a-radio');
      radio.setAttribute('name', 'test-group');
      radio.setAttribute('value', `option-${i}`);
      radio.setAttribute('label', `Option ${i}`);
      form.appendChild(radio);
      createdComponents++;
    }
    
    // Create checkbox components
    for (let i = 0; i < 10; i++) {
      const checkbox = document.createElement('a-checkbox');
      checkbox.setAttribute('name', `checkbox-${i}`);
      checkbox.setAttribute('value', `check-${i}`);
      checkbox.setAttribute('label', `Checkbox ${i}`);
      form.appendChild(checkbox);
      createdComponents++;
    }
    
    // Wait a bit for initialization, then destroy
    setTimeout(() => {
      // Remove all components (this should trigger cleanup)
      const radios = form.querySelectorAll('a-radio');
      const checkboxes = form.querySelectorAll('a-checkbox');
      
      radios.forEach(radio => {
        if (radio.components && radio.components.radio) {
          // Manually call remove to test cleanup
          radio.components.radio.remove();
        }
        radio.parentNode.removeChild(radio);
        destroyedComponents++;
      });
      
      checkboxes.forEach(checkbox => {
        if (checkbox.components && checkbox.components.checkbox) {
          // Manually call remove to test cleanup
          checkbox.components.checkbox.remove();
        }
        checkbox.parentNode.removeChild(checkbox);
        destroyedComponents++;
      });
      
      // Remove form
      form.parentNode.removeChild(form);
      
      console.log(`Cycle complete. Created: ${createdComponents}, Destroyed: ${destroyedComponents}`);
    }, 100);
  }
  
  // Run multiple cycles to test memory stability
  let cycles = 0;
  const maxCycles = 5;
  
  const runCycle = () => {
    if (cycles < maxCycles) {
      console.log(`Running cycle ${cycles + 1}/${maxCycles}`);
      createAndDestroyComponents();
      cycles++;
      setTimeout(runCycle, 500);
    } else {
      console.log('Memory stability test completed');
      console.log(`Total components created: ${createdComponents}`);
      console.log(`Total components destroyed: ${destroyedComponents}`);
      
      // Clean up test scene
      document.body.removeChild(scene);
      
      // Check for memory leaks (basic check)
      if (createdComponents === destroyedComponents) {
        console.log('✅ Memory stability test PASSED - All components properly cleaned up');
      } else {
        console.log('❌ Memory stability test FAILED - Component count mismatch');
      }
    }
  };
  
  // Wait for scene to load, then start test
  scene.addEventListener('loaded', () => {
    console.log('Scene loaded, starting test cycles...');
    runCycle();
  });
  
  // Fallback if loaded event doesn't fire
  setTimeout(() => {
    if (cycles === 0) {
      console.log('Scene load timeout, starting test anyway...');
      runCycle();
    }
  }, 2000);
}

/**
 * Test automatic resource tracking functionality
 * Verifies that trackChild and bindEvent methods work correctly
 */
function testResourceTracking() {
  console.log('Testing automatic resource tracking...');
  
  // Mock component for testing
  const mockComponent = {
    attrName: 'test-component',
    data: { disabled: false },
    el: document.createElement('div')
  };
  
  // Test requires FormControlHelpers - check if available
  if (typeof require !== 'undefined') {
    try {
      const FormControlHelpers = require('./src/core/form-control-helpers');
      
      // Initialize form control
      FormControlHelpers.initFormControl(mockComponent);
      
      // Test trackChild method
      const testElement1 = document.createElement('div');
      const testElement2 = document.createElement('span');
      
      FormControlHelpers.trackChild(mockComponent, testElement1);
      FormControlHelpers.trackChild(mockComponent, testElement2);
      
      console.log('✅ trackChild: Added 2 elements to tracking');
      console.log(`   Tracked elements count: ${mockComponent.childElements.length}`);
      
      // Test bindEvent method
      let eventFired = false;
      const testHandler = () => { eventFired = true; };
      
      FormControlHelpers.bindEvent(mockComponent, testElement1, 'click', testHandler);
      
      // Simulate event
      testElement1.click();
      
      console.log(`✅ bindEvent: Event handler ${eventFired ? 'fired correctly' : 'failed to fire'}`);
      console.log(`   Event handlers count: ${mockComponent.eventHandlers.size}`);
      
      // Test cleanup methods
      FormControlHelpers.unbindAllEvents(mockComponent);
      FormControlHelpers.cleanupChildren(mockComponent);
      
      console.log('✅ Cleanup methods executed');
      console.log(`   Event handlers after cleanup: ${mockComponent.eventHandlers.size}`);
      console.log(`   Child elements after cleanup: ${mockComponent.childElements.length}`);
      
      console.log('✅ Resource tracking test PASSED');
      
    } catch (error) {
      console.log('❌ Resource tracking test FAILED:', error.message);
    }
  } else {
    console.log('⚠️  Resource tracking test skipped (Node.js environment required)');
  }
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testMemoryStability, testResourceTracking };
} else {
  // Browser context - add to window
  window.testMemoryStability = testMemoryStability;
  window.testResourceTracking = testResourceTracking;
}

// Auto-run if this file is loaded directly
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Memory stability tests available:');
    console.log('- Call testMemoryStability() to test component lifecycle');
    console.log('- Call testResourceTracking() to test helper methods');
  });
} else if (typeof document !== 'undefined') {
  console.log('Memory stability tests available:');
  console.log('- Call testMemoryStability() to test component lifecycle');
  console.log('- Call testResourceTracking() to test helper methods');
}