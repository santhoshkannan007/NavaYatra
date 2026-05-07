import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";

interface Passenger {
  seat_number: number;
  name: string;
  age: string;
  gender: string;
}

export default function PassengerInfoScreen() {

  const router = useRouter();

  const { bus_id, date, seats, pickup, dropoff, from, to, price } =
    useLocalSearchParams();

  const seatList = (seats as string).split(",").map(Number);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const [passengers, setPassengers] = useState<Passenger[]>(
    seatList.map((seat) => ({
      seat_number: seat,
      name: "",
      age: "",
      gender: "",
    }))
  );

  const [errors, setErrors] = useState<any>({});

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {

    const updated = [...passengers];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setPassengers(updated);
  };

  const validate = () => {

    let valid = true;
    const newErrors: any = {};

    passengers.forEach((p, index) => {

      if (!p.name.trim()) {
        newErrors[`name${index}`] = "Name required";
        valid = false;
      }

      if (!p.age) {
        newErrors[`age${index}`] = "Age required";
        valid = false;
      }

      if (!p.gender) {
        newErrors[`gender${index}`] = "Select gender";
        valid = false;
      }

    });

    setErrors(newErrors);

    return valid;
  };

  const continueNext = () => {

    if (!validate()) return;

    router.push({
      pathname: "/traveller-contact",
      params: {
        bus_id,
        date,
        seats,
        pickup,
        dropoff,
        from,
        to,
        price,
        passengers: JSON.stringify(passengers),
      },
    });
  };

  const toggleCard = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>Passenger Information</Text>

      {passengers.map((p, index) => (

        <View key={p.seat_number} style={styles.card}>

          {/* Collapse Header */}
          <TouchableOpacity
            style={styles.header}
            onPress={() => toggleCard(index)}
          >

            <Text style={styles.seatTitle}>
              Seat {p.seat_number}
            </Text>

            <Text style={styles.toggle}>
              {expandedIndex === index ? "▲" : "▼"}
            </Text>

          </TouchableOpacity>

          {expandedIndex === index && (

            <View>

              {/* Name */}

              <TextInput
                placeholder="Passenger Name"
                style={styles.input}
                value={p.name}
                onChangeText={(v) => updatePassenger(index, "name", v)}
              />

              {errors[`name${index}`] && (
                <Text style={styles.error}>
                  {errors[`name${index}`]}
                </Text>
              )}

              {/* Age */}

              <TextInput
                placeholder="Age"
                keyboardType="numeric"
                style={styles.input}
                value={p.age}
                onChangeText={(v) => {

                  const cleaned = v.replace(/[^0-9]/g, "");
                  updatePassenger(index, "age", cleaned);

                }}
              />

              {errors[`age${index}`] && (
                <Text style={styles.error}>
                  {errors[`age${index}`]}
                </Text>
              )}

              {/* Gender Dropdown */}

              <View style={styles.pickerWrapper}>

                <Picker
                  selectedValue={p.gender}
                  onValueChange={(v) =>
                    updatePassenger(index, "gender", v)
                  }
                >

                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />

                </Picker>

              </View>

              {errors[`gender${index}`] && (
                <Text style={styles.error}>
                  {errors[`gender${index}`]}
                </Text>
              )}

            </View>

          )}

        </View>

      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={continueNext}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

    </ScrollView>

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

  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 15,
    padding: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  seatTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  toggle: {
    fontSize: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 10,
  },

  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },

  button: {
    backgroundColor: "#C62828",
    padding: 15,
    borderRadius: 8,
    marginTop: 25,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

});