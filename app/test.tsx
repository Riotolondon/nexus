import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'expo-router';

export default function TestScreen() {
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { login, logout, getUser, isUserLoggedIn } = useUserStore();
  
  const user = getUser();
  const isLoggedIn = isUserLoggedIn();

  const handleLogin = async () => {
    try {
      setMessage('Logging in...');
      const success = await login('test@example.com', 'password');
      if (success) {
        setMessage('Login successful');
      } else {
        setMessage('Login failed');
      }
    } catch (error) {
      setMessage(`Login error: ${error}`);
    }
  };

  const handleLogout = async () => {
    try {
      setMessage('Logging out...');
      await logout();
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
        Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}
      </Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text>User Email: {user.email}</Text>
          <Text>User Name: {user.name}</Text>
          <Text>University: {user.university?.name || 'None'}</Text>
          <Text>Interests: {user.interests.join(', ') || 'None'}</Text>
        </View>
      )}
      
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} disabled={isLoggedIn} />
        <Button title="Logout" onPress={handleLogout} disabled={!isLoggedIn} />
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