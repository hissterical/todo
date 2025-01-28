import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native"; // Import useIsFocused

import TaskItem from "../components/TaskItem";
import TaskInput from "../components/TaskInput";
import Task from "../types/TaskTypes"; // Default import
import addTask from "../utils/TaskUtils";

export default function TasksPage() {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const isFocused = useIsFocused(); // Get the focused state of the screen

  const loadTasks = async () => {
    const savedTasks = await AsyncStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadTasks(); // Reload tasks whenever the screen gains focus
    }
  }, [isFocused]);

  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    addTask(task, tasks, setTasks); // Use shared function
    setTask("");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <TaskInput task={task} setTask={setTask} addTask={handleAddTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            toggleCompletion={toggleTaskCompletion}
            deleteTask={deleteTask}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
});
