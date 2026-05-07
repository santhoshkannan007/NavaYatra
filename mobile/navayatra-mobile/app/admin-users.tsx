import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '@/services/api';
import { AdminCard, AdminPage, AdminSectionTitle } from '@/components/admin-ui';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const res = await API.get('/auth/admin/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.users || []);
    } catch (e) {
      console.log('fetch users error', e);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.name}>{item.username} ({item.role})</Text>
        <Text style={styles.sub}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.sub}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: item.is_active ? '#e53935' : '#2e7d32' }]}
        onPress={() => toggleActive(item)}
      >
        <Text style={styles.buttonText}>{item.is_active ? 'Deactivate' : 'Activate'}</Text>
      </TouchableOpacity>
    </View>
  );

  const toggleActive = async (item: any) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      await API.patch(`/auth/admin/users/${item.id}/`, { is_active: !item.is_active }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchUsers();
    } catch (e) {
      console.log('toggle error', e);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  return (
    <AdminPage title="Users" subtitle="Account control, activation, and role overview.">
      <AdminCard>
        <AdminSectionTitle title="User Access" subtitle="Tap a row to manage status" />
      <FlatList
        data={users}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      </AdminCard>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0e7db' },
  name: { fontWeight: '800', color: '#201816' },
  sub: { color: '#6d6158', marginTop: 2 },
  button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, alignSelf: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
