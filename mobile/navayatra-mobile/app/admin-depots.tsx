import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminActionButton, AdminCard, AdminPage, AdminSectionTitle } from '@/components/admin-ui';

type DepotItem = {
  id: number;
  name: string;
  district: string;
  routes_count: number;
  buses_count: number;
};

export default function AdminDepots() {
  const [depots, setDepots] = useState<DepotItem[]>([]);
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchDepots = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await API.get('/transport/admin/depots/', { headers: { Authorization: `Bearer ${token}` } });
      setDepots(res.data || []);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load depots');
    }
  };

  useEffect(() => {
    fetchDepots();
  }, []);

  const resetForm = () => {
    setName('');
    setDistrict('');
    setEditingId(null);
  };

  const saveDepot = async () => {
    if (!name.trim() || !district.trim()) {
      Alert.alert('Missing fields', 'Enter depot name and district');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (editingId) {
        await API.put(`/transport/admin/depots/${editingId}/`, { name, district }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await API.post('/transport/admin/depots/', { name, district }, { headers: { Authorization: `Bearer ${token}` } });
      }
      resetForm();
      fetchDepots();
    } catch (error: any) {
      console.log(error);
      Alert.alert('Error', error?.response?.data?.error || 'Unable to save depot');
    }
  };

  const editDepot = (item: DepotItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDistrict(item.district);
  };

  const deleteDepot = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await API.delete(`/transport/admin/depots/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchDepots();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Unable to delete depot');
    }
  };

  return (
    <AdminPage title="Depots" subtitle="Manage depot records in a dense admin layout.">
      <AdminCard>
        <AdminSectionTitle title={editingId ? 'Edit Depot' : 'New Depot'} subtitle="Create or update depot details" />
        <TextInput placeholder="Depot name" style={styles.input} value={name} onChangeText={setName} />
        <TextInput placeholder="District" style={styles.input} value={district} onChangeText={setDistrict} />
        <AdminActionButton label={editingId ? 'Update Depot' : 'Add Depot'} onPress={saveDepot} />
        {editingId ? <AdminActionButton label="Cancel Edit" onPress={resetForm} tone="secondary" /> : null}
      </AdminCard>

      <AdminCard>
        <AdminSectionTitle title="Depot List" subtitle="Counts reflect linked routes and buses" />
      <FlatList
        data={depots}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.rowMain}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.meta}>{item.district}</Text>
              <Text style={styles.meta}>Routes: {item.routes_count} | Buses: {item.buses_count}</Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.smallButton} onPress={() => editDepot(item)}><Text style={styles.smallButtonText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => deleteDepot(item.id)}><Text style={styles.smallButtonText}>Delete</Text></TouchableOpacity>
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
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#201816' },
  meta: { color: '#6d6158', marginTop: 2, fontSize: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0e7db' },
  rowMain: { flex: 1 },
  rowActions: { justifyContent: 'center', gap: 8 },
  smallButton: { backgroundColor: '#1976D2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  deleteButton: { backgroundColor: '#C62828' },
  smallButtonText: { color: '#fff', fontWeight: 'bold' },
});
