import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function DistanceDetails() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DISTANCE & TRAVEL DETAILS</Text>

      <TextInput placeholder="Duration (e.g. Three Month Period)" style={styles.input} />
      <TextInput placeholder="Depot" style={styles.input} />
      <TextInput placeholder="Remarks" style={styles.input} />
      <TextInput placeholder="From (Boarding Point)" style={styles.input} />
      <TextInput placeholder="To (Dropping Point)" style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={() => router.push('/concession-files')}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 40 },
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
