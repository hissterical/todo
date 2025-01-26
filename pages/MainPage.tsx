import React, {useState} from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {ExpoSpeechRecognitionModule, useSpeechRecognitionEvent} from 'expo-speech-recognition';
import { ScrollView } from 'react-native-gesture-handler';

export default function MainPage() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("GOT ERRORU", event.error); 
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if(!result.granted){
      console.log("Permission not granted", result);
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
      contextualStrings: [],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Main Page!</Text>

      {!recognizing ? (
        <Button title="Start" onPress={handleStart} />
      ) : (
        <Button title="Stop" onPress={() => ExpoSpeechRecognitionModule.stop()} />
      )}

      <ScrollView>
        <Text>{transcript}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});
