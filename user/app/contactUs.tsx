import { Text, View } from 'react-native'
import PageHeader from './components/PageHeader'

const contactUs = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PageHeader title="Contact Us" backRoute="/profile" />
      <View style={{ backgroundColor: '#e7ecec', margin: 16, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#b2d7d7' }}>
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Email Us</Text>
          <Text style={{ fontSize: 16, color: '#008080', fontWeight: 'bold' }}>ipafixmo@gmail.com</Text>
          <Text style={{ marginTop: 20, fontSize: 14, color: '#666', textAlign: 'center', marginHorizontal: 20, marginBottom: 20,  }}>
            For any inquiries, support, or feedback, please email us and our team will get back to you as soon as possible.
          </Text>
        </View>
      </View>
    </View>
  )
}

export default contactUs