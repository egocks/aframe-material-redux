# Implementation Plan

## Overview

This implementation plan converts the radio and checkbox improvements design into a series of discrete, manageable coding tasks. Each task builds incrementally on previous work and includes specific requirements references and implementation details.

## Task List

- [x] 1. Set up core infrastructure and shared utilities
  - [x] 1.1 Create FormManager class (non A-Frame)
    - Implement FormManager class in src/core/form-manager.js
    - Include EventObjectPool, TextMeasurementCache, RadioGroupRegistry, sound pool management
    - Provide methods: playSound, getEventDetail, measureText, radio group management, form ID management
    - Keep class independent of A-Frame (pure JavaScript for testability)
    - _Requirements: 2.1, 2.2, 3.9, 3.10, 7.1-7.4_
  
  - [x] 1.2 Extend existing material-form system via composition
    - Update src/core/material-form-system.js to instantiate FormManager
    - Add schema properties: soundEnabled (boolean, default true)
    - Keep existing raycaster setup (backward compatibility)
    - Delegate resource management to FormManager instance
    - Expose FormManager methods as system public API
    - _Requirements: 2.1, 2.2, 8.1, 8.3_
  
  - [x] 1.3 Enhance existing Utils module
    - Add Utils.validateColor() for color validation
    - Add Utils.validateSize() for size validation  
    - Enhance Utils.measureTextWidth() with modern A-Frame geometry APIs
    - Keep existing Utils.updateOpacity(), Utils.getWidthFactor() for backward compatibility
    - Document which Utils functions to use for common tasks
    - _Requirements: 3.2, 8.1_
  
  - [x] 1.4 Create form-control-helpers.js for component utilities
    - Implement component-specific helper functions that USE Utils (don't duplicate)
    - Include: bindEvent tracking, trackChild management, updateARIA logic
    - Export as module for use by radio/checkbox components
    - Ensure helpers call Utils functions rather than reimplementing
    - _Requirements: 2.1, 4.1, 4.2_

- [x] 2. Implement event object pooling system
  - [x] 2.1 Create circular buffer event pool to prevent race conditions
    - Implement EventObjectPool class with 5-object circular buffers
    - Add change, error, and focus event object types
    - Include timestamp and rotation logic for concurrent event handling
    - _Requirements: 3.9, 3.10_

  - [x] 2.2 Integrate event pooling into form controls system
    - Add event pool instance to form-controls system
    - Create helper methods for getting pooled event objects
    - Update system initialization to include event pool setup
    - _Requirements: 3.9, 3.10_

- [x] 3. Enhance text measurement (via Utils and FormManager)
  - [x] 3.1 Enhance Utils.measureTextWidth with modern A-Frame APIs
    - Update src/utils.js to add async measureTextWidth() method
    - Use geometry.visibleGlyphs (troika-text) as primary method
    - Keep existing Utils.getWidthFactor() as fallback for compatibility
    - Return Promise<number> for async geometry measurement
    - _Requirements: 3.2_

  - [x] 3.2 Add TextMeasurementCache to FormManager
    - Create TextMeasurementCache class in FormManager
    - Cache results from Utils.measureTextWidth() to avoid repeated calculations
    - Provide sync and async measurement methods
    - Track cache hits/misses for performance monitoring
    - Expose via material-form system API
    - _Requirements: 3.2_

- [x] 4. Implement radio group registry with form ID management
  - [x] 4.1 Create radio group registry with hierarchical form IDs
    - Implement RadioGroupRegistry class with nested Map structure
    - Add WeakMap for O(1) radio-to-group lookups
    - Include automatic cleanup of empty groups
    - _Requirements: 3.3, 3.5, 3.6, 3.7, 3.8_

  - [x] 4.2 Add form ID management strategy
    - Implement getFormId method with user ID preference
    - Add auto-generation fallback with stable IDs
    - Include global namespace handling with warnings
    - _Requirements: 3.5, 3.6, 3.7, 3.8_

- [x] 5. Fix critical bugs in existing components
  - [x] 5.1 Fix checkbox SFX asset references
    - Update src/checkbox/sfx.js line 12: change key to 'aframeCheckboxClickDisabledSound'
    - Update src/checkbox/sfx.js line 14: change src to '#aframeCheckboxClickDisabled'
    - Update src/checkbox/sfx.js line 27: fix query selector for new key name
    - Test disabled sound playback in both VR and desktop modes
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 5.2 Fix disabled state color bug
    - Remove incorrect color resets in disabled() method for both components
    - Ensure disabled checked controls maintain checked color with reduced opacity
    - Update disabled state logic to preserve visual state consistency
    - Test disabled state transitions and color preservation
    - _Requirements: 1.4, 1.5, 1.6, 5.1_

- [x] 6. Implement memory leak prevention
  - [x] 6.1 Add comprehensive component cleanup
    - Implement remove() lifecycle method for both radio and checkbox
    - Add event listener tracking and automatic unbinding
    - Include child element cleanup and reference clearing
    - Add sound element cleanup for component-specific sounds
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 6.2 Create automatic resource tracking
    - Implement trackChild method for DOM element management
    - Add bindEvent method for automatic event listener tracking
    - Include cleanupChildren and unbindAllEvents methods
    - Test memory stability with repeated component creation/destruction
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7. Eliminate performance anti-patterns
  - [x] 7.1 Remove setInterval polling patterns
    - Replace setInterval polling with component lifecycle events
    - Implement event-driven opacity updates using 'loaded' events
    - Add requestAnimationFrame fallback for single-check scenarios
    - Remove setTimeout wrappers that add unnecessary event loop overhead
    - _Requirements: 3.1, 3.11, 3.12, 3.13_

  - [x] 7.2 Optimize text width calculation
    - Replace recursive text trimming with efficient algorithms
    - Implement binary search approach for text fitting
    - Use hierarchical text measurement (A-Frame API → fallback)
    - Cache font metrics and text width calculations
    - _Requirements: 3.2_

  - [x] 7.3 Remove empty lifecycle methods
    - Delete empty tick(), pause(), and play() methods from both components
    - Verify components function correctly without empty methods
    - Ensure no A-Frame errors occur after removal
    - _Requirements: 3.4_

- [x] 8. Implement comprehensive accessibility support
  - [x] 8.1 Add ARIA attributes and keyboard navigation
    - Implement updateARIA method with specific attribute requirements
    - Add role, aria-checked, aria-disabled, aria-label attributes
    - Include dynamic ARIA attribute updates on state changes
    - Add tabindex management based on disabled state
    - _Requirements: 4.1, 4.2, 4.6_

  - [x] 8.2 Implement keyboard interaction handlers
    - Add Space and Enter key activation for focused controls
    - Implement arrow key navigation for radio groups
    - Include focus management and visual focus indicators
    - Add keyboard event binding with proper cleanup
    - _Requirements: 4.3, 4.4, 4.7, 4.8, 4.9, 4.10_

  - [x] 8.3 Add visible focus indicators
    - Implement focus indicator display with 3:1 contrast ratio
    - Add VR controller gaze-based focus indication
    - Include focus state transitions and cleanup
    - Test focus indicators across different viewing angles
    - _Requirements: 4.7, 4.8, 4.9, 4.10_

- [-] 9. Add configurable dimensions and styling
  - [x] 9.1 Implement size and spacing configuration
    - Add size, labelOffset, and disabledOpacity schema properties
    - Update visual element creation to use configurable dimensions
    - Scale hit detection areas proportionally with size changes
    - Include label positioning based on labelOffset configuration
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 9.2 Add hover state support
    - Implement mouseenter and mouseleave event handlers
    - Add subtle visual feedback for enabled controls
    - Include smooth transitions using A-Frame animation
    - Ensure hover states work correctly in VR environments
    - _Requirements: 5.2_

- [ ] 10. Refactor ALL components to use system-level sound management
  - [ ] 10.1 Implement centralized sound pool in FormManager
    - Create SoundPool class in FormManager with scene-level sound elements
    - Load all component sounds once per scene (button, switch, toast, radio, checkbox)
    - Implement playSound(soundId) method with sound instance pooling
    - Add sound cleanup that preserves shared resources when components destroyed
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 10.2 Refactor button component to use system sound pool
    - Update src/button/index.js to access system.playSound()
    - Remove component-specific sound creation from src/button/sfx.js
    - Keep src/button/assets.js for asset definitions
    - Update button remove() to not cleanup sounds (system manages them)
    - Test button sound playback using shared pool
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 10.3 Refactor switch component to use system sound pool
    - Update src/switch/index.js to access system.playSound()
    - Remove component-specific sound creation from src/switch/sfx.js
    - Keep src/switch/assets.js for asset definitions
    - Update switch remove() to not cleanup sounds
    - Test switch sound playback using shared pool
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 10.4 Refactor toast component to use system sound pool
    - Update src/toast/index.js to access system.playSound() if applicable
    - Remove component-specific sound creation from src/toast/sfx.js
    - Keep src/toast/assets.js for asset definitions
    - Update toast remove() to not cleanup sounds
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 10.5 Refactor radio component to use system sound pool
    - Update src/radio/index.js to access system.playSound()
    - Remove component-specific sound creation from src/radio/sfx.js
    - Keep src/radio/assets.js for asset definitions
    - Update radio remove() to not cleanup sounds
    - Test radio sound playback using shared pool
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 10.6 Refactor checkbox component to use system sound pool
    - Update src/checkbox/index.js to access system.playSound()
    - Fix asset references (aframeCheckboxClickDisabledSound) in migration
    - Remove component-specific sound creation from src/checkbox/sfx.js
    - Keep src/checkbox/assets.js for asset definitions
    - Update checkbox remove() to not cleanup sounds
    - Test checkbox sound playback using shared pool
    - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3, 7.4_

- [ ] 11. Add comprehensive error handling
  - [ ] 11.1 Implement configuration validation
    - Add validateConfiguration method with color and size validation
    - Include helpful warning messages for invalid configurations
    - Implement fallback values for invalid inputs
    - Add radio group validation with form parent warnings
    - _Requirements: 8.1, 8.2_

  - [ ] 11.2 Create fallback UI system
    - Implement createFallbackUI method for initialization failures
    - Add simplified text-only representation with basic interaction
    - Include error indicator display in development mode
    - Add error event emission for parent component handling
    - _Requirements: 8.3_

- [ ] 12. Ensure backward compatibility
  - [ ] 12.1 Maintain existing attribute support
    - Verify all existing attributes continue to work unchanged
    - Test existing HTML markup compatibility
    - Add deprecation warnings for legacy patterns where appropriate
    - Create migration examples for new features
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 12.2 Create migration documentation
    - Document attribute changes and new features
    - Provide clear upgrade path examples
    - Include before/after code samples
    - Add troubleshooting guide for common migration issues
    - _Requirements: 9.4_

- [ ] 13. Implement VR-specific accessibility features
  - [ ] 13.1 Add VR controller support
    - Implement trigger and grip button activation
    - Add gaze-based selection with dwell-time option
    - Include hand tracking gesture support (pinch activation)
    - Test controller interactions across different VR platforms
    - _Requirements: 11.1, 11.2, 11.5_

  - [ ] 13.2 Optimize for VR viewing distances
    - Implement size scaling based on viewing distance
    - Add label billboarding consideration for different angles
    - Include spatial audio positioning for audio feedback
    - Test readability and interaction at 1-5m distances
    - _Requirements: 11.3, 11.4, 11.6_

- [ ] 14. Create comprehensive test suite
  - [ ] 14.1 Implement unit tests for core functionality
    - Create Jest-based tests for component initialization
    - Add tests for state changes, event emissions, and cleanup
    - Include ARIA attribute validation and keyboard interaction tests
    - Test memory leak prevention and performance optimizations
    - _Requirements: 10.1, 10.2_

  - [ ] 14.2 Add cross-platform integration tests
    - Test across desktop browsers (Chrome, Firefox, Safari)
    - Add mobile browser testing (iOS Safari, Chrome Mobile)
    - Include VR browser testing (Oculus Browser, Wolvic, Firefox Reality)
    - Test on VR headsets (Meta Quest 2/3, PSVR2, PC VR)
    - _Requirements: 10.6, 10.7_

  - [ ] 14.3 Implement accessibility and performance testing
    - Add screen reader testing (NVDA, JAWS, VoiceOver)
    - Include keyboard-only navigation testing
    - Test controller-based interactions and gaze selection
    - Verify 72+ FPS performance on Quest 2 hardware
    - _Requirements: 10.3, 10.7, 10.8_

- [ ] 15. Add comprehensive documentation
  - [ ] 15.1 Create JSDoc documentation
    - Add comprehensive JSDoc comments for all public methods
    - Include usage examples and parameter descriptions
    - Document component schemas and event emissions
    - Add troubleshooting and configuration guides
    - _Requirements: 10.2_

  - [ ] 15.2 Create developer guides and examples
    - Write component usage examples and best practices
    - Create VR-specific implementation guides
    - Add performance optimization recommendations
    - Include accessibility implementation examples
    - _Requirements: 10.2_

## Implementation Notes

### Task Dependencies
- Task 1 establishes core infrastructure (FormManager, enhanced Utils, material-form extension) - MUST complete first
- Tasks 2-4 build on FormManager (event pooling, text cache, radio registry)
- Tasks 5-7 address critical bugs and performance issues (can proceed in parallel with 1-4)
- Tasks 8-9 add accessibility and configuration features
- Task 10 refactors ALL components to system-level sounds (breaking change, coordinate with team)
- Tasks 11-13 implement error handling and VR optimizations
- Tasks 14-15 provide testing and documentation

### Architecture Notes
- FormManager is a pure JavaScript class (not an A-Frame system) for better testability
- material-form system uses FormManager via composition (system delegates to FormManager instance)
- Utils module is the primary location for shared utility functions
- All components (button, switch, toast, radio, checkbox) will use system-level sound pool
- Backward compatibility maintained: existing material-form raycaster setup unchanged

### Testing Strategy
- Each task should include unit tests for new functionality
- Integration tests should be added for cross-component features
- Performance benchmarks should be established before optimization tasks
- Accessibility testing should be performed with actual assistive technologies

### Performance Targets
- Maintain 72+ FPS on Quest 2 hardware during form interactions
- Reduce memory usage by 90% through proper cleanup and resource sharing
- Eliminate setInterval usage and minimize setTimeout overhead
- Achieve sub-100ms component initialization times

### Compatibility Requirements
- All existing attributes and APIs must continue to work
- New features should be opt-in to avoid breaking changes
- Clear migration path should be provided for deprecated patterns
- Support A-Frame 1.7.1+ while maintaining backward compatibility