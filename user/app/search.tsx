import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const Search = () => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Computer Repairing",
    "Painting the walls",
  ]);

  const handleSearch = () => {
    if (query.trim() !== "" && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches]);
    }
    setQuery("");
  };

  const handleRemoveItem = (item: string) => {
    setRecentSearches(recentSearches.filter((search) => search !== item));
  };

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={25} color="#008080" />
        </TouchableOpacity>
      </View>

      {/* Recent Section */}
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Recent</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Searches List */}
      <FlatList
        data={recentSearches}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.recentItem}>
            <Text style={styles.recentText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveItem(item)}>
              <Ionicons name="close" size={18} color="#008080" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 70,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7ecec",
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 199,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  clearAll: {
    fontSize: 16,
    fontWeight: "500",
    color: "#008080",
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  recentText: {
    fontSize: 15,
    color: "#333",
  },
});

export default Search;
