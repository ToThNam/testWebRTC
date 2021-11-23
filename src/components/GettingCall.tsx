import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Button from './Button'
interface gettingCall {
  hangup: () => void,
  join: () => void,
}
export default function GettingCall(props: gettingCall) {
  return (
    <View style={styles.container}>
      <Image source={require('../Assets/Image/nam.jpg')} style={styles.Image} />
      <View style={styles.groupButton}>
        <Button iconName="phone" backgroundColor="green"
          onPress={props.join}
          style={{ marginRight: 50 }}
        />
        <Button iconName="phone" backgroundColor="red"
          onPress={props.hangup}
          style={{ marginLeft: 50 }}
        />
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  Image: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  groupButton: {
    flexDirection: 'row',
    bottom: 40
  },
})
