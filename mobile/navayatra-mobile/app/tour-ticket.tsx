import {
View,
Text,
StyleSheet,
ActivityIndicator,
TouchableOpacity,
ScrollView
} from "react-native";

import { useEffect,useState } from "react";
import { useLocalSearchParams,useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/services/api";

import QRCode from "react-native-qrcode-svg";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";


export default function TourTicket(){

const router = useRouter();

const {tour_id} = useLocalSearchParams();

const [tour,setTour] = useState<any>(null);
const [loading,setLoading] = useState(true);


const fetchTour = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
"/special-tour/my-tours/",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const found = res.data.find((t:any)=>String(t.id) === String(tour_id));

setTour(found || null);

}catch(error){

console.log("Tour Fetch Error:",error);

}finally{

setLoading(false);

}

};


useEffect(()=>{
fetchTour();
},[]);


const downloadPDF = async () => {

  try {

    if (!tour) return;

    const qrData = JSON.stringify({
      tour_id: tour.id,
      route: `${tour.from} - ${tour.to}`,
      start_date: tour.start_date,
      passengers: tour.passenger_count
    });

    const qrURL =
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    const html = `

    <html>
    <head>

    <style>

    body{
      font-family: Arial;
      padding:30px;
      background:#ffffff;
    }

    .header{
      text-align:center;
      margin-bottom:30px;
    }

    .title{
      font-size:28px;
      font-weight:bold;
      color:#C62828;
    }

    .subtitle{
      color:gray;
      font-size:14px;
    }

    .box{
      border:1px solid #ddd;
      padding:18px;
      border-radius:8px;
      margin-top:15px;
    }

    .section{
      font-size:18px;
      font-weight:bold;
      margin-bottom:10px;
      color:#333;
    }

    table{
      width:100%;
      border-collapse:collapse;
      margin-top:10px;
    }

    th,td{
      border:1px solid #ddd;
      padding:8px;
      text-align:left;
    }

    th{
      background:#f5f5f5;
    }

    .route{
      font-size:20px;
      font-weight:bold;
      color:#1565C0;
    }

    .price{
      font-size:18px;
      font-weight:bold;
      color:#2E7D32;
    }

    .qr{
      text-align:center;
      margin-top:30px;
    }

    .footer{
      text-align:center;
      margin-top:40px;
      color:gray;
      font-size:12px;
    }

    </style>

    </head>

    <body>

    <div class="header">

      <div class="title">NavaYatra Special Tour Ticket</div>

      <div class="subtitle">
        Digital Travel Pass
      </div>

    </div>

    <div class="box">

      <div class="section">Tour Information</div>

      <p class="route">${tour.from} → ${tour.to}</p>

      <p><b>Tour Type:</b> ${tour.tour_type}</p>

      <p><b>Start Date:</b> ${tour.start_date}</p>

      <p><b>Duration:</b> ${tour.days} Days</p>

      <p><b>Status:</b> CONFIRMED</p>

    </div>

    <div class="box">

      <div class="section">Bus Information</div>

      <table>

      <tr>
        <th>Bus Type</th>
        <th>Total Buses</th>
        <th>Passengers</th>
      </tr>

      <tr>
        <td>${tour.bus_type}</td>
        <td>${tour.buses}</td>
        <td>${tour.passenger_count}</td>
      </tr>

      </table>

    </div>

    <div class="box">

      <div class="section">Contact Details</div>

      <p><b>Name:</b> ${tour.contact_name}</p>

      <p><b>Phone:</b> ${tour.contact_phone}</p>

    </div>

    <div class="box">

      <div class="section">Payment</div>

      <p class="price">Total Paid: ₹${tour.estimated_price}</p>

    </div>

    <div class="qr">

      <img src="${qrURL}" width="180" height="180"/>

      <p>Scan this QR at the boarding point</p>

    </div>

    <div class="footer">

      Thank you for choosing NavaYatra.<br>
      Have a safe and happy journey.

    </div>

    </body>
    </html>

    `;

    const file = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(file.uri);

  } catch (error) {

    console.log("PDF Error:", error);

  }

};


if(loading){

return(
<View style={styles.loading}>
<ActivityIndicator size="large" color="#C62828"/>
</View>
)

}


if(!tour){

return(
<View style={styles.loading}>
<Text style={{fontSize:18}}>Tour ticket not found</Text>

<TouchableOpacity
style={styles.home}
onPress={()=>router.replace("/home")}
>
<Text style={styles.homeText}>Go Home</Text>
</TouchableOpacity>

</View>
)

}


return(

<ScrollView style={styles.container}>

<Text style={styles.title}>
🎫 Special Tour Confirmed
</Text>


<View style={styles.card}>

<Text style={styles.route}>
{tour.from} → {tour.to}
</Text>

<Text>Tour Type: {tour.tour_type}</Text>

<Text>Start Date: {tour.start_date}</Text>

<Text>Days: {tour.days}</Text>

<Text>Passengers: {tour.passenger_count}</Text>

<Text>Buses: {tour.buses}</Text>

<Text>Bus Type: {tour.bus_type}</Text>

<Text>Contact: {tour.contact_name}</Text>

<Text>Phone: {tour.contact_phone}</Text>

<Text style={styles.price}>
Paid: ₹{tour.estimated_price}
</Text>


<View style={styles.qr}>

<QRCode
value={JSON.stringify(tour)}
size={180}
/>

</View>

<Text style={styles.qrText}>
Show this QR to the station officer
</Text>

</View>


<TouchableOpacity
style={styles.download}
onPress={downloadPDF}
>

<Text style={styles.downloadText}>
Download Ticket PDF
</Text>

</TouchableOpacity>


<TouchableOpacity
style={styles.home}
onPress={()=>router.replace("/home")}
>

<Text style={styles.homeText}>
Go to Home
</Text>

</TouchableOpacity>

</ScrollView>

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
fontSize:24,
fontWeight:"bold",
color:"#2E7D32",
textAlign:"center",
marginBottom:20
},

card:{
backgroundColor:"#F5F5F5",
padding:20,
borderRadius:12,
alignItems:"center"
},

route:{
fontSize:18,
fontWeight:"bold",
marginBottom:10
},

price:{
fontSize:18,
fontWeight:"bold",
color:"#2E7D32",
marginTop:10
},

qr:{
marginVertical:20
},

qrText:{
fontSize:12,
color:"#555"
},

download:{
backgroundColor:"#1565C0",
padding:14,
borderRadius:8,
marginTop:20
},

downloadText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
},

home:{
backgroundColor:"#C62828",
padding:14,
borderRadius:8,
marginTop:15
},

homeText:{
color:"#fff",
textAlign:"center",
fontWeight:"bold"
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
}

});