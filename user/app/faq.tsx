
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, RefreshControl, StyleSheet } from 'react-native'
import PageHeader from './components/PageHeader'

const faqCardDetails = [
  {
    question: "What is FixMo?",
    answer: "FixMo is a mobile app that connects homeowners with TESDA-certified service providers for home maintenance and repair."
  },
  {
    question: "What services can I book?",
    answer: "Plumbing, electrical work, carpentry, air conditioning and refrigeration, masonry, painting, welding, appliance repair, and computer servicing"
  },
  {
    question: "How do I know providers are qualified?",
    answer: "All providers are TESDA-certified and verified through valid IDs, certificates, and admin approval."
  },
  {
    question: "Is FixMo available nationwide?",
    answer: "Currently, FixMo operates within Metro Manila."
  },
  {
    question: "How do I pay for services?",
    answer: "Currently, FixMo only supports cash payments, which are paid directly to the service provider after the job is completed."
  },
  {
    question: "Can I rate and review a provider?",
    answer: "Yes, after each service you can provide ratings and feedback."
  }, 
  {
    question: "What if I encounter issues with a provider?",
    answer: "You can report the issue through the in-app messaging or contact support."
  }
]

const FAQ = () => {
  const [expanded, setExpanded] = useState<number[]>([])
  const [refreshing, setRefreshing] = useState(false);

  const toggleExpand = (idx: number) => {
    setExpanded(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    )
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader title="FAQ" backRoute="/(tabs)/profile" />
      
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Ionicons name="help-circle" size={32} color="#008080" />
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
      </View>

      <ScrollView
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
        <View style={{ paddingBottom: 20 }}>
          {faqCardDetails.map((item, idx) => {
            const isOpen = expanded.includes(idx);
            return (
              <View
                key={idx}
                style={[
                  styles.faqCard,
                  isOpen && styles.faqCardExpanded
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleExpand(idx)}
                  style={styles.questionContainer}
                  activeOpacity={0.7}
                >
                  <View style={styles.questionTextContainer}>
                    <View style={styles.iconBadge}>
                      <Ionicons name="help-circle-outline" size={20} color="#008080" />
                    </View>
                    <Text style={styles.questionText}>{item.question}</Text>
                  </View>
                  <View style={[styles.expandButton, isOpen && styles.expandButtonOpen]}>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color='#fff'
                    />
                  </View>
                </TouchableOpacity>
                
                {isOpen && (
                  <View style={styles.answerContainer}>
                    <View style={styles.answerDivider} />
                    <View style={styles.answerIconContainer}>
                      <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
                    </View>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Help Footer */}
        <View style={styles.helpFooter}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#008080" />
          <Text style={styles.helpText}>Still have questions?</Text>
          <Text style={styles.helpSubtext}>Contact our support team for assistance</Text>
        </View>
      </ScrollView>
    </View>
  )
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
  faqCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  faqCardExpanded: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#008080',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  expandButton: {
    padding: 8,
    backgroundColor: '#008080',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonOpen: {
    backgroundColor: '#006666',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerDivider: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginBottom: 12,
  },
  answerIconContainer: {
    marginBottom: 8,
  },
  answerText: {
    color: '#555',
    fontSize: 15,
    lineHeight: 24,
    paddingLeft: 0,
  },
  helpFooter: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  helpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  helpSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default FAQ