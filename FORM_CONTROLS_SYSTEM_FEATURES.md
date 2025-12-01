# Form Controls System: Intended Features

**Analysis Date:** November 3, 2025  
**Sources:** `requirements.md`, `design.md`

---

## Intended Features of Proposed "form-controls" System

Based on the requirements and design documents, the proposed system is meant to provide:

### 1. **Sound Management** (Requirement 7)
**Purpose:** Centralized sound pool to reduce memory footprint

```javascript
// Public API
playSound(soundId: string): void

// Internal
this.sounds = {};  // Shared sound pool
loadSounds(): void  // Load once per scene
```

**Why:** 
- Currently each component creates its own sound elements
- 10 radio buttons = 20 sound elements (2 per component)
- Proposed: 1 sound pool for entire scene = 4 sound elements total (click, disabled for radio/checkbox)
- **Memory reduction: ~90%**

**Requirements Coverage:**
- Req 7.1: Share common sound pool
- Req 7.2: Create sounds once per scene, not per component
- Req 7.3: Preserve shared resources when components destroyed
- Req 7.4: Efficiently manage sound instances

---

### 2. **Event Object Pooling** (Requirement 3.9, 3.10)
**Purpose:** Prevent race conditions and reduce garbage collection

```javascript
// Public API
getEventDetail(type: string): object  // Returns pooled event object

// Internal
this.eventPool = new EventObjectPool(5);  // Circular buffer
```

**Why:**
- A-Frame 1.7.1 best practice: reuse event detail objects
- Reduces GC pressure in VR (critical for frame rate)
- Pool of 5 objects prevents concurrent event conflicts

**Requirements Coverage:**
- Req 3.9: Reuse event detail objects
- Req 3.10: Create reusable objects to minimize GC

---

### 3. **Text Measurement Caching** (Requirement 3.2)
**Purpose:** Efficient 3D text width calculation with caching

```javascript
// Public API
measureText(textComponent: Element): Promise<number>

// Internal
this.textCache = new TextMeasurementCache();
```

**Why:**
- A-Frame text renders as 3D geometry, not 2D pixels
- Need to wait for geometry to render before measuring
- Cache measurements to avoid repeated calculations
- Use A-Frame's geometry APIs (visibleGlyphs, boundingBox)

**Requirements Coverage:**
- Req 3.2: Leverage A-Frame 1.7.1 text component APIs
- Req 3.2: Cache font metrics and text width calculations

---

### 4. **Radio Group Registry** (Requirement 3.3, 3.5-3.8)
**Purpose:** Efficient radio group management with O(1) lookups

```javascript
// Public API
registerRadioGroup(radio: Element): void
getRadioGroup(radio: Element): Element[]
unregisterRadio(radio: Element): void

// Internal
this.radioGroupRegistry = new RadioGroupRegistry(this);
// Uses Map + WeakMap for efficient lookups
```

**Why:**
- Radio buttons need to know their group members to uncheck others
- Currently uses `querySelectorAll()` on every click (slow)
- Proposed: Cache groups with O(1) lookup
- Dynamic group management (add/remove radios at runtime)

**Requirements Coverage:**
- Req 3.3: Use cached DOM queries instead of repeated querySelectorAll
- Req 3.5: Update cache when radios added dynamically
- Req 3.6: Update cache when radios removed
- Req 3.7: Re-register when name attribute changes
- Req 3.8: Check if group cache needs refreshing

---

### 5. **Form ID Management** (Design requirement)
**Purpose:** Hierarchical form identification for radio group scoping

```javascript
// Public API
getFormId(element: Element): string

// Internal
this.formCounter = 0;
this.hasWarnedGlobal = false;
```

**Why:**
- Radio groups scoped by form (not global)
- Auto-generate form IDs if user doesn't provide
- Warn if radio used without form parent
- Stable IDs across re-renders

**Features:**
- User-provided ID: `<a-form id="my-form">` → use "my-form"
- Auto-generated: `<a-form>` → generate "form-0", "form-1", etc.
- No form parent: use "_global_" namespace with warning

---

### 6. **Error Reporting** (Requirement 8)
**Purpose:** Centralized error logging and debugging

```javascript
// Public API
reportError(component: string, error: Error, context: object): void

// Internal  
schema.debugMode: boolean  // Enable verbose logging
```

