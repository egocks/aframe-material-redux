const Utils = require('../utils');

// Internal catalog of library assets. Paths are tails; we prefix with AFRAME.ASSETS_PATH at runtime.
const CATALOG = {
  radio: [
    { type: 'audio', id: 'aframeRadioClick', path: '/sounds/InputClick.mp3' },
    { type: 'audio', id: 'aframeRadioClickDisabled', path: '/sounds/ButtonClickDisabled.mp3' }
  ],
  checkbox: [
    { type: 'img', id: 'aframeCheckboxMark', path: '/images/CheckmarkIcon.png' },
    { type: 'audio', id: 'aframeCheckboxClick', path: '/sounds/InputClick.mp3' },
    { type: 'audio', id: 'aframeCheckboxClickDisabled', path: '/sounds/ButtonClickDisabled.mp3' }
  ],
  button: [
    { type: 'img', id: 'aframeButtonShadow', path: '/images/ButtonShadow.png' },
    { type: 'audio', id: 'aframeButtonClick', path: '/sounds/ButtonClick.mp3' },
    { type: 'audio', id: 'aframeButtonClickDisabled', path: '/sounds/ButtonClickDisabled.mp3' }
  ],
  switch: [
    { type: 'img', id: 'aframeSwitchShadow', path: '/images/SwitchShadow.png' },
    { type: 'audio', id: 'aframeSwitchClick', path: '/sounds/InputClick.mp3' },
    { type: 'audio', id: 'aframeSwitchClickDisabled', path: '/sounds/ButtonClickDisabled.mp3' }
  ],
  toast: [
    { type: 'audio', id: 'aframeToastShow', path: '/sounds/ToastShow.mp3' }
  ],
  keyboard: [
    { type: 'img', id: 'aframeKeyboardShift', path: '/images/ShiftIcon.png' },
    { type: 'img', id: 'aframeKeyboardShiftActive', path: '/images/ShiftActiveIcon.png' },
    { type: 'img', id: 'aframeKeyboardGlobal', path: '/images/GlobalIcon.png' },
    { type: 'img', id: 'aframeKeyboardBackspace', path: '/images/BackspaceIcon.png' },
    { type: 'img', id: 'aframeKeyboardEnter', path: '/images/EnterIcon.png' },
    { type: 'img', id: 'aframeKeyboardDismiss', path: '/images/DismissIcon.png' },
    { type: 'img', id: 'aframeKeyboardShadow', path: '/images/KeyShadow.png' },
    { type: 'audio', id: 'aframeKeyboardKeyIn', path: '/sounds/KeyIn.mp3' },
    { type: 'audio', id: 'aframeKeyboardKeyDown', path: '/sounds/KeyDown.mp3' }
  ]
};

const AssetsRegistry = {
  ensured: false,
  ensuredFeatures: new Set(),

  ensure(features) {
    if (!features || !features.length) return;
    // Default assets path if not set
    if (typeof AFRAME !== 'undefined' && !AFRAME.ASSETS_PATH) {
      AFRAME.ASSETS_PATH = './assets';
    }

    // Build a deduped list by id
    const all = [];
    const ids = new Set();
    features.forEach((f) => {
      const list = CATALOG[f] || [];
      list.forEach((item) => {
        if (!item || !item.id || ids.has(item.id)) return;
        ids.add(item.id);
        // Compose src at runtime using current ASSETS_PATH
        const src = ((typeof AFRAME !== 'undefined' && AFRAME.ASSETS_PATH) ? AFRAME.ASSETS_PATH : './assets') + item.path;
        all.push({ type: item.type, id: item.id, src });
      });
      this.ensuredFeatures.add(f);
    });

    if (all.length) {
      Utils.preloadAssets(all);
    }
  },

  ensureAll() {
    this.ensure(Object.keys(CATALOG));
    this.ensured = true;
  }
};

module.exports = AssetsRegistry;
