import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import locationData from '../data/metro-manila-locations.json';

interface LocationPickerProps {
  value: string;
  onSelect: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  style?: any;
}

interface City {
  name: string;
  type: string;
  coordinates: { lat: number; lng: number };
  barangays?: string[];
  districts?: District[];
}

interface District {
  name: string;
  type: string;
  coordinates: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onSelect,
  placeholder = 'Select location',
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  // Temporary fix: Handle the actual JSON structure
  const cities: City[] = [];
  const municipalities: City[] = [];
  const allLocations: City[] = [];

  useEffect(() => {
    if (searchQuery) {
      const filtered = allLocations.filter((city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(allLocations);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    setSelectedBarangay('');
  };

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setSelectedBarangay('');
  };

  const handleBarangaySelect = (barangay: string) => {
    setSelectedBarangay(barangay);
  };

  const handleConfirm = () => {
    let locationString = '';
    let coordinates = selectedCity?.coordinates;

    if (selectedCity) {
      if (selectedBarangay) {
        locationString = `${selectedBarangay}, ${selectedCity.name}`;
      } else if (selectedDistrict) {
        locationString = `${selectedDistrict.name}, ${selectedCity.name}`;
        coordinates = selectedDistrict.coordinates;
      } else {
        locationString = selectedCity.name;
      }
    }

    if (locationString) {
      onSelect(locationString, coordinates);
      setModalVisible(false);
      resetSelection();
    }
  };

  const resetSelection = () => {
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedBarangay('');
    setSearchQuery('');
  };

  const handleClose = () => {
    setModalVisible(false);
    resetSelection();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.pickerButton, style]}
      >
        <Text style={[styles.pickerText, !value && { color: '#999' }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="location-outline" size={20} color="#008080" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!selectedCity}
            >
              <Text
                style={[
                  styles.doneButton,
                  !selectedCity && styles.doneButtonDisabled,
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city or municipality..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Breadcrumb */}
          {selectedCity && (
            <View style={styles.breadcrumb}>
              <TouchableOpacity onPress={() => setSelectedCity(null)}>
                <Text style={styles.breadcrumbText}>Cities</Text>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color="#666" />
              <Text style={styles.breadcrumbActive}>{selectedCity.name}</Text>
              {selectedDistrict && (
                <>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                  <Text style={styles.breadcrumbActive}>{selectedDistrict.name}</Text>
                </>
              )}
            </View>
          )}

          <ScrollView style={styles.listContainer}>
            {!selectedCity ? (
              // City List
              <>
                <Text style={styles.sectionTitle}>Metro Manila Cities & Municipalities</Text>
                {filteredCities.map((city) => (
                  <TouchableOpacity
                    key={city.name}
                    onPress={() => handleCitySelect(city)}
                    style={styles.listItem}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons name="business-outline" size={24} color="#008080" />
                      <View style={styles.listItemText}>
                        <Text style={styles.listItemTitle}>{city.name}</Text>
                        <Text style={styles.listItemSubtitle}>
                          {city.type === 'city' ? 'City' : 'Municipality'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </>
            ) : selectedCity.districts && selectedCity.districts.length > 0 && !selectedDistrict ? (
              // District List (for Manila, Muntinlupa, etc.)
              <>
                <Text style={styles.sectionTitle}>Select District in {selectedCity.name}</Text>
                {selectedCity.districts.map((district) => (
                  <TouchableOpacity
                    key={district.name}
                    onPress={() => handleDistrictSelect(district)}
                    style={styles.listItem}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons name="location-outline" size={24} color="#008080" />
                      <View style={styles.listItemText}>
                        <Text style={styles.listItemTitle}>{district.name}</Text>
                        <Text style={styles.listItemSubtitle}>{district.type}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
                
                {/* Option to skip district selection */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDistrict(null);
                    setSelectedBarangay('');
                  }}
                  style={[styles.listItem, styles.skipItem]}
                >
                  <View style={styles.listItemContent}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#008080" />
                    <Text style={styles.skipText}>
                      Use "{selectedCity.name}" without specific district
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : selectedCity.barangays && selectedCity.barangays.length > 0 ? (
              // Barangay List
              <>
                <Text style={styles.sectionTitle}>
                  Select Barangay in {selectedDistrict?.name || selectedCity.name}
                </Text>
                {selectedCity.barangays.map((barangay) => (
                  <TouchableOpacity
                    key={barangay}
                    onPress={() => handleBarangaySelect(barangay)}
                    style={[
                      styles.listItem,
                      selectedBarangay === barangay && styles.listItemSelected,
                    ]}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons
                        name={selectedBarangay === barangay ? 'radio-button-on' : 'radio-button-off'}
                        size={24}
                        color="#008080"
                      />
                      <Text style={styles.listItemTitle}>{barangay}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Option to skip barangay selection */}
                <TouchableOpacity
                  onPress={() => setSelectedBarangay('')}
                  style={[styles.listItem, styles.skipItem]}
                >
                  <View style={styles.listItemContent}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#008080" />
                    <Text style={styles.skipText}>
                      Use "{selectedDistrict?.name || selectedCity.name}" without specific barangay
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              // No subdivisions available
              <View style={styles.noSubdivisions}>
                <Ionicons name="checkmark-circle" size={48} color="#008080" />
                <Text style={styles.noSubdivisionsTitle}>Location Selected</Text>
                <Text style={styles.noSubdivisionsText}>
                  {selectedCity.name} selected. Tap "Done" to confirm.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    backgroundColor: '#e7ecec',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doneButton: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButtonDisabled: {
    color: '#ccc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#008080',
    marginHorizontal: 5,
  },
  breadcrumbActive: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginHorizontal: 5,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemSelected: {
    backgroundColor: '#f0f9f9',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemText: {
    marginLeft: 12,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  skipItem: {
    backgroundColor: '#f9f9f9',
    marginTop: 10,
  },
  skipText: {
    fontSize: 14,
    color: '#008080',
    marginLeft: 12,
    flex: 1,
  },
  noSubdivisions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noSubdivisionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noSubdivisionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default LocationPicker;