**Why:**
- Consistent error format across components
- Contextual error information
- Debug mode for development
- Helps with fallback UI decisions

**Requirements Coverage:**
- Req 8.1: Log warnings for invalid configurations
- Req 8.2: Provide helpful warnings
- Req 8.3: Log detailed error information

---

## Complete System API Surface

```javascript
AFRAME.registerSystem('form-controls', {
  schema: {
    soundEnabled: { type: 'boolean', default: true },
    debugMode: { type: 'boolean', default: false }
  },
  
  // === Public API (7 methods) ===
  
  // Sound Management
  playSound(soundId: string): void
  
  // Event Pooling
  getEventDetail(type: string): object
  
  // Text Measurement
  measureText(textComponent: Element): Promise<number>
  measureSync(textComponent: Element): number | null
  
  // Radio Group Management
  registerRadioGroup(radio: Element): void
  getRadioGroup(radio: Element): Element[]
  unregisterRadio(radio: Element): void
  
  // Form ID Management
  getFormId(element: Element): string
  
  // Error Reporting
  reportError(component: string, error: Error, context: object): void
  
  // === Internal State ===
  this.formCounter: number
  this.hasWarnedGlobal: boolean
  this.sounds: object
  this.eventPool: EventObjectPool
  this.textCache: TextMeasurementCache
  this.radioGroupRegistry: RadioGroupRegistry
});
```

---

## Comparison with Existing material-form System

### Existing material-form System

```javascript
// src/core/material-form-system.js
AFRAME.registerSystem('material-form', {
  schema: {
    objects: {default: 'a-form *'},    // Raycaster targets
    enableMouse: {default: true},      // Mouse interaction
    appendMode: {default: true},       // Raycaster append mode
    interval: {default: 0},            // Raycaster interval
    debug: {default: false}            // Debug logging
  },
  
  // === Functionality ===
  init(): void
  log(...args): void
  setupCameraRaycaster(): void
});
```

**Current Responsibilities:**
- ✅ Camera raycaster setup for mouse/VR controller interaction
- ✅ Debug logging
- ✅ Cursor configuration

**Does NOT provide:**
- ❌ Sound management
- ❌ Event pooling
- ❌ Text measurement
- ❌ Radio group registry
- ❌ Form ID management
- ❌ Error reporting

---

## The Question: One System or Two?

### Option A: Two Separate Systems (As Proposed)

```javascript
// Raycaster/interaction concerns
AFRAME.registerSystem('material-form', {
  // Camera, cursor, raycaster setup
});

// Form control resource management
AFRAME.registerSystem('form-controls', {
  // Sounds, events, text, radio groups
});
```

**Pros:**
- Separation of concerns
- material-form handles scene-level interaction
- form-controls handles component-level resources

