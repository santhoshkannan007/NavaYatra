import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import API from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SeatSelectionScreen() {

  const router = useRouter();
  const { bus_id, date, from, to } = useLocalSearchParams();

  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [heldSeats, setHeldSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [holdSecondsLeft, setHoldSecondsLeft] = useState(0);

  useEffect(() => {
    fetchSeats();
  }, []);

  useEffect(() => {
    if (holdSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setHoldSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [holdSecondsLeft]);

  const fetchSeats = async () => {
    try {
      const res = await API.get(`/booking/seats/${bus_id}?date=${date}`);
      setBookedSeats(res.data.booked_seats || []);
      setHeldSeats(res.data.held_seats || []);
    } catch (error) {
      console.log("Seat API error:", error);
      setBookedSeats([]);
      setHeldSeats([]);
    }
  };

  const seats = Array.from({ length: 40 }, (_, i) => i + 1);

  const handleSeatPress = (seat: number) => {

    if (bookedSeats.includes(seat) || heldSeats.includes(seat)) return;

    if (multiSelect) {

      if (selectedSeats.includes(seat)) {
        setSelectedSeats(selectedSeats.filter(s => s !== seat));
      } else {
        setSelectedSeats([...selectedSeats, seat]);
      }

    } else {

      setSelectedSeats([seat]);

    }
  };

  const renderSeat = (seat: number) => {

    const booked = bookedSeats.includes(seat);
    const held = heldSeats.includes(seat);
    const selected = selectedSeats.includes(seat);

    return (
      <TouchableOpacity
        key={seat}
        disabled={booked || held}
        style={[
          styles.seat,
          booked && styles.booked,
          held && styles.held,
          selected && styles.selected
        ]}
        onPress={() => handleSeatPress(seat)}
      >
        <Text style={styles.seatNumber}>{seat}</Text>
      </TouchableOpacity>
    );
  };

  const rows:any[] = [];

  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

  const continueBooking = async () => {

    if (selectedSeats.length === 0) {
      Alert.alert("Select Seat", "Please choose at least one seat");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const holdRes = await API.post(
        "/booking/hold-seats/",
        {
          bus_id,
          travel_date: date,
          seats: selectedSeats,
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );

      const expiresAt = new Date(holdRes.data.expires_at).getTime();
      const now = Date.now();
      const diff = Math.max(Math.floor((expiresAt - now) / 1000), 0);
      setHoldSecondsLeft(diff);
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Seat hold failed. Please try again.";
      Alert.alert("Seat hold", msg);
      fetchSeats();
      return;
    }

    router.push({
      pathname: "/pickup",
      params: {
        bus_id,
        date,
        seats: selectedSeats.join(","),
        from,
        to
      }
    });
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Select Seats</Text>

      <Text style={styles.route}>
        {from} ➜ {to}
      </Text>

      <View style={styles.switchRow}>
        <Text style={{ fontWeight: "600" }}>Multiple Selection</Text>
        <Switch value={multiSelect} onValueChange={setMultiSelect} />
      </View>

      {holdSecondsLeft > 0 && (
        <Text style={styles.holdTimer}>Seat hold active: {Math.floor(holdSecondsLeft / 60)}:{String(holdSecondsLeft % 60).padStart(2, "0")}</Text>
      )}

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.available]} />
          <Text>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.booked]} />
          <Text>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.held]} />
          <Text>Held</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.selected]} />
          <Text>Selected</Text>
        </View>
      </View>

      <ScrollView>

        <Text style={styles.driver}>🧑‍✈️ Driver</Text>

        <View style={styles.busLayout}>

          {rows.map((row, index) => (

            <View key={index} style={styles.row}>

              {renderSeat(row[0])}
              {renderSeat(row[1])}

              <View style={styles.aisle} />

              {row[2] && renderSeat(row[2])}
              {row[3] && renderSeat(row[3])}

            </View>

          ))}

        </View>

      </ScrollView>

      <View style={styles.bottomBar}>

        <Text>
          Seats: {selectedSeats.join(", ") || "None"}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={continueBooking}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  route: {
    color: "#666",
    marginBottom: 20,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendBox: {
    width: 18,
    height: 18,
    marginRight: 6,
    borderRadius: 4,
    borderWidth: 1,
  },

  available: {
    backgroundColor: "#fff",
    borderColor: "#2ecc71",
  },

  booked: {
    backgroundColor: "#ccc",
    borderColor: "#ccc",
  },

  held: {
    backgroundColor: "#F8D7DA",
    borderColor: "#F1AEB5",
  },

  selected: {
    backgroundColor: "#ffe6f0",
    borderColor: "#ff2d75",
  },

  driver: {
    textAlign: "right",
    marginBottom: 15,
    fontSize: 16,
  },

  busLayout: {
    alignItems: "center",
    marginBottom: 40,
  },

  row: {
    flexDirection: "row",
    marginBottom: 12,
  },

  aisle: {
    width: 30,
  },

  seat: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: "#2ecc71",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },

  seatNumber: {
    fontWeight: "600",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 15,
  },

  holdTimer: {
    marginBottom: 10,
    color: "#C62828",
    fontWeight: "700",
  },

  summaryText: {
    color: "#555",
  },

  total: {
    fontSize: 20,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#C62828",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

});