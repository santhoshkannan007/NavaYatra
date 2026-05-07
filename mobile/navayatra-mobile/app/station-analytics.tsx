import {
View,
Text,
StyleSheet,
ActivityIndicator
} from "react-native";

import { useEffect,useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";


export default function StationAnalytics(){

const [data,setData] = useState<any>(null);
const [loading,setLoading] = useState(true);


const fetchAnalytics = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
"/booking/station-analytics/",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setData(res.data);

}catch(error){

console.log(error);

}finally{

setLoading(false);

}

};


useEffect(()=>{
fetchAnalytics();
},[]);


if(loading){

return(
<View style={styles.loading}>
<ActivityIndicator size="large" color="#C62828"/>
</View>
)

}


return(

<View style={styles.container}>

<Text style={styles.title}>
Depot Analytics
</Text>

<Text style={styles.depot}>
Depot: {data.depot}
</Text>

<View style={styles.card}>
<Text style={styles.label}>Today's Bookings</Text>
<Text style={styles.value}>{data.today_bookings}</Text>
</View>

<View style={styles.card}>
<Text style={styles.label}>Today's Revenue</Text>
<Text style={styles.value}>₹{data.today_revenue}</Text>
</View>

<View style={styles.card}>
<Text style={styles.label}>Seats Booked</Text>
<Text style={styles.value}>{data.seats_booked}</Text>
</View>

<View style={styles.card}>
<Text style={styles.label}>Pending Tours</Text>
<Text style={styles.value}>{data.pending_tours}</Text>
</View>

<View style={styles.card}>
<Text style={styles.label}>Approved Tours</Text>
<Text style={styles.value}>{data.approved_tours}</Text>
</View>

</View>

)

}


const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:"#fff",
paddingTop:40
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

title:{
fontSize:24,
fontWeight:"bold",
marginBottom:10,
color:"#C62828"
},

depot:{
fontSize:16,
marginBottom:20
},

card:{
backgroundColor:"#F5F5F5",
padding:20,
borderRadius:10,
marginBottom:15
},

label:{
fontSize:16,
color:"#555"
},

value:{
fontSize:22,
fontWeight:"bold",
marginTop:5
}

});