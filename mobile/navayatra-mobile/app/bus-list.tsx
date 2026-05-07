import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import API from "@/services/api";

export default function BusListScreen() {
  const router = useRouter();
  const { from, to, date, bus_type, departure_slot, min_seats, min_fare, max_fare } = useLocalSearchParams();

  const [buses, setBuses] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'EARLIEST' | 'LOWEST_FARE' | 'HIGHEST_RATING'>('EARLIEST');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {

    try {

      const res = await API.get(
        `/transport/search-buses/?source=${from}&destination=${to}&date=${date}&bus_type=${bus_type || 'ALL'}&departure_slot=${departure_slot || 'ALL'}&min_seats=${min_seats || 1}&min_fare=${min_fare || 0}&max_fare=${max_fare || ''}`
      );

      setBuses(res.data);

    } catch (error) {
      console.log(error);
    }

  };

  const toMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return 0;
    const hm = parts[0].split(':');
    if (hm.length < 2) return 0;
    const ampm = parts[1].toUpperCase();
    let hour = parseInt(hm[0], 10);
    const minute = parseInt(hm[1], 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;

    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const sortedBuses = [...buses].sort((a, b) => {
    if (sortBy === 'LOWEST_FARE') {
      return Number(a.fare || 0) - Number(b.fare || 0);
    }
    if (sortBy === 'HIGHEST_RATING') {
      return Number(b.avg_rating || 0) - Number(a.avg_rating || 0);
    }
    return toMinutes(a.departure_time) - toMinutes(b.departure_time);
  });

  const renderBus = ({ item }: any) => (

    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/seat-selection",
          params: {
            bus_id: item.id,
            date,
            from,
            to,
          },
        })
      }
    >

    {/* Header */}
    <View style={styles.rowBetween}>
      <Text style={styles.ksrtc}>{item.depot}</Text>
      <Text style={styles.time}>{item.departure_time}</Text>
    </View>

    {/* Route */}
    <Text style={styles.route}>
      {from} ➜ {to}
    </Text>

    {/* Info Box */}
    <View style={styles.infoBox}>
      <Text style={styles.infoText}>
        🚌 Bus No: <Text style={{fontWeight:"bold"}}>{item.bus_number}</Text>
      </Text>

      <Text style={styles.infoText}>
        🕒 Arrival: {item.arrival_time}
      </Text>

      <Text style={styles.infoText}>
        💺 Seats: {item.total_seats}
      </Text>

      <Text style={styles.infoText}>
        ✅ Available: {item.seats_available ?? item.total_seats}
      </Text>

      <Text style={styles.infoText}>
        💰 Fare: ₹{item.fare ?? 0}
      </Text>

      <Text style={styles.infoText}>
        ⭐ Rating: {item.avg_rating ?? 0} ({item.review_count ?? 0} reviews)
      </Text>

      <Text style={styles.infoText}>
        🛣 Route: {item.route}
      </Text>
    </View>

    {/* Bottom Row */}
    <View style={styles.bottomRow}>

      <Text style={styles.busType}>
        {item.bus_type === "AC" ? "Super Fast AC" : "Fast Passenger"}
      </Text>

      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>⭐ {item.avg_rating ?? 0}</Text>
        <Text style={styles.reviewText}>{item.review_count ?? 0} reviews</Text>
      </View>

      <View style={styles.moreBox}>
        <Image
          source={{
            uri: item.bus_type === "AC"
              ? "https://images.timesproperty.com/blog/5898/ksrtc_bus.png"
              : "https://nelsonmcbs.com/wp-content/uploads/2024/11/ksrtc-bus.jpeg"
          }}
          style={styles.busIcon}
        />
        {/* <Text style={styles.moreText}>More...</Text> */}
      </View>

    </View>

  </TouchableOpacity>
);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Available Buses</Text>

      <View style={styles.sortRow}>
        <TouchableOpacity style={[styles.sortChip, sortBy === 'EARLIEST' && styles.sortChipActive]} onPress={() => setSortBy('EARLIEST')}>
          <Text style={styles.sortChipText}>Earliest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortChip, sortBy === 'LOWEST_FARE' && styles.sortChipActive]} onPress={() => setSortBy('LOWEST_FARE')}>
          <Text style={styles.sortChipText}>Lowest Fare</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortChip, sortBy === 'HIGHEST_RATING' && styles.sortChipActive]} onPress={() => setSortBy('HIGHEST_RATING')}>
          <Text style={styles.sortChipText}>Top Rated</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedBuses}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderBus}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C62828",
    marginBottom: 20,
  },

  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },

  sortChip: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sortChipActive: {
    borderColor: '#C62828',
    backgroundColor: '#FFEAEA',
  },

  sortChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  card: {
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ksrtc: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
  },

  time: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },

  route: {
    fontSize: 20,
    marginTop: 8,
    color: "#444",
  },

  infoBox: {
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

  infoText: {
    fontSize: 14,
    color: "#444",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  busType: {
    fontSize: 20,
    color: "#C62828",
    fontWeight: "600",
  },

  moreBox: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 10,
    padding: 8,
  },

  ratingBadge: {
    backgroundColor: "#FFF5E8",
    borderColor: "#F1C27D",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    marginRight: 8,
  },

  ratingText: {
    fontWeight: "700",
    color: "#8A4B08",
  },

  reviewText: {
    fontSize: 10,
    color: "#8A4B08",
  },

  busIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },

  moreText: {
    color: "#2E7D32",
    fontWeight: "600",
  },

});