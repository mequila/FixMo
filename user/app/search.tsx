import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { searchServices, ServiceItem, getAllCategories } from "../utils/servicesData";
import SearchResultItem from "./components/SearchResultItem";

const Search = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ServiceItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Computer Repairing",
    "Painting the walls",
  ]);

  // Perform search whenever query changes
  useEffect(() => {
    if (query.trim().length > 0) {
      setIsSearching(true);
      const results = searchServices(query);
      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [query]);

  const handleSearch = () => {
    if (query.trim() !== "" && !recentSearches.includes(query.trim())) {
      setRecentSearches([query.trim(), ...recentSearches.slice(0, 9)]); // Keep only 10 recent searches
    }
  };

  const handleServicePress = (service: ServiceItem) => {
    // Add to recent searches
    if (!recentSearches.includes(service.title)) {
      setRecentSearches([service.title, ...recentSearches.slice(0, 9)]);
    }
    
    // Navigate to service provider page
    router.push({
      pathname: '/serviceprovider',
      params: { 
        serviceTitle: service.title, 
        category: service.category 
      }
    });
  };

  const handleRecentSearchPress = (searchTerm: string) => {
    setQuery(searchTerm);
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
          placeholder="Search for services (e.g., electrical, plumbing, repair)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={25} color="#008080" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {isSearching ? (
          // Search Results Section
          <View>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} service${searchResults.length === 1 ? '' : 's'}` 
                  : 'No services found'}
              </Text>
              {query.trim().length > 0 && (
                <Text style={styles.searchQuery}>for "{query}"</Text>
              )}
            </View>

            {/* Search Results */}
            {searchResults.map((service) => (
              <SearchResultItem
                key={service.id}
                service={service}
                searchQuery={query}
                onPress={() => handleServicePress(service)}
              />
            ))}

            {searchResults.length === 0 && query.trim().length > 0 && (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>No services found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try searching with different keywords like "repair", "installation", or specific service names
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Recent Searches Section
          <View>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={styles.clearAll}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Recent Searches List */}
            {recentSearches.length > 0 ? (
              recentSearches.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearchPress(item)}
                >
                  <View style={styles.recentItemLeft}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.recentText}>{item}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveItem(item)}>
                    <Ionicons name="close" size={18} color="#008080" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noRecent}>
                <Ionicons name="search-outline" size={32} color="#ccc" />
                <Text style={styles.noRecentText}>No recent searches</Text>
                <Text style={styles.noRecentSubtext}>
                  Start searching to see your search history
                </Text>
              </View>
            )}

            {/* Popular Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.categoriesTitle}>Popular Categories</Text>
              <View style={styles.categoriesGrid}>
                {getAllCategories().slice(0, 6).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryChip}
                    onPress={() => setQuery(category)}
                  >
                    <Text style={styles.categoryText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  searchQuery: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  clearAll: {
    fontSize: 14,
    fontWeight: "500",
    color: "#008080",
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  recentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recentText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
  },
  noRecent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noRecentText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginTop: 12,
  },
  noRecentSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
  categoriesSection: {
    marginTop: 32,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#f0f8f8",
    borderColor: "#008080",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: "#008080",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Search;
