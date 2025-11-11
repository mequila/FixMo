import React, { useState } from 'react';
import { ScrollView, Text, View, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from './components/PageHeader';

const termsList = [
  {
    title: "Eligibility",
    description: "Users must be at least 18 years old to create an account and use FixMo services."
  },
  {
    title: "Verified Providers",
    description: "Only TESDA-certified and FixMo-approved service providers may offer their services on the platform."
  },
  {
    title: "About FixMo",
    description: "FixMo is a mobile and web-based booking application that connects users with qualified home and tech service providers."
  },
  {
    title: "User Responsibilities",
    description: "Users must provide accurate booking details, ensure safe premises for service providers, and comply with scheduled appointments."
  },
  {
    title: "Provider Responsibilities",
    description: "Providers must deliver quality service, arrive on time, maintain professionalism, and adhere to FixMo’s verification and conduct policies."
  },
  {
    title: "Service Guarantee",
    description: "FixMo verifies providers and allows user reviews but is not liable for service outcomes beyond verification, warranty handling, and the rating system."
  },
  {
    title: "Warranty & Backjobs",
    description: "Services may include a limited warranty period. Users may request backjobs within this period, subject to provider evaluation."
  },
  {
    title: "Data Privacy",
    description: "All personal and transactional data are handled in accordance with the Philippine Data Privacy Act of 2012 and FixMo’s Privacy Policy."
  },
  {
    title: "Prohibited Activities",
    description: "Fraudulent activities, platform misuse, harassment, false claims, or manipulation of reviews will result in account suspension or termination."
  },
  {
    title: "Liability",
    description: "FixMo acts solely as a booking intermediary and does not directly employ or control service providers. All services are performed under the provider’s responsibility."
  },
  {
    title: "Account Security",
    description: "Users are responsible for maintaining the confidentiality of their login credentials and must immediately report any unauthorized access to their account."
  },
  {
    title: "Dispute Resolution",
    description: "Any disputes between users and providers should first be reported to FixMo’s support team for mediation before escalating to formal legal action."
  },
  {
    title: "Termination",
    description: "FixMo reserves the right to suspend or terminate accounts that violate these Terms or engage in suspicious or harmful activities."
  },
  {
    title: "System Maintenance",
    description: "FixMo may temporarily suspend operations for updates or maintenance. Users will be notified of scheduled downtimes when possible."
  },
  {
    title: "Intellectual Property",
    description: "All content, trademarks, and system designs on FixMo are owned by FixMo and may not be copied, reproduced, or distributed without authorization."
  },
  {
    title: "Third-Party Services",
    description: "FixMo may integrate third-party tools or APIs (e.g., maps, payment gateways). Users agree to the terms of those third parties when applicable."
  },
  {
    title: "Updates",
    description: "FixMo reserves the right to modify or update these Terms & Conditions at any time. Users will be notified of significant changes via in-app or email notice."
  },
  {
    title: "Governing Law",
    description: "These Terms & Conditions shall be governed by and interpreted under the laws of the Republic of the Philippines."
  }

];

const termsConditions = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader title="Terms and Conditions" backRoute="/profile" />
      
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Ionicons name="document-text" size={32} color="#008080" />
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <Text style={styles.headerSubtitle}>Last updated: November 5, 2025</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#008080']}
            tintColor="#008080"
            title="Pull to refresh"
            titleColor="#008080"
          />
        }
      >
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            By using FixMo, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
          </Text>
        </View>

        {termsList.map((item, idx) => (
          <View key={idx} style={styles.termCard}>
            <View style={styles.termHeader}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.termTitle}>{item.title}</Text>
            </View>
            <Text style={styles.termDescription}>{item.description}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={24} color="#008080" />
          <Text style={styles.footerText}>
            These terms are legally binding. By using FixMo, you acknowledge that you have read and agreed to these terms.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBanner: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  introCard: {
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
  },
  introText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  termCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberBadge: {
    backgroundColor: '#008080',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
    flex: 1,
  },
  termDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});

export default termsConditions;