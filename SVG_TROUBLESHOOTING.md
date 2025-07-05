# React Native SVG Troubleshooting Guide

## Common Errors and Solutions

### 1. `Uncaught TypeError: (0 , _App.hasTouchableProperty) is not a function`

This error occurs when using `react-native-svg` with React Native Web. The error is due to a missing function that the web implementation of react-native-svg expects to find.

### 2. `Uncaught TypeError: (0 , _App.parseTransformProp) is not a function`

This is another missing function error that can occur with react-native-svg in web environments.

#### Solution 1: Add all missing functions to App.tsx

Add this comprehensive fix at the top of your `App.tsx` file:

```typescript
// Add SVG fix at the top of the file
// This adds the missing functions needed by react-native-svg
export const hasTouchableProperty = (props: any): boolean => {
  return props && (
    props.onPress || 
    props.onPressIn || 
    props.onPressOut || 
    props.onLongPress
  );
};

export const parseTransformProp = (transform: any) => {
  if (!transform) return '';
  if (typeof transform === 'string') return transform;
  if (Array.isArray(transform)) {
    return transform.map(t => {
      if (typeof t === 'string') return t;
      const key = Object.keys(t)[0];
      const value = t[key];
      return `${key}(${value})`;
    }).join(' ');
  }
  return '';
};
```

#### Solution 2: Use the comprehensive SVG fix

1. Import the comprehensive fix at the top of your App.tsx:
   ```javascript
   import './comprehensive-svg-fix';
   ```

2. This will automatically patch all missing functions.

#### Solution 3: Install a compatible version

Run the compatibility fix script:
```bash
./fix-svg-compatibility.bat
```

This will:
- Uninstall the current react-native-svg
- Install version 12.3.0 (known to be more stable)
- Clear cache
- Apply patches

#### Solution 4: Manual version downgrade

```bash
npm uninstall react-native-svg
npm install react-native-svg@12.3.0
npm start -- --reset-cache
```

### 3. `props.pointerEvents is deprecated. Use style.pointerEvents`

This warning appears when you use the `pointerEvents` prop directly on components instead of in the `style` prop.

#### Solution: Move pointerEvents to the style prop

Change this:
```jsx
<View pointerEvents="none">
  <Text>Hello World</Text>
</View>
```

To this:
```jsx
<View style={{ pointerEvents: "none" }}>
  <Text>Hello World</Text>
</View>
```

### 4. `"shadow*" style props are deprecated. Use "boxShadow"`

This warning appears when using React Native shadow properties in web environments.

#### Solution: Suppress the warning

Add this to your App.tsx:

```typescript
const suppressWarnings = () => {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string') {
      // Suppress shadow* style warnings
      if (args[0].includes('shadow*') && args[0].includes('Use "boxShadow"')) {
        return;
      }
    }
    originalWarn.apply(console, args);
  };
};

// Call in useEffect
useEffect(() => {
  suppressWarnings();
}, []);
```

## Quick Fix Script

For a comprehensive fix of all SVG and styling issues, run:

```bash
./fix-common-issues.bat
```

Select option 4 (Fix SVG errors) to apply all necessary patches.

## General SVG Tips for React Native Web

1. **Use compatible SVG components**: Ensure you're using components from `react-native-svg` and not mixing with web SVG elements.

2. **Check version compatibility**: React Native SVG version 12.3.0 is known to be stable with React Native Web.

3. **Use simple SVGs**: Complex SVGs with filters, masks, or patterns might not work correctly in React Native Web.

4. **Consider alternatives**: For simple icons, consider using icon libraries like `@expo/vector-icons` which work well across platforms.

5. **Test on all platforms**: Always test your SVG components on all target platforms (iOS, Android, Web) to ensure consistent behavior.

6. **Clear cache frequently**: SVG issues can sometimes be resolved by clearing the Metro cache.

## Useful Commands

```bash
# Install a stable version of react-native-svg
npm install react-native-svg@12.3.0

# Using Expo
npx expo install react-native-svg@12.3.0

# Clear cache (if you're having persistent issues)
npm start -- --reset-cache
# or
npx expo start --clear

# Run the comprehensive fix
./fix-svg-compatibility.bat
```

## Version Compatibility Matrix

| React Native | React Native Web | react-native-svg | Status |
|--------------|------------------|------------------|--------|
| 0.70+        | 0.18+           | 12.3.0           | ✅ Stable |
| 0.69         | 0.17            | 12.1.1           | ⚠️ Some issues |
| 0.68         | 0.17            | 12.0.0           | ❌ Known issues |

Choose versions from the "Stable" row for best compatibility. 