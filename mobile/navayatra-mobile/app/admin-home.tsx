import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminMetricTile, AdminPage, AdminPill, AdminSectionTitle } from '@/components/admin-ui';

type DashboardData = {
  counts: Record<string, number>;
  breakdown: {
    users_by_role: Record<string, number>;
    bookings_by_status: Record<string, number>;
    tours_by_status: Record<string, number>;
  };
  recent: {
    users: { id: number; username: string; role: string; is_active: boolean }[];
    bookings: { id: number; user__username: string; bus__number: string; status: string; total_fare: string }[];
    buses: { id: number; number: string; bus_type: string; depot__name: string; route__name: string }[];
    special_tours: { id: number; tour_type: string; contact_name: string; status: string; payment_status: string }[];
  };
};

export default function AdminHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await API.get('/auth/admin/dashboard/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (e) {
      console.log('admin dashboard error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} />}
    >
      <AdminPage title="Admin Dashboard" subtitle="Quick overview plus direct access to every management area.">
        <View style={styles.metricGrid}>
          <AdminMetricTile label="Users" value={data?.counts?.users ?? 0} tone="accent" />
          <AdminMetricTile label="Buses" value={data?.counts?.buses ?? 0} />
          <AdminMetricTile label="Routes" value={data?.counts?.routes ?? 0} />
          <AdminMetricTile label="Bookings" value={data?.counts?.bookings ?? 0} tone="accent" />
          <AdminMetricTile label="Tours" value={data?.counts?.special_tours ?? 0} />
          <AdminMetricTile label="Depots" value={data?.counts?.depots ?? 0} />
        </View>

        <AdminCard>
          <AdminSectionTitle title="Role Breakdown" subtitle="Current users grouped by role" />
          <View style={styles.pillRow}>
            <AdminPill label={`Admins ${data?.breakdown?.users_by_role?.ADMIN ?? 0}`} tone="info" />
            <AdminPill label={`Station Masters ${data?.breakdown?.users_by_role?.STATION_MASTER ?? 0}`} tone="warning" />
            <AdminPill label={`Users ${data?.breakdown?.users_by_role?.USER ?? 0}`} />
          </View>
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle title="Booking Status" subtitle="Live operational state" />
          <View style={styles.pillRow}>
            <AdminPill label={`Pending ${data?.breakdown?.bookings_by_status?.PENDING ?? 0}`} tone="warning" />
            <AdminPill label={`Confirmed ${data?.breakdown?.bookings_by_status?.CONFIRMED ?? 0}`} tone="success" />
            <AdminPill label={`Cancelled ${data?.breakdown?.bookings_by_status?.CANCELLED ?? 0}`} tone="danger" />
          </View>
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle title="Recent Users" subtitle="Newest accounts" />
          {data?.recent?.users?.map((u) => (
            <View key={u.id} style={styles.tableRow}>
              <View style={styles.tableMain}>
                <Text style={styles.tableTitle}>#{u.id} {u.username}</Text>
                <Text style={styles.tableMeta}>{u.role}</Text>
              </View>
              <AdminPill label={u.is_active ? 'Active' : 'Inactive'} tone={u.is_active ? 'success' : 'danger'} />
            </View>
          ))}
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle title="Recent Bookings" subtitle="Latest ticket activity" />
          {data?.recent?.bookings?.map((b) => (
            <View key={b.id} style={styles.tableRow}>
              <View style={styles.tableMain}>
                <Text style={styles.tableTitle}>#{b.id} {b.user__username}</Text>
                <Text style={styles.tableMeta}>{b.bus__number} • Rs.{b.total_fare}</Text>
              </View>
              <AdminPill label={b.status} tone={b.status === 'CONFIRMED' ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'warning'} />
            </View>
          ))}
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle title="Recent Special Tours" subtitle="Tour requests and payment state" />
          {data?.recent?.special_tours?.map((t) => (
            <View key={t.id} style={styles.tableRow}>
              <View style={styles.tableMain}>
                <Text style={styles.tableTitle}>#{t.id} {t.tour_type}</Text>
                <Text style={styles.tableMeta}>{t.contact_name}</Text>
              </View>
              <AdminPill label={t.payment_status} tone={t.payment_status === 'PAID' ? 'success' : 'warning'} />
            </View>
          ))}
        </AdminCard>

        <AdminSectionTitle title="Administration" subtitle="Open the dense management screens" />
        <View style={styles.buttonGroup}>
          <AdminActionButton label="Manage Users" onPress={() => router.push('/admin-users')} />
          <AdminActionButton label="Manage Depots" onPress={() => router.push('/admin-depots')} tone="secondary" />
          <AdminActionButton label="Manage Routes" onPress={() => router.push('/admin-routes')} tone="secondary" />
          <AdminActionButton label="Manage Bookings" onPress={() => router.push('/admin-bookings')} tone="secondary" />
          <AdminActionButton label="Manage Special Tours" onPress={() => router.push('/admin-tours')} tone="secondary" />
          <AdminActionButton label="Global Search" onPress={() => router.push('/admin-search')} tone="secondary" />
          <AdminActionButton label="Reports" onPress={() => router.push('/admin-reports')} tone="danger" />
        </View>

        <AdminSectionTitle title="Station Tools" subtitle="Existing station-master functions available to admin" />
        <View style={styles.buttonGroup}>
          <AdminActionButton label="Manage Buses" onPress={() => router.push('/station-buses')} tone="secondary" />
          <AdminActionButton label="Manage Stops" onPress={() => router.push('/station-stops')} tone="secondary" />
          <AdminActionButton label="Manage Fares" onPress={() => router.push('/station-fares')} tone="secondary" />
          <AdminActionButton label="View Station Bookings" onPress={() => router.push('/station-bookings')} tone="secondary" />
        </View>
      </AdminPage>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0e7db' },
  tableMain: { flex: 1, paddingRight: 10 },
  tableTitle: { color: '#201816', fontWeight: '700', fontSize: 14 },
  tableMeta: { color: '#7a6c61', fontSize: 12, marginTop: 2 },
  buttonGroup: { marginBottom: 10 },
});
