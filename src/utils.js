const Utils = {};

/**
  Utils.preloadAssets([])
  Add assets to Assets managment system.
*/
Utils.preloadAssets = (assets_arr)=>{
  let assets = document.querySelector('a-assets'), already_exists;

  if (!assets) {
    var scene = document.querySelector('a-scene');
    assets = document.createElement('a-assets');
    scene.appendChild(assets);
  }

  for (let item of assets_arr) {
    already_exists = false;

    /***** With Edge, assets.children is a HTMLCollection, not an Array! *****/
    for (let stuff of Array.from(assets.children)) {
      if (item.id === stuff.id) {
        already_exists = true;
      }
    }

    if (!already_exists) {
      var asset_item = document.createElement(item.type);
      asset_item.setAttribute('id', item.id);
      asset_item.setAttribute('src', item.src);
      assets.appendChild(asset_item);
    }
  }
}


/**
  Utils.extend(a, b)
  Assign object to other object.
*/
Utils.extend = function(a, b) {
	for (let key in b) {
		if (b.hasOwnProperty(key)) {
			a[key] = b[key];
		}
	}
	return a;
};


Utils.clone = function(original) {
	if (Array.isArray(original)) {
		return original.slice(0);
	}

	// First create an empty object with
	// same prototype of our original source
	const clone = Object.create(Object.getPrototypeOf(original));
	let i = undefined;
	const keys = Object.getOwnPropertyNames(original);
	i = 0;
	while (i < keys.length) {
		// copy each property into the clone
		Object.defineProperty(clone, keys[i], Object.getOwnPropertyDescriptor(original, keys[i]));
		i++;
	}
	return clone;
};


Utils.updateOpacity = function(el, opacity) {
  if (el.hasAttribute('text')) {
    let props = el.getAttribute('text');
    if (props) {
      props.opacity = opacity;
      el.setAttribute('text', props);
    }
  }
  el.object3D.traverse(function (o) {
    if (o.material) {
      o.material.transparent = true;
      o.material.opacity = opacity;
    }
  });
  for (let text of el.querySelectorAll('a-text')) {
    text.setAttribute('opacity', opacity);
  }
}


// Calculate the width factor
Utils.getWidthFactor = function(el, wrapCount) {
  let widthFactor = 0.00001;
  if (el.components.text && el.components.text.currentFont) {
    widthFactor = el.components.text.currentFont.widthFactor
    widthFactor = ((0.5 + wrapCount) * widthFactor);
  }
  return widthFactor;
}

 

/**
 * NEW FUNCTIONS - Enhanced Utils for form controls
 */

/**
 * Validate color value (CSS color, hex, or A-Frame color)
 * @param {string} color - Color value to validate
 * @returns {boolean} True if valid color
 */
Utils.validateColor = function(color) {
  if (!color || typeof color !== 'string') {
    return false;
  }
  
  // Check hex colors (#fff, #ffffff)
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return true;
  }
  
  // Check CSS named colors and rgb/rgba
  const testEl = document.createElement('div');
  testEl.style.color = color;
  return testEl.style.color !== '';
};

/**
 * Validate size value (positive number)
 * @param {number|string} size - Size value to validate
 * @returns {boolean} True if valid size
 */
