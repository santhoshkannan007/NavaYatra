import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminPage, AdminSectionTitle } from '@/components/admin-ui';

type Depot = { id: number; name: string };
type RouteItem = { id: number; name: string; depot: string; depot_id: number; stops_count: number; fares_count: number; buses_count: number };

export default function AdminRoutes() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [name, setName] = useState('');
  const [selectedDepot, setSelectedDepot] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const [routesRes, depotsRes] = await Promise.all([
        API.get('/transport/admin/routes/', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/transport/admin/depots/', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setRoutes(routesRes.data || []);
      setDepots((depotsRes.data || []).map((d: any) => ({ id: d.id, name: d.name })));
      if (!selectedDepot && (depotsRes.data || []).length > 0) {
        setSelectedDepot((depotsRes.data || [])[0].id);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load routes');
    }
  }, [selectedDepot]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setName('');
    setSelectedDepot(depots[0]?.id ?? null);
    setEditingId(null);
  };

  const saveRoute = async () => {
    if (!name.trim() || !selectedDepot) {
      Alert.alert('Missing fields', 'Enter route name and depot');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (editingId) {
        await API.put(`/transport/admin/routes/${editingId}/`, { name, depot: selectedDepot }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await API.post('/transport/admin/routes/', { name, depot: selectedDepot }, { headers: { Authorization: `Bearer ${token}` } });
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error?.response?.data?.error || 'Unable to save route');
    }
  };

  const editRoute = (item: RouteItem) => {
    setEditingId(item.id);
    setName(item.name);
    setSelectedDepot(item.depot_id);
  };

  const deleteRoute = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await API.delete(`/transport/admin/routes/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to delete route');
    }
  };

  return (
    <AdminPage title="Routes" subtitle="Manage route names and depot assignment.">
      <AdminCard>
        <AdminSectionTitle title={editingId ? 'Edit Route' : 'New Route'} subtitle="Choose a depot and save" />
        <TextInput placeholder="Route name" style={styles.input} value={name} onChangeText={setName} />
        <View style={styles.depotRow}>
        {depots.map((depot) => (
          <TouchableOpacity key={depot.id} style={[styles.chip, selectedDepot === depot.id && styles.chipActive]} onPress={() => setSelectedDepot(depot.id)}>
            <Text style={[styles.chipText, selectedDepot === depot.id && styles.chipTextActive]}>{depot.name}</Text>
          </TouchableOpacity>
        ))}
        </View>
        <AdminActionButton label={editingId ? 'Update Route' : 'Add Route'} onPress={saveRoute} />
        {editingId ? <AdminActionButton label="Cancel Edit" onPress={resetForm} tone="secondary" /> : null}
      </AdminCard>

      <AdminCard>
        <AdminSectionTitle title="Route List" subtitle="Routes tied to depots and operational counts" />

      <FlatList
        data={routes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.rowMain}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.meta}>{item.depot}</Text>
              <Text style={styles.meta}>Stops: {item.stops_count} | Fares: {item.fares_count} | Buses: {item.buses_count}</Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.smallButton} onPress={() => editRoute(item)}><Text style={styles.smallButtonText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => deleteRoute(item.id)}><Text style={styles.smallButtonText}>Delete</Text></TouchableOpacity>
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
  depotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f4f4f4' },
  chipActive: { backgroundColor: '#C62828' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#201816' },
  meta: { color: '#6d6158', marginTop: 2, fontSize: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0e7db' },
  rowMain: { flex: 1 },
  rowActions: { justifyContent: 'center', gap: 8 },
  smallButton: { backgroundColor: '#1976D2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  deleteButton: { backgroundColor: '#C62828' },
  smallButtonText: { color: '#fff', fontWeight: 'bold' },
});
