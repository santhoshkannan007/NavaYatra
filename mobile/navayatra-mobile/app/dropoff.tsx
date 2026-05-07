import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import API from "@/services/api";

export default function DropoffScreen() {

  const router = useRouter();

  const { bus_id, date, seats, pickup, from, to } = useLocalSearchParams();

  const [stops, setStops] = useState<any[]>([]);
  const [dropoff, setDropoff] = useState<string | null>(null);
  const [fare, setFare] = useState<number>(0);

  useEffect(() => {
    fetchStops();
  }, []);

  const fetchStops = async () => {

    try {

      const res = await API.get(`/transport/bus-stops/${bus_id}`);
      setStops(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const fetchFare = async (pickupStop: string, dropStop: string) => {

    try {

      const res = await API.get(
        `/transport/fare/?source=${pickupStop}&destination=${dropStop}`
      );

      setFare(Number(res.data.price) || 0);

    } catch (error) {

      console.log("Fare fetch error:", error);
      setFare(0);

    }

  };

  const handleSelect = async (stopName: string) => {

    setDropoff(stopName);

    if (pickup) {
      await fetchFare(pickup as string, stopName);
    }

  };

  const continueNext = () => {

    router.push({
      pathname: "/passenger-info",
      params: {
        bus_id,
        date,
        seats,
        pickup,
        dropoff,
        from,
        to,
        price: fare
      }
    });

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Select Drop-off Location</Text>

      <FlatList
        data={stops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              styles.item,
              dropoff === item.name && styles.selected
            ]}
            onPress={() => handleSelect(item.name)}
          >

            <Text>{item.name}</Text>

          </TouchableOpacity>

        )}
      />

      <TouchableOpacity
        style={[styles.button, !dropoff && styles.disabled]}
        disabled={!dropoff}
        onPress={continueNext}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

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
    marginBottom: 15,
  },

  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },

  selected: {
    backgroundColor: "#E8F5E9",
    borderColor: "#2E7D32",
  },

  button: {
    backgroundColor: "#C62828",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },

  disabled: {
    backgroundColor: "#ccc",
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

});