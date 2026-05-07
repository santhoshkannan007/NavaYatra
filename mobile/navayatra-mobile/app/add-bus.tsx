import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
ScrollView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function AddBus(){

const router = useRouter();

const [number,setNumber] = useState("");
const [route,setRoute] = useState("");
const [busType,setBusType] = useState("");
const [seats,setSeats] = useState("");
const [departure,setDeparture] = useState("");
const [arrival,setArrival] = useState("");
const [departureDate, setDepartureDate] = useState(new Date());
const [arrivalDate, setArrivalDate] = useState(new Date());
const [showDeparturePicker, setShowDeparturePicker] = useState(false);
const [showArrivalPicker, setShowArrivalPicker] = useState(false);
const [routes, setRoutes] = useState<any[]>([]);
const [routeSearch, setRouteSearch] = useState("");

const formatTime = (date: Date) => {
const hh = String(date.getHours()).padStart(2, "0");
const mm = String(date.getMinutes()).padStart(2, "0");
return `${hh}:${mm}:00`;
};

const fetchRoutes = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
"/transport/station/routes/",
{
headers:{Authorization:`Bearer ${token}`}
}
);

setRoutes(res.data || []);

if ((res.data || []).length > 0) {
setRoute(String(res.data[0].id));
}

}catch(error){

console.log(error);

}

};

useEffect(() => {
fetchRoutes();
}, []);

const createBus = async()=>{

if(!route){
Alert.alert("Select route", "Choose a route from your depot first");
return;
}

try{

const token = await AsyncStorage.getItem("accessToken");

await API.post(
"/transport/station/buses/",
{
number:number,
route:route,
bus_type:busType,
total_seats:seats,
departure_time:departure,
arrival_time:arrival
},
{
headers:{Authorization:`Bearer ${token}`}
}
);

Alert.alert("Bus Added Successfully");

router.replace("/station-buses");

}catch(error){

console.log(error);
Alert.alert("Failed to add bus");

}

};

const filteredRoutes = routes.filter((r)=>{
const search = routeSearch.trim().toLowerCase();
if(!search) return true;

return (
String(r.name || "").toLowerCase().includes(search) ||
String(r.depot || "").toLowerCase().includes(search)
);
});

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>Add New Bus</Text>

<TextInput
placeholder="Bus Number"
style={styles.input}
value={number}
onChangeText={setNumber}
/>

<TextInput
placeholder="Route ID"
style={[styles.input, {marginBottom: 8}]}
value={route}
editable={false}
/> 

<TextInput
placeholder="Search route"
style={[styles.input, {marginBottom: 8}]}
value={routeSearch}
onChangeText={setRouteSearch}
/>

<View style={styles.routeWrap}>
{filteredRoutes.map((r)=>(
<TouchableOpacity
key={r.id}
style={[styles.routeChip, route === String(r.id) && styles.routeChipActive]}
onPress={()=>setRoute(String(r.id))}
>
<Text style={[styles.routeChipText, route === String(r.id) && styles.routeChipTextActive]}>
{r.name}
</Text>

<Text style={styles.routeDepotBadge}>
{r.depot}
</Text>
</TouchableOpacity>
))}

{filteredRoutes.length === 0 && (
<Text style={styles.emptyRouteText}>No routes found for this search</Text>
)}
</View>

<TextInput
placeholder="Bus Type (AC / NON_AC)"
style={styles.input}
value={busType}
onChangeText={setBusType}
/>

<TextInput
placeholder="Total Seats"
style={styles.input}
value={seats}
onChangeText={setSeats}
keyboardType="numeric"
/>

<Text style={styles.label}>Departure Time</Text>
<TouchableOpacity
style={styles.timeButton}
onPress={() => setShowDeparturePicker(true)}
>
<Text style={styles.timeButtonText}>
{departure || "Select departure time"}
</Text>
</TouchableOpacity>

{showDeparturePicker && (
<DateTimePicker
value={departureDate}
mode="time"
is24Hour={true}
display="default"
onChange={(_, selectedDate) => {
setShowDeparturePicker(false);
if (selectedDate) {
setDepartureDate(selectedDate);
setDeparture(formatTime(selectedDate));
}
}}
 />
)}

<Text style={styles.label}>Arrival Time</Text>
<TouchableOpacity
style={styles.timeButton}
onPress={() => setShowArrivalPicker(true)}
>
<Text style={styles.timeButtonText}>
{arrival || "Select arrival time"}
</Text>
</TouchableOpacity>

{showArrivalPicker && (
<DateTimePicker
value={arrivalDate}
mode="time"
is24Hour={true}
display="default"
onChange={(_, selectedDate) => {
setShowArrivalPicker(false);
if (selectedDate) {
setArrivalDate(selectedDate);
setArrival(formatTime(selectedDate));
}
}}
 />
)}

<TouchableOpacity
style={styles.button}
onPress={createBus}
>

<Text style={styles.buttonText}>
Create Bus
</Text>

</TouchableOpacity>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#fff",
padding:20,
paddingTop:40
},

title:{
fontSize:24,
fontWeight:"bold",
marginBottom:20
},

input:{
backgroundColor:"#F5F5F5",
padding:12,
borderRadius:8,
marginBottom:12
},

label:{
fontSize:13,
fontWeight:"700",
marginBottom:8,
color:"#334155",
},

timeButton:{
backgroundColor:"#F5F5F5",
padding:12,
borderRadius:8,
marginBottom:12,
},

timeButtonText:{
color:"#0f172a",
fontWeight:"600",
},

button:{
backgroundColor:"#2E7D32",
padding:14,
borderRadius:8,
marginTop:10
},

buttonText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
},

routeWrap:{
flexDirection:"row",
flexWrap:"wrap",
gap:8,
marginBottom:12,
},

routeChip:{
borderWidth:1,
borderColor:"#cbd5e1",
backgroundColor:"#f8fafc",
paddingVertical:8,
paddingHorizontal:12,
borderRadius:14,
minWidth:140,
},

routeChipActive:{
backgroundColor:"#fee2e2",
borderColor:"#C62828",
},

routeChipText:{
color:"#334155",
fontWeight:"600",
},

routeChipTextActive:{
color:"#991b1b",
},

routeDepotBadge:{
marginTop:6,
alignSelf:"flex-start",
fontSize:11,
fontWeight:"700",
color:"#475569",
backgroundColor:"#e2e8f0",
paddingHorizontal:8,
paddingVertical:3,
borderRadius:999,
},

emptyRouteText:{
fontSize:13,
color:"#64748b",
paddingVertical:6,
}

});