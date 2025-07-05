// fix-svg-error.js
// This file adds a polyfill for the missing hasTouchableProperty function in react-native-svg

// Add this to your project and import it at the top of your App.tsx or index.js file

if (typeof window !== 'undefined') {
  // Check if we're in a browser environment
  const originalRequire = window.require;

  // Override the require function to intercept react-native-svg imports
  window.require = function(moduleName) {
    if (moduleName === 'react-native-svg') {
      const svgModule = originalRequire(moduleName);
      
      // Add the missing hasTouchableProperty function if it doesn't exist
      if (!svgModule.hasTouchableProperty) {
        svgModule.hasTouchableProperty = function(props) {
          return props && (
            props.onPress || 
            props.onPressIn || 
            props.onPressOut || 
            props.onLongPress
          );
        };
      }
      
      return svgModule;
    }
    
    return originalRequire(moduleName);
  };
}

// If the above approach doesn't work, you can try this alternative:
// Add this to your global scope
if (typeof global !== 'undefined' && !global.hasTouchableProperty) {
  global.hasTouchableProperty = function(props) {
    return props && (
      props.onPress || 
      props.onPressIn || 
      props.onPressOut || 
      props.onLongPress
    );
  };
} 