import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function InstituteDetails() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>INSTITUTION DETAILS</Text>

      <TextInput placeholder="College Name" style={styles.input} />
      <TextInput placeholder="College Type" style={styles.input} />
      <TextInput placeholder="Course" style={styles.input} />
      <TextInput placeholder="Course Type" style={styles.input} />
      <TextInput placeholder="Course Duration" style={styles.input} />
      <TextInput placeholder="College ID" style={styles.input} />
      <TextInput placeholder="Current Year" style={styles.input} />
      <TextInput placeholder="District" style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={() => router.push('/concession-distance')}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff',paddingTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 12, borderRadius: 8, marginBottom: 12,
  },
  button: {
    backgroundColor: '#C62828', padding: 14,
    borderRadius: 8, marginTop: 20,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
