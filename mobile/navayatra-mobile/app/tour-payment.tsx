import {
View,
Text,
TouchableOpacity,
StyleSheet,
TextInput,
Alert,
ScrollView,
Animated,
Image
} from "react-native";

import { useRouter,useLocalSearchParams } from "expo-router";
import { useState,useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";
import { LinearGradient } from "expo-linear-gradient";

export default function TourPayment(){

const router = useRouter();
const {tour_id,price} = useLocalSearchParams();

const [method,setMethod] = useState("CARD");

const [cardNumber,setCardNumber] = useState("");
const [name,setName] = useState("");
const [expiry,setExpiry] = useState("");
const [cvv,setCvv] = useState("");
const [upi,setUpi] = useState("");

const flipAnim = useRef(new Animated.Value(0)).current;
const scaleAnim = useRef(new Animated.Value(1)).current;

const frontRotate = flipAnim.interpolate({
inputRange:[0,180],
outputRange:["0deg","180deg"]
});

const backRotate = flipAnim.interpolate({
inputRange:[0,180],
outputRange:["180deg","360deg"]
});

const flipCard=()=>{
Animated.spring(flipAnim,{
toValue:180,
useNativeDriver:true
}).start();
};

const unflipCard=()=>{
Animated.spring(flipAnim,{
toValue:0,
useNativeDriver:true
}).start();
};

const animatePress=()=>{
Animated.sequence([
Animated.timing(scaleAnim,{toValue:0.95,duration:100,useNativeDriver:true}),
Animated.timing(scaleAnim,{toValue:1,duration:100,useNativeDriver:true})
]).start();
};

const formatCardNumber=(value:string)=>{
const cleaned=value.replace(/\D/g,"");
const groups=cleaned.match(/.{1,4}/g);
setCardNumber(groups?groups.join(" "):cleaned);
};

const formatExpiry=(value:string)=>{
let cleaned=value.replace(/\D/g,"");

if(cleaned.length>=3){
cleaned=cleaned.slice(0,2)+"/"+cleaned.slice(2,4);
}

setExpiry(cleaned);
};

const luhnCheck=(num:string)=>{
const arr=(num+"").split("").reverse().map(x=>parseInt(x));
const lastDigit=arr.shift();

if(typeof lastDigit!=="number") return false;

let sum=arr.reduce((acc,val,i)=>{
if(i%2===0){
val*=2;
if(val>9) val-=9;
}
return acc+val;
},0);

sum+=lastDigit;

return sum%10===0;
};

const validatePayment=()=>{

if(method==="CARD"){

const cleaned=cardNumber.replace(/\s/g,"");

if(cleaned.length!==16){
Alert.alert("Invalid card number");
return false;
}

if(!luhnCheck(cleaned)){
Alert.alert("Card validation failed");
return false;
}

if(!name){
Alert.alert("Enter card holder name");
return false;
}

if(!expiry || expiry.length<5){
Alert.alert("Enter valid expiry");
return false;
}

if(cvv.length<3){
Alert.alert("Enter valid CVV");
return false;
}

}

if(method==="UPI"){
if(!upi.includes("@")){
Alert.alert("Enter valid UPI ID");
return false;
}
}

return true;
};

const payTour=async()=>{

if(!validatePayment()) return;

try{

const token=await AsyncStorage.getItem("accessToken");

await API.post(
`/special-tour/pay/${tour_id}/`,
{
payment_method:method,
payment_reference:method==="CARD"?cardNumber:upi
},
{
headers:{ Authorization:`Bearer ${token}` }
}
);

Alert.alert("Payment Successful");

router.replace({
pathname:"/tour-ticket",
params:{tour_id}
});

}catch(error){
console.log(error);
Alert.alert("Payment Failed");
}

};

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>Payment</Text>

<View style={styles.methodRow}>

<TouchableOpacity
style={[styles.method,method==="CARD"&&styles.active]}
onPress={()=>setMethod("CARD")}
>
<Text>💳 Card</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.method,method==="UPI"&&styles.active]}
onPress={()=>setMethod("UPI")}
>
<Text>UPI</Text>
</TouchableOpacity>

</View>

