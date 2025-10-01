import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { router } from "expo-router/build/exports";

const DateTimeSelector = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const showPicker = (mode: "date" | "time") => {
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const hidePicker = () => {
    setPickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    if (pickerMode === "date") {
      setSelectedDate(date);
    } else {
      setSelectedTime(date);
    }
    hidePicker();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };



  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#e7ecec' }} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#e7ecec',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={24} color="#399d9d" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', flex: 1 }}>
          Schedule Appointment
        </Text>
      </View>

      <View>
        <View style={styles.container}>
        <TouchableOpacity style={styles.box} onPress={() => showPicker("date")}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>


        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode={pickerMode}
          is24Hour={false}
          onConfirm={handleConfirm}
          onCancel={hidePicker}
        />
      </View>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 18,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default DateTimeSelector;
