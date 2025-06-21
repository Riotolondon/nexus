import React, { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export default function App() {
  // Log app initialization
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App); 