import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { searchServices, ServiceItem } from "../utils/servicesData";
import PageHeader from "./components/PageHeader";
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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <PageHeader title="" backRoute="/" />
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={handleSearch} style={{ marginRight: 12 }}>
          <Ionicons name="search" size={22} color="#008080" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Search for services..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginHorizontal: 16 }}>
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

            {/* Popular Categories - show four highlighted categories in a single row */}
            <View style={styles.categoriesSection}>
              <Text style={styles.categoriesTitle}>Popular Categories</Text>
              <View style={styles.categoriesRow}>
                {[
                  'Electrical',
                  'Plumbing',
                  'Carpentry',
                  'Appliances',
                ].map((category) => (
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
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Root container for the screen (keeps background and overall padding)
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 70,
  },

  // Search bar wrapper: horizontal layout with rounded background and border
  // Contains the icon + input and controls spacing inside the pill-shaped bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7ecec",
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 30,
    marginHorizontal: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 15,
  },

  // TextInput styling inside the search bar
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },

  // Header above search results: small spacing below
  resultsHeader: {
    marginBottom: 16,
  },

  // Title for results (e.g., "Found 3 services")
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Secondary text showing the query (e.g., for "plumbing")
  searchQuery: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  // Empty-result container: centers the no-results UI
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  // Main heading when no results are found
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },

  // Supporting subtext under the no-results heading
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },

  // Recent searches header row: label on left, clear action on right
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  // Title for recent searches
  recentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // "Clear All" action styling
  clearAll: {
    fontSize: 14,
    fontWeight: "500",
    color: "#008080",
  },

  // Each recent search row container
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  // Left side of a recent item (icon + text)
  recentItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  // Text for a recent search entry
  recentText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
  },

  // Fallback UI when there are no recent searches
  noRecent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  // Heading for the no-recent state
  noRecentText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginTop: 12,
  },

  // Supporting subtext for the no-recent state
  noRecentSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },

  // Section for category chips
  categoriesSection: {
    marginTop: 32,
  },

  // Title for the categories section
  categoriesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },

  // Grid wrapper for category chips (wraps to next line)
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: -4,
  },

  // Horizontal row container for highlighted categories
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
    paddingRight: 8,
    alignItems: 'flex-start',
  },

  // Individual category chip styling
  categoryChip: {
    backgroundColor: "#f0f8f8",
    borderColor: "#008080",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 5,
    marginBottom: 8,
  },

  // Text inside a category chip
  categoryText: {
    color: "#008080",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default Search;