**Cons:**
- Two systems to maintain
- Components need to access both systems
- Confusing naming (what's the difference?)
- Scene setup: `<a-scene material-form form-controls>`

---

### Option B: Extend Existing System (Recommended)

```javascript
AFRAME.registerSystem('material-form', {
  schema: {
    // EXISTING: Raycaster config
    objects: {default: 'a-form *'},
    enableMouse: {default: true},
    appendMode: {default: true},
    interval: {default: 0},
    debug: {default: false},
    
    // NEW: Resource management
    soundEnabled: {type: 'boolean', default: true}
  },
  
  init: function() {
    // EXISTING: Raycaster setup
    this.setupCameraRaycaster();
    
    // NEW: Resource management
    this.formCounter = 0;
    this.eventPool = new EventObjectPool();
    this.textCache = new TextMeasurementCache();
    this.radioGroupRegistry = new RadioGroupRegistry(this);
    this.loadSounds();
  },
  
  // EXISTING methods
  setupCameraRaycaster(): void
  log(...args): void
  
  // NEW methods
  playSound(soundId): void
  getEventDetail(type): object
  measureText(textComponent): Promise<number>
  registerRadioGroup(radio): void
  getRadioGroup(radio): Element[]
  unregisterRadio(radio): void
  getFormId(element): string
  reportError(component, error, context): void
});
```

**Pros:**
- ✅ Single system for all form-related functionality
- ✅ Backward compatible (existing scenes work)
- ✅ Natural evolution of existing system
- ✅ Simple scene setup: `<a-scene material-form>`
- ✅ Components access one system: `this.el.sceneEl.systems['material-form']`

**Cons:**
- System has multiple responsibilities (but they're all form-related)
- Larger system file (but still under 500 lines)

---

## Responsibilities Matrix

| Responsibility | Belongs To | Rationale |
|----------------|------------|-----------|
| Camera/Raycaster Setup | Scene-level (system) | One per scene, affects all interactive elements |
| Sound Pool | Scene-level (system) | Shared resource, one per scene |
| Event Object Pool | Scene-level (system) | Shared resource for performance |
| Text Measurement Cache | Scene-level (system) | Shared cache, benefits all components |
| Radio Group Registry | Scene-level (system) | Cross-component coordination (radios in same group) |
| Form ID Management | Scene-level (system) | Hierarchical scope management |
| Error Reporting | Scene-level (system) | Centralized logging |
| ARIA Management | Component-level | Per-component state |
| Visual Rendering | Component-level | Per-component visuals |
| Event Handlers | Component-level | Per-component behavior |

**Pattern:** Scene-level shared resources → System, Component-level state/behavior → Component

---

## Recommendation

### ✅ Extend `material-form` System (Don't Create New One)

**Rationale:**

1. **Conceptual Coherence**
   - All features are form-related
   - material-form already handles form interaction (raycaster)
   - Natural to extend with form resource management

2. **Backward Compatibility**
   - Existing scenes using `material-form` continue to work
   - No breaking changes
   - Progressive enhancement

3. **Developer Experience**
   - One system to understand
   - Clear naming: "material-form handles all form concerns"
   - Simple scene setup

4. **Code Organization**
   - System responsibilities are clear
   - No confusion about which system to use
   - Single source of truth

5. **Implementation Simplicity**
   - Add new properties to existing schema
   - Add new methods to existing system
   - Keep existing raycaster setup

### Implementation Path

```javascript
// src/core/material-form-system.js

// 1. Keep existing raycaster functionality (backward compatible)
setupCameraRaycaster() { /* existing code */ }

// 2. Add resource management classes (internal)
const EventObjectPool = require('./event-object-pool');
const TextMeasurementCache = require('./text-measurement-cache');
const RadioGroupRegistry = require('./radio-group-registry');

// 3. Extend init to set up new features
init: function() {
  // Existing
  this.setupCameraRaycaster();
  
  // New
  this.formCounter = 0;
  this.eventPool = new EventObjectPool(5);
  this.textCache = new TextMeasurementCache();
  this.radioGroupRegistry = new RadioGroupRegistry(this);
  if (this.data.soundEnabled) this.loadSounds();
}

// 4. Add new public methods
playSound(soundId) { /* ... */ }
getEventDetail(type) { return this.eventPool.get(type); }
// ... etc
```

---

## Updated Task 1 Recommendation

**Current (Problematic):**
```markdown
- [ ] 1. Set up core infrastructure and shared utilities
  - Create base form control mixin with common functionality
  - Implement form controls system with resource management  ← NEW SYSTEM
```

**Revised (Aligned):**
```markdown
- [ ] 1. Enhance existing material-form system
  - Extend material-form system schema with soundEnabled option
  - Add EventObjectPool, TextMeasurementCache, RadioGroupRegistry classes
  - Integrate resource management into existing system.init()
  - Add public API methods (playSound, getEventDetail, measureText, etc.)
  - Maintain backward compatibility with existing raycaster setup
  - Update system from src/core/material-form-system.js
```

---

## Conclusion

The proposed "form-controls" system has clear, valuable features:

1. ✅ **Sound Management** - Reduces memory by 90%
2. ✅ **Event Pooling** - VR performance optimization
3. ✅ **Text Measurement** - 3D-specific text handling
4. ✅ **Radio Group Registry** - Performance optimization
5. ✅ **Form ID Management** - Hierarchical scoping
6. ✅ **Error Reporting** - Better debugging

**However:** These features should be **added to the existing material-form system**, not created as a separate competing system.

**Benefits of Extension Approach:**
- Backward compatible
- Conceptually coherent
- Better developer experience
- Maintains single source of truth
- Simpler implementation

**Next Step:** Revise tasks.md to extend `material-form` instead of creating `form-controls`.
