import {
View,
Text,
TouchableOpacity,
StyleSheet,
ScrollView,
Alert
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function TourReview(){

const router = useRouter();
const params:any = useLocalSearchParams();

const submitRequest = async ()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

await API.post(
"/special-tour/create/",
{
tour_type:params.type,

from_location:params.from_location,
to_location:params.to_location,
depot:params.depot,

journey_start_date:params.journey_start_date,
number_of_days:params.number_of_days,

number_of_buses:params.number_of_buses,
bus_type:params.bus_type,

passenger_count:params.passenger_count,

contact_name:params.contact_name,
contact_phone:params.contact_phone,
contact_email:params.contact_email
},
{
headers:{ Authorization:`Bearer ${token}` }
}
);

Alert.alert("Success","Tour request submitted");

router.replace("/tour-status");

}catch(error){

console.log(error);
Alert.alert("Error","Failed to submit request");

}

};

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>
Review Your Tour Request
</Text>

{/* ROUTE CARD */}

<View style={styles.card}>

<Text style={styles.sectionTitle}>Trip Route</Text>

<Text style={styles.route}>
📍 {params.from_location} → {params.to_location}
</Text>

<Text style={styles.item}>
🗓 Start Date: {params.journey_start_date}
</Text>

<Text style={styles.item}>
⏳ Duration: {params.number_of_days} Days
</Text>

<Text style={styles.item}>
🎯 Tour Type: {params.type}
</Text>

</View>


{/* BUS DETAILS */}

<View style={styles.card}>

<Text style={styles.sectionTitle}>Bus Details</Text>

<View style={styles.row}>

<View style={styles.infoBox}>
<Text style={styles.infoValue}>{params.number_of_buses}</Text>
<Text style={styles.infoLabel}>Buses</Text>
</View>

<View style={styles.infoBox}>
<Text style={styles.infoValue}>{params.bus_type}</Text>
<Text style={styles.infoLabel}>Bus Type</Text>
</View>

<View style={styles.infoBox}>
<Text style={styles.infoValue}>{params.passenger_count}</Text>
<Text style={styles.infoLabel}>Passengers</Text>
</View>

</View>

</View>


{/* CONTACT DETAILS */}

<View style={styles.card}>

<Text style={styles.sectionTitle}>Contact Person</Text>

<Text style={styles.item}>
👤 {params.contact_name}
</Text>

<Text style={styles.item}>
📞 {params.contact_phone}
</Text>

<Text style={styles.item}>
📧 {params.contact_email}
</Text>

</View>


{/* SUBMIT BUTTON */}

<TouchableOpacity
style={styles.button}
onPress={submitRequest}
>

<Text style={styles.buttonText}>
Confirm & Submit Request
</Text>

</TouchableOpacity>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F8F8F8",
padding:20,
paddingTop:40
},

title:{
fontSize:26,
fontWeight:"bold",
color:"#C62828",
marginBottom:20
},

card:{
backgroundColor:"#fff",
borderRadius:12,
padding:18,
marginBottom:20,
shadowColor:"#000",
shadowOpacity:0.08,
shadowRadius:6,
elevation:3
},

sectionTitle:{
fontSize:18,
fontWeight:"bold",
marginBottom:10
},

route:{
fontSize:18,
fontWeight:"bold",
color:"#1565C0",
marginBottom:10
},

item:{
fontSize:15,
marginBottom:6,
color:"#333"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:10
},

infoBox:{
alignItems:"center",
backgroundColor:"#F5F5F5",
padding:12,
borderRadius:8,
width:"30%"
},

infoValue:{
fontSize:18,
fontWeight:"bold",
color:"#2E7D32"
},

infoLabel:{
fontSize:12,
color:"#666"
},

button:{
backgroundColor:"#2E7D32",
padding:16,
borderRadius:10,
marginTop:10
},

buttonText:{
color:"#fff",
textAlign:"center",
fontSize:16,
fontWeight:"bold"
}

});