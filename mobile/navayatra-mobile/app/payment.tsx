import React, { useEffect, useState, useRef } from "react";
import {
View,
Text,
TouchableOpacity,
StyleSheet,
Alert,
ActivityIndicator,
TextInput,
Image,
Animated,
ScrollView
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

export default function PaymentScreen(){

const router = useRouter();

const {
bus_id,
date,
seats,
pickup,
dropoff,
passengers,
phone,
email,
price
} = useLocalSearchParams();

const seatList = typeof seats === "string" ? seats.split(",") : [];
const passengerList = typeof passengers === "string" ? JSON.parse(passengers) : [];

const totalPrice = Number(price || 0) * seatList.length;

const [loading,setLoading] = useState(false);
const [paymentMethod,setPaymentMethod] = useState("UPI");
const [walletBalance, setWalletBalance] = useState(0);
const [useWallet, setUseWallet] = useState(false);

const [upiApp,setUpiApp] = useState("");
const [upiId,setUpiId] = useState("");

const [cardNumber,setCardNumber] = useState("");
const [cardName,setCardName] = useState("");
const [expiry,setExpiry] = useState("");
const [cvv,setCvv] = useState("");

const [bank,setBank] = useState("");

const walletUsed = useWallet ? Math.min(walletBalance, totalPrice) : 0;
const payableAmount = Math.max(totalPrice - walletUsed, 0);

useEffect(() => {
	const fetchWallet = async () => {
		try {
			const token = await AsyncStorage.getItem("accessToken");
			const res = await API.get("/auth/me/", {
				headers: { Authorization: token ? `Bearer ${token}` : "" },
			});

			const amount = Number(res?.data?.wallet_refund_balance || 0);
			setWalletBalance(Number.isFinite(amount) ? amount : 0);
		} catch (_error) {
			setWalletBalance(0);
		}
	};

	fetchWallet();
}, []);

/* CARD FLIP */

const flipAnim = useRef(new Animated.Value(0)).current;

const frontRotate = flipAnim.interpolate({
inputRange:[0,180],
outputRange:["0deg","180deg"]
});

const backRotate = flipAnim.interpolate({
inputRange:[0,180],
outputRange:["180deg","360deg"]
});

const flipToBack = ()=>{
Animated.timing(flipAnim,{
toValue:180,
duration:400,
useNativeDriver:true
}).start();
};

const flipToFront = ()=>{
Animated.timing(flipAnim,{
toValue:0,
duration:400,
useNativeDriver:true
}).start();
};

/* CARD NUMBER FORMAT */

const formatCard = (text: string)=>{
let formatted = text.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim();
setCardNumber(formatted);
};

/* PAYMENT */

const handlePayment = async()=>{

if(payableAmount > 0 && paymentMethod==="UPI"){
if(!upiApp){ Alert.alert("Select UPI App"); return; }
if(!upiId.includes("@")){ Alert.alert("Invalid UPI ID"); return; }
}

if(payableAmount > 0 && paymentMethod==="CARD"){
if(cardNumber.replace(/\s/g,"").length!==16){
Alert.alert("Invalid Card Number");
return;
}
if(!cardName){ Alert.alert("Enter Card Holder Name"); return; }
if(!expiry.includes("/")){ Alert.alert("Enter expiry MM/YY"); return; }
if(cvv.length!==3){ Alert.alert("Invalid CVV"); return; }
}

if(payableAmount > 0 && paymentMethod==="NETBANKING"){
if(!bank){ Alert.alert("Select Bank"); return; }
}

setLoading(true);

setTimeout(async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.post(
"/booking/create/",
{
bus_id,
travel_date:date,
pickup,
dropoff,
contact_phone:phone,
contact_email:email,
passengers:passengerList,
payment_method:paymentMethod,
use_wallet: useWallet
},
{
headers:{ Authorization: token ? `Bearer ${token}` : "" }
}
);

const breakdown = res?.data?.payment_breakdown;
const walletMsg = breakdown
? `\nWallet used: ₹${Number(breakdown.wallet_used || 0).toFixed(2)}\nPaid now: ₹${Number(breakdown.cash_payable || 0).toFixed(2)}`
: "";

Alert.alert("Payment Successful 🎉", `Booking confirmed.${walletMsg}`);

router.replace({
pathname:"/ticket",
params:{ booking_id: res.data.booking_id }
});

}catch(e){

Alert.alert("Payment Failed");

}

setLoading(false);

},2000);

};

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>Secure Payment</Text>

