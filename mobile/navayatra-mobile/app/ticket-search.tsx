import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TicketSearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);
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

  const formatDate = (selectedDate: Date) => {
    const dateValue = new Date(selectedDate);
    const year = dateValue.getFullYear();
    const month = (`0${dateValue.getMonth() + 1}`).slice(-2);
    const day = (`0${dateValue.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);

    if (selectedDate) {
      setDate(formatDate(selectedDate));
    }
  };

  const searchBus = () => {
    if (!from.trim()) {
      Alert.alert('Validation', 'Please enter source location');
      return;
    }

    if (!to.trim()) {
      Alert.alert('Validation', 'Please enter destination');
      return;
    }

    if (!date) {
      Alert.alert('Validation', 'Please select journey date');
      return;
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      Alert.alert('Validation', 'Source and destination cannot be the same');
      return;
    }

    router.push({
      pathname: '/bus-list',
      params: {
        from: from.trim(),
        to: to.trim(),
        date,
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
          <Ionicons name="ticket-outline" size={28} color={palette.primary} />
        </View>
        <Text style={[styles.title, { color: palette.text, fontFamily: Fonts.rounded }]}>Ticket booking</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>Search buses with a guided flow and a cleaner booking experience.</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Plan your trip</Text>

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

        <TouchableOpacity
          style={[styles.datePicker, { borderColor: palette.border, backgroundColor: palette.surfaceElevated }]}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={palette.primary} />
          <Text style={{ color: date ? palette.text : palette.muted, fontWeight: '600' }}>
            {date ? date : 'Select journey date'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            mode="date"
            display="default"
            minimumDate={new Date()}
            value={new Date()}
            onChange={onDateChange}
          />
        )}

        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickChip, busType === 'ALL' && styles.quickChipActive]} onPress={() => setBusType('ALL')}>
            <Text>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickChip, busType === 'AC' && styles.quickChipActive]} onPress={() => setBusType('AC')}>
            <Text>AC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickChip, busType === 'NON_AC' && styles.quickChipActive]} onPress={() => setBusType('NON_AC')}>
            <Text>Non-AC</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          {['ALL', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'].map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.quickChip, departureSlot === slot && styles.quickChipActive]}
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

        <TouchableOpacity style={[styles.button, { backgroundColor: palette.primary }]} onPress={searchBus}>
          <Text style={styles.buttonText}>Search buses</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickRow}>
        {['Kumily','Kochi', 'Kottayam', 'Kannur'].map((city) => (
          <TouchableOpacity
            key={city}
            style={[styles.quickChip, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}
            onPress={() => setFrom(city)}
          >
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
  datePicker: {
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontSize: 16,
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
  quickChipActive: {
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
