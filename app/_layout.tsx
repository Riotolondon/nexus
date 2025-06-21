import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '../constants/colors';
// Import Firebase configuration is already done in App.tsx

export default function RootLayout() {
  // Log when the layout is mounted
  useEffect(() => {
    console.log('Root layout mounted');
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
  },
});