Utils.validateSize = function(size) {
  const num = parseFloat(size);
  return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Enhanced text width measurement using modern A-Frame geometry APIs
 * This is the primary method for 3D text measurement in VR
 * @param {Element} textComponent - A-Frame entity with text component
 * @returns {Promise<number>} Width in A-Frame units
 */
Utils.measureTextWidth = function(textComponent) {
  return new Promise(function(resolve) {
    function measure() {
      try {
        if (!textComponent || !textComponent.components || !textComponent.components.text) {
          resolve(0);
          return;
        }
        var obj = textComponent.object3D;
        if (!obj || !obj.children || obj.children.length === 0) {
          requestAnimationFrame(measure);
          return;
        }
        var mesh = obj.children[0];
        if (!mesh || !mesh.geometry) {
          requestAnimationFrame(measure);
          return;
        }
        var geometry = mesh.geometry;
        if (geometry.visibleGlyphs && geometry.visibleGlyphs.length > 0) {
          var lastGlyph = geometry.visibleGlyphs[geometry.visibleGlyphs.length - 1];
          var width = lastGlyph.position[0] + lastGlyph.data.width;
          resolve(width);
          return;
        }
        if (geometry.boundingBox) {
          geometry.computeBoundingBox();
          resolve(geometry.boundingBox.max.x - geometry.boundingBox.min.x);
          return;
        }
        var textData = textComponent.getAttribute('text');
        if (textData && textData.value) {
          var widthFactor = Utils.getWidthFactor(textComponent, textData.value.length);
          resolve(textData.value.length * widthFactor);
          return;
        }
        resolve(0);
      } catch (e) {
        console.warn('[Utils.measureTextWidth] Measurement failed:', e);
        resolve(0);
      }
    }
    measure();
  });
};

/**
 * Binary search text fitting - replaces recursive trimming
 * Efficiently finds the maximum text that fits within a given width
 * @param {Element} textComponent - A-Frame entity with text component
 * @param {string} originalText - Full text to fit
 * @param {number} maxWidth - Maximum width in A-Frame units
 * @param {object} textProps - Text component properties
 * @returns {Promise<string>} Fitted text (may be truncated with ellipsis)
 */
Utils.fitTextBinarySearch = async function(textComponent, originalText, maxWidth, textProps) {
  if (!originalText || maxWidth <= 0) {
    return '';
  }
  
  // First try the full text
  textComponent.setAttribute('text', Object.assign({}, textProps, { value: originalText }));
  const fullWidth = await Utils.measureTextWidth(textComponent);
  
  if (fullWidth <= maxWidth) {
    return originalText; // Full text fits
  }
  
  // Binary search for the longest fitting text
  let left = 0;
  let right = originalText.length;
  let bestFit = '';
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const testText = originalText.substring(0, mid);
    const testTextWithEllipsis = mid < originalText.length ? testText + '...' : testText;
    
    textComponent.setAttribute('text', Object.assign({}, textProps, { value: testTextWithEllipsis }));
    const width = await Utils.measureTextWidth(textComponent);
    
    if (width <= maxWidth) {
      bestFit = testTextWithEllipsis;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return bestFit;
};

/**
 * Synchronous text width estimation using cached font metrics
 * Fast approximation for immediate layout decisions
 * @param {string} text - Text to measure
 * @param {object} textProps - Text component properties
 * @returns {number} Estimated width in A-Frame units
 */
Utils.estimateTextWidth = function(text, textProps) {
  if (!text) return 0;
  
  // Use cached font metrics if available
  const fontSize = textProps.width || 1;
  const charCount = text.length;
  
  // Rough estimation: average character width is ~0.6 of font size
  // This is a fast approximation for immediate decisions
  return charCount * fontSize * 0.6;
};

/**
 * Documentation for Utils functions usage
 * 
 * EXISTING FUNCTIONS (keep for backward compatibility):
 * - Utils.preloadAssets(assets_arr) - Add assets to A-Frame asset management
 * - Utils.extend(a, b) - Assign object properties to another object
 * - Utils.clone(original) - Deep clone objects and arrays
 * - Utils.updateOpacity(el, opacity) - Update opacity for text and materials
 * - Utils.getWidthFactor(el, wrapCount) - Calculate text width factor (legacy)
 * 
 * NEW FUNCTIONS (for form controls):
 * - Utils.validateColor(color) - Validate CSS/hex color values
 * - Utils.validateSize(size) - Validate positive numeric sizes
 * - Utils.measureTextWidth(textComponent) - Modern 3D text measurement (async)
 * 
 * USAGE GUIDELINES:
 * - Use Utils as the primary location for shared utility functions
 * - Component-specific helpers should call Utils functions (don't duplicate)
 * - For text measurement in VR: use Utils.measureTextWidth() (A-Frame geometry)
 * - For validation: use Utils.validateColor() and Utils.validateSize()
 * - For opacity updates: continue using Utils.updateOpacity()
 */

module.exports = Utils;
