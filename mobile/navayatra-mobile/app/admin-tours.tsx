import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminPage, AdminPill, AdminSectionTitle } from '@/components/admin-ui';

type TourItem = {
  id: number;
  tour_type: string;
  from_location: string;
  to_location: string;
  contact_name: string;
  status: string;
  payment_status: string;
  estimated_price: string;
  assigned_depot: string | null;
};

export default function AdminTours() {
  const [tours, setTours] = useState<TourItem[]>([]);
  const [search, setSearch] = useState('');
  const [priceById, setPriceById] = useState<Record<string, string>>({});
  const [remarksById, setRemarksById] = useState<Record<string, string>>({});

  const fetchTours = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await API.get(`/special-tour/admin/tours/${query}`, { headers: { Authorization: `Bearer ${token}` } });
      setTours(res.data || []);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load tours');
    }
  }, [search]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const approveTour = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await API.post(`/special-tour/admin/tours/${id}/approve/`, {
        estimated_price: priceById[String(id)] || '0',
        remarks: remarksById[String(id)] || '',
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTours();
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error?.response?.data?.error || 'Unable to approve tour');
    }
  };

  const rejectTour = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await API.post(`/special-tour/admin/tours/${id}/reject/`, {
        remarks: remarksById[String(id)] || 'Rejected by admin',
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTours();
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error?.response?.data?.error || 'Unable to reject tour');
    }
  };

  return (
    <AdminPage title="Special Tours" subtitle="Approve or reject tour requests with price and remarks.">
      <AdminCard>
        <AdminSectionTitle title="Search" subtitle="Filter by contact or route details" />
        <TextInput style={styles.input} placeholder="Search by name, phone, place, user" value={search} onChangeText={setSearch} />
        <AdminActionButton label="Search" onPress={fetchTours} />
      </AdminCard>

      <AdminCard>
        <AdminSectionTitle title="Tour Requests" subtitle="Approval state and payment progress" />
      <FlatList
        data={tours}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.headerRow}>
              <View style={styles.rowMain}>
                <Text style={styles.cardTitle}>#{item.id} {item.tour_type}</Text>
                <Text style={styles.meta}>{item.contact_name}</Text>
                <Text style={styles.meta}>{item.from_location} → {item.to_location}</Text>
                <Text style={styles.meta}>Depot: {item.assigned_depot || '-'}</Text>
              </View>
              <View style={styles.stackPills}>
                <AdminPill label={item.status} tone={item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'} />
                <AdminPill label={item.payment_status} tone={item.payment_status === 'PAID' ? 'success' : 'warning'} />
              </View>
            </View>
            <TextInput style={styles.input} placeholder="Estimated price" keyboardType="numeric" value={priceById[String(item.id)] || ''} onChangeText={(text) => setPriceById((current) => ({ ...current, [String(item.id)]: text }))} />
            <TextInput style={styles.input} placeholder="Remarks" value={remarksById[String(item.id)] || ''} onChangeText={(text) => setRemarksById((current) => ({ ...current, [String(item.id)]: text }))} />
            <View style={styles.row}>
              <TouchableOpacity style={styles.smallButton} onPress={() => approveTour(item.id)}><Text style={styles.smallButtonText}>Approve</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => rejectTour(item.id)}><Text style={styles.smallButtonText}>Reject</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      </AdminCard>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#e2d8ca', borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: '#fff' },
  itemCard: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0e7db' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  rowMain: { flex: 1 },
  stackPills: { alignItems: 'flex-end', gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#201816' },
  meta: { color: '#6d6158', marginTop: 2, fontSize: 12 },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  smallButton: { backgroundColor: '#2e7d32', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  deleteButton: { backgroundColor: '#C62828' },
  smallButtonText: { color: '#fff', fontWeight: 'bold' },
});
