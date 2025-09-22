import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";
import homeStyles from "./components/homeStyles";
import { useRouter } from "expo-router";

interface Message {
  id: string;
  text: string;
}

const DirectMessage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = () => {
    if (message.trim() === "") return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: message },
    ]);
    setMessage("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER (always fixed at the top) */}
      <SafeAreaView style={[homeStyles.safeAreaHeader]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.push("./messages")} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#008080" />
          </TouchableOpacity>
          <Text style={[homeStyles.headerText]}>Provider Name</Text>
        </View>
      </SafeAreaView>

      {/* CHAT + INPUT (moves with keyboard) */}
      <KeyboardAvoidingView
        style={{ flex: 1 }} // Add paddingTop here
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80} // adjust so keyboard doesn't overlap input
      >
        {/* Messages List */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, flexGrow: 1 }}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: "flex-end",
                backgroundColor: "#008080",
                padding: 10,
                borderRadius: 20,
                marginBottom: 10,
                maxWidth: "75%",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14 }}>{item.text}</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#555",
                  backgroundColor: "#e7ecec",
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                Today
              </Text>
            </View>
          )}
        />

        {/* Input Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderTopWidth: 0.5,
            borderTopColor: "#b2d7d7",
            paddingBottom: 14,
            paddingTop: 12,
            paddingHorizontal: 10,
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            style={{
              flex: 1,
              backgroundColor: "#e7ecec",
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: 14,
              fontSize: 14,
              borderWidth: 1,
              borderColor: "#b2d7d7",
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={{
              marginLeft: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="send" size={25} color="#008080" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default DirectMessage;
