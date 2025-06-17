import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signInUser, signOutUser, getCurrentUser, subscribeToAuthChanges } from '@/utils/localAuthService';
import { useRouter } from 'expo-router';

export default function TestScreen() {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setMessage(`Auth state changed: ${currentUser ? 'logged in' : 'logged out'}`);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setMessage('Logging in...');
      await signInUser('test@example.com', 'password');
      setMessage('Login successful');
    } catch (error) {
      setMessage(`Login error: ${error}`);
    }
  };

  const handleLogout = async () => {
    try {
      setMessage('Logging out...');
      await signOutUser();
      setMessage('Logout successful');
    } catch (error) {
      setMessage(`Logout error: ${error}`);
    }
  };

  const handleNavigate = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Test Screen</Text>
      
      <Text style={styles.status}>
        Status: {user ? 'Logged In' : 'Logged Out'}
      </Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text>User Email: {user.email}</Text>
          <Text>User Name: {user.displayName}</Text>
        </View>
      )}
      
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} disabled={!!user} />
        <Button title="Logout" onPress={handleLogout} disabled={!user} />
        <Button title="Navigate Home" onPress={handleNavigate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
  },
  userInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
  },
  message: {
    marginVertical: 20,
    color: 'blue',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
}); 