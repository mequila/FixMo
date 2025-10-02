// Search result item component for better presentation
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceItem } from "../../utils/servicesData";

interface SearchResultItemProps {
  service: ServiceItem;
  onPress: () => void;
  searchQuery?: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ 
  service, 
  onPress, 
  searchQuery 
}) => {
  // Highlight matching text in title and description
  const highlightText = (text: string, query: string): string[] => {
    if (!query.trim()) return [text];
    
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).filter(part => part.length > 0);
  };

  const titleParts: string[] = searchQuery ? highlightText(service.title, searchQuery) : [service.title];
  const descriptionParts: string[] = searchQuery ? highlightText(service.description, searchQuery) : [service.description];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {titleParts.map((part: string, index: number) => (
              <Text
                key={index}
                style={searchQuery && part.toLowerCase().includes(searchQuery.toLowerCase()) 
                  ? styles.highlightedText 
                  : styles.normalText
                }
              >
                {part}
              </Text>
            ))}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{service.category}</Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {descriptionParts.map((part: string, index: number) => (
            <Text
              key={index}
              style={searchQuery && part.toLowerCase().includes(searchQuery.toLowerCase()) 
                ? styles.highlightedText 
                : styles.descriptionNormalText
              }
            >
              {part}
            </Text>
          ))}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.selectText}>Tap to select service</Text>
          <Ionicons name="chevron-forward" size={16} color="#008080" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  normalText: {
    color: "#333",
  },
  highlightedText: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    fontWeight: "700",
  },
  categoryBadge: {
    backgroundColor: "#e6f7f7",
    borderColor: "#008080",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#008080",
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  descriptionNormalText: {
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 14,
    color: "#008080",
    fontWeight: "500",
  },
});

export default SearchResultItem;