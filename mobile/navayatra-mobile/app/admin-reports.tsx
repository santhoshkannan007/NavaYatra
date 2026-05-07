import { Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminPage, AdminSectionTitle } from '@/components/admin-ui';

export default function AdminReports() {

  const downloadReport = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Call the existing admin report download endpoint
      await API.get('/admin/reports/download/', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      // For now just confirm success; handling file download in Expo may need additional work
      Alert.alert('Report', 'Report downloaded (server responded)');
    } catch (e) {
      console.log('report error', e);
      Alert.alert('Error', 'Failed to download report.');
    }
  };

  return (
    <AdminPage title="Reports" subtitle="Download administrative exports and summaries.">
      <AdminCard>
        <AdminSectionTitle title="Export" subtitle="Current report endpoint from Django" />
        <AdminActionButton label="Download Admin Report" onPress={downloadReport} />
        <Text style={styles.note}>Note: File handling on mobile may require additional setup.</Text>
      </AdminCard>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: 8, color: '#6d6158', fontSize: 12 },
});
