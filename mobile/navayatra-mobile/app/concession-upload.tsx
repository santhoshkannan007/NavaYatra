import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConcessionUploadScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>

      <TouchableOpacity style={styles.uploadCard}>
        <Ionicons name="card" size={30} color="#C62828" />
        <Text style={styles.uploadText}>Upload College ID Card</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadCard}>
        <Ionicons name="document" size={30} color="#C62828" />
        <Text style={styles.uploadText}>Upload Bonafide / Certificate</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/concession-status')}
      >
        <Text style={styles.buttonText}>Submit Application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 40, },
  title: { fontSize: 24, fontWeight: 'bold', color: '#C62828', marginBottom: 25 },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
  },
  uploadText: { marginLeft: 12, fontSize: 15 },
  button: {
    backgroundColor: '#C62828',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
