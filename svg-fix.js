// svg-fix.js
// This file directly patches the react-native-svg module

// Import this file at the top of your App.tsx or index.js file

// Define the missing function
export const hasTouchableProperty = (props) => {
  return props && (
    props.onPress || 
    props.onPressIn || 
    props.onPressOut || 
    props.onLongPress
  );
};

// Try to patch the module directly
try {
  // For web environments
  if (typeof window !== 'undefined') {
    // Method 1: Try to patch the module's exports
    const svgModule = require('react-native-svg');
    if (svgModule && !svgModule.hasTouchableProperty) {
      svgModule.hasTouchableProperty = hasTouchableProperty;
    }
    
    // Method 2: Patch the module's internal utils
    const svgUtils = require('react-native-svg/lib/module/web/utils/prepare');
    if (svgUtils && !svgUtils.hasTouchableProperty) {
      svgUtils.hasTouchableProperty = hasTouchableProperty;
    }
  }
} catch (e) {
  console.warn('Failed to patch react-native-svg:', e);
} 