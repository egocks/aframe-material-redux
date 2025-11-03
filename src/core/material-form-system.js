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
      this.observeFormChildren();
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
    this.log('Camera raycaster objects =', camEl.getAttribute('raycaster').objects);
  },

  refreshRaycasters: function () {
    const sceneEl = this.sceneEl;
    const camEl = (sceneEl.camera && sceneEl.camera.el) || sceneEl.querySelector('a-camera');
    if (camEl && camEl.components && camEl.components.raycaster && camEl.components.raycaster.refreshObjects) {
      camEl.components.raycaster.refreshObjects();
      this.log('Refreshed camera raycaster objects');
    }
  },

  observeFormChildren: function () {
    const sceneEl = this.sceneEl;
    const update = () => this.refreshRaycasters();

    // Initial hook for existing forms
    sceneEl.querySelectorAll('a-form').forEach(formEl => {
      formEl.addEventListener('child-attached', update);
      formEl.addEventListener('child-detached', update);
    });

    // Observe future a-form additions
    sceneEl.addEventListener('child-attached', (e) => {
      if (!e.detail || !e.detail.el) return;
      const el = e.detail.el;
      if (el.tagName && el.tagName.toLowerCase() === 'a-form') {
        el.addEventListener('child-attached', update);
        el.addEventListener('child-detached', update);
        this.log('Observed new a-form');
        this.refreshRaycasters();
      }
    });
  }
});
