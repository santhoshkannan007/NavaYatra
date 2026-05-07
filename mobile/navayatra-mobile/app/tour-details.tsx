import React, { useState } from 'react';
import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
Platform
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TourDetails(){

  const router = useRouter();
  const { type } = useLocalSearchParams();

  const [fromLocation,setFromLocation] = useState('');
  const [toLocation,setToLocation] = useState('');
  const [startDate,setStartDate] = useState('');
  const [days,setDays] = useState('');

  const [showPicker,setShowPicker] = useState(false);
  const [depot, setDepot] = useState('');
  const [date,setDate] = useState(new Date());

  const onChangeDate = (event: any, selectedDate: Date | undefined)=>{
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);

    const formattedDate =
      currentDate.getFullYear() + "-" +
      String(currentDate.getMonth()+1).padStart(2,'0') + "-" +
      String(currentDate.getDate()).padStart(2,'0');

    setStartDate(formattedDate);
  };

  const handleNext = ()=>{

    if(!fromLocation || !toLocation || !startDate || !days || !depot){
      Alert.alert("Error","Please fill all fields");
      return;
    }

    router.push({
      pathname:'/tour-bus',
      params:{
        type,
        from_location:fromLocation,
        to_location:toLocation,
        journey_start_date:startDate,
        number_of_days:days,
        depot
      }
    });

  }

  return(

    <View style={styles.container}>

      <Text style={styles.title}>Trip Details</Text>

      <Text style={styles.subtitle}>
        Tour Type: {type}
      </Text>

      <TextInput
        placeholder="From Location"
        value={fromLocation}
        onChangeText={setFromLocation}
        style={styles.input}
      />

      <TextInput
        placeholder="To Location"
        value={toLocation}
        onChangeText={setToLocation}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={()=>setShowPicker(true)}
      >
        <TextInput
          placeholder="Journey Start Date"
          value={startDate}
          editable={false}
          style={styles.input}
        />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}

      <TextInput
        placeholder="Number of Days"
        keyboardType="numeric"
        value={days}
        onChangeText={setDays}
        style={styles.input}
      />

      <TextInput
        placeholder="Select Nearest Depot (e.g. Kumily)"
        value={depot}
        onChangeText={setDepot}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          Next
        </Text>
      </TouchableOpacity>

    </View>

  )

}

const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
backgroundColor:'#fff',
paddingTop:40
},

title:{
fontSize:24,
fontWeight:'bold'
},

subtitle:{
fontSize:14,
color:'#555',
marginBottom:20
},

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
borderRadius:8,
marginTop:10
},

buttonText:{
color:'#fff',
textAlign:'center',
fontWeight:'bold'
}

});