import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "../services/api";

export default function LoginScreen() {

  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    try {

      const response = await API.post("/auth/login/", {
        username,
        password,
      });

      const accessToken = response.data.tokens.access;
      const refreshToken = response.data.tokens.refresh;

      const user = response.data.user;

      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);

      // Save role locally
      await AsyncStorage.setItem("userRole", user.role);

      Alert.alert("Success", "Login successful");

      // Role-based navigation
      if (user.role === "STATION_MASTER") {
        router.replace('/station-home');
      } else if (user.role === "ADMIN") {
        router.replace('/admin-home');
      } else {
        router.replace('/home');
      }

    } catch (error) {

      const err = error as AxiosError<any>;

      console.log("LOGIN ERROR:", err.response?.data);

      Alert.alert(
        "Login Failed",
        JSON.stringify(err.response?.data) || "Server error"
      );
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>NavaYatra</Text>
      <Text style={styles.subtitle}>Smart Journey for Kerala</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        New user?{' '}
        <Text
          style={{ color: '#C62828', fontWeight: 'bold' }}
          onPress={() => router.push('/signup')}
        >
          Sign Up
        </Text>
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#C62828',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#444',
  },

});