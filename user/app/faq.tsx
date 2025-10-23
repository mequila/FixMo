import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import PageHeader from './components/PageHeader'

const faqCardDetails = [
  {
    question: "What is FixMo?",
    answer: "FixMo is a mobile app that connects homeowners with TESDA-certified service providers for home maintenance and repair."
  },
  {
    question: "What services can I book?",
    answer: "Plumbing, electrical work, carpentry, air conditioning and refrigeration, masonry, painting, welding, appliance repair, and computer servicing."
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

  const toggleExpand = (idx: number) => {
    setExpanded(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <PageHeader title="FAQ" backRoute="/(tabs)/profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: 15 
        }}
      >
        {faqCardDetails.map((item, idx) => {
          const isOpen = expanded.includes(idx);
          return (
            <View key={idx}>
              {/* FAQ Card */}
              <View
                style={{
                  marginHorizontal: 20,
                  borderRadius: 8,
                  backgroundColor: isOpen ? '#cceded' : '#fff',
                }}
              >
                {/* Question Section */}
                <TouchableOpacity
                  onPress={() => toggleExpand(idx)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 15,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#008080',
                      fontWeight: '500',
                      flex: 1,
                      paddingRight: 10,
                    }}
                  >
                    {item.question}
                  </Text>

                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color="#008080"
                  />
                </TouchableOpacity>

                {/* Answer Section */}
                {isOpen && (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingBottom: 15,
                      backgroundColor: '#cceded',
                    }}
                  >
                    <Text
                      style={{
                        color: '#333',
                        fontSize: 15,
                        lineHeight: 22,
                      }}
                    >
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>

              {/* Partition Divider (Not after last item) */}
              {idx !== faqCardDetails.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: 'lightgray',
                    marginVertical: 16,
                    alignSelf: 'center',
                    width: '90%',
                  }}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  )
}

export default FAQ
