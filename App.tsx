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
    return transform.map((t, index) => {
      if (typeof t === 'string') return t;
      const key = Object.keys(t)[0];
      const value = t[key];
      return `${key}(${value})`;
    }).join(' ');
  }
  return '';
};

// Suppress various React Native Web warnings
const suppressWarnings = () => {
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string') {
      // Suppress pointerEvents warning
      if (args[0].includes('pointerEvents is deprecated')) {
        return;
      }
      // Suppress shadow* style warnings
      if (args[0].includes('shadow*') && args[0].includes('Use "boxShadow"')) {
        return;
      }
    }
    originalWarn.apply(console, args);
  };
};

import React, { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { useSupabaseUserStore } from './store/useSupabaseUserStore';

export default function App() {
  const { initializeAuth } = useSupabaseUserStore();
  
  // Log app initialization and initialize auth
  useEffect(() => {
    console.log('App component mounted');
    initializeAuth();
    
    // Suppress various warnings
    suppressWarnings();
  }, []);

  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);