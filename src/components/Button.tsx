import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

interface Buttons {
  onPress?: any,
  iconName: string,
  backgroundColor: string,
  style?: any,
}
export default function Button(props: Buttons) {
  return (
    <View>
      <TouchableOpacity
        onPress={props.onPress}
        style={[
          { backgroundColor: props.backgroundColor },
          props.style,
          styles.button,
        ]}>
        <FontAwesome5 name={props.iconName} color='white' size={20} />
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    padding: 10,
    elevation: 10,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
