// fix-pointer-events.js
// This file provides guidance on fixing the "props.pointerEvents is deprecated" warning

/*
The warning "props.pointerEvents is deprecated. Use style.pointerEvents" is coming from
react-native-web. This warning occurs when you use the pointerEvents prop directly on
components instead of putting it in the style prop.

To fix this warning, you need to find components in your code that use the pointerEvents
prop directly and move it to the style prop.

Example:

BEFORE:
<View pointerEvents="none">
  <Text>Hello World</Text>
</View>

AFTER:
<View style={{ pointerEvents: "none" }}>
  <Text>Hello World</Text>
</View>

If you're already using a style prop, merge the pointerEvents into it:

BEFORE:
<View style={{ backgroundColor: 'red' }} pointerEvents="none">
  <Text>Hello World</Text>
</View>

AFTER:
<View style={{ backgroundColor: 'red', pointerEvents: "none" }}>
  <Text>Hello World</Text>
</View>

To find all instances in your code, you can search for:
1. `pointerEvents=` 
2. `pointerEvents:` (to find where it's already correctly used in style objects)

This warning doesn't affect functionality and can be safely ignored for now,
but it's good practice to update your code to follow the latest recommendations.
*/

// If you want to suppress this warning temporarily, you can add this code to your App.tsx:
export function suppressPointerEventsWarning() {
  // Save the original console.warn
  const originalWarn = console.warn;
  
  // Override console.warn to filter out the specific warning
  console.warn = function(...args) {
    // Check if this is the pointerEvents warning
    if (args[0] && typeof args[0] === 'string' && 
        args[0].includes('pointerEvents is deprecated')) {
      // Ignore this warning
      return;
    }
    
    // Call the original warn with all arguments
    originalWarn.apply(console, args);
  };
} 