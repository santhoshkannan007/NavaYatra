import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SpecialTourEntry() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Special Tour Booking</Text>
      <Text style={styles.subtitle}>
        Apply for a new tour or review existing requests
      </Text>

      {/* Apply for Tour Booking */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/tour-type')}
      >
        <Ionicons name="bus-outline" size={32} color="#C62828" />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Apply for Tour Booking</Text>
          <Text style={styles.cardDesc}>
            Marriage, school trips, tourist & group tours
          </Text>
        </View>
      </TouchableOpacity>

      {/* Review Tour Status */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/tour-status')}
      >
        <Ionicons name="document-text-outline" size={32} color="#C62828" />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Review Tour Status</Text>
          <Text style={styles.cardDesc}>
            Check status of submitted tour requests
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
    flex: 1,
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
