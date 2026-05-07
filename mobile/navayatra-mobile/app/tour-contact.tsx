import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function TourContact(){

  const router = useRouter();
  const params = useLocalSearchParams();

  const [name,setName] = useState('');
  const [phone,setPhone] = useState('');
  const [email,setEmail] = useState('');

  const handleNext = ()=>{

    if(!name || !phone || !email){
      Alert.alert("Error","Please fill all fields");
      return;
    }

    router.push({
      pathname:'/tour-review',
      params:{
        ...params,
        contact_name:name,
        contact_phone:phone,
        contact_email:email
      }
    });

  }

  return(

    <View style={styles.container}>

      <Text style={styles.title}>Contact Details</Text>

      <TextInput
        placeholder="Contact Person Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <TextInput
        placeholder="Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          Review Application
        </Text>
      </TouchableOpacity>

    </View>

  )

}

const styles = StyleSheet.create({

container:{ flex:1,padding:20,backgroundColor:'#fff',paddingTop:40 },

title:{ fontSize:24,fontWeight:'bold',marginBottom:20 },

input:{
borderWidth:1,
borderColor:'#ccc',
padding:12,
borderRadius:8,
marginBottom:15
},

button:{
backgroundColor:'#C62828',
padding:14,
borderRadius:8
},

buttonText:{
color:'#fff',
textAlign:'center',
fontWeight:'bold'
}

});