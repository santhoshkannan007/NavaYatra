import { useState } from 'react';
import { Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminPage, AdminSectionTitle } from '@/components/admin-ui';

export default function AdminSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  const runSearch = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await API.get(`/auth/admin/search/?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Search failed');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }}>
      <AdminPage title="Global Search" subtitle="Search across every admin model in one place.">
        <AdminCard>
          <AdminSectionTitle title="Search" subtitle="Users, depots, routes, buses, bookings, and tours" />
          <TextInput style={styles.input} placeholder="Search users, depots, routes, buses, bookings, tours" value={query} onChangeText={setQuery} />
          <AdminActionButton label="Search" onPress={runSearch} />
        </AdminCard>

        {results && (
          <>
            <Section title="Users" items={results.users || []} renderLine={(item) => `#${item.id} ${item.username} | ${item.role} | ${item.email}`} />
            <Section title="Depots" items={results.depots || []} renderLine={(item) => `#${item.id} ${item.name} | ${item.district}`} />
            <Section title="Routes" items={results.routes || []} renderLine={(item) => `#${item.id} ${item.name} | ${item.depot__name}`} />
            <Section title="Buses" items={results.buses || []} renderLine={(item) => `#${item.id} ${item.number} | ${item.bus_type} | ${item.depot__name}`} />
            <Section title="Bookings" items={results.bookings || []} renderLine={(item) => `#${item.id} ${item.user__username} | ${item.bus__number} | ${item.status}`} />
            <Section title="Tours" items={results.tours || []} renderLine={(item) => `#${item.id} ${item.tour_type} | ${item.contact_name} | ${item.status}`} />
          </>
        )}
      </AdminPage>
    </ScrollView>
  );
}

function Section({ title, items, renderLine }: { title: string; items: any[]; renderLine: (item: any) => string }) {
  if (!items.length) return null;
  return (
    <AdminCard>
      <AdminSectionTitle title={title} subtitle={`${items.length} result${items.length === 1 ? '' : 's'}`} />
      {items.map((item) => (
        <Text key={`${title}-${item.id}`} style={styles.line}>{renderLine(item)}</Text>
      ))}
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  input: { borderWidth: 1, borderColor: '#e2d8ca', borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: '#fff' },
  line: { color: '#555', marginBottom: 6, fontSize: 12 },
});
