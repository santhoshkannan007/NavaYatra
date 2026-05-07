import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConcessionStatusScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="hourglass" size={50} color="#F9A825" />
      <Text style={styles.title}>Application Under Review</Text>
      <Text style={styles.text}>
        Your documents are being verified using AI.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#F9A825',
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
});
