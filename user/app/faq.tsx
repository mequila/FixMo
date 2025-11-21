import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, RefreshControl, StyleSheet } from 'react-native'
import PageHeader from './components/PageHeader'

const faqCardDetails: Array<{
  question: string;
  answer: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  {
    question: "What is FixMo?",
    answer: "FixMo is a mobile app that connects homeowners with TESDA-certified service providers for home maintenance and repair.",
    icon: "information-circle"
  },
  {
    question: "What services can I book?",
    answer: "Plumbing, electrical work, carpentry, air conditioning and refrigeration, masonry, painting, welding, appliance repair, and computer servicing",
    icon: "construct"
  },
  {
    question: "How do I know providers are qualified?",
    answer: "All providers are TESDA-certified and verified through valid IDs, certificates, and admin approval.",
    icon: "shield-checkmark"
  },
  {
    question: "Is FixMo available nationwide?",
    answer: "Currently, FixMo operates within Metro Manila.",
    icon: "map"
  },
  {
    question: "How do I pay for services?",
    answer: "Currently, FixMo only supports cash payments, which are paid directly to the service provider after the job is completed.",
    icon: "cash"
  },
  {
    question: "Can I rate and review a provider?",
    answer: "Yes, after each service you can provide ratings and feedback.",
    icon: "star"
  },
  {
    question: "What if I encounter issues with a provider?",
    answer: "You can report the issue through the in-app messaging or contact support.",
    icon: "alert"
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
                      <Ionicons name={item.icon} size={20} color="#008080" />
                    </View>
                    <Text style={styles.questionText}>{item.question}</Text>
                  </View>

                  <View style={[styles.expandButton, isOpen && styles.expandButtonOpen]}>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color="#fff"
                    />
                  </View>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.answerContainer}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.helpFooter}>
          <Ionicons name="help-circle" size={45} color="#008080" />
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
    backgroundColor: '#fff',
  },
  faqCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,    
    borderWidth: 0.5,
    borderColor: '#b2d7d7',         
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,             
    elevation: 2,
  },
  faqCardExpanded: {
    borderWidth: 1.5,
    borderColor: '#b2d7d7',
    borderRadius: 12,     
      
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
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
    backgroundColor: '#cceded',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  expandButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#008080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonOpen: {
    backgroundColor: '#008080',
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
  answerText: {
    color: '#555',
    fontSize: 15,
    lineHeight: 24,
  },
  helpFooter: {
    backgroundColor: '#fff',
    borderRadius: 12,              
    padding: 20,
    margin: 16,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b2d7d7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 12,             
    elevation: 2,
    overflow: 'hidden',          
  },
  helpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
  },
  helpSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default FAQ