<View style={styles.summaryCard}>

<Text style={styles.label}>Seats</Text>
<Text>{seats}</Text>

<Text style={styles.label}>Passengers</Text>
<Text>{seatList.length}</Text>

<Text style={styles.total}>Total Fare ₹{totalPrice}</Text>

<TouchableOpacity
style={[styles.walletToggle, useWallet && styles.active]}
onPress={() => setUseWallet((prev) => !prev)}
disabled={walletBalance <= 0}
>
<Text style={styles.walletText}>Use Wallet (Available ₹{walletBalance.toFixed(2)})</Text>
</TouchableOpacity>

<Text style={styles.label}>Wallet Used</Text>
<Text>₹{walletUsed.toFixed(2)}</Text>

<Text style={styles.label}>Payable Now</Text>
<Text style={styles.total}>₹{payableAmount.toFixed(2)}</Text>

</View>

{payableAmount > 0 && <Text style={styles.subtitle}>Payment Method</Text>}

{payableAmount > 0 && <View style={styles.methodRow}>

<TouchableOpacity
style={[styles.methodBtn,paymentMethod==="UPI" && styles.active]}
onPress={()=>setPaymentMethod("UPI")}
>
<Text>UPI</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.methodBtn,paymentMethod==="CARD" && styles.active]}
onPress={()=>setPaymentMethod("CARD")}
>
<Text>Card</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.methodBtn,paymentMethod==="NETBANKING" && styles.active]}
onPress={()=>setPaymentMethod("NETBANKING")}
>
<Text>NetBank</Text>
</TouchableOpacity>

</View>}

{/* UPI */}

{payableAmount > 0 && paymentMethod==="UPI" && (

<View>

<View style={styles.upiRow}>

{[
{ name:"GPay", icon:"https://cdn-icons-png.flaticon.com/512/6124/6124998.png" },
{ name:"PhonePe", icon:"https://img.icons8.com/color/1200/phone-pe.jpg" },
{ name:"Paytm", icon:"https://img.icons8.com/color/1200/paytm.jpg" }
].map(app=>(
<TouchableOpacity
key={app.name}
style={[styles.upiBtn, upiApp===app.name && styles.active]}
onPress={()=>setUpiApp(app.name)}
>
<Image source={{uri:app.icon}} style={styles.upiIcon}/>
<Text>{app.name}</Text>
</TouchableOpacity>
))}

</View>

{upiApp!=="" && (

<TextInput
placeholder="example@upi"
value={upiId}
onChangeText={setUpiId}
style={styles.input}
/>

)}

</View>

)}

{/* CARD */}

{payableAmount > 0 && paymentMethod==="CARD" && (

<View>

<View style={styles.cardPreviewWrap}>

<Animated.View style={[styles.cardFront,{ transform:[{rotateY:frontRotate}] }]}>

<Text style={styles.cardTitle}>NavaYatra</Text>

<Text style={styles.cardNumber}>
{cardNumber || "XXXX XXXX XXXX XXXX"}
</Text>

<View style={styles.cardBottom}>

<View>
<Text style={styles.cardLabel}>Card Holder</Text>
<Text style={styles.cardValue}>{cardName || "FULL NAME"}</Text>
</View>

<View>
<Text style={styles.cardLabel}>Expiry</Text>
<Text style={styles.cardValue}>{expiry || "MM/YY"}</Text>
</View>

</View>

</Animated.View>

<Animated.View style={[styles.cardBack,{ transform:[{rotateY:backRotate}] }]}>

<View style={styles.blackStrip}/>

<Text style={{color:"#fff"}}>CVV</Text>

<View style={styles.cvvBox}>
<Text>{cvv || "***"}</Text>
</View>

</Animated.View>

</View>

<TextInput
placeholder="Card Number"
value={cardNumber}
onChangeText={formatCard}
keyboardType="numeric"
maxLength={19}
style={styles.input}
/>

<TextInput
placeholder="Card Holder Name"
value={cardName}
onChangeText={setCardName}
style={styles.input}
/>

<View style={styles.row}>

<TextInput
placeholder="MM/YY"
value={expiry}
onFocus={flipToFront}
onChangeText={setExpiry}
style={[styles.input,{flex:1,marginRight:10}]}
/>

<TextInput
placeholder="CVV"
value={cvv}
keyboardType="numeric"
onFocus={flipToBack}
onChangeText={setCvv}
maxLength={3}
style={[styles.input,{flex:1}]}
/>

</View>

</View>

)}

