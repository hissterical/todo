// TaskInput.tsx
import React from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

type TaskInputProps = {
  task: string;
  setTask: React.Dispatch<React.SetStateAction<string>>;
  addTask: () => void;
};

const TaskInput: React.FC<TaskInputProps> = ({ task, setTask, addTask }) => {
  return (
    <>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={task}
        onChangeText={setTask}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50', // Green button for "Add Task"
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskInput;