{method==="UPI" && (

<View style={styles.upiApps}>

<Image
source={{ uri: "https://cdn-icons-png.flaticon.com/512/6124/6124998.png" }}
style={styles.appIcon}
/>

<Image
source={{ uri: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png" }}
style={styles.appIcon}
/>

<Image
source={{ uri: "https://static.vecteezy.com/system/resources/previews/051/336/375/non_2x/paytm-upi-transparent-icon-free-png.png" }}
style={styles.appIcon}
/>

</View>

)}

{method==="CARD" && (

<View>

<View style={styles.cardContainer}>

<Animated.View
style={[
styles.card,
{
transform:[
{perspective:1000},
{rotateY:frontRotate}
],
backfaceVisibility:"hidden"
}
]}
>

<LinearGradient
colors={["#4B6CB7","#182848"]}
style={styles.cardInner}
>

<Text style={styles.cardNumber}>
{cardNumber || "0000 0000 0000 0000"}
</Text>

<View style={styles.cardRow}>

<Text style={styles.cardName}>
{name || "CARD HOLDER"}
</Text>

<Text style={styles.cardExpiry}>
{expiry || "MM/YY"}
</Text>

</View>

</LinearGradient>

</Animated.View>

<Animated.View
style={[
styles.cardBack,
{
transform:[
{perspective:1000},
{rotateY:backRotate}
],
backfaceVisibility:"hidden"
}
]}
>

<View style={styles.blackStrip}/>

<View style={styles.cvvBox}>
<Text>{cvv || "CVV"}</Text>
</View>

</Animated.View>

</View>

<View style={styles.form}>

<Text style={styles.label}>Card Number</Text>

<TextInput
style={styles.input}
placeholder="1234 5678 9012 3456"
value={cardNumber}
onChangeText={formatCardNumber}
keyboardType="numeric"
/>

<Text style={styles.label}>Card Holder</Text>

<TextInput
style={styles.input}
placeholder="John Doe"
value={name}
onChangeText={setName}
/>

<View style={styles.row}>

<View style={{flex:1,marginRight:10}}>
<Text style={styles.label}>Expiry</Text>

<TextInput
style={styles.input}
placeholder="MM/YY"
value={expiry}
onChangeText={formatExpiry}
keyboardType="numeric"
/>

</View>

<View style={{flex:1}}>
<Text style={styles.label}>CVV</Text>

<TextInput
style={styles.input}
placeholder="123"
value={cvv}
onFocus={flipCard}
onBlur={unflipCard}
onChangeText={setCvv}
keyboardType="numeric"
/>

</View>

</View>

</View>

</View>

)}

{method==="UPI" && (

<View style={styles.form}>

<Text style={styles.label}>UPI ID</Text>

<TextInput
style={styles.input}
placeholder="name@upi"
value={upi}
onChangeText={setUpi}
/>

</View>

)}

<View style={styles.secure}>
<Text style={styles.secureText}>🔐 Secure Payment</Text>
</View>

<Animated.View style={{transform:[{scale:scaleAnim}]}}>

<TouchableOpacity
style={styles.payButton}
onPress={()=>{
animatePress();
payTour();
}}
>

<Text style={styles.payText}>
Pay ₹{price}
</Text>

</TouchableOpacity>

</Animated.View>

</ScrollView>

);
}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#fff",
padding:20,
paddingTop:50
},

title:{
fontSize:26,
fontWeight:"bold",
marginBottom:20
},

methodRow:{
flexDirection:"row",
marginBottom:20
},

method:{
backgroundColor:"#F5F5F5",
padding:10,
borderRadius:8,
marginRight:10
},

active:{
backgroundColor:"#D1E3FF"
},

cardContainer:{
height:200,
marginBottom:20,
justifyContent:"center",
alignItems:"center"
},

card:{
position:"absolute",
width:"100%",
height:180,
borderRadius:15
},

cardInner:{
flex:1,
borderRadius:15,
padding:20,
justifyContent:"space-between"
},

cardBack:{
position:"absolute",
width:"100%",
height:180,
backgroundColor:"#222",
borderRadius:15,
padding:20,
justifyContent:"center"
},

blackStrip:{
height:40,
backgroundColor:"#000",
marginBottom:20
},

cardNumber:{
color:"#fff",
fontSize:20,
letterSpacing:2
},

cardRow:{
flexDirection:"row",
justifyContent:"space-between"
},

cardName:{
color:"#fff"
},

cardExpiry:{
color:"#fff"
},

cvvBox:{
backgroundColor:"#fff",
padding:10,
width:80,
alignItems:"center",
alignSelf:"flex-end"
},

form:{
marginBottom:20
},

label:{
marginBottom:6
},

input:{
backgroundColor:"#F5F5F5",
padding:12,
borderRadius:8,
marginBottom:15
},

row:{
flexDirection:"row"
},

upiApps:{
flexDirection:"row",
justifyContent:"space-around",
marginBottom:20
},

appIcon:{
width:70,
height:70,
resizeMode:"contain"
},

secure:{
alignItems:"center",
marginBottom:20
},

secureText:{
color:"#777"
},

payButton:{
backgroundColor:"#000",
padding:16,
borderRadius:10,
alignItems:"center"
},

payText:{
color:"#fff",
fontWeight:"bold",
fontSize:16
}

});