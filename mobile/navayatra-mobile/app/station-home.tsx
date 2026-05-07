import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "@/services/api";

export default function StationHome(){

  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      const res = await API.get("/booking/station-analytics/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnalytics(res.data);
    } catch (error) {
      console.log("Station dashboard analytics error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const actions = [
    {
      title: "My Profile",
      subtitle: "View station account",
      icon: "person-circle-outline",
      route: "/station-profile",
      color: "#0f766e",
    },
    {
      title: "Depot Buses",
      subtitle: "Add and edit buses",
      icon: "bus-outline",
      route: "/station-buses",
      color: "#1d4ed8",
    },
    {
      title: "Route Stops",
      subtitle: "Manage stop order",
      icon: "git-network-outline",
      route: "/station-stops",
      color: "#7c3aed",
    },
    {
      title: "Fare Setup",
      subtitle: "Update route fares",
      icon: "cash-outline",
      route: "/station-fares",
      color: "#b45309",
    },
    {
      title: "Special Tours",
      subtitle: "Approve or reject",
      icon: "map-outline",
      route: "/station-tours",
      color: "#c2410c",
    },
    {
      title: "Ticket Bookings",
      subtitle: "View depot bookings",
      icon: "ticket-outline",
      route: "/station-bookings",
      color: "#be123c",
    },
    {
      title: "Depot Analytics",
      subtitle: "Live performance",
      icon: "bar-chart-outline",
      route: "/station-analytics",
      color: "#334155",
    },
  ];

  const pendingTours = analytics?.pending_tours ?? 0;
  const todayBookings = analytics?.today_bookings ?? 0;
  const seatsBooked = analytics?.seats_booked ?? 0;
  const todayRevenue = analytics?.today_revenue ?? 0;

  const alerts = [
    pendingTours > 0
      ? {
          level: "high",
          icon: "alert-circle-outline",
          title: `${pendingTours} special tour request(s) pending approval`,
          note: "Review and process pending requests quickly.",
        }
      : {
          level: "ok",
          icon: "checkmark-circle-outline",
          title: "No pending special tours",
          note: "All special tour requests are up to date.",
        },
    todayBookings === 0
      ? {
          level: "medium",
          icon: "trending-down-outline",
          title: "No ticket bookings recorded today",
          note: "Check routes and operations for low activity.",
        }
      : {
          level: "ok",
          icon: "trending-up-outline",
          title: `${todayBookings} booking(s) recorded today`,
          note: "Ticket flow is active for your depot.",
        },
    seatsBooked < 10
      ? {
          level: "medium",
          icon: "people-outline",
          title: `Only ${seatsBooked} seat(s) booked today`,
          note: "Monitor demand and adjust schedule if needed.",
        }
      : {
          level: "ok",
          icon: "people-circle-outline",
          title: `${seatsBooked} seat(s) booked today`,
          note: "Passenger occupancy looks healthy.",
        },
    {
      level: "info",
      icon: "cash-outline",
      title: `Today's revenue: ₹${todayRevenue}`,
      note: "Pulled from confirmed bookings under your depot.",
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return(

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#C62828"
        />
      }
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.heroCard}>
        <Text style={styles.title}>Station Master Dashboard</Text>
        <Text style={styles.subtitle}>
          Depot: {analytics?.depot || "Unknown"}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{analytics?.today_bookings ?? 0}</Text>
          <Text style={styles.metricLabel}>Today's Bookings</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>₹{analytics?.today_revenue ?? 0}</Text>
          <Text style={styles.metricLabel}>Today's Revenue</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{analytics?.pending_tours ?? 0}</Text>
          <Text style={styles.metricLabel}>Pending Tours</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{analytics?.seats_booked ?? 0}</Text>
          <Text style={styles.metricLabel}>Seats Booked</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Alerts</Text>

      <View style={styles.alertList}>
        {alerts.map((alert, idx) => (
          <View
            key={`${alert.title}-${idx}`}
            style={[
              styles.alertCard,
              alert.level === "high" && styles.alertHigh,
              alert.level === "medium" && styles.alertMedium,
              alert.level === "ok" && styles.alertOk,
              alert.level === "info" && styles.alertInfo,
            ]}
          >
            <Ionicons name={alert.icon as any} size={18} color="#0f172a" />
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertNote}>{alert.note}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.actionCard}
            onPress={() => router.push(action.route as any)}
          >
            <View style={[styles.iconWrap, { backgroundColor: action.color }]}> 
              <Ionicons name={action.icon as any} size={18} color="#fff" />
            </View>

            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>

  )

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f8fafc",
},

contentContainer:{
padding:20,
paddingTop:50,
paddingBottom:30,
},

heroCard:{
backgroundColor:"#fee2e2",
borderColor:"#fecaca",
borderWidth:1,
padding:16,
borderRadius:14,
marginBottom:14,
},

title:{
fontSize:24,
fontWeight:"bold",
color:"#C62828"
},

subtitle:{
fontSize:14,
color:"#7f1d1d",
marginTop:6,
},

sectionTitle:{
fontSize:17,
fontWeight:"700",
marginTop:8,
marginBottom:10,
color:"#0f172a",
},

metricsRow:{
flexDirection:"row",
gap:10,
marginBottom:10,
},

metricCard:{
flex:1,
backgroundColor:"#ffffff",
borderRadius:12,
padding:14,
borderColor:"#e2e8f0",
borderWidth:1,
},

metricValue:{
fontSize:20,
fontWeight:"800",
color:"#111827",
},

metricLabel:{
marginTop:4,
fontSize:12,
color:"#475569",
fontWeight:"600",
},

alertList:{
gap:8,
marginBottom:10,
},

alertCard:{
flexDirection:"row",
alignItems:"flex-start",
gap:10,
padding:12,
borderRadius:12,
borderWidth:1,
},

alertHigh:{
backgroundColor:"#fef2f2",
borderColor:"#fecaca",
},

alertMedium:{
backgroundColor:"#fffbeb",
borderColor:"#fde68a",
},

alertOk:{
backgroundColor:"#ecfdf5",
borderColor:"#bbf7d0",
},

alertInfo:{
backgroundColor:"#eff6ff",
borderColor:"#bfdbfe",
},

alertTextWrap:{
flex:1,
},

alertTitle:{
fontSize:13,
fontWeight:"700",
color:"#0f172a",
},

alertNote:{
marginTop:3,
fontSize:12,
color:"#334155",
},

actionGrid:{
flexDirection:"row",
flexWrap:"wrap",
gap:10,
},

actionCard:{
width:"48%",
backgroundColor:"#ffffff",
borderRadius:12,
padding:12,
borderColor:"#e2e8f0",
borderWidth:1,
minHeight:108,
},

iconWrap:{
width:32,
height:32,
borderRadius:16,
justifyContent:"center",
alignItems:"center",
marginBottom:10,
},

actionTitle:{
fontSize:14,
fontWeight:"800",
color:"#0f172a",
},

actionSubtitle:{
fontSize:12,
color:"#475569",
marginTop:4,
},

loadingContainer:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:"#f8fafc",
}

});