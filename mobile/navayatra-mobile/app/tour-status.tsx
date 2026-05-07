import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";

import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function TourStatus() {

  const router = useRouter();

  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTours = async () => {

    try {

      setLoading(true);

      const token = await AsyncStorage.getItem("accessToken");

      const res = await API.get(
        "/special-tour/my-tours/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTours(res.data);

    } catch (error) {

      console.log("Tour fetch error:", error);

    } finally {

      setLoading(false);

    }

  };

  /* Refresh when screen is focused */
  useFocusEffect(
    useCallback(() => {
      fetchTours();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        My Special Tour Requests
      </Text>

      <FlatList
        data={tours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.route}>
              {item.from} → {item.to}
            </Text>

            <Text>Tour Type: {item.tour_type}</Text>

            <Text>Passengers: {item.passenger_count}</Text>

            <Text>Bus Type: {item.bus_type}</Text>

            <Text>Start Date: {item.start_date}</Text>

            <Text style={styles.status}>
              Status: {item.status}
            </Text>

            {/* APPROVED BUT NOT PAID */}

            {item.status === "APPROVED" && item.payment_status !== "PAID" && (

              <TouchableOpacity
                style={styles.payButton}
                onPress={() =>
                  router.push({
                    pathname: "/tour-payment",
                    params: {
                      tour_id: item.id,
                      price: item.estimated_price
                    }
                  })
                }
              >

                <Text style={styles.payText}>
                  Pay ₹{item.estimated_price}
                </Text>

              </TouchableOpacity>

            )}

            {/* PAYMENT SUCCESS */}

            {item.status === "APPROVED" && item.payment_status === "PAID" && (

              <View>

                <Text style={styles.success}>
                  Payment Successful
                </Text>

                <TouchableOpacity
                  style={styles.ticketButton}
                  onPress={() =>
                    router.push({
                      pathname: "/tour-ticket",
                      params: { tour_id: item.id }
                    })
                  }
                >

                  <Text style={styles.ticketText}>
                    View Ticket
                  </Text>

                </TouchableOpacity>

              </View>

            )}

            {/* REJECTED */}

            {item.status === "REJECTED" && (

              <Text style={styles.rejected}>
                Request Rejected
              </Text>

            )}

            {/* PENDING */}

            {item.status === "PENDING" && (

              <Text style={styles.pending}>
                Waiting for station master approval
              </Text>

            )}

          </View>

        )}

        ListFooterComponent={

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.buttonText}>
              Go To Home
            </Text>
          </TouchableOpacity>

        }

      />

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
    marginBottom: 20,
    color: "#C62828"
  },

  card: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },

  route: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  },

  status: {
    marginTop: 8,
    fontWeight: "bold"
  },

  payButton: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center"
  },

  payText: {
    color: "#fff",
    fontWeight: "bold"
  },

  success: {
    color: "#2E7D32",
    fontWeight: "bold",
    marginTop: 10
  },

  ticketButton: {
    backgroundColor: "#1976D2",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center"
  },

  ticketText: {
    color: "#fff",
    fontWeight: "bold"
  },

  rejected: {
    color: "red",
    marginTop: 10
  },

  pending: {
    color: "#999",
    marginTop: 10
  },

  homeButton: {
    backgroundColor: "#C62828",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }

});