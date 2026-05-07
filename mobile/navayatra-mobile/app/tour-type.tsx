import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function TourType(){

  const router = useRouter();

  const selectType = (type:string)=>{

    router.push({
      pathname:'/tour-details',
      params:{ type }
    });

  }

  return(

    <View style={styles.container}>

      <Text style={styles.title}>Select Tour Type</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={()=>selectType('Marriage')}
      >
        <Text style={styles.cardText}>Marriage Function</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={()=>selectType('School')}
      >
        <Text style={styles.cardText}>School / College Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={()=>selectType('Tourist')}
      >
        <Text style={styles.cardText}>Tourist / Group Tour</Text>
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
  fontWeight:'bold',
  marginBottom:20
  },

  card:{
  padding:18,
  borderRadius:12,
  backgroundColor:'#F9F9F9',
  marginBottom:15
  },

  cardText:{
  fontSize:16,
  fontWeight:'600'
  }

});