import {
View,
Text,
FlatList,
StyleSheet,
ActivityIndicator,
TouchableOpacity,
TextInput,
Alert
} from "react-native";

import { useEffect,useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function StationStops(){

const [stops,setStops] = useState<any[]>([]);
const [loading,setLoading] = useState(true);
const [routes, setRoutes] = useState<any[]>([]);
const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
const [stopName, setStopName] = useState("");
const [stopOrder, setStopOrder] = useState("");
const [submitting, setSubmitting] = useState(false);

const fetchRoutes = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
"/transport/station/routes/",
{
headers:{Authorization:`Bearer ${token}`}
}
);

const routeData = res.data || [];
setRoutes(routeData);

if(routeData.length > 0){
setSelectedRouteId(routeData[0].id);
}else{
setSelectedRouteId(null);
setLoading(false);
}

}catch(error){
console.log(error);
setLoading(false);
}

};

const fetchStops = async()=>{

if(!selectedRouteId){
setStops([]);
setLoading(false);
return;
}

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
`/transport/station/stops/${selectedRouteId}/`,
{
headers:{Authorization:`Bearer ${token}`}
}
);

setStops(res.data);

}catch(error){
console.log(error);
}
finally{
setLoading(false);
}

};

useEffect(()=>{
fetchRoutes();
},[]);

useEffect(()=>{
if(selectedRouteId){
setLoading(true);
fetchStops();
}
},[selectedRouteId]);

const addStop = async()=>{

if(!selectedRouteId){
Alert.alert("No route", "No routes available in your depot");
return;
}

if(!stopName.trim() || !stopOrder.trim()){
Alert.alert("Missing fields", "Enter stop name and order");
return;
}

setSubmitting(true);

try{

const token = await AsyncStorage.getItem("accessToken");

await API.post(
"/transport/station/stops/",
{
route: selectedRouteId,
name: stopName.trim(),
order: Number(stopOrder)
},
{
headers:{Authorization:`Bearer ${token}`}
}
);

setStopName("");
setStopOrder("");
fetchStops();
Alert.alert("Success", "Stop added");

}catch(error:any){
console.log(error);
Alert.alert("Failed", error?.response?.data?.error || "Unable to add stop");
}finally{
setSubmitting(false);
}

};

const deleteStop = async(id:number)=>{

try{

const token = await AsyncStorage.getItem("accessToken");

await API.delete(
`/transport/station/stops/detail/${id}/`,
{
headers:{Authorization:`Bearer ${token}`}
}
);

fetchStops();

}catch(error){
console.log(error);
}

};

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
Route Stops
</Text>

<Text style={styles.label}>Select Route</Text>
<View style={styles.routeWrap}>
{routes.map((route)=>(
<TouchableOpacity
key={route.id}
style={[styles.routeChip, selectedRouteId === route.id && styles.routeChipActive]}
onPress={()=>setSelectedRouteId(route.id)}
>
<Text style={[styles.routeChipText, selectedRouteId === route.id && styles.routeChipTextActive]}>
{route.name}
</Text>
</TouchableOpacity>
))}
</View>

<Text style={styles.label}>Add Stop</Text>
<TextInput
style={styles.input}
placeholder="Stop name"
value={stopName}
onChangeText={setStopName}
/>

<TextInput
style={styles.input}
placeholder="Order (number)"
keyboardType="numeric"
value={stopOrder}
onChangeText={setStopOrder}
/>

<TouchableOpacity
style={styles.addButton}
onPress={addStop}
disabled={submitting}
>
<Text style={styles.addText}>{submitting ? "Adding..." : "+ Add Stop"}</Text>
</TouchableOpacity>

<FlatList
data={stops}
keyExtractor={(item)=>item.id.toString()}
renderItem={({item})=>(

<View style={styles.card}>

<Text>
Stop {item.order}: {item.name}
</Text>

<TouchableOpacity
style={styles.delete}
onPress={()=>deleteStop(item.id)}
>
<Text style={{color:"#fff"}}>Delete</Text>
</TouchableOpacity>

</View>

)}
/>

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

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

delete:{
backgroundColor:"#C62828",
padding:8,
borderRadius:6,
marginTop:10,
alignSelf:"flex-start"
},

label:{
fontSize:13,
fontWeight:"700",
marginBottom:8,
color:"#334155",
},

routeWrap:{
flexDirection:"row",
flexWrap:"wrap",
gap:8,
marginBottom:12,
},

routeChip:{
paddingVertical:8,
paddingHorizontal:12,
borderRadius:999,
borderWidth:1,
borderColor:"#cbd5e1",
backgroundColor:"#f8fafc",
},

routeChipActive:{
borderColor:"#C62828",
backgroundColor:"#fee2e2",
},

routeChipText:{
fontWeight:"600",
color:"#334155",
},

routeChipTextActive:{
color:"#991b1b",
},

input:{
backgroundColor:"#f8fafc",
borderColor:"#cbd5e1",
borderWidth:1,
padding:10,
borderRadius:8,
marginBottom:10,
},

addButton:{
backgroundColor:"#2E7D32",
padding:10,
borderRadius:8,
alignItems:"center",
marginBottom:14,
},

addText:{
color:"#fff",
fontWeight:"700",
}

});