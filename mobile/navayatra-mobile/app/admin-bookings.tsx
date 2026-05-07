import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminPage, AdminPill, AdminSectionTitle } from '@/components/admin-ui';

type BookingItem = {
  id: number;
  username: string;
  bus: string;
  route: string;
  depot: string;
  pickup: string;
  dropoff: string;
  date: string;
  status: string;
  passenger_count: number;
  total_fare: string;
  refund_amount: string;
};

export default function AdminBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status.trim()) params.set('status', status.trim().toUpperCase());
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await API.get(`/booking/admin/bookings/${query}`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data || []);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load bookings');
    }
  }, [search, status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const openDetail = (id: number) => {
    router.push({ pathname: '/admin-booking-detail', params: { id: String(id) } });
  };

  return (
    <AdminPage title="Bookings" subtitle="Search and inspect ticket records with status controls.">
      <AdminCard>
        <AdminSectionTitle title="Filters" subtitle="Search by user, bus, pickup, or dropoff" />
        <TextInput style={styles.input} placeholder="Search booking / bus / user" value={search} onChangeText={setSearch} />
        <TextInput style={styles.input} placeholder="Status: PENDING / CONFIRMED / CANCELLED" value={status} onChangeText={setStatus} />
        <AdminActionButton label="Apply Filter" onPress={fetchBookings} />
      </AdminCard>

      <AdminCard>
        <AdminSectionTitle title="Booking List" subtitle="Tap any record to open the detail view" />
      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemRow} onPress={() => openDetail(item.id)}>
            <View style={styles.rowMain}>
              <Text style={styles.cardTitle}>#{item.id} {item.username}</Text>
              <Text style={styles.meta}>{item.bus} | {item.route} | {item.depot}</Text>
              <Text style={styles.meta}>{item.pickup} → {item.dropoff}</Text>
              <Text style={styles.meta}>{item.date} | Rs.{item.total_fare} | Refund Rs.{item.refund_amount}</Text>
            </View>
            <AdminPill label={item.status} tone={item.status === 'CONFIRMED' ? 'success' : item.status === 'CANCELLED' ? 'danger' : 'warning'} />
          </TouchableOpacity>
        )}
      />
      </AdminCard>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#e2d8ca', borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: '#fff' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#201816' },
  meta: { color: '#6d6158', marginTop: 2, fontSize: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0e7db', gap: 12 },
  rowMain: { flex: 1 },
});
