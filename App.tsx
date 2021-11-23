import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Button from './src/components/Button'
import GettingCall from './src/components/GettingCall'
import Video from './src/components/Video'
import { EventOnAddStream, MediaStream, RTCPeerConnection, RTCIceCandidate, RTCSessionDescriptionType } from 'react-native-webrtc'
import Utils from './src/utils/Index'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'

const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

export default function App() {
    const [localStream, setLocalStream] = useState<MediaStream | null>()
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
    const [gettingCall, setGettingCall] = useState(false);
    const pc = useRef<RTCPeerConnection>();
    const connecting = useRef(false);

    useEffect(() => {
        const cRef = firestore().collection('MeetStream').doc('facetimeID');
        const subcrible = cRef.onSnapshot(snapshot => {
            const data = snapshot.data();
            //on answer start the call
            if (pc.current && !pc.current.remoteDescription && data && data.answer) {
                pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
            //if there is  offer  for facetimeID  set the  getting  call flag
            if (data && data.offer && !connecting.current) {
                setGettingCall(true);
            }
        });
        //on delete of collection  call hangup
        //the other  side  has clicked on hangup
        const subcribleDelete = cRef.collection('reciver').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type == 'removed') {
                    hangup();
                }
            });
        });
        return () => {
            subcrible();
            subcribleDelete();
        }
    }, [])

    const setupWebRtc = async () => {
        pc.current = new RTCPeerConnection(configuration)
        //get the audio anh video  stream for the call
        const stream = await Utils.getStream();
        if (stream) {
            setLocalStream(stream);
            pc.current.addStream(stream)
        }
        //get remote stream once it is available
        pc.current.onaddstream = (event: EventOnAddStream) => {
            setRemoteStream(event.stream)
        }
    };
    const create = async () => {
        console.log('calling');
        connecting.current = true;
        //setup Webrtc
        await setupWebRtc();
        //document for the call
        const cRef = firestore().collection('MeetStream').doc('facetimeID');
        //exchange the ice between the caller  and reciver
        colectionIceCandidates(cRef, 'caller', 'reciver');
        if (pc.current) {
            //create the offer of the call
            //store  the offer under the document
            const offer = await pc.current.createOffer();
            pc.current.setLocalDescription(offer)
            const cWithOffer = {
                offer: {
                    type: offer.type,
                    sdp: offer.sdp,
                },
            };
            cRef.set(cWithOffer);
        }
    }
    const join = async () => {
        console.log('join')
        connecting.current = true;
        setGettingCall(false);
        const cRef = firestore().collection('MeetStream').doc('facetimeID');
        const offer = (await cRef.get()).data()?.offer;
        if (offer) {
            //set up webrtc
            await setupWebRtc();
            //ecchange the ICe  candidate
            //check the parameters, It reciversed. since  the joinning  part is reciver
            colectionIceCandidates(cRef, 'reciver', 'caller');
            if (pc.current) {
                pc.current.setRemoteDescription(new RTCSessionDescription(offer));
                //create the answer for the call
                // udate the documet with the answer
                const answer = await pc.current.createAnswer();
                pc.current.setLocalDescription(answer);
                const cWithAnswer = {
                    answer: {
                        type: answer.type,
                        sdp: answer.sdp,
                    },
                };
                cRef.update(cWithAnswer);
            }
        }
    };

    // for  disconnecting  the call close the  connection , release the stream 
    // and delete  the document for the call
    const hangup = async () => {
        setGettingCall(false);
        connecting.current = false;
        streamCleanUp();
        firestoreCleanUp();
        if (pc.current) {
            pc.current.close();
        }
    }
    //helper funtion
    const streamCleanUp = async () => {
        if (localStream) {
            localStream.getTracks().forEach((t) => t.stop());
            localStream.release();
        }
        setLocalStream(null);
        setRemoteStream(null);
    }
    const firestoreCleanUp = async () => {
        const cRef = firestore().collection('MeetStream').doc('facetimeID')
        if (cRef) {
            const reciverCandidate = await cRef.collection('MeetStream').get();
            reciverCandidate.forEach(async (candidate) => {
                await candidate.ref.delete();
            })
            const callerCandidate = await cRef.collection('MeetStream').get();
            callerCandidate.forEach(async (candidate) => {
                await candidate.ref.delete();
            })
            cRef.delete();
        }
    }
    const colectionIceCandidates = async (
        cRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>,
        localName: string,
        remoteName: string,
    ) => {
        const candidateCollection = cRef.collection(localName)
        if (pc.current) {
            //on new  ICE  candidate add it to firestore
            pc.current.onicecandidate = (event) => {
                if (event.candidate) {
                    candidateCollection.add(event.candidate);
                }
            };
        }
        //get the ICE candidate added to firestore and update the local PC
        cRef.collection(remoteName).onSnapshot(snapshot => {
            snapshot.docChanges().forEach((change: any) => {
                if (change.type = 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data())
                    pc.current?.addIceCandidate(candidate);
                }
            });
        })
    };
    //display the  getting call components
    if (gettingCall) {
        return <GettingCall hangup={hangup} join={join} />;
    }
    //display local stream on calling
    if (localStream) {
        return <Video hangup={hangup} localStream={localStream} remoteStream={remoteStream} />;
    }

    return (
        <View style={styles.container}>
            <Button iconName="video" backgroundColor="blue" onPress={create} />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})

