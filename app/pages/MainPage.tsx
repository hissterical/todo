import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, Linking } from "react-native";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { ScrollView } from "react-native-gesture-handler";
import Task from "../types/TaskTypes"; // Default import

interface JsonTask {
  task: string;
}
interface ParsedJson {
  message: string;
  addTasks: JsonTask[];
}

const prompt = `You are a virtual assistant. Please listen to the following speech input as if the user is talking to you and make the required tasks. Respond with the tasks in a structured JSON format like this:
{
  "message": "Added two tasks", <or couldn't find tasks>
  "addTasks": [
    {
      "task": "<task text>"
    },
    {
      "task": "<task text>"
    }
  ]
}
When the user says split any task or make them separate, make n tasks and number them numerically. 
Only include tasks that are clear and actionable. If there are no clear tasks, provide a general message explaining that no tasks were found. Don't include any unnecessary information. Here is the speech: 
`;

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export default function MainPage() {
  const [userMsg, setUserMsg] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [llmMessage, setLlmMessage] = useState<string>("");
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    handleSTTComplete();
  });
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("GOT ERRORU", event.error);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  
    if (!result.granted) {
      if (result.canAskAgain) {
        Alert.alert(
          "Permission Required",
          "We need access to the microphone to use speech recognition."
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Microphone access has been denied. Please enable it in your device settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
      return;
    }
  
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false, // End session after a single recognition
      requiresOnDeviceRecognition: false,
      addsPunctuation: true, // Adds punctuation to the transcript
    });
  };
  const handleSTTComplete = () => {
    if (transcript.trim()) {
      run(transcript);
      setTranscript("");
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    loadTasks();
  }, []);

  const addTasksMain = async (tasksJson: ParsedJson) => {
    const newTasks = tasksJson.addTasks.map((task: JsonTask) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(7), // Unique ID
      text: task.task,
      completed: false,
    }));

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, ...newTasks];
      AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks)); // Persist tasks
      return updatedTasks;
    });

    setLlmMessage(tasksJson.message); // Update LLM message
  };

  const run = async (userMsg: string) => {
    if (!userMsg.trim()) {
      Alert.alert("Input Required", "Please enter a message to process.");
      return;
    }

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });
      const result = await chatSession.sendMessage(prompt + userMsg);
      const responseJSON = result.response
        .text()
        .replace(/`{3}json|`{3}/g, "")
        .trim();

      try {
        const parsedResponse: ParsedJson = JSON.parse(responseJSON);
        addTasksMain(parsedResponse);
      } catch (error) {
        console.error("Error parsing the JSON response:", error);
        Alert.alert(
          "Error",
          "Failed to process the response. Please try again."
        );
      }
    } catch (error) {
      console.error("Error occurred while generating response:", error);
      Alert.alert(
        "Error",
        "Failed to connect to the server. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the GAY Page!</Text>
      <Button
        title={!recognizing ? "Start" : "Stop"}
        onPress={() => {
          if (!recognizing) {
            handleStart();
          } else {
            ExpoSpeechRecognitionModule.stop();
          }
        }}
      />

      <ScrollView>
        <Text>{transcript}</Text>
      </ScrollView>
      <TextInput
        style={styles.input}
        value={userMsg}
        onChangeText={(text) => setUserMsg(text)}
        placeholder="Type your message here..."
      />
      <Button
        title="Run"
        onPress={() => {
          run(userMsg);
          setUserMsg("");
        }}
      />
      {llmMessage ? <Text style={styles.llmMessage}>{llmMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: 300,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
  },
  llmMessage: {
    marginTop: 20,
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
});
