import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function TourBus() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const [buses, setBuses] = useState("");
  const [busType, setBusType] = useState("");
  const [passengerCount, setPassengerCount] = useState("");

  const validateForm = () => {

    if (!buses.trim()) {
      Alert.alert("Validation Error", "Please enter number of buses");
      return false;
    }

    if (isNaN(Number(buses)) || Number(buses) <= 0) {
      Alert.alert("Validation Error", "Number of buses must be a valid number");
      return false;
    }

    if (!busType) {
      Alert.alert("Validation Error", "Please select bus type");
      return false;
    }

    if (!passengerCount.trim()) {
      Alert.alert("Validation Error", "Please enter passenger count");
      return false;
    }

    if (isNaN(Number(passengerCount)) || Number(passengerCount) <= 0) {
      Alert.alert("Validation Error", "Passenger count must be a valid number");
      return false;
    }

    const passengers = Number(passengerCount);
    const busNumber = Number(buses);

    let capacity = 0;

    if (busType === "AC") capacity = 45;
    if (busType === "Non-AC") capacity = 50;
    if (busType === "Sleeper") capacity = 30;

    if (passengers > capacity * busNumber) {
      Alert.alert(
        "Capacity Error",
        `Selected buses cannot accommodate ${passengers} passengers`
      );
      return false;
    }

    return true;
  };

  const handleNext = () => {

    if (!validateForm()) return;

    router.push({
      pathname: "/tour-contact",
      params: {
        ...params,
        number_of_buses: buses,
        bus_type: busType,
        passenger_count: passengerCount,
      }
    });
  };

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Bus Requirement</Text>

        <Text style={styles.label}>Number of Buses</Text>

        <TextInput
          placeholder="Enter number of buses"
          keyboardType="numeric"
          value={buses}
          onChangeText={setBuses}
          style={styles.input}
        />

        <Text style={styles.label}>Bus Type</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={busType}
            onValueChange={(itemValue) => setBusType(itemValue)}
          >
            <Picker.Item label="Select Bus Type" value="" />
            <Picker.Item label="AC Bus (45 seats)" value="AC" />
            <Picker.Item label="Non-AC Bus (50 seats)" value="Non-AC" />
            <Picker.Item label="Sleeper Bus (30 seats)" value="Sleeper" />
          </Picker>
        </View>

        <Text style={styles.label}>Passenger Count</Text>

        <TextInput
          placeholder="Enter passenger count"
          keyboardType="numeric"
          value={passengerCount}
          onChangeText={setPassengerCount}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

      </ScrollView>

    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: "#ffffff",
    justifyContent: "center"
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#C62828"
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 16
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 18
  },

  button: {
    backgroundColor: "#C62828",
    padding: 16,
    borderRadius: 10,
    marginTop: 10
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  }

});