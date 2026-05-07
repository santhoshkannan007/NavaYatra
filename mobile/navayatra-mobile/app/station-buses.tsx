import {
View,
Text,
FlatList,
TouchableOpacity,
StyleSheet,
ActivityIndicator,
Alert
} from "react-native";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";
import { useRouter } from "expo-router";

export default function StationBuses(){

const router = useRouter();

const [buses,setBuses] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

const fetchBuses = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
"/transport/station/buses/",
{
headers:{ Authorization:`Bearer ${token}` }
}
);

setBuses(res.data);

}catch(error){

console.log(error);

}finally{

setLoading(false);

}

};


useEffect(()=>{
fetchBuses();
},[]);


const deleteBus = async(id:number)=>{

try{

const token = await AsyncStorage.getItem("accessToken");

await API.delete(
`/transport/station/buses/${id}/`,
{
headers:{ Authorization:`Bearer ${token}` }
}
);

Alert.alert("Bus deleted");

fetchBuses();

}catch(error){
console.log(error);
}

};


const editBus = (bus:any)=>{

router.push({
pathname:"/edit-bus",
params:{
id:bus.id,
number:bus.number,
type:bus.bus_type,
seats:bus.total_seats
}
});

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
Depot Buses
</Text>

<TouchableOpacity
style={styles.addButton}
onPress={()=>router.push("/add-bus")}
>
<Text style={styles.addText}>+ Add New Bus</Text>
</TouchableOpacity>


<FlatList
data={buses}
keyExtractor={(item)=>item.id.toString()}
renderItem={({item})=>(

<View style={styles.card}>

<Text style={styles.bus}>
{item.number}
</Text>

<Text>Route: {item.route}</Text>
<Text>Type: {item.bus_type}</Text>
<Text>Seats: {item.total_seats}</Text>

<View style={styles.row}>

<TouchableOpacity
style={styles.edit}
onPress={()=>editBus(item)}
>
<Text style={styles.btnText}>Edit</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.delete}
onPress={()=>deleteBus(item.id)}
>
<Text style={styles.btnText}>Delete</Text>
</TouchableOpacity>

</View>

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

bus:{
fontWeight:"bold",
fontSize:16
},

row:{
flexDirection:"row",
marginTop:10
},

edit:{
backgroundColor:"#1976D2",
padding:8,
borderRadius:6,
marginRight:10
},

delete:{
backgroundColor:"#C62828",
padding:8,
borderRadius:6
},

btnText:{
color:"#fff",
fontWeight:"bold"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

addButton:{
backgroundColor:"#2E7D32",
padding:12,
borderRadius:8,
marginBottom:15,
alignItems:"center"
},

addText:{
color:"#fff",
fontWeight:"bold"
}

});