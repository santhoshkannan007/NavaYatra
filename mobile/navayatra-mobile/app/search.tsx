import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SearchBusScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [busType, setBusType] = useState<'ALL' | 'AC' | 'NON_AC'>('ALL');
  const [departureSlot, setDepartureSlot] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'>('ALL');
  const [minSeats, setMinSeats] = useState('1');
  const [minFare, setMinFare] = useState('');
  const [maxFare, setMaxFare] = useState('');

  const clearFilters = () => {
    setBusType('ALL');
    setDepartureSlot('ALL');
    setMinSeats('1');
    setMinFare('');
    setMaxFare('');
  };

  const handleSearch = () => {
    if (!from.trim() || !to.trim() || !date.trim()) {
      Alert.alert('Missing details', 'Please enter source, destination, and journey date.');
      return;
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      Alert.alert('Check your route', 'Source and destination should be different.');
      return;
    }

    router.push({
      pathname: '/bus-list',
      params: {
        from: from.trim(),
        to: to.trim(),
        date: date.trim(),
        bus_type: busType,
        departure_slot: departureSlot,
        min_seats: minSeats.trim() || '1',
        min_fare: minFare.trim() || '0',
        max_fare: maxFare.trim() || '',
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
        <View style={[styles.iconWrap, { backgroundColor: palette.primarySoft }]}> 
          <Ionicons name="search-outline" size={28} color={palette.primary} />
        </View>
        <Text style={[styles.title, { color: palette.text, fontFamily: Fonts.rounded }]}>Search buses</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Discover a cleaner way to plan your route before booking.</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Trip details</Text>

        <TextInput
          placeholder="From"
          placeholderTextColor={palette.muted}
          style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surfaceElevated, color: palette.text }]}
          value={from}
          onChangeText={setFrom}
        />
        <TextInput
          placeholder="To"
          placeholderTextColor={palette.muted}
          style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surfaceElevated, color: palette.text }]}
          value={to}
          onChangeText={setTo}
        />
        <TextInput
          placeholder="Journey Date (YYYY-MM-DD)"
          placeholderTextColor={palette.muted}
          style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surfaceElevated, color: palette.text }]}
          value={date}
          onChangeText={setDate}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, busType === 'ALL' && styles.filterChipActive]} onPress={() => setBusType('ALL')}>
            <Text>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, busType === 'AC' && styles.filterChipActive]} onPress={() => setBusType('AC')}>
            <Text>AC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, busType === 'NON_AC' && styles.filterChipActive]} onPress={() => setBusType('NON_AC')}>
            <Text>Non-AC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {['ALL', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'].map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.filterChip, departureSlot === slot && styles.filterChipActive]}
              onPress={() => setDepartureSlot(slot as any)}
            >
              <Text>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="Minimum seats"
          keyboardType="numeric"
          placeholderTextColor={palette.muted}
          style={[styles.input, { borderColor: palette.border, backgroundColor: palette.surfaceElevated, color: palette.text }]}
          value={minSeats}
          onChangeText={setMinSeats}
        />

        <View style={styles.fareRow}>
          <TextInput
            placeholder="Min fare"
            keyboardType="numeric"
            placeholderTextColor={palette.muted}
            style={[styles.input, styles.fareInput, { borderColor: palette.border, backgroundColor: palette.surfaceElevated, color: palette.text }]}
            value={minFare}
            onChangeText={setMinFare}
          />
          <TextInput
            placeholder="Max fare"
            keyboardType="numeric"
            placeholderTextColor={palette.muted}
            style={[styles.input, styles.fareInput, { borderColor: palette.border, backgroundColor: palette.surfaceElevated, color: palette.text }]}
            value={maxFare}
            onChangeText={setMaxFare}
          />
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear filters</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: palette.primary }]} onPress={handleSearch}>
          <Text style={styles.buttonText}>Find buses</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        {['Kozhikode', 'Thrissur', 'Alappuzha'].map((city) => (
          <TouchableOpacity key={city} style={[styles.quickChip, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]} onPress={() => setFrom(city)}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>{city}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  formCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 16,
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 15,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: '#C62828',
    backgroundColor: '#FFEAEA',
  },
  fareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fareInput: {
    flex: 1,
  },
  clearButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  clearButtonText: {
    color: '#C62828',
    fontWeight: '700',
    fontSize: 13,
  },
});
