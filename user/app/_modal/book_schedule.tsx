import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function BookScheduleModal() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const router = useRouter();

  const showPicker = (mode: "date" | "time") => {
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const hidePicker = () => {
    setPickerVisible(false);
  };

  const handleConfirmPicker = (date: Date) => {
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
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.title}>Select Date & Time</Text>
        <View style={styles.container}>
          <TouchableOpacity style={styles.box} onPress={() => showPicker("date")}> 
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.box} onPress={() => showPicker("time")}> 
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{formatTime(selectedTime)}</Text>
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode={pickerMode}
          is24Hour={false}
          onConfirm={handleConfirmPicker}
          onCancel={hidePicker}
        />
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => router.push("/serviceprovider")}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#b2d7d7",
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
  footer: {
    marginTop: 20,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#008080",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
