import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function TravellerContactScreen() {

  const router = useRouter();

  const {
    bus_id,
    date,
    seats,
    pickup,
    dropoff,
    from,
    to,
    price,
    passengers
  } = useLocalSearchParams();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<any>({});

  const validate = () => {

    let valid = true;
    const newErrors: any = {};

    if (!phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Enter valid 10 digit phone number";
      valid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter valid email";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const proceed = () => {

    if (!validate()) return;

    router.push({
      pathname: "/payment",
      params: {
        bus_id,
        date,
        seats,
        pickup,
        dropoff,
        from,
        to,
        price,
        passengers,
        phone,
        email
      }
    });

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Passenger Contact Details
      </Text>

      <TextInput
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      <TextInput
        placeholder="Email Address"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={proceed}
      >
        <Text style={styles.buttonText}>
          Proceed to Payment
        </Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 40
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C62828",
    marginBottom: 25
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5
  },

  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10
  },

  button: {
    backgroundColor: "#C62828",
    padding: 14,
    borderRadius: 8,
    marginTop: 20
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  }

});