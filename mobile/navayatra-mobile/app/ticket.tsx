import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";

import API from "@/services/api";

export default function TicketScreen() {

  const router = useRouter();
  const { booking_id } = useLocalSearchParams();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTicket = async () => {

    try {

      const token = await AsyncStorage.getItem("accessToken");

      const res = await API.get(
        `/booking/ticket/${booking_id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTicket(res.data);

      const reviewRes = await API.get(`/booking/reviews/?booking_id=${booking_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const existing = reviewRes.data?.[0];
      if (existing) {
        setRating(existing.rating || 0);
        setComment(existing.comment || "");
      }

    } catch (error) {

      console.log("Ticket fetch error:", error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchTicket();
  }, []);

  const submitReview = async () => {
    if (!rating) {
      Alert.alert("Rating required", "Please select a rating between 1 and 5.");
      return;
    }

    try {
      setSubmittingReview(true);
      const token = await AsyncStorage.getItem("accessToken");

      await API.post(
        "/booking/reviews/",
        {
          booking_id,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Alert.alert("Thank you", "Your review has been saved.");
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to submit review";
      Alert.alert("Review error", msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>Ticket Confirmed</Text>

      <View style={styles.ticket}>

        <Text style={styles.booking}>#{ticket.booking_id}</Text>

        <View style={styles.routeRow}>

          <View>
            <Text style={styles.city}>{ticket.pickup}</Text>
            <Text style={styles.label}>FROM</Text>
          </View>

          <Text style={{fontSize:30}}>🚌</Text>

          <View>
            <Text style={styles.city}>{ticket.dropoff}</Text>
            <Text style={styles.label}>TO</Text>
          </View>

        </View>

        <View style={styles.divider} />

        <Text style={styles.section}>Travel Date</Text>
        <Text>{ticket.date}</Text>

        <Text style={styles.section}>Seats</Text>
        <Text>
          {ticket.passengers.map((p:any)=>p.seat).join(", ")}
        </Text>

        <Text style={styles.section}>Passengers</Text>

        {ticket.passengers.map((p:any,index:number)=>(
          <Text key={index}>
            {p.name} | Seat {p.seat}
          </Text>
        ))}

        <View style={styles.qr}>
          <QRCode
            value={JSON.stringify(ticket)}
            size={180}
          />
        </View>

        <Text style={styles.qrText}>
          Scan while boarding
        </Text>

        <View style={styles.reviewBox}>
          <Text style={styles.section}>Rate this trip</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => setRating(value)}>
                <Text style={styles.star}>{value <= rating ? "★" : "☆"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Write your feedback (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            style={styles.commentInput}
          />

          <TouchableOpacity style={styles.reviewButton} onPress={submitReview} disabled={submittingReview}>
            <Text style={styles.buttonText}>{submittingReview ? "Submitting..." : "Submit Review"}</Text>
          </TouchableOpacity>
        </View>

      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={()=>router.replace("/home")}
      >
        <Text style={styles.buttonText}>
          Go To Home
        </Text>
      </TouchableOpacity>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F4F6F8",
padding:20
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

title:{
fontSize:22,
fontWeight:"bold",
textAlign:"center",
marginBottom:20
},

ticket:{
backgroundColor:"#fff",
borderRadius:15,
padding:20
},

booking:{
textAlign:"right",
color:"#777"
},

routeRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginVertical:15
},

city:{
fontSize:20,
fontWeight:"bold"
},

label:{
fontSize:10,
color:"#777"
},

divider:{
height:1,
backgroundColor:"#eee",
marginVertical:15
},

section:{
marginTop:10,
fontWeight:"bold"
},

qr:{
alignItems:"center",
marginTop:20
},

qrText:{
textAlign:"center",
fontSize:12,
marginTop:5,
color:"#777"
},

reviewBox:{
marginTop:20
},

starRow:{
flexDirection:"row",
gap:8,
marginTop:8,
marginBottom:10
},

star:{
fontSize:28,
color:"#C62828"
},

commentInput:{
borderWidth:1,
borderColor:"#ddd",
borderRadius:8,
padding:10,
minHeight:80,
textAlignVertical:"top"
},

reviewButton:{
marginTop:12,
backgroundColor:"#2E7D32",
padding:12,
borderRadius:8,
alignItems:"center"
},

homeButton:{
backgroundColor:"#C62828",
padding:14,
borderRadius:10,
marginTop:20
},

buttonText:{
textAlign:"center",
color:"#fff",
fontWeight:"bold"
}

});