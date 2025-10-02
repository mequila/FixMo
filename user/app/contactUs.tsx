import { View, Text } from 'react-native'
import React from 'react'
import PageHeader from './components/PageHeader'

const contactUs = () => {
  return (
    <View>
      <PageHeader title="Contact Us" backRoute="/profile" />
    </View>
  )
}

export default contactUs