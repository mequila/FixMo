import { ScrollView, Text, View } from 'react-native';
import PageHeader from './components/PageHeader';
const termsList = [
  {
    title: "Eligibility",
    description: "Users must be at least 18 years old."
  },
  {
    title: "Verified Providers",
    description: "Only TESDA-certified and FixMo-approved providers may offer services."
  },
  {
    title: "About FixMo",
    description: "FixMo is a mobile booking application for home services."
  },
  {
    title: "User Responsibilities",
    description: "Provide accurate booking details, ensure safe premises, and comply with scheduled appointments."
  },
  {
    title: "Service Guarantee",
    description: "FixMo verifies providers but is not liable for service outcomes beyond verification and ratings."
  },
  {
    title: "Payments & Fees",
    description: "Users agree to pay the displayed service fees. Cancellations may incur charges."
  },
  {
    title: "Data Privacy",
    description: "All personal data is handled in compliance with the Philippine Data Privacy Act of 2012."
  },
  {
    title: "Prohibited Activities",
    description: "Fraud, misuse of the platform, or harassment of providers/users will result in account suspension."
  },
  {
    title: "Liability",
    description: "FixMo is a booking platform and does not directly employ service providers."
  },
  {
    title: "Updates",
    description: "FixMo reserves the right to modify terms, with notice to users."
  }
];

const termsConditions = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PageHeader title="Terms and Conditions" backRoute="/profile" />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {termsList.map((item, idx) => (
          <View key={idx} style={{ marginBottom: 18 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#008080', marginBottom: 4 }}>
              {idx + 1}. {item.title}
            </Text>
            <Text style={{ color: '#333', fontSize: 15, lineHeight: 24 }}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default termsConditions;