/**
 * Accessibility Test Suite for Radio and Checkbox Components
 * Tests Requirements 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9, 4.10
 */

function testAccessibilityFeatures() {
  console.log('🔍 Starting Accessibility Tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function addTest(name, passed, details) {
    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}: ${details}`);
    }
  }
  
  // Test 1: ARIA Attributes (Requirements 4.1, 4.2)
  const radio = document.querySelector('a-radio');
  const checkbox = document.querySelector('a-checkbox');
  
  if (radio) {
    const hasRole = radio.getAttribute('role') === 'radio';
    const hasAriaChecked = radio.hasAttribute('aria-checked');
    const hasAriaDisabled = radio.hasAttribute('aria-disabled');
    const hasTabindex = radio.hasAttribute('tabindex');
    
    addTest('Radio ARIA Attributes', 
      hasRole && hasAriaChecked && hasAriaDisabled && hasTabindex,
      `role: ${hasRole}, aria-checked: ${hasAriaChecked}, aria-disabled: ${hasAriaDisabled}, tabindex: ${hasTabindex}`
    );
  }
  
  if (checkbox) {
    const hasRole = checkbox.getAttribute('role') === 'checkbox';
    const hasAriaChecked = checkbox.hasAttribute('aria-checked');
    const hasAriaDisabled = checkbox.hasAttribute('aria-disabled');
    const hasTabindex = checkbox.hasAttribute('tabindex');
    
    addTest('Checkbox ARIA Attributes',
      hasRole && hasAriaChecked && hasAriaDisabled && hasTabindex,
      `role: ${hasRole}, aria-checked: ${hasAriaChecked}, aria-disabled: ${hasAriaDisabled}, tabindex: ${hasTabindex}`
    );
  }
  
  // Test 2: Focus Indicators (Requirements 4.7, 4.8, 4.9, 4.10)
  function testFocusIndicator(element, type) {
    return new Promise((resolve) => {
      if (!element) {
        resolve(false);
        return;
      }
      
      // Focus the element
      element.focus();
      
      setTimeout(() => {
        // Check if focus indicator was created
        const focusIndicator = element.querySelector('a-ring');
        const hasFocusIndicator = focusIndicator !== null;
        
        if (hasFocusIndicator) {
          // Check indicator properties
          const material = focusIndicator.getAttribute('material');
          const hasHighContrast = material && material.color === '#0066cc';
          const hasAnimation = focusIndicator.hasAttribute('animation__pulse');
          
          addTest(`${type} Focus Indicator Creation`,
            hasFocusIndicator && hasHighContrast && hasAnimation,
            `indicator: ${hasFocusIndicator}, contrast: ${hasHighContrast}, animation: ${hasAnimation}`
          );
        } else {
          addTest(`${type} Focus Indicator Creation`, false, 'No focus indicator found');
        }
        
        // Test blur
        element.blur();
        
        setTimeout(() => {
          const indicatorAfterBlur = element.querySelector('a-ring');
          addTest(`${type} Focus Indicator Cleanup`, 
            indicatorAfterBlur === null,
            `indicator removed: ${indicatorAfterBlur === null}`
          );
          resolve(true);
        }, 250); // Wait for blur animation
        
      }, 250); // Wait for focus animation
    });
  }
  
  // Test 3: Keyboard Navigation (Requirements 4.3, 4.4)
  function testKeyboardNavigation() {
    return new Promise((resolve) => {
      if (!radio || !checkbox) {
        resolve(false);
        return;
      }
      
      // Test Space key activation
      radio.focus();
      const initialChecked = radio.getAttribute('checked') === 'true';
      
      // Simulate Space key press
      const spaceEvent = new KeyboardEvent('keydown', {
        code: 'Space',
        key: ' ',
        bubbles: true
      });
      
      radio.dispatchEvent(spaceEvent);
      
      setTimeout(() => {
        const afterSpaceChecked = radio.getAttribute('checked') === 'true';
        addTest('Space Key Activation',
          afterSpaceChecked !== initialChecked || afterSpaceChecked === true,
          `initial: ${initialChecked}, after: ${afterSpaceChecked}`
        );
        
        // Test Enter key activation on checkbox
        checkbox.focus();
        const initialCheckboxChecked = checkbox.getAttribute('checked') === 'true';
        
        const enterEvent = new KeyboardEvent('keydown', {
          code: 'Enter',
          key: 'Enter',
          bubbles: true
        });
        
        checkbox.dispatchEvent(enterEvent);
        
        setTimeout(() => {
          const afterEnterChecked = checkbox.getAttribute('checked') === 'true';
          addTest('Enter Key Activation',
            afterEnterChecked !== initialCheckboxChecked,
            `initial: ${initialCheckboxChecked}, after: ${afterEnterChecked}`
          );
          resolve(true);
        }, 100);
      }, 100);
    });
  }
  
  // Test 4: Radio Group Navigation (Requirement 4.4)
  function testRadioGroupNavigation() {
    return new Promise((resolve) => {
      const radios = document.querySelectorAll('a-radio');
      if (radios.length < 2) {
        addTest('Radio Group Navigation', false, 'Need at least 2 radios for group navigation test');
        resolve(false);
        return;
      }
      
      // Focus first radio
      radios[0].focus();
      
      // Simulate Arrow Down key
      const arrowEvent = new KeyboardEvent('keydown', {
        code: 'ArrowDown',
        key: 'ArrowDown',
        bubbles: true
      });
      
      radios[0].dispatchEvent(arrowEvent);
      
      setTimeout(() => {
        const focusedElement = document.activeElement;
        const movedToNextRadio = focusedElement === radios[1] || 
                                (focusedElement && focusedElement.tagName === 'A-RADIO' && focusedElement !== radios[0]);
        
        addTest('Radio Group Arrow Navigation',
          movedToNextRadio,
          `focused element: ${focusedElement ? focusedElement.tagName : 'none'}`
        );
        resolve(true);
      }, 100);
    });
  }
  
  // Test 5: VR Gaze Indicators (Requirement 4.8)
  function testVRGazeIndicators() {
    return new Promise((resolve) => {
      if (!radio) {
        resolve(false);
        return;
      }
      
      // Simulate mouse enter (gaze enter in VR)
      const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
      radio.dispatchEvent(mouseEnterEvent);
      
      setTimeout(() => {
        // Look for gaze indicator (should be different from focus indicator)
        const indicators = radio.querySelectorAll('a-ring');
        const hasGazeIndicator = indicators.length > 0;
        
        addTest('VR Gaze Indicator',
          hasGazeIndicator,
          `indicators found: ${indicators.length}`
        );
        
        // Test gaze leave
        const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
        radio.dispatchEvent(mouseLeaveEvent);
        
        setTimeout(() => {
          const indicatorsAfterLeave = radio.querySelectorAll('a-ring');
          addTest('VR Gaze Indicator Cleanup',
            indicatorsAfterLeave.length === 0,
            `indicators after leave: ${indicatorsAfterLeave.length}`
          );
          resolve(true);
        }, 100);
      }, 100);
    });
  }
  
  // Run all tests sequentially
  async function runAllTests() {
    await testFocusIndicator(radio, 'Radio');
    await testFocusIndicator(checkbox, 'Checkbox');
    await testKeyboardNavigation();
    await testRadioGroupNavigation();
    await testVRGazeIndicators();
    
    // Print summary
    console.log('\n📊 Accessibility Test Results:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests.filter(t => !t.passed).forEach(test => {
        console.log(`  - ${test.name}: ${test.details}`);
      });
    }
    
    return results;
  }
  
  return runAllTests();
}

// Test contrast ratio calculation (Requirement 4.7)
function testContrastRatio() {
  console.log('🎨 Testing Focus Indicator Contrast Ratio...');
  
  // Test color #0066cc against white background
  const focusColor = '#0066cc';
  const backgroundColor = '#ffffff';
  
  // Simple contrast ratio calculation (simplified for demo)
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  function getContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }
  
  const contrastRatio = getContrastRatio(focusColor, backgroundColor);
  const meetsWCAG = contrastRatio >= 3.0; // WCAG AA requirement for focus indicators
  
  console.log(`Focus color: ${focusColor}`);
  console.log(`Background color: ${backgroundColor}`);
  console.log(`Contrast ratio: ${contrastRatio.toFixed(2)}:1`);
  console.log(`Meets WCAG AA (3:1): ${meetsWCAG ? '✅' : '❌'}`);
  
  return { contrastRatio, meetsWCAG };
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.testAccessibilityFeatures = testAccessibilityFeatures;
  window.testContrastRatio = testContrastRatio;
}