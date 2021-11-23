import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MediaStream, RTCView } from 'react-native-webrtc'
import Button from './Button'

interface videoCall {
  hangup: () => void;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
}
function ButtonContainer(props: videoCall) {
  return (
    <View style={styles.groupButton}>
      <Button iconName="phone" backgroundColor="red"
        onPress={props.hangup}
        style={{ marginLeft: 50 }}
      />
    </View>
  )
}
export default function Video(props: videoCall) {
  if (props.localStream && !props.remoteStream) {
    return (
      <View style={styles.container}>
        <RTCView
          streamURL={props.localStream.toURL()}
          objectFit={'cover'}
          style={styles.video}
        />
        <ButtonContainer hangup={props.hangup} />
      </View>
    );
  }
  if (props.localStream && props.remoteStream) {
    return (
      <View style={styles.container}>
        <RTCView
          streamURL={props.remoteStream.toURL()}
          objectFit={'cover'}
          style={styles.video}
        />
        <RTCView
          streamURL={props.localStream.toURL()}
          objectFit={'cover'}
          style={styles.videoLocal}
        />
        <ButtonContainer hangup={props.hangup} />
      </View>
    );
  }
  return <ButtonContainer hangup={props.hangup} />

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  groupButton: {
    flexDirection: 'row',
    bottom: 40
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  videoLocal: {
    position: 'absolute',
    width: 100,
    height: 150,
    top: 0,
    left: 20,
    elevation: 10,
  },
})

