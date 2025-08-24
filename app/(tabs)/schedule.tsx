import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { homeStyles } from "../components/homeStyles";
import { useRouter } from 'expo-router';


const schedule = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const router = useRouter();

  return (
    <View>
      <View style={homeStyles.calendar}>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#399d9d',
            },
          }}
          theme={{
            calendarBackground: '#fff',
            selectedDayBackgroundColor: '#399d9d',
            todayTextColor: '#399d9d',
            arrowColor: '#399d9d',
            textDayHeaderFontWeight: 700,
            textMonthFontWeight: 'bold',
            textDayFontWeight: 600,
            textSectionTitleColor: 'gray',
            monthTextColor: '#399d9d',
          }}
          style={[homeStyles.calendarWrap]}
        />
      </View>

      <View style={{marginHorizontal: 25, marginTop: 15, alignItems: "flex-start"}}>
          <Text style={{ fontSize: 20, color: "black", fontWeight: "bold" }}>
            Service Booking
          </Text>
      </View>

      <View style={{ ...homeStyles.bookings }}>
              <Image
                source={require("../../assets/images/service-provider.jpg")}
                style={{ width: 80, height: 80, borderRadius: 15 }}
              />
      
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}>
                  Type of Provider
                </Text>
      
                <Text style={{ color: "#399d9d", fontSize: 16, fontWeight: "500", marginBottom: 5 }}>
                  Provider Name
                </Text>
      
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ backgroundColor: "#127d7d", borderRadius: 15, paddingVertical: 5, paddingHorizontal: 10 }}>
                    <Text style={{ fontSize: 10, color: "white", fontWeight: "bold" }}>On the way</Text>
                  </View>
      
                  <TouchableOpacity onPress={() => router.push("/messages")}> 
                    <Ionicons name="chatbox-ellipses" size={25} color="#399d9d" />
                  </TouchableOpacity>
                  
                </View>
              </View>
            </View>
      


    </View>
  );
};

export default schedule;
