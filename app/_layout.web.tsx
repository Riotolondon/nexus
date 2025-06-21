import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '../constants/colors';
// Firebase is already imported in App.tsx

export default function RootLayoutWeb() {
  // Add any web-specific initialization here
  useEffect(() => {
    console.log('Web layout mounted');
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = '100%';
    document.documentElement.style.height = '100%';
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    height: '100%',
    width: '100%',
  },
}); 