AFRAME.registerSystem('material-form', {
  schema: {
    objects: {default: 'a-form *'},
    enableMouse: {default: true},
    appendMode: {default: true},
    interval: {default: 0},
    debug: {default: false}
  },

  init: function () {
    const sceneEl = this.sceneEl;
    const onSceneLoaded = () => {
      this.setupCameraRaycaster();
      this.log('Material-form system initialized');
    };
    if (sceneEl.hasLoaded) onSceneLoaded(); else sceneEl.addEventListener('loaded', onSceneLoaded);
  },

  log: function (...args) { if (this.data.debug) { console.log('[material-form]', ...args); } },

  setupCameraRaycaster: function () {
    if (!this.data.enableMouse) return;
    const sceneEl = this.sceneEl;
    const camEl = (sceneEl.camera && sceneEl.camera.el) || sceneEl.querySelector('a-camera');
    if (!camEl) { this.log('No camera found to attach cursor/raycaster'); return; }

    // Ensure cursor
    const cursor = camEl.getAttribute('cursor') || {};
    if (!cursor || !cursor.rayOrigin) camEl.setAttribute('cursor', Object.assign({}, cursor, {rayOrigin: 'mouse'}));

    // Ensure raycaster
    const rc = camEl.getAttribute('raycaster') || {};
    const wantObjects = this.data.objects;
    let newObjects = wantObjects;
    if (this.data.appendMode && rc.objects && rc.objects.length) {
      // Append if not already present
      if (rc.objects.indexOf(wantObjects) === -1) {
        newObjects = rc.objects + ', ' + wantObjects;
      } else {
        newObjects = rc.objects;
      }
    }
    camEl.setAttribute('raycaster', Object.assign({}, rc, {objects: newObjects, interval: this.data.interval}));
    this.log('Camera raycaster configured with objects:', newObjects);
  }
});
