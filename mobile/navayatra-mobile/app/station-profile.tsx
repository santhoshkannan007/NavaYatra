import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
} from "react-native";

import { useEffect,useState } from "react";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import API from "@/services/api";


interface User{
id:number
username:string
email:string
first_name:string
last_name:string
phone:string
role:string
depot:string
}


export default function StationProfile(){

const router = useRouter();
const colorScheme = useColorScheme();
const palette = Colors[colorScheme ?? 'light'];
const isDark = colorScheme === 'dark';

const [user,setUser] = useState<User | null>(null);
const [loading,setLoading] = useState(true);


const fetchProfile = async()=>{

try{

const token = await AsyncStorage.getItem("accessToken");

const res = await API.get(
"/auth/me/",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setUser(res.data);

}catch(error){

console.log(error);

}finally{

setLoading(false);

}

};


useEffect(()=>{
fetchProfile();
},[]);


const logout = async()=>{

await AsyncStorage.removeItem("accessToken");
await AsyncStorage.removeItem("refreshToken");

router.replace("/");

};


if(loading){

return(
<View style={[styles.loading, { backgroundColor: palette.background }]}>
<ActivityIndicator size="large" color={palette.primary}/>
</View>
)

}


const profileItems = [
	{ label: 'Username', value: user?.username || '—', icon: 'person-outline' },
	{ label: 'Email', value: user?.email || '—', icon: 'mail-outline' },
	{ label: 'Phone', value: user?.phone || '—', icon: 'call-outline' },
	{ label: 'Depot', value: user?.depot || '—', icon: 'business-outline' },
];


return(

<ScrollView
	style={[styles.container, { backgroundColor: palette.background }]}
	contentContainerStyle={styles.contentContainer}
	showsVerticalScrollIndicator={false}
>
	<View style={[styles.glowTop, { backgroundColor: isDark ? '#3A2E48' : '#F8E3D7' }]} />
	<View style={[styles.glowBottom, { backgroundColor: palette.primarySoft }]} />

	<View style={[styles.heroCard, { backgroundColor: isDark ? 'rgba(32,36,42,0.64)' : 'rgba(255,255,255,0.75)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)' }]}> 
		<View style={styles.heroTopRow}>
			<View>
				<Text style={[styles.kicker, { color: palette.accent }]}>Station Master</Text>
				<Text style={[styles.name, { color: palette.text, fontFamily: Fonts.rounded }]}>
					{user?.first_name} {user?.last_name}
				</Text>
				<Text style={[styles.subtitle, { color: palette.muted }]}>Professional control center for depot operations.</Text>
			</View>

			<View style={[styles.avatarWrap, { backgroundColor: palette.primarySoft }]}> 
				<Ionicons name="person-circle-outline" size={56} color={palette.primary} />
			</View>
		</View>

		<View style={styles.metaGrid}>
			{profileItems.map((item) => (
				<View key={item.label} style={[styles.metaCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)' }]}> 
					<View style={[styles.metaIcon, { backgroundColor: palette.primarySoft }]}> 
						<Ionicons name={item.icon as any} size={16} color={palette.primary} />
					</View>
					<Text style={[styles.metaLabel, { color: palette.muted }]}>{item.label}</Text>
					<Text style={[styles.metaValue, { color: palette.text }]} numberOfLines={1}>{item.value}</Text>
				</View>
			))}
		</View>

		<View style={styles.roleRow}>
			<View style={[styles.rolePill, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
				<Ionicons name="shield-checkmark-outline" size={16} color={palette.primary} />
				<Text style={[styles.roleText, { color: palette.text }]}>Role: Station Master</Text>
			</View>
		</View>
	</View>

	<View style={styles.actionsRow}>
		<TouchableOpacity
			style={[styles.primaryButton, { backgroundColor: palette.primary }]}
			onPress={()=>router.push("/station-home")}
		>
			<Ionicons name="speedometer-outline" size={18} color="#fff" />
			<Text style={styles.primaryButtonText}>Back to Dashboard</Text>
		</TouchableOpacity>

		<TouchableOpacity
			style={[styles.secondaryButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}
			onPress={logout}
		>
			<Ionicons name="log-out-outline" size={18} color={palette.primary} />
			<Text style={[styles.secondaryButtonText, { color: palette.text }]}>Logout</Text>
		</TouchableOpacity>
	</View>
</ScrollView>

)

}


const styles = StyleSheet.create({

container:{
flex:1,
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

contentContainer:{
	padding:20,
	paddingTop:56,
	paddingBottom:36,
},

glowTop:{
	position:'absolute',
	width:180,
	height:180,
	borderRadius:180,
	top:-40,
	right:-80,
	opacity:0.6,
},

glowBottom:{
	position:'absolute',
	width:220,
	height:220,
	borderRadius:220,
	bottom:120,
	left:-110,
	opacity:0.45,
},

heroCard:{
	borderRadius:28,
	borderWidth:1,
	padding:20,
	overflow:'hidden',
	shadowColor:'#000',
	shadowOpacity:0.08,
	shadowRadius:20,
	shadowOffset:{ width:0, height:10 },
	elevation:4,
},

heroTopRow:{
	flexDirection:'row',
	alignItems:'flex-start',
	justifyContent:'space-between',
	gap:14,
},

kicker:{
	fontSize:12,
	fontWeight:'800',
	letterSpacing:1.2,
	textTransform:'uppercase',
	marginBottom:8,
},

name:{
fontSize:26,
fontWeight:'800',
lineHeight:32,
},

subtitle:{
fontSize:14,
marginTop:8,
lineHeight:20,
},

avatarWrap:{
	width:72,
	height:72,
	borderRadius:22,
	alignItems:'center',
	justifyContent:'center',
	flexShrink:0,
},

metaGrid:{
	marginTop:16,
	gap:10,
},

metaCard:{
	borderRadius:18,
	borderWidth:1,
	paddingHorizontal:14,
	paddingVertical:12,
},

metaIcon:{
	width:30,
	height:30,
	borderRadius:10,
	alignItems:'center',
	justifyContent:'center',
	marginBottom:8,
},

metaLabel:{
	fontSize:11,
	fontWeight:'700',
	textTransform:'uppercase',
	letterSpacing:0.6,
},

metaValue:{
	marginTop:4,
	fontSize:14,
	fontWeight:'700',
},

roleRow:{
	marginTop:16,
	flexDirection:'row',
},

rolePill:{
	flexDirection:'row',
	alignItems:'center',
	gap:8,
	paddingHorizontal:14,
	paddingVertical:10,
	borderRadius:999,
	borderWidth:1,
},

roleText:{
	fontWeight:'700',
},

actionsRow:{
	marginTop:18,
	gap:12,
},

primaryButton:{
	minHeight:52,
	borderRadius:18,
	flexDirection:'row',
	alignItems:'center',
	justifyContent:'center',
	gap:8,
},

primaryButtonText:{
	color:'#fff',
	fontWeight:'800',
	fontSize:14,
},

secondaryButton:{
	minHeight:52,
	borderRadius:18,
	borderWidth:1,
	flexDirection:'row',
	alignItems:'center',
	justifyContent:'center',
	gap:8,
},

secondaryButtonText:{
	fontWeight:'800',
	fontSize:14,
},

info:{
fontSize:16,
marginTop:6,
color:"#555"
}

});