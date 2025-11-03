import { ScrollView, Text, View } from 'react-native';
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
    title: "Payments & Fees",
    description: "Users agree to pay the displayed service fees through FixMo’s supported payment methods. Cancellations made outside the allowed window may incur charges."
  },
  {
    title: "Cancellations & Refunds",
    description: "Refunds and cancellations are subject to FixMo’s refund policy. Refund requests may be reviewed based on service status and provider confirmation."
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