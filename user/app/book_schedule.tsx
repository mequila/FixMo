import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
