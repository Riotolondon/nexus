// comprehensive-svg-fix.js
// This file provides comprehensive fixes for react-native-svg issues in React Native Web

// Define all missing functions that react-native-svg might need
export const hasTouchableProperty = (props) => {
  return props && (
    props.onPress || 
    props.onPressIn || 
    props.onPressOut || 
    props.onLongPress
  );
};

export const parseTransformProp = (transform) => {
  if (!transform) return '';
  if (typeof transform === 'string') return transform;
  if (Array.isArray(transform)) {
    return transform.map((t, index) => {
      if (typeof t === 'string') return t;
      const key = Object.keys(t)[0];
      const value = t[key];
      return `${key}(${value})`;
    }).join(' ');
  }
  return '';
};

export const extractTransform = (props) => {
  return props?.transform || props?.style?.transform || '';
};

export const extractOpacity = (props) => {
  return props?.opacity || props?.style?.opacity || 1;
};

// Try to patch the react-native-svg module
const patchSVGModule = () => {
  try {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Try to get the SVG module
    let svgModule;
    try {
      svgModule = require('react-native-svg');
    } catch (e) {
      console.warn('Could not load react-native-svg module for patching');
      return;
    }

    // Patch main module
    if (svgModule) {
      if (!svgModule.hasTouchableProperty) {
        svgModule.hasTouchableProperty = hasTouchableProperty;
      }
      if (!svgModule.parseTransformProp) {
        svgModule.parseTransformProp = parseTransformProp;
      }
      if (!svgModule.extractTransform) {
        svgModule.extractTransform = extractTransform;
      }
      if (!svgModule.extractOpacity) {
        svgModule.extractOpacity = extractOpacity;
      }
    }

    // Try to patch the web utils module
    try {
      const webUtils = require('react-native-svg/lib/module/web/utils/prepare');
      if (webUtils) {
        if (!webUtils.hasTouchableProperty) {
          webUtils.hasTouchableProperty = hasTouchableProperty;
        }
        if (!webUtils.parseTransformProp) {
          webUtils.parseTransformProp = parseTransformProp;
        }
      }
    } catch (e) {
      // Ignore if this module doesn't exist
    }

    // Try to patch the App module (sometimes referenced in SVG)
    try {
      const appModule = require('react-native-svg/lib/module/web/utils/App');
      if (appModule) {
        if (!appModule.hasTouchableProperty) {
          appModule.hasTouchableProperty = hasTouchableProperty;
        }
        if (!appModule.parseTransformProp) {
          appModule.parseTransformProp = parseTransformProp;
        }
      }
    } catch (e) {
      // Ignore if this module doesn't exist
    }

    console.log('SVG module patching completed');
  } catch (error) {
    console.warn('Error patching SVG module:', error);
  }
};

// Add functions to global scope as fallback
if (typeof global !== 'undefined') {
  global.hasTouchableProperty = hasTouchableProperty;
  global.parseTransformProp = parseTransformProp;
  global.extractTransform = extractTransform;
  global.extractOpacity = extractOpacity;
}

// Add functions to window scope for web
if (typeof window !== 'undefined') {
  window.hasTouchableProperty = hasTouchableProperty;
  window.parseTransformProp = parseTransformProp;
  window.extractTransform = extractTransform;
  window.extractOpacity = extractOpacity;
}

// Run the patching
patchSVGModule();

// Export for manual use
export { patchSVGModule }; 