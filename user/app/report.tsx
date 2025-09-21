import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const PassengerForm = () => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  // New states
  const [problem, setProblem] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(""); // placeholder

  const handleSubmit = () => {
    console.log({
      name,
      number,
      email,
      city,
      problem,
      serviceType,
      description,
      attachment,
    });
    alert("Report submitted!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Report Issue</Text>
      {/* Service Provider Name */}
      <Text style={styles.label}>
        Service Provider Name <Text style={{ color: "red" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {/* Service Provider Number */}
      <Text style={styles.label}>
        Service Provider Number <Text style={{ color: "red" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="091234567890"
        value={number}
        keyboardType="phone-pad"
        onChangeText={setNumber}
      />

      {/* Email */}
      <Text style={styles.label}>
        Email Address <Text style={{ color: "red" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      {/* City */}
      <Text style={styles.label}>
        City <Text style={{ color: "red" }}>*</Text>
      </Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={city} onValueChange={(val) => setCity(val)}>
          <Picker.Item label="Select option..." value="" />
          <Picker.Item label="Manila" value="manila" />
          <Picker.Item label="Quezon City" value="quezon" />
          <Picker.Item label="Makati" value="makati" />
          <Picker.Item label="Pasig" value="pasig" />
        </Picker>
      </View>

      {/* Service Type */}
      <Text style={styles.label}>
        Service Type <Text style={{ color: "red" }}>*</Text>
      </Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={serviceType}
          onValueChange={(val) => setServiceType(val)}
        >
          <Picker.Item label="Select option..." value="" />
          <Picker.Item label="AC Repair & Maintenance" value="ac_repair" />
          <Picker.Item label="TV Repair" value="tv_repair" />
          <Picker.Item
            label="Refrigerator Diagnosis & Maintenance"
            value="refrigerator_maintenance"
          />
          <Picker.Item label="Audio Systems Repair" value="audio_repair" />
          <Picker.Item
            label="Washing Machine Circuit Repair"
            value="washing_machine_repair"
          />
          <Picker.Item label="Carpentry & Woodworks" value="carpentry" />
          <Picker.Item
            label="Furniture Setup & Repair"
            value="furniture_repair"
          />
          <Picker.Item
            label="Computer Troubleshooting & Data Backup"
            value="computer_troubleshooting"
          />
          <Picker.Item
            label="Network Setup (Wi-Fi & Printer Sharing)"
            value="network_setup"
          />
          <Picker.Item label="Virus Removal" value="virus_removal" />
          <Picker.Item label="Wiring & Connections" value="wiring_connections" />
          <Picker.Item label="Fixture Installation" value="fixture_installation" />
          <Picker.Item label="Circuit & Breaker Repair" value="circuit_repair" />
          <Picker.Item
            label="Appliance Wiring & Repair"
            value="appliance_wiring"
          />
          <Picker.Item label="Masonry Works" value="masonry_works" />
          <Picker.Item label="Surface Painting & Coating" value="surface_painting" />
          <Picker.Item label="Pipe Fitting & Leak Repair" value="pipe_fitting" />
          <Picker.Item
            label="Fixture Installation (Plumbing)"
            value="plumbing_fixture_installation"
          />
          <Picker.Item
            label="Shower & Water Heater Installation"
            value="shower_installation"
          />
          <Picker.Item label="Tile Works and Installation" value="tile_works" />
          <Picker.Item
            label="Welding & Metal Works"
            value="welding_metal_works"
          />
          <Picker.Item
            label="Metal Furniture Repair"
            value="metal_furniture_repair"
          />
        </Picker>
      </View>

      {/* Problem Encountered */}
      <Text style={styles.label}>
        Problem Encountered <Text style={{ color: "red" }}>*</Text>
      </Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={problem}
          onValueChange={(val) => setProblem(val)}
        >
          <Picker.Item label="Select option..." value="" />
          <Picker.Item label="Incomplete Service" value="incomplete_service" />
          <Picker.Item label="Late Arrival" value="late_arrival" />
          <Picker.Item label="Damaged Property" value="damaged_property" />
          <Picker.Item label="Unprofessional Behavior" value="unprofessional_behavior" />
          <Picker.Item label="Overcharging" value="overcharging" />
          <Picker.Item label="Service Not Completed" value="service_not_completed" />
          <Picker.Item label="Wrong Service Delivered" value="wrong_service" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      {/* Description */}
      <Text style={styles.label}>
        Description of the Issue: <Text style={{ color: "red" }}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Describe the issue encountered, including any relevant details..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Attachment */}
      <Text style={styles.label}>Attachment (If Applicable)</Text>
      <TouchableOpacity
        style={styles.attachmentBox}
        onPress={() => alert("Upload feature not implemented yet")}
      >
        <Text style={{ color: "#666" }}>
          {attachment ? attachment : "Screenshot/Record"}
        </Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 6,
    marginBottom: 15,
  },
  attachmentBox: {
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 6,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#008080",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PassengerForm;
