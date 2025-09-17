import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ServiceProviderCard from "./components/services/ServiceProviderCard";
import { router } from "expo-router/build/exports";

const DateTimeSelector = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date"); // "date" or "time"

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

  const formatTime = (time: Date | null) => {
    if (!time) return "Select time";
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
      <View>
        <View style={styles.container}>
        {/* Date Selector */}
        <TouchableOpacity style={styles.box} onPress={() => showPicker("date")}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        {/* Time Selector */}
        <TouchableOpacity style={styles.box} onPress={() => showPicker("time")}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{formatTime(selectedTime)}</Text>
        </TouchableOpacity>

        {/* DateTime Picker Modal */}
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode={pickerMode}
          is24Hour={false}
          onConfirm={handleConfirm}
          onCancel={hidePicker}
        />
      </View>

      <ServiceProviderCard
        name="Sabrina Carpenter"
        rating={4.5}
        profession="Carpenter"
        price={500.0}
        onPress={() => router.push("/profile_serviceprovider")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
