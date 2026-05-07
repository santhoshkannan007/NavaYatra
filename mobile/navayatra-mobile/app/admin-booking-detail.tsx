import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminPage, AdminPill, AdminSectionTitle } from '@/components/admin-ui';

export default function AdminBookingDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const bookingId = params.id;
  const [booking, setBooking] = useState<any>(null);
  const [reason, setReason] = useState('Cancelled by admin');

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await API.get(`/booking/admin/bookings/${bookingId}/`, { headers: { Authorization: `Bearer ${token}` } });
      setBooking(res.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load booking');
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const cancelBooking = async () => {
    if (!bookingId) return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await API.post(`/booking/admin/bookings/${bookingId}/cancel/`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('Success', 'Booking cancelled');
      fetchBooking();
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error?.response?.data?.error || 'Unable to cancel booking');
    }
  };

  if (!booking) {
    return (
      <AdminPage title="Booking Detail" subtitle="Loading booking information..."><AdminCard><Text style={styles.meta}>Loading...</Text></AdminCard></AdminPage>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }}>
      <AdminPage title="Booking Detail" subtitle={`#${booking.booking_id} • ${booking.status}`}>
        <AdminCard>
          <View style={styles.headerRow}>
            <View style={styles.headerMain}>
              <Text style={styles.cardTitle}>#{booking.booking_id}</Text>
              <Text style={styles.meta}>{booking.bus}</Text>
              <Text style={styles.meta}>{booking.pickup} → {booking.dropoff}</Text>
              <Text style={styles.meta}>Date: {String(booking.date)}</Text>
            </View>
            <AdminPill label={booking.status} tone={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'CANCELLED' ? 'danger' : 'warning'} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}><Text style={styles.statValue}>{booking.passenger_count}</Text><Text style={styles.statLabel}>Passengers</Text></View>
            <View style={styles.statBlock}><Text style={styles.statValue}>Rs.{booking.total_fare}</Text><Text style={styles.statLabel}>Total Fare</Text></View>
            <View style={styles.statBlock}><Text style={styles.statValue}>Rs.{booking.refund_amount}</Text><Text style={styles.statLabel}>Refund</Text></View>
          </View>
          <Text style={styles.meta}>Cancellation Reason: {booking.cancellation_reason || '-'}</Text>
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle title="Passengers" subtitle="Seat allocation and traveller list" />
          {booking.passengers?.map((passenger: any, index: number) => (
            <View key={`${passenger.name}-${index}`} style={styles.passengerRow}>
              <View style={styles.passengerMain}>
                <Text style={styles.cardTitle}>{passenger.name}</Text>
                <Text style={styles.meta}>{passenger.gender} • Age {passenger.age}</Text>
              </View>
              <AdminPill label={`Seat ${passenger.seat}`} tone="info" />
            </View>
          ))}
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle title="Admin Action" subtitle="Cancel with a reason and trigger refund" />
          <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholder="Cancellation reason" />
          <AdminActionButton label="Cancel Booking + Refund" onPress={cancelBooking} tone="danger" />
          <AdminActionButton label="Back" onPress={() => router.back()} tone="secondary" />
        </AdminCard>
      </AdminPage>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#201816' },
  meta: { color: '#6d6158', marginTop: 2, fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#e2d8ca', borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  headerMain: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  statBlock: { flex: 1, backgroundColor: '#f8f5f1', borderRadius: 12, padding: 10 },
  statValue: { color: '#201816', fontWeight: '800', fontSize: 13 },
  statLabel: { color: '#6d6158', fontSize: 11, marginTop: 2 },
  passengerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0e7db' },
  passengerMain: { flex: 1, paddingRight: 10 },
});
