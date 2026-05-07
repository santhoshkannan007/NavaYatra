import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
ScrollView
} from "react-native";

import { useState } from "react";
import { useLocalSearchParams,useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function EditBus(){

const router = useRouter();

const {id,number,type,seats} = useLocalSearchParams();

const [busNumber,setBusNumber] = useState(String(number));
const [busType,setBusType] = useState(String(type));
const [totalSeats,setTotalSeats] = useState(String(seats));

const updateBus = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

await API.put(
`/transport/station/buses/${id}/`,
{
number:busNumber,
bus_type:busType,
total_seats:totalSeats
},
{
headers:{Authorization:`Bearer ${token}`}
}
);

Alert.alert("Bus Updated Successfully");

router.replace("/station-buses");

}catch(error){

console.log(error);
Alert.alert("Update Failed");

}

};

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>
Edit Bus
</Text>

<TextInput
style={styles.input}
value={busNumber}
onChangeText={setBusNumber}
/>

<TextInput
style={styles.input}
value={busType}
onChangeText={setBusType}
/>

<TextInput
style={styles.input}
value={totalSeats}
onChangeText={setTotalSeats}
keyboardType="numeric"
/>

<TouchableOpacity
style={styles.button}
onPress={updateBus}
>

<Text style={styles.buttonText}>
Update Bus
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

button:{
backgroundColor:"#1976D2",
padding:14,
borderRadius:8
},

buttonText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
}

});