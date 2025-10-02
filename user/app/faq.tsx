
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

  const toggleExpand = (idx: number) => {
    setExpanded(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PageHeader title="FAQ" backRoute="/(tabs)/profile" />
      <ScrollView>
        {faqCardDetails.map((item, idx) => {
          const isOpen = expanded.includes(idx);
          return (
            <View
              key={idx}
              style={{
                marginTop: isOpen ? 8 : 15,
                borderRadius: 8,
                overflow: 'hidden',
                marginHorizontal: 16,
                backgroundColor: isOpen ? '#e7ecec' : 'transparent',
                borderWidth: isOpen ? 1 : 0,
                borderColor: isOpen ? '#b2d7d7' : 'transparent',
                elevation: isOpen ? 4 : 5,
                shadowColor: '#008080',
                shadowOpacity: isOpen ? 0.12 : 0.06,
                shadowRadius: isOpen ? 8 : 3,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 16, }}>{item.question}</Text>
                <TouchableOpacity
                  style={{
                    padding: 5,
                    backgroundColor: '#008080',
                    borderRadius: 5,
                  }}
                  onPress={() => toggleExpand(idx)}
                >
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color='#fff'
                  />
                </TouchableOpacity>
              </View>
              {isOpen && (
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#fff',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    borderTopWidth: 1,
                    borderColor: '#e7ecec',
                  }}
                >
                  <Text style={{ color: '#333', fontSize: 15, lineHeight: 25 }}>{item.answer}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
    
  )
}

export default FAQ