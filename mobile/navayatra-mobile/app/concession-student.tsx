import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function StudentDetails() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
    <ScrollView style={styles.container}
    contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>PERSONAL DETAILS</Text>

      <TextInput placeholder="Full Name" style={styles.input} />
      <TextInput placeholder="Email" keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Date of Birth (YYYY-MM-DD)" style={styles.input} />
      <TextInput placeholder="Age" keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Gender" style={styles.input} />
      <TextInput placeholder="Guardian Name" style={styles.input} />
      <TextInput placeholder="Address" style={styles.input} />
      <TextInput placeholder="Place" style={styles.input} />
      <TextInput placeholder="Postal Name" style={styles.input} />
      <TextInput placeholder="Pin Code" keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="District" style={styles.input} />
      <TextInput placeholder="Mobile Number" keyboardType="phone-pad" style={styles.input} />
      <TextInput placeholder="Aadhaar Number" style={styles.input} />
      <TextInput placeholder="Ration Card Type (APL / BPL)" style={styles.input} />
      <TextInput placeholder="Ration Card Number" style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={() => router.push('/concession-institute')}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff',paddingTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 12,
    borderRadius: 8, marginBottom: 12,
  },
  button: {
    backgroundColor: '#C62828', padding: 14,
    borderRadius: 8, marginTop: 20, marginBottom: 40,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
