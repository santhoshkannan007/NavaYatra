import {
View,
Text,
StyleSheet,
FlatList,
ActivityIndicator
} from "react-native";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function StationBookings(){

const [bookings,setBookings] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

const fetchBookings = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
"/booking/station-master/bookings/",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setBookings(res.data);

}catch(error){

console.log(error);

}finally{

setLoading(false);

}

};

useEffect(()=>{
fetchBookings();
},[]);

if(loading){

return(
<View style={styles.loading}>
<ActivityIndicator size="large" color="#C62828"/>
</View>
);

}

return(

<View style={styles.container}>

<Text style={styles.title}>
Depot Ticket Bookings
</Text>

<FlatList
data={bookings}
keyExtractor={(item)=>item.booking_id.toString()}
renderItem={({item})=>(

<View style={styles.card}>

<Text style={styles.route}>
{item.pickup} → {item.dropoff}
</Text>

<Text>Date: {item.date}</Text>

<Text>Bus: {item.bus}</Text>

<Text>Passengers: {item.passenger_count}</Text>

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
fontSize:22,
fontWeight:"bold",
marginBottom:20
},

card:{
backgroundColor:"#F5F5F5",
padding:15,
borderRadius:10,
marginBottom:10
},

route:{
fontSize:16,
fontWeight:"bold"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
}

});