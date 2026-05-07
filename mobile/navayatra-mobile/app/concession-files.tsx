import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConcessionFiles() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IMAGES & FILES</Text>

      <TouchableOpacity style={styles.card}>
        <Ionicons name="person" size={28} />
        <Text style={styles.text}>Upload Student Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Ionicons name="card" size={28} />
        <Text style={styles.text}>Upload ID Card Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Ionicons name="document" size={28} />
        <Text style={styles.text}>Upload Aadhaar Card (PDF)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Ionicons name="document-text" size={28} />
        <Text style={styles.text}>Upload Ration Card (PDF)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Ionicons name="document-attach" size={28} />
        <Text style={styles.text}>Self Declaration Certificate</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/concession-review')}>
        <Text style={styles.buttonText}>Review Application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 15, borderWidth: 1,
    borderColor: '#ccc', borderRadius: 10,
    marginBottom: 12,
  },
  text: { marginLeft: 12 },
  button: {
    backgroundColor: '#C62828', padding: 14,
    borderRadius: 8, marginTop: 20,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
