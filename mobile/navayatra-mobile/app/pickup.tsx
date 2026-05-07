import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import API from "@/services/api";

export default function PickupScreen() {

  const router = useRouter();

  const { bus_id, date, seats, from, to, price } = useLocalSearchParams();

  const [stops, setStops] = useState<any[]>([]);
  const [pickup, setPickup] = useState<string | null>(null);

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

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Select Pickup Location</Text>

      <FlatList
        data={stops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              styles.item,
              pickup === item.name && styles.selected
            ]}
            onPress={() => setPickup(item.name)}
          >

            <Text>{item.name}</Text>

          </TouchableOpacity>

        )}
      />

      <TouchableOpacity
        style={[styles.button, !pickup && styles.disabled]}
        disabled={!pickup}
        onPress={() =>
          router.push({
            pathname: "/dropoff",
            params: {
              bus_id,
              date,
              seats,
              from,
              to,
              price,
              pickup
            }
          })
        }
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
    backgroundColor: "#FDECEA",
    borderColor: "#C62828",
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