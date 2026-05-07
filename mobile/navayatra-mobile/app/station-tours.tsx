import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function StationTours() {

  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceInputs, setPriceInputs] = useState<{[key:number]:string}>({});

  const fetchTours = async () => {

    try {

      const token = await AsyncStorage.getItem("accessToken");

      const res = await API.get(
        "/special-tour/station-requests/",
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

  useEffect(() => {
    fetchTours();
  }, []);

  const approveTour = async (id:number) => {

    const price = priceInputs[id];

    if (!price) {
      Alert.alert("Error","Enter price before approving");
      return;
    }

    try {

      const token = await AsyncStorage.getItem("accessToken");

      await API.post(
        `/special-tour/approve/${id}/`,
        { estimated_price: price },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Alert.alert("Success","Tour Approved");

      fetchTours();

    } catch (error) {

      console.log(error);
      Alert.alert("Error","Approval failed");

    }

  };

  const rejectTour = async (id:number) => {

    try {

      const token = await AsyncStorage.getItem("accessToken");

      await API.post(
        `/special-tour/reject/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Alert.alert("Rejected");

      fetchTours();

    } catch (error) {

      console.log(error);

    }

  };

  if (loading) {

    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#C62828"/>
      </View>
    );

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Special Tour Requests
      </Text>

      <FlatList
        data={tours}
        keyExtractor={(item)=>item.id.toString()}

        renderItem={({item})=>(

          <View style={styles.card}>

            <Text style={styles.route}>
              {item.from} → {item.to}
            </Text>

            <Text>Type: {item.tour_type}</Text>

            <Text>Passengers: {item.passenger_count}</Text>

            <Text>Bus Type: {item.bus_type}</Text>

            <Text>Contact: {item.contact_name}</Text>

            <Text>Phone: {item.phone}</Text>

            <Text>Start Date: {item.start_date}</Text>

            <TextInput
              placeholder="Enter Price"
              keyboardType="numeric"
              style={styles.input}
              onChangeText={(text)=>
                setPriceInputs({...priceInputs,[item.id]:text})
              }
            />

            <View style={styles.row}>

              <TouchableOpacity
                style={styles.approve}
                onPress={()=>approveTour(item.id)}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reject}
                onPress={()=>rejectTour(item.id)}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>

            </View>

          </View>

        )}

      />

    </View>

  );

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:"#fff",
paddingTop:50
},

title:{
fontSize:24,
fontWeight:"bold",
marginBottom:20,
color:"#C62828"
},

card:{
backgroundColor:"#F5F5F5",
padding:15,
borderRadius:10,
marginBottom:15
},

route:{
fontSize:16,
fontWeight:"bold",
marginBottom:5
},

input:{
borderWidth:1,
borderColor:"#ccc",
padding:10,
borderRadius:8,
marginTop:10
},

row:{
flexDirection:"row",
marginTop:10
},

approve:{
backgroundColor:"#2E7D32",
padding:10,
borderRadius:6,
marginRight:10
},

reject:{
backgroundColor:"#C62828",
padding:10,
borderRadius:6
},

buttonText:{
color:"#fff",
fontWeight:"bold"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
}

});