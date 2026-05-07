import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StudentConcessionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Concession</Text>
      <Text style={styles.subtitle}>
        Apply for a new concession or review an existing application
      </Text>

      {/* Apply for Concession */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/concession-student')}
      >
        <Ionicons name="create-outline" size={32} color="#C62828" />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Apply for Concession</Text>
          <Text style={styles.cardDesc}>
            New application for student travel concession
          </Text>
        </View>
      </TouchableOpacity>

      {/* Review Application */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/concession-review')}
      >
        <Ionicons name="document-text-outline" size={32} color="#C62828" />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Review Application</Text>
          <Text style={styles.cardDesc}>
            Check details and status of submitted application
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#F9F9F9',
    marginBottom: 16,
    elevation: 2,
  },
  textBox: {
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
});