{/* NETBANK */}

{payableAmount > 0 && paymentMethod==="NETBANKING" && (

<View>

{["SBI","HDFC","ICICI","AXIS"].map(b=>(
<TouchableOpacity
key={b}
style={[styles.bankBtn, bank===b && styles.active]}
onPress={()=>setBank(b)}
>
<Text>{b} Bank</Text>
</TouchableOpacity>
))}

</View>

)}

{loading ? (
<ActivityIndicator size="large" color="#C62828"/>
):(
<TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
<Text style={styles.payText}>Pay ₹{payableAmount.toFixed(2)}</Text>
</TouchableOpacity>
)}

<Text style={styles.secure}>
Secure Payment • NavaYatra Gateway
</Text>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{ flex:1, backgroundColor:"#fff", padding:20 },

title:{ fontSize:26, fontWeight:"bold", color:"#C62828", marginBottom:20 },

subtitle:{ fontSize:18, fontWeight:"bold", marginBottom:10 },

summaryCard:{
backgroundColor:"#F5F5F5",
padding:20,
borderRadius:10,
marginBottom:20
},

label:{ color:"#777", marginTop:10 },

total:{ fontSize:22, fontWeight:"bold", marginTop:15 },

methodRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:20
},

methodBtn:{
borderWidth:1,
borderColor:"#ccc",
padding:12,
borderRadius:8,
width:"30%",
alignItems:"center"
},

walletToggle:{
borderWidth:1,
borderColor:"#ccc",
padding:12,
borderRadius:8,
marginTop:12,
marginBottom:8,
alignItems:"center"
},

walletText:{
fontWeight:"600"
},

active:{
borderColor:"#C62828",
backgroundColor:"#FFEAEA"
},

upiRow:{
flexDirection:"row",
justifyContent:"space-around",
marginBottom:20
},

upiBtn:{ alignItems:"center" },

upiIcon:{ width:45, height:45, marginBottom:5 },

input:{
borderWidth:1,
borderColor:"#ccc",
padding:12,
borderRadius:8,
marginBottom:15
},

row:{ flexDirection:"row" },

bankBtn:{
borderWidth:1,
borderColor:"#ddd",
padding:15,
borderRadius:8,
marginBottom:10
},

payBtn:{
backgroundColor:"#C62828",
padding:15,
borderRadius:8
},

payText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold",
fontSize:16
},

secure:{
textAlign:"center",
marginTop:20,
color:"#777"
},

/* CARD */

cardPreviewWrap:{
height:200,
marginBottom:20
},

cardFront:{
position:"absolute",
width:"100%",
height:200,
backgroundColor:"#C62828",
borderRadius:14,
padding:20,
justifyContent:"space-between",
backfaceVisibility:"hidden"
},

cardBack:{
position:"absolute",
width:"100%",
height:200,
backgroundColor:"#1A1A1A",
borderRadius:14,
padding:20,
backfaceVisibility:"hidden"
},

cardTitle:{ color:"#fff", fontSize:18, fontWeight:"bold" },

cardNumber:{ color:"#fff", fontSize:22, letterSpacing:2 },

cardBottom:{ flexDirection:"row", justifyContent:"space-between" },

cardLabel:{ color:"#ddd", fontSize:12 },

cardValue:{ color:"#fff", fontSize:16 },

blackStrip:{ backgroundColor:"#000", height:40, marginBottom:20 },

cvvBox:{
backgroundColor:"#fff",
padding:10,
borderRadius:6,
alignItems:"flex-end"
}

});